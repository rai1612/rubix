-- rubiX Database Schema
-- Core tables for the speedcubing practice platform

-- Enable UUID extension for PostgreSQL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto extension for additional UUID functions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255), -- Nullable for OAuth-only users
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    preferences JSONB DEFAULT '{}',
    oauth_provider VARCHAR(20), -- 'google', 'github', 'local'
    oauth_id VARCHAR(255), -- External OAuth ID
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    verification_token VARCHAR(255),
    reset_token VARCHAR(255),
    reset_token_expires_at TIMESTAMP WITH TIME ZONE
);

-- Scrambles table
CREATE TABLE IF NOT EXISTS scrambles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scramble_text VARCHAR(500) NOT NULL,
    puzzle_type VARCHAR(20) NOT NULL DEFAULT '3x3',
    algorithm_moves INTEGER NOT NULL,
    move_count INTEGER GENERATED ALWAYS AS (array_length(string_to_array(scramble_text, ' '), 1)) STORED,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_custom BOOLEAN DEFAULT false,
    created_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Only for custom scrambles
    difficulty_rating INTEGER CHECK (difficulty_rating >= 1 AND difficulty_rating <= 5) -- Future feature
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100),
    puzzle_type VARCHAR(20) NOT NULL DEFAULT '3x3',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    solve_count INTEGER DEFAULT 0,
    total_time_ms BIGINT DEFAULT 0,
    best_time_ms INTEGER,
    worst_time_ms INTEGER,
    average_time_ms INTEGER,
    notes TEXT,
    tags VARCHAR(255)[]
);

-- Solves table (main table)
CREATE TABLE IF NOT EXISTS solves (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    scramble_id UUID NOT NULL REFERENCES scrambles(id) ON DELETE RESTRICT,
    time_ms INTEGER NOT NULL CHECK (time_ms > 0),
    inspection_time_ms INTEGER DEFAULT 0 CHECK (inspection_time_ms >= 0),
    penalty VARCHAR(20) DEFAULT 'NONE' CHECK (penalty IN ('NONE', 'PLUS_TWO', 'DNF')),
    adjusted_time_ms INTEGER NOT NULL, -- time_ms + penalty adjustments
    solved_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    tags VARCHAR(255)[],
    -- Performance tracking fields
    move_count INTEGER,
    tps DECIMAL(5,2), -- Turns per second
    -- Future analytics fields
    cross_time_ms INTEGER,
    f2l_time_ms INTEGER,
    oll_time_ms INTEGER,
    pll_time_ms INTEGER
);

-- Algorithms table
CREATE TABLE IF NOT EXISTS algorithms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- NULL for public algorithms
    name VARCHAR(100) NOT NULL,
    notation_string VARCHAR(1000) NOT NULL,
    case_description TEXT,
    algorithm_set VARCHAR(50), -- 'OLL', 'PLL', 'F2L', 'CMLL', etc.
    case_number INTEGER, -- OLL 21, PLL Aa, etc.
    difficulty INTEGER CHECK (difficulty >= 1 AND difficulty <= 5),
    move_count INTEGER,
    execution_time_ms INTEGER, -- Average execution time for this algorithm
    is_public BOOLEAN DEFAULT false,
    is_favorite BOOLEAN DEFAULT false,
    tags VARCHAR(255)[],
    trigger_pattern VARCHAR(255), -- For recognition training
    setup_moves VARCHAR(500), -- Moves to set up the case
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    usage_count INTEGER DEFAULT 0 -- How many times user has practiced this
);

-- User statistics (precomputed for performance)
CREATE TABLE IF NOT EXISTS user_statistics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    puzzle_type VARCHAR(20) NOT NULL DEFAULT '3x3',
    total_solves INTEGER DEFAULT 0,
    total_time_ms BIGINT DEFAULT 0,
    -- Personal bests
    best_single INTEGER,
    best_ao5 INTEGER,
    best_ao12 INTEGER,
    best_ao100 INTEGER,
    best_ao1000 INTEGER,
    -- Current averages
    current_ao5 INTEGER,
    current_ao12 INTEGER,
    current_ao100 INTEGER,
    -- Solve distribution
    sub_10_count INTEGER DEFAULT 0,
    sub_15_count INTEGER DEFAULT 0,
    sub_20_count INTEGER DEFAULT 0,
    sub_30_count INTEGER DEFAULT 0,
    dnf_count INTEGER DEFAULT 0,
    plus_two_count INTEGER DEFAULT 0,
    -- Time periods
    today_solves INTEGER DEFAULT 0,
    week_solves INTEGER DEFAULT 0,
    month_solves INTEGER DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, puzzle_type)
);

