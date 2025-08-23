// Groups System API Endpoints
// Add these to your server/index.js file

// Create a new group
app.post('/api/groups', authenticateToken, (req, res) => {
  const { name, description, isPublic = true } = req.body;
  const creatorId = req.user.id;

  if (!name || name.trim().length === 0) {
    return res.status(400).json({ error: 'Group name is required' });
  }

  // Check if group name already exists
  db.get('SELECT id FROM groups WHERE LOWER(name) = LOWER(?)', [name.trim()], (err, existingGroup) => {
    if (err) {
      console.error('Error checking group name:', err);
      return res.status(500).json({ error: 'Server error' });
    }

    if (existingGroup) {
      return res.status(400).json({ error: 'Group name already exists' });
    }

    // Create the group
    db.run(
      'INSERT INTO groups (name, description, creator_id, is_public) VALUES (?, ?, ?, ?)',
      [name.trim(), description?.trim() || null, creatorId, isPublic ? 1 : 0],
      function(err) {
        if (err) {
          console.error('Error creating group:', err);
          return res.status(500).json({ error: 'Failed to create group' });
        }

        const groupId = this.lastID;

        // Add creator as admin member
        db.run(
          'INSERT INTO group_members (group_id, user_id, role) VALUES (?, ?, ?)',
          [groupId, creatorId, 'admin'],
          (err) => {
            if (err) {
              console.error('Error adding creator to group:', err);
            }
          }
        );

        res.status(201).json({
          message: 'Group created successfully',
          group: {
            id: groupId,
            name: name.trim(),
            description: description?.trim(),
            creator_id: creatorId,
            is_public: isPublic
          }
        });
      }
    );
  });
});

// Get all public groups
app.get('/api/groups', (req, res) => {
  const query = `
    SELECT g.*, 
           u.username as creator_name,
           COUNT(gm.user_id) as member_count
    FROM groups g
    LEFT JOIN users u ON g.creator_id = u.id
    LEFT JOIN group_members gm ON g.id = gm.group_id
    WHERE g.is_public = 1
    GROUP BY g.id
    ORDER BY g.created_at DESC
  `;

  db.all(query, (err, groups) => {
    if (err) {
      console.error('Error fetching groups:', err);
      return res.status(500).json({ error: 'Server error' });
    }

    res.json({ groups });
  });
});

// Get user's groups with unread counts
app.get('/api/user/groups', authenticateToken, (req, res) => {
  const userId = req.user.id;

  const query = `
    SELECT g.*,
           gm.role,
           gm.joined_at,
           gm.last_visited,
           COUNT(p.id) as total_posts,
           COALESCE(
             (SELECT COUNT(p2.id) 
              FROM posts p2 
              WHERE p2.group_id = g.id 
              AND p2.created_at > gm.last_visited), 0
           ) as unread_posts
    FROM group_members gm
    JOIN groups g ON gm.group_id = g.id
    LEFT JOIN posts p ON g.id = p.group_id
    WHERE gm.user_id = ?
    GROUP BY g.id
    ORDER BY unread_posts DESC, g.name
  `;

  db.all(query, [userId], (err, userGroups) => {
    if (err) {
      console.error('Error fetching user groups:', err);
      return res.status(500).json({ error: 'Server error' });
    }

    res.json({ groups: userGroups });
  });
});

// Join a group
app.post('/api/groups/:groupId/join', authenticateToken, (req, res) => {
  const { groupId } = req.params;
  const userId = req.user.id;

  // Check if group exists and is public
  db.get('SELECT id, is_public FROM groups WHERE id = ?', [groupId], (err, group) => {
    if (err) {
      console.error('Error checking group:', err);
      return res.status(500).json({ error: 'Server error' });
    }

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    if (!group.is_public) {
      return res.status(403).json({ error: 'Cannot join private group' });
    }

    // Check if already a member
    db.get('SELECT id FROM group_members WHERE group_id = ? AND user_id = ?', 
      [groupId, userId], (err, existingMember) => {
      if (err) {
        console.error('Error checking membership:', err);
        return res.status(500).json({ error: 'Server error' });
      }

      if (existingMember) {
        return res.status(400).json({ error: 'Already a member of this group' });
      }

      // Join the group
      db.run(
        'INSERT INTO group_members (group_id, user_id) VALUES (?, ?)',
        [groupId, userId],
        function(err) {
          if (err) {
            console.error('Error joining group:', err);
            return res.status(500).json({ error: 'Failed to join group' });
          }

          res.json({ message: 'Successfully joined group' });
        }
      );
    });
  });
});

// Leave a group
app.delete('/api/groups/:groupId/leave', authenticateToken, (req, res) => {
  const { groupId } = req.params;
  const userId = req.user.id;

  // Check if user is the creator (can't leave if they're the only admin)
  db.get('SELECT creator_id FROM groups WHERE id = ?', [groupId], (err, group) => {
    if (err) {
      console.error('Error checking group:', err);
      return res.status(500).json({ error: 'Server error' });
    }

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    if (group.creator_id === userId) {
      return res.status(400).json({ error: 'Group creator cannot leave. Transfer ownership or delete the group.' });
    }

    // Leave the group
    db.run(
      'DELETE FROM group_members WHERE group_id = ? AND user_id = ?',
      [groupId, userId],
      function(err) {
        if (err) {
          console.error('Error leaving group:', err);
          return res.status(500).json({ error: 'Failed to leave group' });
        }

        if (this.changes === 0) {
          return res.status(400).json({ error: 'Not a member of this group' });
        }

        res.json({ message: 'Successfully left group' });
      }
    );
  });
});

// Mark group as read (update last_visited)
app.post('/api/groups/:groupId/read', authenticateToken, (req, res) => {
  const { groupId } = req.params;
  const userId = req.user.id;

  db.run(
    'UPDATE group_members SET last_visited = datetime("now") WHERE group_id = ? AND user_id = ?',
    [groupId, userId],
    function(err) {
      if (err) {
        console.error('Error marking group as read:', err);
        return res.status(500).json({ error: 'Server error' });
      }

      if (this.changes === 0) {
        return res.status(400).json({ error: 'Not a member of this group' });
      }

      res.json({ message: 'Group marked as read' });
    }
  );
});

// Get group posts
app.get('/api/groups/:groupId/posts', authenticateToken, (req, res) => {
  const { groupId } = req.params;
  const userId = req.user.id;

  // Check if user is a member
  db.get('SELECT id FROM group_members WHERE group_id = ? AND user_id = ?', 
    [groupId, userId], (err, membership) => {
    if (err) {
      console.error('Error checking membership:', err);
      return res.status(500).json({ error: 'Server error' });
    }

    if (!membership) {
      return res.status(403).json({ error: 'Not a member of this group' });
    }

    // Get group posts with user info
    const query = `
      SELECT p.*, u.username, u.profile_photo,
             COUNT(c.id) as comment_count
      FROM posts p
      JOIN users u ON p.user_id = u.id
      LEFT JOIN comments c ON p.id = c.post_id
      WHERE p.group_id = ?
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `;

    db.all(query, [groupId], (err, posts) => {
      if (err) {
        console.error('Error fetching group posts:', err);
        return res.status(500).json({ error: 'Server error' });
      }

      res.json({ posts });
    });
  });
});
