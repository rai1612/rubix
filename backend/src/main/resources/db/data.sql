-- Sample data for development and testing

-- Insert sample public algorithms (OLL cases)
-- Using individual INSERT statements to ensure UUID generation works properly

INSERT INTO algorithms (name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, usage_count) 
VALUES ('OLL 21 - Anti-Sune', 'R U R'' U R U2 R''', 'T-shaped OLL case with bar on back', 'OLL', 21, 2, 7, true, false, ARRAY['beginner', 'common'], 0);

INSERT INTO algorithms (name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, usage_count) 
VALUES ('OLL 26 - Sune', 'R U R'' U R U2 R''', 'T-shaped OLL case with bar on front', 'OLL', 26, 2, 7, true, false, ARRAY['beginner', 'common'], 0);

INSERT INTO algorithms (name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, usage_count) 
VALUES ('OLL 27 - Anti-Sune', 'R'' U'' R U'' R'' U2 R', 'Mirror of Sune', 'OLL', 27, 2, 7, true, false, ARRAY['beginner', 'common'], 0);

INSERT INTO algorithms (name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, usage_count) 
VALUES ('PLL Aa - Adjacent Corner Swap', 'x R'' U R D2 R'' U'' R D2 R2 x''', 'Swaps two adjacent corners', 'PLL', 1, 3, 9, true, false, ARRAY['corner-swap'], 0);

INSERT INTO algorithms (name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, usage_count) 
VALUES ('PLL Ab - Adjacent Corner Swap', 'x R2 D2 R U R'' D2 R U'' R x''', 'Mirror of Aa perm', 'PLL', 2, 3, 9, true, false, ARRAY['corner-swap'], 0);

INSERT INTO algorithms (name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, usage_count) 
VALUES ('PLL T - Adjacent Corner and Edge Swap', 'R U R'' F'' R U R'' U'' R'' F R2 U'' R''', 'T-shaped PLL case', 'PLL', 20, 4, 13, true, false, ARRAY['advanced'], 0);

INSERT INTO algorithms (name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, usage_count) 
VALUES ('F2L Case 1', 'R U'' R''', 'Basic corner-edge pair insertion', 'F2L', 1, 1, 3, true, false, ARRAY['beginner', 'basic'], 0);

INSERT INTO algorithms (name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, usage_count) 
VALUES ('F2L Case 2', 'F R F''', 'Insert from different angle', 'F2L', 2, 2, 3, true, false, ARRAY['intermediate'], 0);

-- Insert sample scrambles for testing
INSERT INTO scrambles (id, scramble_text, puzzle_type, algorithm_moves, is_custom) VALUES
(uuid_generate_v4(), 'R U R'' U'' R U R'' F'' R U R'' U'' R'' F R', '3x3', 15, false),
(uuid_generate_v4(), 'D'' F2 U2 R2 U'' B2 R2 D'' L2 U2 F2 R'' B'' U2 L U'' B2 R2 F'' D2', '3x3', 20, false),
(uuid_generate_v4(), 'F'' U2 L2 B2 R2 D L2 U'' R2 U B2 L U R D'' U B'' R F U R''', '3x3', 20, false),
(uuid_generate_v4(), 'B2 L2 F2 D'' R2 U F2 L2 U2 B2 U'' R'' F D2 L B'' D'' F2 L'' B2', '3x3', 19, false),
(uuid_generate_v4(), 'R2 U B2 D F2 D R2 U'' L2 D2 B2 F U'' L'' F D R U B D2', '3x3', 20, false);

-- Create a demo user for testing (password: "demo123")
-- Note: In production, this should be removed
INSERT INTO users (id, username, email, password_hash, first_name, last_name, preferences, is_active, is_verified, oauth_provider)
VALUES (
    uuid_generate_v4(),
    'demo_user',
    'demo@rubix.local',
    '$2a$10$dXJ3SW6G7P2lkFkBr/2HHeykgMZvIYEGOoOzFxcGq7xhfkJHFb7AO', -- BCrypt hash of "demo123"
    'Demo',
    'User',
    '{"handedness": "right", "preferred_notation": "singmaster", "timer_precision": "centiseconds", "cube_size": "3x3", "inspection_time": 15}',
    true,
    true,
    'LOCAL'
);

-- Get the demo user ID for sample data
-- Note: This approach works for development but should be handled differently in production
DO $$
DECLARE
    demo_user_id UUID;
    sample_session_id UUID;
    sample_scramble_ids UUID[];
    i INTEGER;
BEGIN
    -- Get demo user ID
    SELECT id INTO demo_user_id FROM users WHERE username = 'demo_user';
    
    -- Create a sample session
    INSERT INTO sessions (id, user_id, name, puzzle_type, started_at, is_active, notes)
    VALUES (uuid_generate_v4(), demo_user_id, 'Morning Practice Session', '3x3', 
            CURRENT_TIMESTAMP - INTERVAL '2 hours', false, 'Good practice session with focus on F2L')
    RETURNING id INTO sample_session_id;
    
    -- Get some scramble IDs
    SELECT ARRAY(SELECT id FROM scrambles LIMIT 5) INTO sample_scramble_ids;
    
    -- Insert sample solves
    FOR i IN 1..20 LOOP
        INSERT INTO solves (
            user_id, session_id, scramble_id, time_ms, inspection_time_ms, 
            penalty, adjusted_time_ms, solved_at, notes
        ) VALUES (
            demo_user_id,
            sample_session_id,
            sample_scramble_ids[((i-1) % 5) + 1],
            12000 + (random() * 8000)::INTEGER, -- Random time between 12-20 seconds
            (random() * 15000)::INTEGER, -- Random inspection time up to 15 seconds
            CASE 
                WHEN random() < 0.05 THEN 'DNF'
                WHEN random() < 0.15 THEN 'PLUS_TWO'
                ELSE 'NONE'
            END,
            CASE 
                WHEN random() < 0.05 THEN 999999 -- DNF
                WHEN random() < 0.15 THEN 12000 + (random() * 8000)::INTEGER + 2000 -- +2
                ELSE 12000 + (random() * 8000)::INTEGER -- Normal time
            END,
            CURRENT_TIMESTAMP - INTERVAL '2 hours' + (i * INTERVAL '3 minutes'),
            CASE i
                WHEN 1 THEN 'Great cross, slow F2L'
                WHEN 5 THEN 'PLL skip!'
                WHEN 10 THEN 'Need to work on OLL recognition'
                WHEN 15 THEN 'Good solve overall'
                ELSE NULL
            END
        );
    END LOOP;
    
    -- Create a current active session
    INSERT INTO sessions (id, user_id, name, puzzle_type, started_at, is_active, notes)
    VALUES (uuid_generate_v4(), demo_user_id, 'Current Session', '3x3', 
            CURRENT_TIMESTAMP - INTERVAL '30 minutes', true, 'Current practice session');
    
END $$;
