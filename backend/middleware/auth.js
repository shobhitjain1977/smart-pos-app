const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No authentication token, access denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-this');
    
    // Find user
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Attach user to request
    req.user = user;
    req.userId = user._id;
    
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};

// Admin middleware
const adminAuth = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }
    next();
  } catch (error) {
    res.status(403).json({ error: 'Access denied' });
  }
};

module.exports = { auth, adminAuth };
