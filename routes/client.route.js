const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth.js");

const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  signUp,
  signIn,
  logout,
  verifyCode,
} = require("../controllers/client.controller.js");

// Enregistrement d'un utilisateur
router.post("/register", signUp);

// Vérification du mail
router.post("/verify/:email", verifyCode);

// Connexion d'un utilisateur
router.post("/login", signIn);

// Affichage de tous les utilisateurs
router.get("/", requireAuth, getUsers); //requireAuth

// Déconnexion d'un utilisateur
router.get("/logout", requireAuth, logout); //requireAuth

// Affichage d'un utilisateur
router.get("/:userId", requireAuth, getUser); //requireAuth

// Mise à jour d'un utilisateur
router.put("/:id", requireAuth, updateUser); //requireAuth

// Suppression d'un utilisateur
router.delete("/:id", requireAuth, deleteUser); //requireAuth

module.exports = router;
