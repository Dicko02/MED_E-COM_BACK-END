require('dotenv').config();
const mongoose = require('mongoose');

(async () => {
  try {
    console.log("🔗 Tentative de connexion à:", process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connexion réussie !");
  } catch (err) {
    console.error("❌ Erreur de connexion:", err.message);
  } finally {
    await mongoose.disconnect();
  }
})();
