-- ============================================
-- SKILLVERSE DATABASE
-- ============================================

-- USERS
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,

    google_id VARCHAR(255) UNIQUE,

    name VARCHAR(150) NOT NULL,

    email VARCHAR(255) UNIQUE NOT NULL,

    college VARCHAR(255) NOT NULL,

    department VARCHAR(150) NOT NULL,

    year VARCHAR(50) NOT NULL,

    location VARCHAR(150) NOT NULL,

    interest VARCHAR(30) NOT NULL
        CHECK (interest IN ('software', 'hardware', 'both')),

    github_url TEXT,

    linkedin_url TEXT,

    portfolio_url TEXT,

    avatar_url TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ============================================
-- SKILLS
-- ============================================

CREATE TABLE IF NOT EXISTS skills (
    id SERIAL PRIMARY KEY,

    name VARCHAR(100) UNIQUE NOT NULL,

    category VARCHAR(100) NOT NULL,

    description TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ============================================
-- USER SKILLS
-- ============================================

CREATE TABLE IF NOT EXISTS user_skills (
    id SERIAL PRIMARY KEY,

    user_id INTEGER NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    skill_id INTEGER NOT NULL
        REFERENCES skills(id)
        ON DELETE CASCADE,

    progress INTEGER DEFAULT 0
        CHECK (progress >= 0 AND progress <= 100),

    score INTEGER DEFAULT 0
        CHECK (score >= 0 AND score <= 100),

    level VARCHAR(30) DEFAULT 'Beginner',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(user_id, skill_id)
);


-- ============================================
-- TESTS
-- ============================================

CREATE TABLE IF NOT EXISTS tests (
    id SERIAL PRIMARY KEY,

    skill_id INTEGER NOT NULL
        REFERENCES skills(id)
        ON DELETE CASCADE,

    title VARCHAR(255) NOT NULL,

    description TEXT,

    difficulty VARCHAR(50),

    total_questions INTEGER DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ============================================
-- TEST ATTEMPTS
-- ============================================

CREATE TABLE IF NOT EXISTS test_attempts (
    id SERIAL PRIMARY KEY,

    user_id INTEGER NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    test_id INTEGER NOT NULL
        REFERENCES tests(id)
        ON DELETE CASCADE,

    score INTEGER NOT NULL
        CHECK (score >= 0 AND score <= 100),

    correct_answers INTEGER DEFAULT 0,

    total_questions INTEGER DEFAULT 0,

    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ============================================
-- ASSIGNMENTS
-- ============================================

CREATE TABLE IF NOT EXISTS assignments (
    id SERIAL PRIMARY KEY,

    skill_id INTEGER NOT NULL
        REFERENCES skills(id)
        ON DELETE CASCADE,

    title VARCHAR(255) NOT NULL,

    description TEXT,

    difficulty VARCHAR(50),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO skills (name, category, description)
VALUES
('JavaScript', 'Software', 'JavaScript programming and web development'),

('React', 'Software', 'React frontend development'),

('Node.js', 'Software', 'Backend development using Node.js'),

('Python', 'Software', 'Python programming and development'),

('Java', 'Software', 'Java programming'),

('C++', 'Software', 'C++ programming and problem solving'),

('Data Structures', 'Software', 'Data structures and algorithms'),

('Machine Learning', 'Software', 'Machine learning and AI'),

('UI/UX Design', 'Software', 'User interface and experience design'),

('Cybersecurity', 'Software', 'Cybersecurity fundamentals'),

('Arduino', 'Hardware', 'Arduino and embedded development'),

('ESP32', 'Hardware', 'ESP32 IoT development'),

('Robotics', 'Hardware', 'Robotics and automation')

ON CONFLICT (name) DO NOTHING;
-- ============================================
-- HACKATHONS
-- ============================================

CREATE TABLE IF NOT EXISTS hackathons (
    id SERIAL PRIMARY KEY,

    title VARCHAR(500) NOT NULL,

    organizer VARCHAR(255),

    description TEXT,

    registration_url TEXT,

    event_url TEXT NOT NULL UNIQUE,

    start_date TIMESTAMP NULL,

    end_date TIMESTAMP NULL,

    registration_deadline TIMESTAMP NULL,

    location VARCHAR(255),

    is_online BOOLEAN DEFAULT false,

    technologies TEXT[] DEFAULT '{}',

    source VARCHAR(100),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- ============================================
-- CHAT CONVERSATIONS
-- ============================================

CREATE TABLE IF NOT EXISTS conversations (
    id SERIAL PRIMARY KEY,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ============================================
-- CONVERSATION MEMBERS
-- ============================================

CREATE TABLE IF NOT EXISTS conversation_members (
    id SERIAL PRIMARY KEY,

    conversation_id INTEGER NOT NULL
        REFERENCES conversations(id)
        ON DELETE CASCADE,

    user_id INTEGER NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(conversation_id, user_id)
);


-- ============================================
-- CHAT MESSAGES
-- ============================================

CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,

    conversation_id INTEGER NOT NULL
        REFERENCES conversations(id)
        ON DELETE CASCADE,

    sender_id INTEGER NOT NULL
        REFERENCES users(id)
        ON DELETE CASCADE,

    message TEXT NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_conversation_members_user
ON conversation_members(user_id);


CREATE INDEX IF NOT EXISTS idx_conversation_members_conversation
ON conversation_members(conversation_id);


CREATE INDEX IF NOT EXISTS idx_messages_conversation
ON messages(conversation_id);


CREATE INDEX IF NOT EXISTS idx_messages_created_at
ON messages(created_at);