const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const path = require('path');
const storageService = require('./services/storageService');
const config = require('../config');

// Debug the config import
console.log('Config file path:', require.resolve('../config'));
console.log('Config object:', config);
console.log('Config backend port:', config.backend.port);

const app = express();
const PORT = config.backend.port;
const JWT_SECRET = config.jwt.secret;

// Debug output to see what's being loaded
console.log('Config loaded:', {
  backendHost: config.backend.host,
  backendPort: config.backend.port,
  backendBaseURL: config.backend.baseURL,
  backendApiURL: config.backend.apiURL
});

console.log('Server will start on port:', PORT);

// Trust proxy for rate limiting (fixes X-Forwarded-For warning)
app.set('trust proxy', 1);

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));
app.use(express.json());

// Serve uploaded files
// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer configuration for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// Rate limiting - temporarily disabled for development
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100 // limit each IP to 100 requests per windowMs
// });
// app.use(limiter);

// Database setup
const db = new sqlite3.Database(path.join(__dirname, 'social.db'));

// Create tables
db.serialize(() => {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Posts table
  db.run(`CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    image_filename TEXT,
    visibility TEXT DEFAULT 'public' CHECK(visibility IN ('public', 'private')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Comments table
  db.run(`CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES posts (id),
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Connections table
  db.run(`CREATE TABLE IF NOT EXISTS connections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    requester_id INTEGER NOT NULL,
    addressee_id INTEGER NOT NULL,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'rejected')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (requester_id) REFERENCES users (id),
    FOREIGN KEY (addressee_id) REFERENCES users (id),
    UNIQUE(requester_id, addressee_id)
  )`);
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Routes

// User registration
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Username or email already exists' });
          }
          return res.status(500).json({ error: 'Error creating user' });
        }

        const token = jwt.sign({ id: this.lastID, username }, JWT_SECRET);
        res.status(201).json({
          message: 'User created successfully',
          token,
          user: { id: this.lastID, username, email }
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// User login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Server error' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET);
    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, username: user.username, email: user.email }
    });
  });
});

// Create a post
app.post('/api/posts', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { content, visibility = 'public' } = req.body;
    const userId = req.user.id;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Post content is required' });
    }

    if (!['public', 'private'].includes(visibility)) {
      return res.status(400).json({ error: 'Invalid visibility setting' });
    }

    let imageFilename = null;
    if (req.file) {
      const timestamp = Date.now();
      const originalName = req.file.originalname;
      const extension = path.extname(originalName);
      imageFilename = `post_${timestamp}_${Math.random().toString(36).substring(2)}${extension}`;
      
      await storageService.saveFile(req.file, imageFilename);
    }

    db.run(
      'INSERT INTO posts (user_id, content, image_filename, visibility) VALUES (?, ?, ?, ?)',
      [userId, content.trim(), imageFilename, visibility],
      function(err) {
        if (err) {
          // If there was an error and we saved an image, try to delete it
          if (imageFilename) {
            storageService.deleteFile(imageFilename);
          }
          return res.status(500).json({ error: 'Error creating post' });
        }
        res.status(201).json({
          message: 'Post created successfully',
          post: { 
            id: this.lastID, 
            content: content.trim(), 
            user_id: userId,
            image_filename: imageFilename,
            visibility
          }
        });
      }
    );
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Error creating post' });
  }
});

// Get all posts with user info and comments (protected route)
app.get('/api/posts', authenticateToken, (req, res) => {
  const currentUserId = req.user.id;
  
  console.log('Fetching posts for user ID:', currentUserId);
  
  const query = `
    SELECT 
      p.id, p.content, p.image_filename, p.visibility, p.created_at,
      u.username as author, u.profile_photo as author_photo,
      COUNT(c.id) as comment_count
    FROM posts p
    JOIN users u ON p.user_id = u.id
    LEFT JOIN comments c ON p.id = c.post_id
    WHERE p.visibility = 'public' 
       OR p.user_id = ? 
       OR EXISTS (
         SELECT 1 FROM connections conn 
         WHERE conn.status = 'accepted' 
           AND ((conn.requester_id = ? AND conn.addressee_id = p.user_id) 
                OR (conn.addressee_id = ? AND conn.requester_id = p.user_id))
       )
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `;
  
  console.log('Executing posts query with user ID:', currentUserId);
  
  db.all(query, [currentUserId, currentUserId, currentUserId], (err, posts) => {
    if (err) {
      console.error('Database error fetching posts:', err);
      return res.status(500).json({ error: 'Error fetching posts' });
    }
    
    console.log('Successfully fetched posts:', posts.length, 'posts found');
    console.log('Posts data:', posts);
    
    res.json(posts);
  });
});

