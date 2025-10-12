const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth.js");

const {
  createNewOrder,
  deleteOneOrder,
  updateOneOrder,
  viewAllOrder,
  getAllOrders,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  createOrder,
  cancelOrder,
  getOrderStats,
  createCartOrder
} = require("../controllers/order.controller");

// Routes pour les commandes


// Création d'une nouvelle commande
router.post("/createNewOrder", requireAuth, createNewOrder);

// Affichage de toutes les commandes
router.get("/viewAllOrder", requireAuth, viewAllOrder);

// Suppression d'une commande
router.delete("/deleteOneOrder/:id", requireAuth, deleteOneOrder);

// Mise à jour d'une commande
router.put("/updateOneOrder/:id", requireAuth, updateOneOrder);

// Route pour récupérer toutes les commandes (admin)
router.get('/all', requireAuth, getAllOrders);

// Route pour récupérer les commandes d'un utilisateur
router.get('/user/:email', requireAuth, getUserOrders);

// Route pour récupérer une commande spécifique
router.get('/:orderId', requireAuth, getOrderById);

// Route pour créer une nouvelle commande
router.post('/create', requireAuth, createOrder);

// Route pour créer une commande avec panier complet
router.post('/cart/create', requireAuth, createCartOrder);

// Route pour mettre à jour le statut d'une commande
router.put('/:orderId/status', requireAuth, updateOrderStatus);

// Route pour annuler une commande
router.put('/:orderId/cancel', requireAuth, cancelOrder);

// Route pour les statistiques des commandes (admin)
router.get('/stats/overview', requireAuth, getOrderStats);

module.exports = router;
