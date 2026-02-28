const jwt = require("jsonwebtoken");
const User = require("../model/userSchema.js");

const adminMiddleware = async (req, res, next) => {
    try {
        const { token } = req.cookies;
        if (!token) {
            return res.status(401).json({ message: "Token missing! Please log in." });
        }

        const decoded = jwt.verify(token, process.env.SECRET_KEY);
       // const user = await User.findById(decoded._id);   // when we don't send role in token, we can fetch it from DB to check if user is admin or not. This way we can also handle role changes without needing to reissue tokens.
        const user = decoded; // when we include role in token, we can skip DB fetch and directly check role from decoded token payload.
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ message: "Admin access required" });
        }

        req.user = user;
        next();

    } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
    }
};

module.exports = adminMiddleware; // CommonJS export