// Get posts by username
app.get('/api/users/:username/posts', authenticateToken, (req, res) => {
  const { username } = req.params;
  
  // First get user info
  db.get('SELECT id, username, email, created_at, profile_photo FROM users WHERE username = ?', [username], (err, user) => {
    if (err) {
      console.error('Error fetching user:', err);
      return res.status(500).json({ error: 'Failed to fetch user' });
    }
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Then get posts by this user
    const query = `
      SELECT 
        p.id, p.content, p.image_filename, p.created_at,
        u.username as author, u.profile_photo as author_photo,
        COUNT(c.id) as comment_count
      FROM posts p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN comments c ON p.id = c.post_id
      WHERE u.username = ?
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `;
    
    db.all(query, [username], (err, posts) => {
      if (err) {
        console.error('Error fetching user posts:', err);
        return res.status(500).json({ error: 'Failed to fetch user posts' });
      }
      
      res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          created_at: user.created_at
        },
        posts: posts
      });
    });
  });
});

// Get a single post with comments (protected route)
app.get('/api/posts/:id', authenticateToken, (req, res) => {
  const postId = req.params.id;

  // Get post details
  db.get(
    'SELECT p.*, u.username as author, u.profile_photo as author_photo FROM posts p JOIN users u ON p.user_id = u.id WHERE p.id = ?',
    [postId],
    (err, post) => {
      if (err) {
        return res.status(500).json({ error: 'Error fetching post' });
      }

      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      // Get comments for this post
      db.all(
        'SELECT c.*, u.username as author, u.profile_photo as author_photo FROM comments c JOIN users u ON c.user_id = u.id WHERE c.post_id = ? ORDER BY c.created_at ASC',
        [postId],
        (err, comments) => {
          if (err) {
            return res.status(500).json({ error: 'Error fetching comments' });
          }

          res.json({
            post,
            comments
          });
        }
      );
    }
  );
});

// Delete a post (protected route - users can only delete their own posts)
app.delete('/api/posts/:id', authenticateToken, async (req, res) => {
  const postId = req.params.id;
  const userId = req.user.id;

  try {
    // First get the post to check ownership and get image filename
    db.get('SELECT * FROM posts WHERE id = ?', [postId], async (err, post) => {
      if (err) {
        console.error('Error fetching post for deletion:', err);
        return res.status(500).json({ error: 'Error fetching post' });
      }

      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }

      // Check if user owns the post
      if (post.user_id !== userId) {
        return res.status(403).json({ error: 'You can only delete your own posts' });
      }

      // Delete associated comments first (due to foreign key constraint)
      db.run('DELETE FROM comments WHERE post_id = ?', [postId], function(err) {
        if (err) {
          console.error('Error deleting comments:', err);
          return res.status(500).json({ error: 'Error deleting post comments' });
        }

        console.log(`Deleted ${this.changes} comments for post ${postId}`);

        // Delete the post
        db.run('DELETE FROM posts WHERE id = ?', [postId], async function(err) {
          if (err) {
            console.error('Error deleting post:', err);
            return res.status(500).json({ error: 'Error deleting post' });
          }

          // Delete associated image file if it exists
          if (post.image_filename) {
            try {
              await storageService.deleteFile(post.image_filename);
              console.log(`Deleted image file: ${post.image_filename}`);
            } catch (imageError) {
              console.error('Error deleting image file:', imageError);
              // Don't fail the request if image deletion fails
            }
          }

          console.log(`Successfully deleted post ${postId}`);
          res.json({ message: 'Post deleted successfully' });
        });
      });
    });
  } catch (error) {
    console.error('Error in delete post:', error);
    res.status(500).json({ error: 'Error deleting post' });
  }
});

