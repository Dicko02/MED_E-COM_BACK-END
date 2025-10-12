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
} = require("../controllers/admin.controller.js");

// Enregistrement d'un administrateur
router.post("/register", signUp);

// Vérification du mail
router.post("/verify/:email", verifyCode);

// Connexion d'un administrateur
router.post("/login", signIn);

// Affichage de tous les administrateurs
router.get("/", requireAuth, getUsers);

// Déconnexion d'un administrateur
router.get("/logout", requireAuth, logout);

// Affichage d'un administrateur
router.get("/:userId", requireAuth, getUser);

// Mise à jour d'un administrateur
router.put("/:id", requireAuth, updateUser);

// Suppression d'un administrateur
router.delete("/:id", requireAuth, deleteUser);

module.exports = router;
