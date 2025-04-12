const jwt = require('jsonwebtoken');
const UsersRoles = require('../models/UsersRoles.js');
const  UserRoles  = require('../models/UserRoles.js');



const roleBasedRouting = async (req, res, next) => {
  try {
    // Default route for non-authenticated users
    let route = '/blog';
    let navigationType = 'guest';
    
    // Check for token in headers or cookies
    const token = req.headers.authorization?.split(' ')[1] || req.cookies?.token;
    
    if (token) {
      try {
        // Verify token and get user ID
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;
        
        // Get user's role from database
        const UserRoles = await UsersRoles.findOne({
          where: { user_id: userId },
          include: [{
            model: UserRoles,
            attributes: ['user_role']
          }]
        });
        
        if (UserRoles) {
          const roleName = UserRoles.UserRoles.user_role.toLowerCase();
          
          // Set route and navigation based on role
          switch(roleName) {
            case 'admin':
            case 'subadmin':
              route = '/admin';
              navigationType = 'admin';
              break;
            case 'user':
              route = '/blog';
              navigationType = 'user';
              break;
            default:
              route = '/blog';
              navigationType = 'user';
          }
          
          // Attach role info to request for use in components
          req.user = {
            id: userId,
            role: roleName
          };
        }
      } catch (error) {
        console.error('Token verification failed:', error);
        // Proceed with default guest access
      }
    }
    
    // Attach routing info to response locals
    res.locals.route = route;
    res.locals.navigationType = navigationType;
    next();
    
  } catch (error) {
    console.error('Role-based routing error:', error);
    // Fallback to default route on error
    res.locals.route = '/blog';
    res.locals.navigationType = 'guest';
    next();
  }
};

module.exports = roleBasedRouting;