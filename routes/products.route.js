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
  getNewProducts,
  totalProducts
} = require("../controllers/produits.controller");

router.get("/getAllProduits", getAllProduct); // Affichage de tous les produits

router.get("/search", searchProducts); // Recherche de produits

router.get("/popular", getPopularProducts); // Affichage des produits populaires

router.get("/new", getNewProducts); // Affichage des nouveaux produits

router.get("/statistiques/total-products", requireAuth, totalProducts); // Affichage du nombre total de produits

router.post("/bulk", requireAuth, addBulkProducts); // Ajout de plusieurs produits

router.post("/uploadImage", requireAuth, uploadWithErrorHandling, uploadImage); // Upload d'une image

router.post("/addProduit", requireAuth, uploadWithErrorHandling, addProduct); // Ajout d'un produit

router.get("/category/:categoryId", getProductsByCategory); // Affichage des produits par catégorie

router.put("/updateProduit/:id", requireAuth, uploadWithErrorHandling, updatedProduct); // Mise à jour d'un produit

router.get("/getProduit/:id", getProductById); // Affichage d'un produit

router.delete("/deleteProduit/:id", requireAuth, deleteProduct); // Suppression d'un produit

module.exports = router;
