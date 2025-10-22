require('dotenv').config();
const mongoose = require('mongoose');

mongoose.set('strictQuery', true);

const connectDB = async () => {
  try {
    console.log("🔗 Tentative de connexion à:", process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connexion Mongo réussie !");
  } catch (err) {
    console.error("❌ Erreur de connexion Mongo:", err.message);
    process.exit(1); // Quitte le serveur si la connexion échoue
  }
};

module.exports = connectDB;
