const Order = require("../models/orderModel");
const ProduitsModel = require("../models/produitsModel");
const sendConfirmationEmail = require("../utils/orderMailer");

// Fonction pour la création d'une nouvelle commande
module.exports.createNewOrder = async (req, res) => {
  try {
    const { produitId, quantity, customerEmail } = req.body;
    const produit = await ProduitsModel.findById(produitId);

    if (produit.nombreDisponible < quantity) {
      return res.status(400).json({ message: "Stock insuffisant" });
    }

    const order = new Order({
      produitId,
      quantity,
      customerEmail,
    });

    // Mise à jour du stock du produit après la commande
    produit.nombreDisponible = produit.nombreDisponible - quantity;
    await produit.save(); // Sauvegarde de la nouvelle quantité

    // Envoi de l'email de confirmation
    sendConfirmationEmail(customerEmail, produit.name, quantity);

    // Sauvegarde de la commande dans la base de données
    await order.save();

    res.status(200).json({ message: "Commande enregistrée, mail envoyé", order });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la création de la commande", error });
  }
};


// Fonction pour la récupération de toutes les commandes
module.exports.viewAllOrder = async (req, res) => {
  try {
    const orders = await Order.find();
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des commandes", error });
  }
};


// Fonction pour la récupération d'une commande par ID
module.exports.viewOneOrder = async (req, res) => {
  try {
    const id = req.params.id;
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Commande non trouvée" });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération de la commande",
      error,
    });
  }
};


// Fonction pour la suppression d'une commande
module.exports.deleteOneOrder = async (req, res) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);
    if (!deletedOrder) {
      return res.status(404).json({ message: "Commande non trouvée" });
    }
    res.status(200).json({ message: "Commande supprimée", order: deletedOrder });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la suppression de la commande", error });
  }
};


// Fonction pour la mise à jour d'une commande
module.exports.updateOneOrder = async (req, res) => {
  try {
    const { product, quantity, customerEmail } = req.body;
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { product, quantity, customerEmail },
      { new: true, runValidators: true }
    );
    if (!updatedOrder) {
      return res.status(404).json({ message: "Commande non trouvée" });
    }
    res.status(200).json({ message: "Commande mise à jour", order: updatedOrder });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la mise à jour de la commande", error });
  }
};


// Fonction pour la récupération de toutes les commandes
module.exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('produitId', 'nom prix image')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      orders: orders
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des commandes' });
  }
};


// Fonction pour la récupération des commandes d'un utilisateur spécifique
module.exports.getUserOrders = async (req, res) => {
  try {
    const { email } = req.params;
    
    if (!email) {
      return res.status(400).json({ error: 'Email utilisateur requis' });
    }

    const orders = await Order.find({ customerEmail: email })
      .populate('produitId', 'nom prix image description')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      orders: orders
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes utilisateur:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des commandes' });
  }
};


// Fonction pour la création d'une nouvelle commande
module.exports.createOrder = async (req, res) => {
  try {
    const { produitId, quantity, customerEmail, customerInfo } = req.body;
    
    if (!produitId || !quantity || !customerEmail) {
      return res.status(400).json({ 
        error: 'Produit ID, quantité et email client requis' 
      });
    }

    // Vérifier si le produit existe
    const produit = await ProduitsModel.findById(produitId);
    if (!produit) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }

    // Vérifier le stock
    if (produit.nombreDisponible < quantity) {
      return res.status(400).json({ error: 'Stock insuffisant' });
    }

    // Calculer le total
    const totalAmount = produit.prix * quantity;

    // Créer la commande
    const order = new Order({
      produitId,
      quantity,
      customerEmail,
      customerInfo,
      totalAmount,
      status: 'pending'
    });

    const savedOrder = await order.save();
    
    // Mettre à jour le stock du produit
    produit.nombreDisponible -= quantity;
    await produit.save();

    res.status(201).json({
      success: true,
      order: savedOrder,
      message: 'Commande créée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la création de la commande:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la création de la commande' });
  }
};


// Fonction pour la récupération d'une commande spécifique
module.exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findById(orderId)
      .populate('produitId', 'nom prix image description');
    
    if (!order) {
      return res.status(404).json({ error: 'Commande non trouvée' });
    }
    
    res.status(200).json({
      success: true,
      order: order
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la commande:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération de la commande' });
  }
};


