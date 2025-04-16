const sequelize = require("./db.js");
const cors = require('cors');
// Import models
const User = require("./models/User.js");
const Post = require("./models/Post.js");
const Comment = require("./models/Comment.js");
const Like = require("./models/Like.js");
const Category = require("./models/Category.js");
const Tag = require("./models/Tag.js");
const PostTags =require("./models/PostTags.js");
const UserRole =require("./models/UserRole.js");
const UserRoutes = require("./routes/UserRoutes.js")
const authRoutes = require("./routes/authRoutes.js")
const CommentRoutes= require("./routes/CommentRoutes.js")
const CategoryRoutes = require('./routes/CategoryRoutes.js')
const PostRoutes = require('./routes/PostRoutes.js');
const LikeRoutes = require('./routes/LikeRoutes.js')
const tagRoutes =require('./routes/tagRoutes.js')
const SavedPost = require('./models/SavedPost.js')
const express = require('express');
const SavedPostRoutes = require('./routes/SavedPostRoutes.js')
const cloudinary = require('cloudinary').v2;
require('dotenv').config();
const ProfileRoutes = require('./routes/ProfileRoutes.js');
const openAIRoutes= require('./routes/openai.js')

//POST http://localhost:5000/posts/d8683c36-79fc-4964-a108-35567b07155b/save


const app = express();
app.use(express.json());
// app.use(cors());
app.use(cors({
  origin: 'http://localhost:5173',  // Allow only frontend URL
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: 'Content-Type,Authorization'
}));

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
REACT_APP_OPENAI_KEY: process.env.REACT_APP_OPENAI_KEY;

// Define all associations in one place
function setupAssociations() {
  // UserRole associations
  UserRole.hasMany(User, {
    foreignKey: 'role_id',
    as: 'users'
  });

  // User associations
  User.belongsTo(UserRole, {
    foreignKey: 'role_id',
    as: 'role'
  });
  User.hasMany(Post, {
    foreignKey: 'author_id',
    as: 'posts'
  });
  User.hasMany(Comment, {
    foreignKey: 'author_id',
    as: 'comments',
    onDelete: 'CASCADE'
  });
  User.hasMany(Like, {
    foreignKey: 'author_id',
    as: 'likes',
    onDelete: 'CASCADE'
  });

  // Category associations
  Category.hasMany(Post, {
    foreignKey: 'category_id',
    as: 'posts',
    onDelete: 'RESTRICT'
  });

  // Post associations
  Post.belongsTo(User, {
    foreignKey: 'author_id',
    as: 'author',
    onDelete: 'CASCADE'
  });
  Post.belongsTo(Category, {
    foreignKey: 'category_id',
    as: 'category',
    onDelete: 'RESTRICT'
  });
  Post.hasMany(Comment, {
    foreignKey: 'post_id',
    as: 'comments',
    onDelete: 'CASCADE'
  });
  Post.hasMany(Like, {
    foreignKey: 'post_id',
    as: 'likes',
    onDelete: 'CASCADE'
  });
  Post.belongsToMany(Tag, {
    through: PostTags,
    foreignKey: 'post_id',
    otherKey: 'tag_id',
    as: 'tags',
    onDelete: 'CASCADE'
  });

  // Comment associations
  Comment.belongsTo(Post, {
    foreignKey: 'post_id',
    as: 'comments',
    onDelete: 'CASCADE'
  });
  Comment.belongsTo(User, {
    foreignKey: 'author_id',
    as: 'author',
    onDelete: 'CASCADE'
  });

  // Like associations
  Like.belongsTo(Post, {
    foreignKey: 'post_id',
    as: 'post',
    onDelete: 'CASCADE'
  });
  Like.belongsTo(User, {
    foreignKey: 'author_id',
    as: 'author',
    onDelete: 'CASCADE'
  });

  // Tag associations
  Tag.belongsToMany(Post, {
    through: PostTags,
    foreignKey: 'tag_id',
    otherKey: 'post_id',
    as: 'posts',
    onDelete: 'CASCADE'
  });
  User.hasMany(SavedPost, {
    foreignKey: 'user_id',
    as: 'savedPosts',
    onDelete: 'CASCADE'
  });

  // Post can be saved by many users
  Post.hasMany(SavedPost, {
    foreignKey: 'post_id',
    as: 'savedByUsers',
    onDelete: 'CASCADE'
  });

  // Many-to-Many through SavedPost (junction table)
  User.belongsToMany(Post, {
    through: SavedPost,
    foreignKey: 'user_id',
    otherKey: 'post_id',
    as: 'savedPostsRelation',
    onDelete: 'CASCADE'
  });

  Post.belongsToMany(User, {
    through: SavedPost,
    foreignKey: 'post_id',
    otherKey: 'user_id',
    as: 'savedByUsersRelation',
    onDelete: 'CASCADE'
  });
  SavedPost.belongsTo(Post, {
    foreignKey: 'post_id',
    as: 'post',
    onDelete: 'CASCADE'
  });
  SavedPost.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user',
    onDelete: 'CASCADE'
  });

}

// Start the server
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log("Connection to the database is successful.");

    // Setup associations
    setupAssociations();

    // Start server
    app.listen(5000, () => {
      console.log("Server has started on port 5000");
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

app.use('/', UserRoutes);
app.use('/', authRoutes);
app.use('/', CategoryRoutes);
app.use('/', CommentRoutes);
app.use('/', PostRoutes);
app.use('/', LikeRoutes);
app.use('/',SavedPostRoutes);
app.use('/', ProfileRoutes);
app.use('/',CategoryRoutes);
app.use('/',tagRoutes)
app.use('/api/openai', openAIRoutes);

// Start everything
startServer();

// Export models
module.exports = {
  sequelize,
  User,
  UserRole,
  Post,
  Comment,
  Like,
  Category,
  Tag,
  PostTags,
  SavedPost
};