// Create a comment
app.post('/api/posts/:id/comments', authenticateToken, (req, res) => {
  const postId = req.params.id;
  const { content } = req.body;
  const userId = req.user.id;

  if (!content || content.trim().length === 0) {
    return res.status(400).json({ error: 'Comment content is required' });
  }

  // Check if post exists
  db.get('SELECT id FROM posts WHERE id = ?', [postId], (err, post) => {
    if (err) {
      return res.status(500).json({ error: 'Server error' });
    }

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Create comment
    db.run(
      'INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)',
      [postId, userId, content.trim()],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Error creating comment' });
        }

        res.status(201).json({
          message: 'Comment created successfully',
          comment: { id: this.lastID, content: content.trim(), post_id: postId, user_id: userId }
        });
      }
    );
  });
});

// Get user profile
app.get('/api/profile', authenticateToken, (req, res) => {
  const userId = req.user.id;
  
  db.get('SELECT id, username, email, created_at, profile_photo FROM users WHERE id = ?', [userId], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Error fetching profile' });
    }
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  });
});

// Upload profile photo
app.post('/api/profile/photo', authenticateToken, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No photo file provided' });
    }

    const userId = req.user.id;
    
    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = path.extname(req.file.originalname);
    const filename = `profile_${userId}_${timestamp}_${randomString}${fileExtension}`;
    
    // Save the file
    await storageService.saveFile(req.file, filename);
    
    // Get current profile photo to delete old one
    db.get('SELECT profile_photo FROM users WHERE id = ?', [userId], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Error fetching current profile photo' });
      }
      
      // Delete old profile photo if it exists
      if (user.profile_photo) {
        await storageService.deleteFile(user.profile_photo);
      }
      
      // Update user profile with new photo
      db.run('UPDATE users SET profile_photo = ? WHERE id = ?', [filename, userId], function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to update profile photo' });
        }
        
        res.json({ 
          message: 'Profile photo updated successfully',
          profile_photo: filename,
          photo_url: storageService.getFileUrl(filename)
        });
      });
    });
    
  } catch (error) {
    console.error('Error uploading profile photo:', error);
    res.status(500).json({ error: 'Failed to upload profile photo' });
  }
});

// Get all users (for connection requests)
app.get('/api/users', authenticateToken, (req, res) => {
  const currentUserId = req.user.id;
  
  const query = `
    SELECT 
      u.id, u.username, u.created_at, u.profile_photo,
      CASE 
        WHEN c1.status = 'accepted' THEN 'connected'
        WHEN c1.status = 'pending' AND c1.requester_id = ? THEN 'pending_sent'
        WHEN c1.status = 'pending' AND c1.addressee_id = ? THEN 'pending_received'
        WHEN c1.status = 'rejected' THEN 'rejected'
        ELSE 'not_connected'
      END as connection_status
    FROM users u
    LEFT JOIN connections c1 ON (
      (c1.requester_id = ? AND c1.addressee_id = u.id) OR
      (c1.addressee_id = ? AND c1.requester_id = u.id)
    )
    WHERE u.id != ?
    ORDER BY u.username
  `;
  
  db.all(query, [currentUserId, currentUserId, currentUserId, currentUserId, currentUserId], (err, users) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).json({ error: 'Failed to fetch users' });
    }
    
    res.json(users);
  });
});

// Send connection request
app.post('/api/connections/request', authenticateToken, (req, res) => {
  const requesterId = req.user.id;
  const { addresseeId } = req.body;
  
  if (!addresseeId) {
    return res.status(400).json({ error: 'Addressee ID is required' });
  }
  
  if (requesterId === addresseeId) {
    return res.status(400).json({ error: 'Cannot connect to yourself' });
  }
  
  // Check if connection already exists
  db.get('SELECT * FROM connections WHERE (requester_id = ? AND addressee_id = ?) OR (requester_id = ? AND addressee_id = ?)', 
    [requesterId, addresseeId, addresseeId, requesterId], (err, existing) => {
    if (err) {
      return res.status(500).json({ error: 'Server error' });
    }
    
    if (existing) {
      return res.status(400).json({ error: 'Connection already exists' });
    }
    
    // Create connection request
    db.run('INSERT INTO connections (requester_id, addressee_id) VALUES (?, ?)', 
      [requesterId, addresseeId], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to create connection request' });
      }
      
      res.status(201).json({ 
        message: 'Connection request sent successfully',
        connectionId: this.lastID 
      });
    });
  });
});

