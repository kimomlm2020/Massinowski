import jwt from 'jsonwebtoken';

const authUser = (req, res, next) => {
  try {
    const token = req.headers.token || 
                  req.headers.authorization?.replace('Bearer ', '') ||
                  req.query.token;

    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    req.userId = decoded.id || decoded.userId || decoded._id;
    
    if (!req.userId) {
      return res.status(401).json({ success: false, message: 'Invalid token structure' });
    }

    next();
    
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: error.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token'
    });
  }
};

export default authUser;