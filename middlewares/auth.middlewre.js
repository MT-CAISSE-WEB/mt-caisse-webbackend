const jwt = require("jsonwebtoken");
const dotenv = require('dotenv');
dotenv.config({path: '../config/config.env'});

function authentificatetoken(req, res, next) {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(401).json({ message: "Token manquant" });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: "Token manquant" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Token invalide ou expiré" });
        }
        req.user = user;
        next();
    });
}


module.exports = {authentificatetoken};