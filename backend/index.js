const express = require("express");
const app = express();
const cors = require("cors");
const pool = require("./db")
const jwt = require("jsonwebtoken");
//const { authenticateToken } = require("./auth");
const bcrypt = require("bcrypt");
require("dotenv").config();
const path = require("path");


//middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Adjust the limit as needed
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const multer = require("multer");


// Set up multer storage engine (you can customize the destination and file naming)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Store in "uploads" directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Use current timestamp as filename
  },
});

const upload = multer({ storage: storage });

//routes

//auth
function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
  
    if (!token) return res.status(401).json({ message: "Access denied" });
  
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.status(403).json({ message: "Invalid token" });
      req.user = user;
      next();
    });
  }
  
    //post/register

    app.post("/register", async (req, res) => {
      try {
        const { user_name, email, password, role, image_url } = req.body;
    
        // Check if user_name, email, and password are provided
        if (!user_name || !email || !password) {
          return res.status(400).json({ message: "user_name, email, and password are required" });
        }
    
        // Check if the user_name already exists
        const usernameExists = await pool.query("SELECT * FROM users WHERE user_name = $1", [user_name]);
        if (usernameExists.rows.length > 0) {
          return res.status(400).json({ message: "Username already taken" });
        }
    
        // Check if the email already exists
        const userExists = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (userExists.rows.length > 0) {
          return res.status(400).json({ message: "User with this email already exists" });
        }
    
        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
    
        // Default profile image (if not provided)
        const defaultProfileImage =
          "data:image/jpeg;base64,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";
    
        // Use provided profile image or fallback to default
        const profileImage = image_url || defaultProfileImage;
    
        // Insert new user with profile image
        const newUser = await pool.query(
          "INSERT INTO users (user_name, email, password, role, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *",
          [user_name, email, hashedPassword, role || "user", profileImage]
        );
    
        res.status(201).json({ message: "User registered successfully", user: newUser.rows[0] });
      } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Internal server error" });
      }
    });
    
    

    app.post("/login", async (req, res) => {
      try {
        const { email, password } = req.body;
    
        // Check if the user exists
        const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (user.rows.length === 0) return res.status(404).json({ message: "User not found" });
    
        // Validate the password
        const isMatch = await bcrypt.compare(password, user.rows[0].password);
        if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });
    
        // Generate a JWT token
        const token = jwt.sign(
          { id: user.rows[0].id, email: user.rows[0].email, role: user.rows[0].role },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRES_IN }
        );
    
        // Return the token, user_name, and image_url
        res.json({
          message: "Logged in successfully",
          token,
          user_name: user.rows[0].user_name,
          image_url: user.rows[0].image_url,
        });
      } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    //post/profile

    app.get("/profile", authenticateToken, async (req, res) => {
        try {
          const user = await pool.query("SELECT id, email, role , user_name , image_url FROM users WHERE id = $1", [req.user.id]);
          if (user.rows.length === 0) return res.status(404).json({ message: "User not found" });
      
          res.json({ user: user.rows[0] });
        } catch (err) {
          console.error(err.message);
          res.status(500).json({ message: "Internal server error" });
        }
      });

    //post/logout

    app.post("/logout", (req, res) => {
        res.json({ message: "Logged out successfully. Delete the token on the client side." });
      });

//post

