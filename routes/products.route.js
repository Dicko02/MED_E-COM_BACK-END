const express = require("express");
const router = express.Router();
const { uploadWithErrorHandling } = require("../middleware/upload");
const requireAuth = require("../middleware/requireAuth.js");

const {
  getAllProduct,
  getProductById,
  addProduct,
  updatedProduct,
  deleteProduct,
  uploadImage,
  searchProducts,
  getProductsByCategory,
  addBulkProducts,
  getPopularProducts,
  getNewProducts
} = require("../controllers/produits.controller");

// Routes pour les produits-01
router.get("/getAllProduits", requireAuth, getAllProduct);// Affichage de tous les produits
router.get("/search", requireAuth, searchProducts);// Recherche de produits
router.get("/popular", requireAuth, getPopularProducts);// Affichage des produits populaires
router.get("/new", requireAuth, getNewProducts);// Affichage des nouveaux produits
router.get("/category/:categoryId", requireAuth, getProductsByCategory);// Affichage des produits par catégorie
router.get("/getProduit/:id", requireAuth, getProductById);// Affichage d'un produit
router.delete("/deleteProduit/:id", requireAuth, deleteProduct);// Suppression d'un produit

// Route pour ajouter plusieurs produits en une fois
router.post("/bulk", requireAuth, addBulkProducts);// Ajout de plusieurs produits

// Routes pour les produits-02
router.post("/addProduit", requireAuth, uploadWithErrorHandling, addProduct);// Ajout d'un produit
router.put("/updateProduit/:id", requireAuth, uploadWithErrorHandling, updatedProduct);// Mise à jour d'un produit

// Route pour upload d'image seule
router.post("/uploadImage", requireAuth, uploadWithErrorHandling, uploadImage);// Upload d'une image

module.exports = router;
