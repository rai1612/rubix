-- Demo Users for rubiX
-- Consolidated user data for development and testing
-- All passwords are "demo123" (BCrypt hash)

-- Ensure required extensions
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp') THEN
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pgcrypto') THEN
        CREATE EXTENSION IF NOT EXISTS "pgcrypto";
    END IF;
END
$$;

-- User Seed Data
DO $$
DECLARE
    user_count_before INTEGER;
    user_count_after INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count_before FROM users;
    RAISE NOTICE 'Users before: %', user_count_before;

    -- =========================================================================
    -- DEMO USER (Primary test account)
    -- Username: demo_user / Password: demo123
    -- =========================================================================
    
    INSERT INTO users (id, username, email, password_hash, first_name, last_name, preferences, is_active, is_verified, oauth_provider, created_at, updated_at)
    SELECT 
        uuid_generate_v4(),
        'demo_user',
        'demo@rubix.local',
        '$2a$10$b9HRgPTS7TjBwFIbdEpFoun2Az1wSVmy2obmcGnd9puGnaD9BPzbm',
        'Demo',
        'User',
        '{"handedness": "right", "preferred_notation": "singmaster", "timer_precision": "centiseconds", "cube_size": "3x3", "inspection_time": 15}'::jsonb,
        true,
        true,
        'LOCAL',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'demo_user');

    -- =========================================================================
    -- TEST USERS (For development testing)
    -- =========================================================================
    
    -- Beginner user
    INSERT INTO users (id, username, email, password_hash, first_name, last_name, preferences, is_active, is_verified, oauth_provider, created_at, updated_at)
    SELECT 
        uuid_generate_v4(),
        'beginner_cuber',
        'beginner@test.local',
        '$2a$10$b9HRgPTS7TjBwFIbdEpFoun2Az1wSVmy2obmcGnd9puGnaD9BPzbm',
        'Beginner',
        'Cuber',
        '{"handedness": "right", "preferred_notation": "singmaster", "timer_precision": "seconds", "cube_size": "3x3", "inspection_time": 15, "skill_level": "beginner"}'::jsonb,
        true,
        true,
        'LOCAL',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'beginner_cuber');

    -- Intermediate user
    INSERT INTO users (id, username, email, password_hash, first_name, last_name, preferences, is_active, is_verified, oauth_provider, created_at, updated_at)
    SELECT 
        uuid_generate_v4(),
        'intermediate_cuber',
        'intermediate@test.local',
        '$2a$10$b9HRgPTS7TjBwFIbdEpFoun2Az1wSVmy2obmcGnd9puGnaD9BPzbm',
        'Intermediate',
        'Speedcuber',
        '{"handedness": "right", "preferred_notation": "wca", "timer_precision": "centiseconds", "cube_size": "3x3", "inspection_time": 15, "skill_level": "intermediate"}'::jsonb,
        true,
        true,
        'LOCAL',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'intermediate_cuber');

    -- Advanced user
    INSERT INTO users (id, username, email, password_hash, first_name, last_name, preferences, is_active, is_verified, oauth_provider, created_at, updated_at)
    SELECT 
        uuid_generate_v4(),
        'advanced_cuber',
        'advanced@test.local',
        '$2a$10$b9HRgPTS7TjBwFIbdEpFoun2Az1wSVmy2obmcGnd9puGnaD9BPzbm',
        'Advanced',
        'Speedcuber',
        '{"handedness": "left", "preferred_notation": "wca", "timer_precision": "milliseconds", "cube_size": "3x3", "inspection_time": 15, "skill_level": "advanced"}'::jsonb,
        true,
        true,
        'LOCAL',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'advanced_cuber');

    -- Expert user
    INSERT INTO users (id, username, email, password_hash, first_name, last_name, preferences, is_active, is_verified, oauth_provider, created_at, updated_at)
    SELECT 
        uuid_generate_v4(),
        'expert_cuber',
        'expert@test.local',
        '$2a$10$b9HRgPTS7TjBwFIbdEpFoun2Az1wSVmy2obmcGnd9puGnaD9BPzbm',
        'Expert',
        'Competitor',
        '{"handedness": "right", "preferred_notation": "wca", "timer_precision": "milliseconds", "cube_size": "3x3", "inspection_time": 15, "skill_level": "expert", "favorite_method": "CFOP"}'::jsonb,
        true,
        true,
        'LOCAL',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'expert_cuber');

    -- =========================================================================
    -- SPEEDCUBER PERSONAS (Realistic test profiles)
    -- =========================================================================
    
    -- One-handed specialist
    INSERT INTO users (id, username, email, password_hash, first_name, last_name, preferences, is_active, is_verified, oauth_provider, created_at, updated_at)
    SELECT 
        uuid_generate_v4(),
        'onehanded_pro',
        'onehanded@speedcube.local',
        '$2a$10$b9HRgPTS7TjBwFIbdEpFoun2Az1wSVmy2obmcGnd9puGnaD9BPzbm',
        'One',
        'Handed',
        '{"handedness": "right", "preferred_notation": "wca", "timer_precision": "centiseconds", "cube_size": "3x3", "inspection_time": 15, "favorite_method": "ZZ", "specialty": "one_handed"}'::jsonb,
        true,
        true,
        'LOCAL',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'onehanded_pro');

    -- Method experimenter (Roux method)
    INSERT INTO users (id, username, email, password_hash, first_name, last_name, preferences, is_active, is_verified, oauth_provider, created_at, updated_at)
    SELECT 
        uuid_generate_v4(),
        'roux_master',
        'roux@speedcube.local',
        '$2a$10$b9HRgPTS7TjBwFIbdEpFoun2Az1wSVmy2obmcGnd9puGnaD9BPzbm',
        'Roux',
        'Master',
        '{"handedness": "left", "preferred_notation": "wca", "timer_precision": "centiseconds", "cube_size": "3x3", "inspection_time": 15, "favorite_method": "Roux", "alt_methods": ["CFOP", "ZZ"]}'::jsonb,
        true,
        true,
        'LOCAL',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'roux_master');

    -- Big cube specialist
    INSERT INTO users (id, username, email, password_hash, first_name, last_name, preferences, is_active, is_verified, oauth_provider, created_at, updated_at)
    SELECT 
        uuid_generate_v4(),
        'bigcube_specialist',
        'bigcube@speedcube.local',
        '$2a$10$b9HRgPTS7TjBwFIbdEpFoun2Az1wSVmy2obmcGnd9puGnaD9BPzbm',
        'Big',
        'Cuber',
        '{"handedness": "right", "preferred_notation": "wca", "timer_precision": "centiseconds", "cube_size": "5x5", "inspection_time": 15, "favorite_method": "Yau", "specialty": "big_cubes"}'::jsonb,
        true,
        true,
        'LOCAL',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
    WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'bigcube_specialist');

    -- Report results
    SELECT COUNT(*) INTO user_count_after FROM users;
    RAISE NOTICE 'Users after: % (added %)', user_count_after, user_count_after - user_count_before;
    
END $$;

