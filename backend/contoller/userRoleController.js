// const  UserRoles = require('../models/UserRoles.js');

// // List of allowed roles (customize as needed)
// const ALLOWED_ROLES = ['user', 'admin', 'moderator'];

// // Change a user's role by user_id
// const changeUserRoles = async (req, res) => {
//   try {
//     const { user_id } = req.params;
//     const { new_role } = req.body;

//     // Validate the new role
//     if (!ALLOWED_ROLES.includes(new_role)) {
//       return res.status(400).json({ error: 'Invalid role' });
//     }

//     // Update the user's role
//     const [updated] = await UserRoles.update(
//       { user_role: new_role },
//       { where: { user_id } }
//     );

//     if (updated) {
//       const updatedUserRoles = await UserRoles.findOne({ where: { user_id } });
//       res.json(updatedUserRoles);
//     } else {
//       res.status(404).json({ error: 'User not found or role unchanged' });
//     }
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// module.exports = {
//   changeUserRoles,
// };