import jwt from 'jsonwebtoken';

const adminAuth = async (req, res, next) => {
    try {
        const { token } = req.headers;

        console.log('🔐 AdminAuth - Token received:', token ? 'Yes' : 'No');

        if (!token) {
            return res.status(401).json({
                success: false, 
                message: "No token provided"
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        console.log('🔐 AdminAuth - Decoded:', decoded);

        if (!decoded.email || !decoded.role) {
            return res.status(401).json({
                success: false,
                message: "Invalid token structure"
            });
        }

        // Vérification admin
        const isAdmin = decoded.role === 'admin' && 
                       decoded.email === process.env.ADMIN_EMAIL;

        console.log('🔐 AdminAuth - IsAdmin:', isAdmin);
        console.log('🔐 Expected ADMIN_EMAIL:', process.env.ADMIN_EMAIL);
        console.log('🔐 Token email:', decoded.email);

        if (!isAdmin) {
            return res.status(401).json({
                success: false, 
                message: "Not authorized as admin"
            });
        }

        req.isAdmin = true;
        req.adminEmail = decoded.email;
        req.userId = decoded.id || decoded._id; // Important pour les routes admin
        next();
        
    } catch (error) {
        console.error('🔐 AdminAuth Error:', error.message);
        res.status(401).json({ 
            success: false, 
            message: error.message 
        });
    }
};

export default adminAuth;