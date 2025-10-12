const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");

const {
  createNewCategory,
  viewAllCategory,
  viewOneCategory,
  updateOneCategory,
  deleteOneCategory,
} = require("../controllers/category.controller");

// Routes publiques pour l'administration (à sécuriser en production)
router.post("/addCategory", createNewCategory); // Création d'une nouvelle catégorie
router.get("/getAllCategories", viewAllCategory); // Affichage de toutes les catégories
router.get("/getCategory/:id", viewOneCategory); // Affichage d'une catégorie
router.put("/updateCategory/:id", updateOneCategory); // Mise à jour d'une catégorie
router.delete("/deleteCategory/:id", deleteOneCategory); // Suppression d'une catégorie

// Routes authentifiées
router.post("/createNewCategory", requireAuth, createNewCategory); // Création d'une nouvelle catégorie
router.get("/viewAllCategory", requireAuth, viewAllCategory); // Affichage de toutes les catégories
router.get("/viewOneCategory/:id", requireAuth, viewOneCategory); // Affichage d'une catégorie
router.put("/updateOneCategory/:id", requireAuth, updateOneCategory); // Mise à jour d'une catégorie
router.delete("/deleteOneCategory/:id", requireAuth, deleteOneCategory); // Suppression d'une catégorie

module.exports = router;