app.get("/posts", async (req, res) => {
  try {
    // SQL query to get all posts along with their comments, likes, and the user_name of the post creator
    const allPostsQuery = `
      SELECT 
        posts.*, 
        users.user_name, 
        users.image_url,
        COALESCE(json_agg(comments) FILTER (WHERE comments.id IS NOT NULL), '[]') AS comments,
        COALESCE(count(likes.id), 0) AS likes
      FROM 
        posts
      LEFT JOIN users ON posts.author_id = users.id
      LEFT JOIN comments ON posts.id = comments.post_id
      LEFT JOIN likes ON posts.id = likes.post_id
      GROUP BY posts.id, users.user_name, users.image_url;
    `;
    
    // Execute the query
    const allPosts = await pool.query(allPostsQuery);
    
    // Process the image_url for each post
    const processedPosts = allPosts.rows.map((post) => {
      if (post.image_url && !post.image_url.startsWith("http")) {
        // If the image is uploaded locally, prepend the server's base URL
        post.image_url = `${req.protocol}://${req.get("host")}/${post.image_url}`;
      }
      return post;
    });

    // Return the posts with their associated comments, likes, and user_name
    res.json(processedPosts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
  
  
   //GET /posts/:id: Get a specific post with comments (public).

   app.get("/posts/user/:user_id", async (req, res) => {
    try {
      const { user_id } = req.params;
  
      // SQL query to get all posts of a specific user with comments and likes
      const postsQuery = `
        SELECT 
          posts.*, 
          users.user_name, 
          users.image_url,
          COALESCE(json_agg(comments) FILTER (WHERE comments.id IS NOT NULL), '[]') AS comments,
          COALESCE(COUNT(likes.id), 0) AS likes
        FROM 
          posts
        LEFT JOIN users ON posts.author_id = users.id
        LEFT JOIN comments ON posts.id = comments.post_id
        LEFT JOIN likes ON posts.id = likes.post_id
        WHERE posts.author_id = $1
        GROUP BY posts.id, users.user_name, users.image_url;
      `;
  
      const posts = await pool.query(postsQuery, [user_id]);
      res.json(posts.rows);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  });

 // GET /posts/:post_id: Get a specific post with its comments, likes, user_name, and image_url
app.get("/posts/:post_id", async (req, res) => {
  try {
    const { post_id } = req.params;

    // SQL query to get the specific post with comments, likes, and user details
    const postQuery = `
      SELECT 
        posts.*, 
        users.user_name, 
        users.image_url,
        COALESCE(json_agg(comments) FILTER (WHERE comments.id IS NOT NULL), '[]') AS comments,
        COALESCE(COUNT(likes.id), 0) AS likes
      FROM 
        posts
      LEFT JOIN users ON posts.author_id = users.id
      LEFT JOIN comments ON posts.id = comments.post_id
      LEFT JOIN likes ON posts.id = likes.post_id
      WHERE posts.id = $1
      GROUP BY posts.id, users.user_name, users.image_url;
    `;
    
    // Execute the query with the specific post_id
    const post = await pool.query(postQuery, [post_id]);

    if (post.rows.length === 0) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Return the specific post with its associated comments, likes, and user details
    res.json(post.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});


app.post("/posts", authenticateToken, upload.single("image"), async (req, res) => {
  try {
    const { title, content } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null; // Handle the uploaded image URL

    // The user ID comes from the decoded token (set by the middleware)
    const user_id = req.user.id;

    const newPost = await pool.query(
      "INSERT INTO posts(title, content, image_url, author_id) VALUES($1, $2, $3, $4) RETURNING *",
      [title, content, image_url, user_id]
    );

    res.status(201).json({
      message: "Post created successfully",
      post: newPost.rows[0],
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});




  // PUT /posts/:id: Update your own post (auth required)
  
app.put("/posts/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params; // Post ID from URL
    const { title, content, image_url } = req.body; // Updated fields

    // Get the post to check ownership
    const post = await pool.query("SELECT * FROM posts WHERE id = $1", [id]);

    if (post.rows.length === 0) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if the logged-in user is the author of the post
    if (post.rows[0].author_id !== req.user.id) {
      return res.status(403).json({ message: "You are not authorized to update this post" });
    }

    // Update the post
    const updatedPost = await pool.query(
      "UPDATE posts SET title = $1, content = $2, image_url = $3 WHERE id = $4 RETURNING *",
      [title || post.rows[0].title, content || post.rows[0].content, image_url || post.rows[0].image_url, id]
    );

    res.json({ message: "Post updated successfully", post: updatedPost.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Internal server error" });
  }
});


   // DELETE /posts/:id: Delete your own post (auth required)
app.delete("/posts/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the post exists
    const post = await pool.query("SELECT * FROM posts WHERE id = $1", [id]);

    if (post.rows.length === 0) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if the logged-in user is the author of the post
    if (post.rows[0].author_id !== req.user.id) {
      return res.status(403).json({ message: "You are not authorized to delete this post" });
    }

    // Delete the post
    await pool.query("DELETE FROM posts WHERE id = $1", [id]);

    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

   //GET /posts/category/:category: Get posts by category.
   //GET /posts/tag/:tag: Get posts by tag.

//comment

   //GET /posts/:id/comments: Get all comments for a post (public).

// GET /posts/:id/comments: Get all comments for a post (public)
app.get("/posts/:id/comments", async (req, res) => {
  try {
    const { id } = req.params;

    // SQL query to get all comments for a specific post
    const commentsQuery = `
      SELECT 
        comments.id, 
        comments.content, 
        comments.created_at, 
        users.user_name, 
        users.image_url
      FROM 
        comments
      LEFT JOIN users ON comments.author_id = users.id
      WHERE 
        comments.post_id = $1
      ORDER BY 
        comments.created_at ASC;
    `;

    // Execute the query with the post ID
    const comments = await pool.query(commentsQuery, [id]);

    if (comments.rows.length === 0) {
      return res.status(404).json({ message: "No comments found for this post" });
    }

    // Return the comments
    res.json(comments.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});



   //POST /posts/:id/comments: Add a comment to a post (auth required).

   // POST /posts/:id/comments: Add a comment to a post (auth required)
app.post("/posts/:id/comments", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params; // Post ID
    const { content } = req.body;
    const user_id = req.user.id; // User ID from the token

    if (!content) {
      return res.status(400).json({ message: "Content is required" });
    }

    // Check if the post exists
    const post = await pool.query("SELECT * FROM posts WHERE id = $1", [id]);

    if (post.rows.length === 0) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Insert the new comment
    const newComment = await pool.query(
      "INSERT INTO comments (content, post_id, author_id) VALUES ($1, $2, $3) RETURNING *",
      [content, id, user_id]
    );

    res.status(201).json({ 
      message: "Comment added successfully", 
      comment: newComment.rows[0] 
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Internal server error" });
  }
});


   // PUT /comments/:id: Update your own comment (auth required)
app.put("/comments/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params; // Comment ID from URL
    const { content } = req.body; // New content from request body
    const user_id = req.user.id; // User ID from the token

    if (!content) {
      return res.status(400).json({ message: "Content is required" });
    }

    // Check if the comment exists and belongs to the user
    const comment = await pool.query(
      "SELECT * FROM comments WHERE id = $1 AND author_id = $2",
      [id, user_id]
    );

    if (comment.rows.length === 0) {
      return res.status(404).json({ message: "Comment not found or not authorized" });
    }

    // Update the comment
    const updatedComment = await pool.query(
      "UPDATE comments SET content = $1 WHERE id = $2 RETURNING *",
      [content, id]
    );

    res.json({ 
      message: "Comment updated successfully", 
      comment: updatedComment.rows[0] 
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

 

// DELETE /comments/:id: Delete your own comment (auth required)

app.delete("/comments/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params; // Comment ID from the URL
    const user_id = req.user.id; // User ID from the token

    // Check if the comment exists and belongs to the user
    const comment = await pool.query(
      "SELECT * FROM comments WHERE id = $1 AND author_id = $2",
      [id, user_id]
    );

    if (comment.rows.length === 0) {
      return res.status(404).json({ message: "Comment not found or not authorized" });
    }

    // Delete the comment
    await pool.query("DELETE FROM comments WHERE id = $1", [id]);

    res.json({ message: "Comment deleted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Internal server error" });
  }
});


// like routes
    //POST /posts/:id/like: Like a post (auth required).
    app.get("/posts/:postId/likes/check", authenticateToken, async (req, res) => {
      try {
        const { postId } = req.params;
        const userId = req.user.id;
    
        const like = await pool.query(
          "SELECT * FROM likes WHERE post_id = $1 AND user_id = $2",
          [postId, userId]
        );
    
        res.json({ hasLiked: like.rows.length > 0 });
      } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Internal server error" });
      }
    });

// POST /posts/:id/like: Like a post (auth required)
app.post("/posts/:postId/like", authenticateToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    // Check if the user has already liked the post
    const like = await pool.query(
      "SELECT * FROM likes WHERE post_id = $1 AND user_id = $2",
      [postId, userId]
    );

    if (like.rows.length > 0) {
      return res.status(400).json({ message: "You already liked this post" });
    }

    // Add the like
    await pool.query(
      "INSERT INTO likes (post_id, user_id) VALUES ($1, $2)",
      [postId, userId]
    );

    res.json({ message: "Post liked successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Internal server error" });
  }
});



   // DELETE /posts/:id/like: Unlike a post (auth required)

   app.delete("/posts/:postId/like", authenticateToken, async (req, res) => {
    try {
      const { postId } = req.params;
      const userId = req.user.id;
  
      // Remove the like
      await pool.query(
        "DELETE FROM likes WHERE post_id = $1 AND user_id = $2",
        [postId, userId]
      );
  
      res.json({ message: "Post disliked successfully" });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ message: "Internal server error" });
    }
  });

//Category & Tag Routes 
   //GET /categories: Get all categories.
   //POST /categories: Create a category (admin only).
   //DELETE /categories/:id: Delete a category (admin only).
   //GET /tags: Get all tags.
   //POST /tags: Create a tag (admin only).
   //DELETE /tags/:id: Delete a tag (admin only).
     
//Admin Routes

   //GET /admin/users: View all users (admin only).

   // Middleware to check if the user is an admin
function checkAdmin(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  next();
}

// GET /admin/users: View all users (admin only)
app.get("/admin/users", authenticateToken, checkAdmin, async (req, res) => {
  try {
    const users = await pool.query("SELECT id, email, role FROM users");
    res.json(users.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Internal server error" });
  }
});
   //PUT /admin/users/:id: Update user role (admin only).

   app.put("/admin/users/:id", authenticateToken, checkAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;
  
      // Validate the role
      const validRoles = ["user", "admin"];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
  
      // Update the user's role
      const updatedUser = await pool.query(
        "UPDATE users SET role = $1 WHERE id = $2 RETURNING id, email, role",
        [role, id]
      );
  
      if (updatedUser.rows.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }
  
      res.json({
        message: "User role updated successfully",
        user: updatedUser.rows[0],
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ message: "Internal server error" });
    }
  });

   //DELETE /admin/users/:id: Delete user (admin only).

   app.delete("/admin/users/:id", authenticateToken, checkAdmin, async (req, res) => {
    const client = await pool.connect();
    
    try {
      const { id } = req.params;
  
      // Start a transaction
      await client.query("BEGIN");
  
      // Delete likes by the user
      await client.query("DELETE FROM likes WHERE user_id = $1", [id]);
  
      // Delete comments by the user
      await client.query("DELETE FROM comments WHERE author_id = $1", [id]);
  
      // Delete posts by the user (this should cascade to related likes/comments if foreign keys are set with ON DELETE CASCADE)
      await client.query("DELETE FROM posts WHERE author_id = $1", [id]);
  
      // Delete the user
      const deletedUser = await client.query(
        "DELETE FROM users WHERE id = $1 RETURNING id, email",
        [id]
      );
  
      if (deletedUser.rows.length === 0) {
        // Rollback if the user doesn’t exist
        await client.query("ROLLBACK");
        return res.status(404).json({ message: "User not found" });
      }
  
      // Commit the transaction
      await client.query("COMMIT");
  
      res.json({ message: "User and related data deleted successfully", user: deletedUser.rows[0] });
    } catch (err) {
      // Rollback on error
      await client.query("ROLLBACK");
      console.error(err.message);
      res.status(500).json({ message: "Internal server error" });
    } finally {
      client.release();
    }
  });

  app.get("/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const user = await db.query(
        "SELECT id, email, image_url FROM users WHERE id = $1",
        [id]
      );
  
      if (user.rows.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }
  
      res.json(user.rows[0]);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Failed to fetch user data" });
    }
  });
  
  

app.listen(5000, () =>{
    console.log("serever has started on port 5000");
});  