// Accept connection request
app.post('/api/connections/accept', authenticateToken, (req, res) => {
  const addresseeId = req.user.id;
  const { requesterId } = req.body;
  
  if (!requesterId) {
    return res.status(400).json({ error: 'Requester ID is required' });
  }
  
  db.run('UPDATE connections SET status = ? WHERE requester_id = ? AND addressee_id = ? AND status = ?', 
    ['accepted', requesterId, addresseeId, 'pending'], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to accept connection' });
    }
    
    if (this.changes === 0) {
      return res.status(400).json({ error: 'No pending connection request found' });
    }
    
    res.json({ message: 'Connection accepted successfully' });
  });
});

// Reject connection request
app.post('/api/connections/reject', authenticateToken, (req, res) => {
  const addresseeId = req.user.id;
  const { requesterId } = req.body;
  
  if (!requesterId) {
    return res.status(400).json({ error: 'Requester ID is required' });
  }
  
  db.run('UPDATE connections SET status = ? WHERE requester_id = ? AND addressee_id = ? AND status = ?', 
    ['rejected', requesterId, addresseeId, 'pending'], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to reject connection' });
    }
    
    if (this.changes === 0) {
      return res.status(400).json({ error: 'No pending connection request found' });
    }
    
    res.json({ message: 'Connection rejected successfully' });
  });
});

// Remove connection (delete accepted connection)
app.delete('/api/connections/:connectionId', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const connectionId = req.params.connectionId;
  
  // First verify the connection exists and user is part of it
  db.get('SELECT * FROM connections WHERE id = ? AND status = ? AND (requester_id = ? OR addressee_id = ?)', 
    [connectionId, 'accepted', userId, userId], (err, connection) => {
    if (err) {
      return res.status(500).json({ error: 'Server error' });
    }
    
    if (!connection) {
      return res.status(404).json({ error: 'Connection not found or you are not authorized to remove it' });
    }
    
    // Delete the connection
    db.run('DELETE FROM connections WHERE id = ?', [connectionId], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to remove connection' });
      }
      
      res.json({ message: 'Connection removed successfully' });
    });
  });
});

// Get user's connections
app.get('/api/connections', authenticateToken, (req, res) => {
  const userId = req.user.id;
  
  // First check if the profile_photo column exists
  db.get("PRAGMA table_info(users)", (err, columns) => {
    if (err) {
      console.error('Error checking table schema:', err);
      return res.status(500).json({ error: 'Database schema error' });
    }
    
    console.log('Users table columns:', columns);
    
    // Check if profile_photo column exists
    db.get("SELECT COUNT(*) as count FROM pragma_table_info('users') WHERE name='profile_photo'", (err, result) => {
      if (err) {
        console.error('Error checking for profile_photo column:', err);
        return res.status(500).json({ error: 'Database schema check failed' });
      }
      
      console.log('profile_photo column exists:', result.count > 0);
      
      if (result.count === 0) {
        // Column doesn't exist, add it
        db.run('ALTER TABLE users ADD COLUMN profile_photo TEXT', (err) => {
          if (err) {
            console.error('Error adding profile_photo column:', err);
            return res.status(500).json({ error: 'Failed to update database schema' });
          }
          
          console.log('Added profile_photo column to users table');
          // Continue with the original query
          executeConnectionsQuery();
        });
      } else {
        // Column exists, execute the original query
        executeConnectionsQuery();
      }
    });
  });
  
  function executeConnectionsQuery() {
    const query = `
      SELECT 
        c.id as connection_id,
        u.id, u.username, u.created_at, u.profile_photo,
        c.status, c.created_at as connection_date
      FROM connections c
      JOIN users u ON (
        CASE 
          WHEN c.requester_id = ? THEN c.addressee_id = u.id
          ELSE c.requester_id = u.id
        END
      )
      WHERE c.status = 'accepted'
      ORDER BY u.username
    `;
    
    db.all(query, [userId], (err, connections) => {
      if (err) {
        console.error('Error fetching connections:', err);
        return res.status(500).json({ error: 'Failed to fetch connections' });
      }
      
      res.json(connections);
    });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT} and bound to all interfaces (0.0.0.0)`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close(() => {
    console.log('Database connection closed.');
    process.exit(0);
  });
}); 