-- Rolling averages cache
CREATE TABLE IF NOT EXISTS rolling_averages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    average_type VARCHAR(10) NOT NULL CHECK (average_type IN ('ao5', 'ao12', 'ao100', 'ao1000')),
    average_value INTEGER NOT NULL,
    solve_count INTEGER NOT NULL,
    solve_ids UUID[] NOT NULL, -- Array of solve IDs used in calculation
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_personal_best BOOLEAN DEFAULT false,
    puzzle_type VARCHAR(20) NOT NULL DEFAULT '3x3'
);

-- Training plans (future feature)
CREATE TABLE IF NOT EXISTS training_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    target_metrics JSONB, -- Target times, solve counts, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Performance indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_oauth ON users(oauth_provider, oauth_id);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_scrambles_type ON scrambles(puzzle_type);
CREATE INDEX IF NOT EXISTS idx_scrambles_generated_at ON scrambles(generated_at DESC);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_active ON sessions(user_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_sessions_started_at ON sessions(started_at DESC);

CREATE INDEX IF NOT EXISTS idx_solves_user_id_solved_at ON solves(user_id, solved_at DESC);
CREATE INDEX IF NOT EXISTS idx_solves_session_id ON solves(session_id);
CREATE INDEX IF NOT EXISTS idx_solves_user_time ON solves(user_id, adjusted_time_ms) WHERE penalty != 'DNF';
CREATE INDEX IF NOT EXISTS idx_solves_scramble_id ON solves(scramble_id);
CREATE INDEX IF NOT EXISTS idx_solves_penalty ON solves(penalty);
CREATE INDEX IF NOT EXISTS idx_solves_created_at ON solves(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_algorithms_user_id ON algorithms(user_id);
CREATE INDEX IF NOT EXISTS idx_algorithms_set ON algorithms(algorithm_set);
CREATE INDEX IF NOT EXISTS idx_algorithms_public ON algorithms(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_algorithms_favorite ON algorithms(user_id, is_favorite) WHERE is_favorite = true;

CREATE INDEX IF NOT EXISTS idx_user_statistics_user_puzzle ON user_statistics(user_id, puzzle_type);

CREATE INDEX IF NOT EXISTS idx_rolling_averages_user_type ON rolling_averages(user_id, average_type, calculated_at DESC);
CREATE INDEX IF NOT EXISTS idx_rolling_averages_pb ON rolling_averages(user_id, is_personal_best) WHERE is_personal_best = true;

-- Functions for automatic updates
-- Using standard quotes instead of dollar quotes for Spring Boot compatibility
CREATE OR REPLACE FUNCTION update_session_stats() RETURNS TRIGGER AS '
BEGIN
    IF TG_OP = ''INSERT'' OR TG_OP = ''UPDATE'' THEN
        UPDATE sessions SET 
            solve_count = (SELECT COUNT(*) FROM solves WHERE session_id = NEW.session_id),
            total_time_ms = (SELECT COALESCE(SUM(adjusted_time_ms), 0) FROM solves WHERE session_id = NEW.session_id AND penalty != ''DNF''),
            best_time_ms = (SELECT MIN(adjusted_time_ms) FROM solves WHERE session_id = NEW.session_id AND penalty != ''DNF''),
            worst_time_ms = (SELECT MAX(adjusted_time_ms) FROM solves WHERE session_id = NEW.session_id AND penalty != ''DNF''),
            average_time_ms = (SELECT AVG(adjusted_time_ms)::INTEGER FROM solves WHERE session_id = NEW.session_id AND penalty != ''DNF'')
        WHERE id = NEW.session_id;
        RETURN NEW;
    ELSIF TG_OP = ''DELETE'' THEN
        UPDATE sessions SET 
            solve_count = (SELECT COUNT(*) FROM solves WHERE session_id = OLD.session_id),
            total_time_ms = (SELECT COALESCE(SUM(adjusted_time_ms), 0) FROM solves WHERE session_id = OLD.session_id AND penalty != ''DNF''),
            best_time_ms = (SELECT MIN(adjusted_time_ms) FROM solves WHERE session_id = OLD.session_id AND penalty != ''DNF''),
            worst_time_ms = (SELECT MAX(adjusted_time_ms) FROM solves WHERE session_id = OLD.session_id AND penalty != ''DNF''),
            average_time_ms = (SELECT AVG(adjusted_time_ms)::INTEGER FROM solves WHERE session_id = OLD.session_id AND penalty != ''DNF'')
        WHERE id = OLD.session_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
' LANGUAGE plpgsql;

-- Trigger for session stats updates
CREATE TRIGGER trigger_update_session_stats
    AFTER INSERT OR UPDATE OR DELETE ON solves
    FOR EACH ROW EXECUTE FUNCTION update_session_stats();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column() 
RETURNS TRIGGER AS '
BEGIN 
    NEW.updated_at = CURRENT_TIMESTAMP; 
    RETURN NEW; 
END; 
' LANGUAGE plpgsql;

-- Triggers for updated_at columns
CREATE TRIGGER trigger_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_algorithms_updated_at BEFORE UPDATE ON algorithms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
