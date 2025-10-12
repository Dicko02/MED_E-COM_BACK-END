const jwt = require('jsonwebtoken');


//Middleware pour vérifier si l'utilisateur est connecté via un token JWT et récupérer son ID depuis le token(Il doit être utilisé **après** cookie-parser dans Express: app.use(cookieParser()))
const requireAuth = (req, res, next) => {

    // Récupération du token depuis les cookies(avec cookie-parser, tous les cookies sont accessibles via req.cookies)
    const token = req.cookies?.jwt; // le nom du cookie qui contient le token est 'jwt'

    // Vérification de l'existence du token
    if (!token) {
        return res.status(401).json({ message: 'Token manquant, veuillez vous connecter.' });
    }

    // Vérification et décodage du token
    jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {

        if (err) {
            // Si le token est invalide ou expiré
            return res.status(401).json({ message: 'Token invalide ou expiré.' });
        }

        // Ajout de l'ID de l'utilisateur à la requête pour les routes suivantes
        req.userId = decoded.id; // le champ que j'ai mis dans la payload du token (id)

        // Passage au middleware ou à la route suivante
        next();
        
    });

};

module.exports = requireAuth;
