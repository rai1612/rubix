-- Minimal data for MVP authentication testing
-- Create a demo user for testing (password: "demo123")
INSERT INTO users (id, username, email, password_hash, first_name, last_name, preferences, is_active, is_verified, oauth_provider, created_at, updated_at)
VALUES (
    uuid_generate_v4(),
    'demo_user',
    'demo@rubix.local',
    '$2a$10$b9HRgPTS7TjBwFIbdEpFoun2Az1wSVmy2obmcGnd9puGnaD9BPzbm', -- BCrypt hash of "demo123"
    'Demo',
    'User',
    '{"handedness": "right", "preferred_notation": "singmaster", "timer_precision": "centiseconds", "cube_size": "3x3", "inspection_time": 15}',
    true,
    true,
    'LOCAL',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);
