-- Groups System Database Schema
-- Inspired by tribe.net functionality

-- Groups table
CREATE TABLE IF NOT EXISTS groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    creator_id INTEGER NOT NULL,
    is_public BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (creator_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Group memberships
CREATE TABLE IF NOT EXISTS group_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_visited DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(group_id, user_id)
);

-- Group posts (extends existing posts table)
-- We'll add a group_id column to the existing posts table
-- ALTER TABLE posts ADD COLUMN group_id INTEGER REFERENCES groups(id);

-- Group post read tracking
CREATE TABLE IF NOT EXISTS group_post_reads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    group_id INTEGER NOT NULL,
    last_read_post_id INTEGER,
    last_read_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
    FOREIGN KEY (last_read_post_id) REFERENCES posts(id) ON DELETE SET NULL,
    UNIQUE(user_id, group_id)
);

-- Sample data for testing
INSERT OR IGNORE INTO groups (name, description, creator_id, is_public) VALUES 
('Photography Enthusiasts', 'Share your best photos and get feedback from fellow photographers', 1, 1),
('Tech Talk', 'Discuss the latest in technology, programming, and innovation', 1, 1),
('Book Club', 'Share book recommendations and discuss your latest reads', 1, 1);

-- Add group_id column to existing posts table (run this separately)
-- ALTER TABLE posts ADD COLUMN group_id INTEGER REFERENCES groups(id);
