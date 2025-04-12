// const jwt = require('jsonwebtoken');

// module.exports = (req, res, next) => {
//   const token = req.header('Authorization')?.replace('Bearer ', '');

//   if (!token) {
//     return res.status(401).json({ error: 'Access denied. No token provided.' });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded; // Attach user data to the request
//     next();
//   } catch (err) {
//     res.status(400).json({ error: 'Invalid token.' });
//   }
// };

//middleware/authMiddleware.js

// const jwt = require('jsonwebtoken');

// const authMiddleware = (requiredRoles = []) => {
//   return async (req, res, next) => {
//     try {
//       // 1. Check if token exists
//       const authHeader = req.headers.authorization;
//       if (!authHeader || !authHeader.startsWith('Bearer ')) {
//         return res.status(401).json({ 
//           error: 'Authentication required',
//           message: 'No token provided or malformed authorization header'
//         });
//       }

//       const token = authHeader.split(' ')[1];
      
//       // 2. Verify token
//       let decoded;
//       try {
//         decoded = jwt.verify(token, process.env.JWT_SECRET);
//       } catch (verifyError) {
//         if (verifyError.name === 'TokenExpiredError') {
//           return res.status(401).json({ 
//             error: 'Token expired',
//             message: 'Your session has expired. Please log in again.'
//           });
//         }
//         return res.status(401).json({ 
//           error: 'Invalid token',
//           message: 'Failed to authenticate token'
//         });
//       }

//       // 3. Validate token structure
//       if (!decoded.id) {
//         return res.status(401).json({
//           error: 'Invalid token payload',
//           message: 'Token is missing required user identification'
//         });
//       }

//       // Attach user to request
//       req.user = {
//         id: decoded.id,
//         role: decoded.role,
//         email: decoded.email,
//         user_name: decoded.user_name,
//         user_image: decoded.user_image
//       };
      
//       console.log("Authenticated user:", req.user); // Debug logging

//       // 4. Role-based authorization check
//       if (requiredRoles.length > 0) {
//         if (!decoded.role) {
//           return res.status(403).json({
//             error: 'Role information missing',
//             message: 'Token does not contain role information'
//           });
//         }

//         if (!requiredRoles.includes(decoded.role)) {
//           return res.status(403).json({
//             error: 'Access denied',
//             message: `Requires one of these roles: ${requiredRoles.join(', ')}`
//           });
//         }
//       }

//       // Proceed to the next middleware/controller
//       next();
//     } catch (error) {
//       console.error('Authentication middleware error:', error);
//       return res.status(500).json({
//         error: 'Authentication processing failed',
//         message: 'An unexpected error occurred during authentication'
//       });
//     }
//   };
// };

// module.exports = authMiddleware;

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

// const jwt = require('jsonwebtoken');
// const User = require('../models/User');

// const authMiddleware = async (req, res, next) => {
//   try {
//     // Get token from header
//     const token = req.header('Authorization')?.replace('Bearer ', '');

//     if (!token) {
//       return res.status(401).json({ error: 'No token provided' });
//     }

//     // Verify token
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     // Find user and attach to request
//     const user = await User.findByPk(decoded.id, {
//       attributes: { exclude: ['password'] } // Don't send password back
//     });

//     if (!user) {
//       return res.status(401).json({ error: 'User not found' });
//     }

//     req.user = user; // Attach user to request
//     next();
//   } catch (error) {
//     console.error('Authentication error:', error);
    
//     let errorMessage = 'Authentication failed';
//     if (error.name === 'JsonWebTokenError') {
//       errorMessage = 'Invalid token';
//     } else if (error.name === 'TokenExpiredError') {
//       errorMessage = 'Token expired';
//     }

//     res.status(401).json({ 
//       error: errorMessage,
//       ...(process.env.NODE_ENV === 'development' && { details: error.message })
//     });
//   }
// };

// // Optional: Admin check middleware
// const adminMiddleware = (req, res, next) => {
//   if (req.user.role_id !== 'admin-role-id') { // Replace with your actual admin role ID
//     return res.status(403).json({ error: 'Admin access required' });
//   }
//   next();
// };

// module.exports = {
//   authMiddleware,
//   adminMiddleware
// };