// Fonction pour la mise à jour du statut d'une commande
module.exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, trackingNumber } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Statut requis' });
    }

    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Statut invalide' });
    }

    const updateData = { status };
    if (trackingNumber) {
      updateData.trackingNumber = trackingNumber;
    }
    
    if (status === 'shipped') {
      updateData.shippingDate = new Date();
    } else if (status === 'delivered') {
      updateData.deliveryDate = new Date();
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      updateData,
      { new: true }
    ).populate('produitId', 'nom prix image');
    
    if (!order) {
      return res.status(404).json({ error: 'Commande non trouvée' });
    }
    
    res.status(200).json({
      success: true,
      order: order,
      message: 'Statut de la commande mis à jour avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la mise à jour du statut' });
  }
};


// Fonction pour l'annulation d'une commande
module.exports.cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Commande non trouvée' });
    }

    // Vérifier si la commande peut être annulée
    if (order.status === 'delivered' || order.status === 'cancelled') {
      return res.status(400).json({ 
        error: 'Cette commande ne peut pas être annulée' 
      });
    }

    // Mettre à jour le statut
    order.status = 'cancelled';
    await order.save();

    // Restaurer le stock si la commande était confirmée
    if (order.status === 'confirmed' || order.status === 'shipped') {
      const produit = await ProduitsModel.findById(order.produitId);
      if (produit) {
        produit.nombreDisponible += order.quantity;
        await produit.save();
      }
    }

    res.status(200).json({
      success: true,
      order: order,
      message: 'Commande annulée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de l\'annulation de la commande:', error);
    res.status(500).json({ error: 'Erreur serveur lors de l\'annulation de la commande' });
  }
};


// Fonction pour l'obtention des statistiques des commandes
module.exports.getOrderStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    
    const recentOrders = await Order.find()
      .populate('produitId', 'nom prix')
      .sort({ createdAt: -1 })
      .limit(10);

    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        recentOrders,
        ordersByStatus
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};


// Fonction pour la création d'une commande avec panier complet
module.exports.createCartOrder = async (req, res) => {
  try {
    const { clientId, cartItems, customerInfo, totalAmount } = req.body;
    
    console.log('📦 Création commande panier:', {
      clientId,
      cartItems: cartItems?.length,
      customerInfo,
      totalAmount
    });
    
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ 
        error: 'Articles du panier requis' 
      });
    }

    if (!customerInfo || !customerInfo.email) {
      return res.status(400).json({ 
        error: 'Informations client et email requis' 
      });
    }

    // Vérifier et mettre à jour le stock pour chaque produit
    const createdOrders = [];
    let calculatedTotal = 0;

    for (const item of cartItems) {
      const produit = await ProduitsModel.findById(item.productId || item.product._id);
      
      if (!produit) {
        return res.status(404).json({ 
          error: `Produit non trouvé: ${item.productId || item.product._id}` 
        });
      }

      if (produit.nombreDisponible < item.quantity) {
        return res.status(400).json({ 
          error: `Stock insuffisant pour ${produit.nom}: ${produit.nombreDisponible} disponible(s)` 
        });
      }

      const itemTotal = produit.prix * item.quantity;
      calculatedTotal += itemTotal;

      // Créer une commande pour chaque produit (selon le modèle Order)
      const order = new Order({
        produitId: produit._id,
        quantity: item.quantity,
        customerEmail: customerInfo.email,
        customerInfo: {
          firstName: customerInfo.firstName,
          lastName: customerInfo.lastName,
          email: customerInfo.email,
          phone: customerInfo.phone,
          address: customerInfo.address
        },
        totalAmount: itemTotal,
        status: 'confirmed',
        paymentStatus: 'completed',
        orderDate: new Date()
      });

      const savedOrder = await order.save();
      createdOrders.push(savedOrder);

      // Mettre à jour le stock du produit
      await ProduitsModel.findByIdAndUpdate(
        produit._id,
        { $inc: { nombreDisponible: -item.quantity } }
      );
    }

    console.log('✅ Commandes créées:', createdOrders.length);

    // Retourner la première commande avec un résumé
    const mainOrder = createdOrders[0];
    const orderSummary = {
      ...mainOrder.toObject(),
      _id: mainOrder._id,
      totalCartAmount: calculatedTotal,
      itemCount: cartItems.length,
      allOrderIds: createdOrders.map(o => o._id)
    };

    res.status(201).json({
      success: true,
      order: orderSummary,
      message: `${createdOrders.length} commande(s) créée(s) avec succès`
    });
  } catch (error) {
    console.error('❌ Erreur lors de la création de la commande:', error);
    res.status(500).json({ 
      error: 'Erreur serveur lors de la création de la commande',
      details: error.message 
    });
  }
};


