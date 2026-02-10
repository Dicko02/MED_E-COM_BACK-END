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

// Routes authentifiées
router.post("/createNewCategory", requireAuth, createNewCategory); // Création d'une nouvelle catégorie
router.get("/viewAllCategory", viewAllCategory); // Affichage de toutes les catégories
router.get("/viewOneCategory/:id", viewOneCategory); // Affichage d'une catégorie
router.put("/updateOneCategory/:id", requireAuth, updateOneCategory); // Mise à jour d'une catégorie
router.delete("/deleteOneCategory/:id", requireAuth, deleteOneCategory); // Suppression d'une catégorie

module.exports = router;
