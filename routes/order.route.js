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

// Affichage de toutes les commandes
router.get("/viewAllOrder", requireAuth, viewAllOrder);

// Route pour récupérer toutes les commandes (admin)
router.get('/all', requireAuth, getAllOrders);

// Route pour créer une nouvelle commande
router.post('/create', createOrder);

// Route pour créer une commande avec panier complet
router.post('/cart/create', createCartOrder);

// Route pour les statistiques des commandes (admin)
router.get('/stats/overview', requireAuth, getOrderStats);

// Route pour récupérer les commandes d'un utilisateur
router.get('/user/:email', requireAuth, getUserOrders);

// Route pour récupérer une commande spécifique
router.get('/:orderId', requireAuth, getOrderById);

// Route pour mettre à jour le statut d'une commande
router.put('/:orderId/status', requireAuth, updateOrderStatus);

// Route pour annuler une commande
router.put('/:orderId/cancel', requireAuth, cancelOrder);

// Suppression d'une commande
router.delete("/deleteOneOrder/:id", requireAuth, deleteOneOrder);

// Mise à jour d'une commande
router.put("/updateOneOrder/:id", requireAuth, updateOneOrder);

module.exports = router;
