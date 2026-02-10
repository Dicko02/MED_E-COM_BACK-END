const mongoose = require("mongoose");
//const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user.model.js");
const Chart = require("../models/chart.model.js");

const { signUpErrors, signInErrors } = require("../utils/errors.utils.js");
const mail = require("../utils/mailer.js");


// Token JWT
const maxAge = 1 * 24 * 60 * 60 * 1000; // 3 jours

const createToken = (id, role) => {
  return jwt.sign(
    {
      id: id.toString(),
      role: role,
    },
    process.env.TOKEN_SECRET, {
      expiresIn: '1d',
    }
  );
};


// Enregistrement utilisateur
module.exports.signUp = async (req, res) => {
  try {
    const user = await User.create(req.body);

    // Génération du code de vérification
    const generateNumericCode = (length) => {
      let code = "";
      for (let i = 0; i < length; i++) {
        code += Math.floor(Math.random() * 10);
      }
      return code;
    };

    const code = generateNumericCode(6);

    await User.findByIdAndUpdate(user._id, { code });

    // Envoi email
    await mail(
      user.email,
      "Confirmation",
      `Votre code est ${code}`,
      `<p>Votre code est <strong>${code}</strong></p>`
    );

    res.status(200).json({ message: "Utilisateur créé. Code envoyé par email." });

  } catch (err) {
    const errors = signUpErrors(err);
    res.status(400).json({ errors });
  }
};


// Vérification du code de confirmation
module.exports.verifyCode = async (req, res) => {
  try {
    const { email } = req.params;
    const { code } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Utilisateur introuvable" });
    }

    if (user.code !== code) {
      // sécurité : on supprime le compte si tentative invalide
      await User.findByIdAndDelete(user._id);
      return res.status(401).json({ message: "Code invalide" });
    }

    // Validation OK
    user.code = null;
    await user.save();

    // Création du panier UNIQUEMENT pour les clients
    if (user.role === "client") {
      const existingChart = await Chart.findOne({ client: user._id });
      if (!existingChart) {
        await Chart.create({ client: user._id, products: [] });
      }
    }

    const token = createToken(user._id, user.role);

    res.cookie("jwt", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge,
    });

    res.status(200).json({
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
      },
      token,
    });

  } catch (err) {
    res.status(400).json({ message: "Erreur vérification code" });
  }
};


// Connexion utilisateur
module.exports.signIn = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.login(email, password);

    const token = createToken(user._id, user.role);

    res.status(200).json({
      user: { _id: user._id, email: user.email, role: user.role },
      token
    });


  } catch (err) {
    const errors = signInErrors(err);
    res.status(400).json({ errors });
  }
};


// Déconnexion utilisateur
module.exports.logout = (req, res) => {
  res.cookie("jwt", "", { maxAge: 1 });
  res.status(200).json({ message: "Déconnexion réussie" });
};


// Récupération des utilisateurs (ADMIN)
module.exports.getUsers = async (req, res) => {
  try {
    const current = await User.findById(req.userId);

    if (!current || current.role !== 'admin') {
      return res.status(403).json({ message: "Accès refusé" });
    }

    const users = await User.find().select("-password -code");
    res.status(200).json(users);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Récupération d'un utilisateur spécifique
module.exports.getUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "ID invalide" });
    }

    const user = await User.findById(userId).select("-password -code");

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.status(200).json(user);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Mise à jour d'un utilisateur
module.exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).select("-password -code");

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    res.status(200).json(user);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Suppression d'un utilisateur
module.exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Suppression du panier si client
    if (user.role === "client") {
      await Chart.findOneAndDelete({ client: user._id });
    }

    res.status(200).json({ message: "Utilisateur supprimé" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Statistiques - total utilisateurs
module.exports.totalUsers = async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Récupération des infos de l'utilisateur connecté
module.exports.getMe = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Pas de token fourni" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);

    // DEBUG : Affiche l'ID pour vérifier s'il est correct dans la console serveur
    console.log("ID décodé du token :", decoded.id);

    // Correction : s'assurer que l'ID est bien trimé (pas d'espaces)
    const userId = decoded.id.trim();

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Format d'ID invalide", debug: userId });
    }

    const user = await User.findById(userId).select("-password -code");
    
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé en base" });
    }

    res.status(200).json(user);

  } catch (err) {
    console.error("Erreur JWT:", err.message);
    return res.status(401).json({ message: "Token invalide ou expiré" });
  }
};

