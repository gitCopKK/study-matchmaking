-- Admin User (email: admin@studymatch.com, password: password123)
-- BCrypt hash for 'password123': $2a$10$rzEsUHTCidZjV71JL2HcCO.LpJbFIlD9JWVkXucB7CRXwayds1b3C
INSERT INTO users (id, email, username, password_hash, display_name, is_online, profile_complete, role, blocked, created_at, updated_at)
VALUES 
    ('00000000-0000-0000-0000-000000000001', 'admin@studymatch.com', 'studymatch_admin', '$2a$10$rzEsUHTCidZjV71JL2HcCO.LpJbFIlD9JWVkXucB7CRXwayds1b3C', 'System Admin', false, true, 'ADMIN', false, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Add study goals columns to profiles if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'daily_goal_minutes') THEN
        ALTER TABLE profiles ADD COLUMN daily_goal_minutes INTEGER DEFAULT 60;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'weekly_goal_minutes') THEN
        ALTER TABLE profiles ADD COLUMN weekly_goal_minutes INTEGER DEFAULT 300;
    END IF;
END $$;

-- Add new columns to activities table if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'start_time') THEN
        ALTER TABLE activities ADD COLUMN start_time TIME;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'end_time') THEN
        ALTER TABLE activities ADD COLUMN end_time TIME;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activities' AND column_name = 'notes') THEN
        ALTER TABLE activities ADD COLUMN notes TEXT;
    END IF;
END $$;

-- Create badges table if not exists
CREATE TABLE IF NOT EXISTS badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    emoji VARCHAR(10) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    threshold INTEGER NOT NULL,
    display_order INTEGER DEFAULT 0
);

-- Create user_badges table if not exists
CREATE TABLE IF NOT EXISTS user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMP NOT NULL DEFAULT NOW(),
    seen BOOLEAN DEFAULT FALSE,
    UNIQUE(user_id, badge_id)
);

-- Create index for faster badge lookups
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_earned_at ON user_badges(earned_at DESC);
