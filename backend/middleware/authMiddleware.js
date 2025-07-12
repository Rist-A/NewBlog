const jwt = require('jsonwebtoken');

const authMiddleware = (requiredRoles = []) => {
  return (req, res, next) => { // Removed async as it's not needed
    try {
      const authHeader = req.headers.authorization;

      // 1. Check if token is present
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ 
          error: 'Authentication required',
          message: 'No token provided or malformed authorization header'
        });
      }

      const token = authHeader.split(' ')[1];
      if (!token) {
        return res.status(401).json({
          error: 'Invalid token',
          message: 'Token is malformed'
        });
      }

      // 2. Verify JWT
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (verifyError) {
        if (verifyError.name === 'TokenExpiredError') {
          return res.status(401).json({ 
            error: 'Token expired',
            message: 'Your session has expired. Please log in again.'
          });
        }
        return res.status(401).json({ 
          error: 'Invalid token',
          message: 'Failed to authenticate token'
        });
      }

      // 3. Validate token structure
      if (!decoded?.id) {
        return res.status(401).json({
          error: 'Invalid token payload',
          message: 'Token is missing required user identification'
        });
      }

      // 4. Attach user to request
      req.user = {
        id: decoded.id,
        role: decoded.role || 'user', // Added fallbacks
        email: decoded.email || null,
        user_name: decoded.user_name || null,
        user_image: decoded.user_image || null
      };

      if (process.env.NODE_ENV !== 'production') {
        console.log("✅ Authenticated user:", req.user);
      }

      // 5. Role-based access control
      if (requiredRoles.length > 0) {
        const userRole = (req.user.role || '').toLowerCase();
        const allowedRoles = requiredRoles.map(r => r.toLowerCase());

        if (!allowedRoles.includes(userRole)) {
          return res.status(403).json({
            error: 'Access denied',
            message: `Requires one of these roles: ${requiredRoles.join(', ')}`
          });
        }
      }

      next(); // Proceed to the next middleware/route

    } catch (error) {
      console.error('❌ Authentication middleware error:', error);
      return res.status(500).json({
        error: 'Authentication processing failed',
        message: 'An unexpected error occurred during authentication'
      });
    }
  };
};

module.exports = authMiddleware;
