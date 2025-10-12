const User = require("../models/admin.model");
const jwt = require("jsonwebtoken");
const { signUpErrors, signInErrors } = require("../utils/errors.utils.js");
const mail = require("../utils/mailer.js");

maxAge = 3 * 24 * 60 * 60 * 1000;
const createToken = (id) => {
  return jwt.sign({ id }, process.env.TOKEN_SECRET, {
    expiresIn: maxAge,
  });
};


// Fonction pour l'inscription d'un nouvel utilisateur
module.exports.signUp = async (req, res) => {
  try {
    const user = await User.create(req.body);

    const generateNumericCode = (length) => {
      let code = "";
      for (let i = 0; i < length; i++) {
        code += Math.floor(Math.random() * 10);
      }
      return code;
    };

    const code = generateNumericCode(6);

    console.log(code);

    console.log("ok");

    await User.findOneAndUpdate(
      { email: req.body.email },
      { code: code },
      { new: true }
    );

    console.log("ok");

    const email = req.body.email;
    console.log(email);

    await mail(
      email, // Adresse e-mail du destinataire
      "Confirmation", // Sujet de l'e-mail
      `Votre code est ${code}`, // Texte brut
      `<p>Votre code est ${code}</p>` // Contenu HTML
    );
    
    console.log(code);

    res.status(200).json({ user });
  } catch (err) {
    const errors = signUpErrors(err);
    res.status(400).send({ errors });
  }
};


// Fonction pour la vérification du code
module.exports.verifyCode = async (req, res) => {
  try {
    console.log(req.params.email);

    const user = await User.findOne({ email: req.params.email });

    console.log(user);

    if (!user) {
      return res.status(401).json({ message: "Pas de user" });
    }
    console.log(user.code);

    if (user.code === req.body.code) {
      code = await User.findOneAndUpdate(
        { email: req.params.email },
        { code: null }
      );
      const token = createToken(user._id);
      res.cookie("jwt", token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: maxAge,
      });
      res.status(200).json({ user: code._id, token: token });
    } else {
      code = await User.findOneAndDelete({ email: req.params.email });
    }
  } catch (err) {
    const errors = signUpErrors(err);
    res.status(400).send({ errors });
  }
};


// Fonction pour la connexion d'un utilisateur
module.exports.signIn = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.login(email, password);
    const token = createToken(user._id);
    console.log(token);

    res.cookie("jwt", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: maxAge,
    });
    res.status(200).json({ user: user._id, token: token });
  } catch (err) {
    const errors = signInErrors(err);
    res.status(400).send({ errors });
  }
};


// Fonction pour la déconnexion d'un utilisateur
module.exports.logout = async (req, res) => {
  res.cookie("jwt", "", { maxAge: 1 });
  res.status(200).json({ message: "Deconnexion reussie" });
};


// Fonction pour récupérer tous les utilisateurs
module.exports.getUsers = async (req, res) => {
  try {
    const Users = await User.find().select();
    res.status(200).json(Users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Fonction pour récupérer un utilisateur spécifique
module.exports.getUser = async (req, res) => {
  try {
    const userId = req.params.userId;

    const Users = await User.findById({ _id: userId }).select("id");
    console.log(Users);

    res.status(200).json(Users);
  } catch (error) {
    throw error;
  }
};


// Fonction pour la mise à jour d'un utilisateur spécifique
module.exports.updateUser = async (req, res) => {
  try {
    const id = req.params.id;

    console.log(id);
    
    const user = await User.findOneAndUpdate({ _id: id }, req.body);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const updatedUser = await User.findOneAndUpdate({ id: req.body.id });
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Fonction pour la suppression d'un utilisateur spécifique
module.exports.deleteUser = async (req, res) => {
  try {
    const id = req.params.id;

    const user = await User.findOneAndDelete({ _id: id });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted succesfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
