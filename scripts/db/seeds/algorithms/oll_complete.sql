-- Complete OLL Orientation of Last Layer Algorithms for rubiX
-- All 57 OLL cases with verified notation, setup moves, and image URLs
-- Setup moves verified from CubeSkills archive

-- Ensure required extensions
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp') THEN
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    END IF;
END
$$;

-- OLL Algorithm Seed Data
-- Uses conditional inserts to prevent duplicates idempotent
DO $$
DECLARE
    oll_count_before INTEGER;
    oll_count_after INTEGER;
BEGIN
    SELECT COUNT(*) INTO oll_count_before FROM algorithms WHERE algorithm_set = 'OLL' AND is_public = true;
    RAISE NOTICE 'OLL algorithms before: %', oll_count_before;

    -- =========================================================================
    -- OLL 1-10
    -- =========================================================================
    
    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'OLL 1 - Dot', 'R U2 R'' R'' F R F'' U2 R'' F R F''', 'All edges flipped, no corners oriented', 'OLL', 1, 4, 13, true, false, ARRAY['dot', 'advanced'], 'L U2 B'' R2 F R2 B U2 R'' F'' R L''', '/images/oll-cases/1.png', 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'OLL' AND case_number = 1 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'OLL 2 - Dot', 'F R U R'' U'' F'' f R U R'' U'' f''', 'All edges flipped, corners in headlights pattern', 'OLL', 2, 4, 12, true, false, ARRAY['dot', 'advanced'], 'R'' U'' F'' U2 F R'' D'' L F'' L'' D R2 U''', '/images/oll-cases/2.png', 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'OLL' AND case_number = 2 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'OLL 3 - Dot', 'f R U R'' U'' f'' U'' F R U R'' U'' F''', 'All edges flipped, L-shape corners', 'OLL', 3, 4, 14, true, false, ARRAY['dot', 'advanced'], 'B L2 F'' L'' F2 U2 F'' L'' B'' R'' U2 R U2', '/images/oll-cases/3.png', 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'OLL' AND case_number = 3 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'OLL 4 - Dot', 'f R U R'' U'' f'' U F R U R'' U'' F''', 'All edges flipped, mirrored L corners', 'OLL', 4, 4, 13, true, false, ARRAY['dot', 'advanced'], 'R'' U'' F'' U F R F R U R'' U'' F'' U2', '/images/oll-cases/4.png', 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'OLL' AND case_number = 4 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'OLL 5 - Square', 'r'' U2 R U R'' U r', 'Square shape, lightning bolt', 'OLL', 5, 2, 7, true, false, ARRAY['square', 'intermediate'], 'L'' U'' F B'' U2 F2 B L'' D'' L2 D F U', '/images/oll-cases/5.png', 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'OLL' AND case_number = 5 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'OLL 6 - Square', 'r U2 R'' U'' R U'' r''', 'Square shape, reverse lightning', 'OLL', 6, 2, 7, true, false, ARRAY['square', 'intermediate'], 'L F U F'' U'' F R'' F R F2 L'' U', '/images/oll-cases/6.png', 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'OLL' AND case_number = 6 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'OLL 7 - Lightning', 'r U R'' U R U2 r''', 'Lightning bolt right', 'OLL', 7, 2, 7, true, false, ARRAY['lightning', 'intermediate'], 'L'' U'' B'' U B U'' L U'' L'' U2 L U2', '/images/oll-cases/7.png', 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'OLL' AND case_number = 7 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'OLL 8 - Lightning', 'r'' U'' R U'' R'' U2 r', 'Lightning bolt left', 'OLL', 8, 2, 7, true, false, ARRAY['lightning', 'intermediate'], 'B U L U'' L'' U B'' U B U2 B'' U', '/images/oll-cases/8.png', 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'OLL' AND case_number = 8 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'OLL 9 - Fish', 'R U R'' U'' R'' F R2 U R'' U'' F''', 'Fish shape variant', 'OLL', 9, 3, 11, true, false, ARRAY['fish', 'intermediate'], 'F'' U2 F U F'' U L'' U'' L U F U''', '/images/oll-cases/9.png', 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'OLL' AND case_number = 9 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'OLL 10 - Fish', 'R U R'' U R'' F R F'' R U2 R''', 'Fish with headlights', 'OLL', 10, 3, 11, true, false, ARRAY['fish', 'intermediate'], 'F U2 F'' U L'' U'' L U'' F U'' F''', '/images/oll-cases/10.png', 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'OLL' AND case_number = 10 AND is_public = true);

    -- =========================================================================
    -- OLL 11-20
    -- =========================================================================

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'OLL 11 - Lightning', 'F'' L'' U'' L U F y F R U R'' U'' F''', 'Awkward lightning', 'OLL', 11, 3, 12, true, false, ARRAY['lightning', 'advanced'], 'L R'' F'' L F2 L'' F'' L F'' L2 R', '/images/oll-cases/11.png', 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'OLL' AND case_number = 11 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'OLL 12 - Lightning', 'F R U R'' U'' F'' U F R U R'' U'' F''', 'Double F-move', 'OLL', 12, 3, 14, true, false, ARRAY['lightning', 'advanced'], 'B'' F R B'' R2 B R B'' R B2 F'' U2', '/images/oll-cases/12.png', 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'OLL' AND case_number = 12 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'OLL 13 - Big L', 'F U R U'' R2 F'' R U R U'' R''', 'Big L shape', 'OLL', 13, 3, 11, true, false, ARRAY['big-l', 'intermediate'], 'B L U L'' U B D F'' L2 F D'' B2 U''', '/images/oll-cases/13.png', 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'OLL' AND case_number = 13 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'OLL 14 - Big L', 'R'' F R U R'' F'' R y'' R U'' R''', 'Big L mirrored', 'OLL', 14, 3, 10, true, false, ARRAY['big-l', 'intermediate'], 'R U B U'' B'' U'' L'' U R'' U'' L U2', '/images/oll-cases/14.png', 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'OLL' AND case_number = 14 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'OLL 15 - Big L', 'l'' U'' l L'' U'' L U l'' U l', 'Big L with l-moves', 'OLL', 15, 3, 10, true, false, ARRAY['big-l', 'intermediate'], 'B'' R'' F R2 D R D2 F D F2 R2 B U''', '/images/oll-cases/15.png', 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'OLL' AND case_number = 15 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'OLL 16 - Big L', 'r U r'' R U R'' U'' r U'' r''', 'Big L with r-moves', 'OLL', 16, 3, 10, true, false, ARRAY['big-l', 'intermediate'], 'L F U F2 U'' F R'' D'' F D L'' R U''', '/images/oll-cases/16.png', 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'OLL' AND case_number = 16 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'OLL 17 - Dot', 'R U R'' U R'' F R F'' U2 R'' F R F''', 'All edges flipped, diagonal corners', 'OLL', 17, 4, 14, true, false, ARRAY['dot', 'advanced'], 'B'' F R F R F'' R'' B F2 L F L'' U', '/images/oll-cases/17.png', 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'OLL' AND case_number = 17 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'OLL 18 - Dot', 'F R U R'' U y'' R'' U2 R'' F R F''', 'All edges flipped, arrow pattern', 'OLL', 18, 4, 12, true, false, ARRAY['dot', 'advanced'], 'F U R U'' R'' U F'' U'' F'' L F L'' U', '/images/oll-cases/18.png', 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'OLL' AND case_number = 18 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'OLL 19 - Dot', 'M U R U R'' U'' M'' R'' F R F''', 'All edges flipped, M-move solution', 'OLL', 19, 4, 12, true, false, ARRAY['dot', 'advanced'], 'F U'' R'' F R B F D'' L D B'' F U', '/images/oll-cases/19.png', 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'OLL' AND case_number = 19 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'OLL 20 - Dot', 'M U R U R'' U'' M2 U R U'' r''', 'All edges flipped, X pattern corners', 'OLL', 20, 4, 12, true, false, ARRAY['dot', 'advanced'], 'R'' F'' U'' F R B2 F'' D L D'' B2 F', '/images/oll-cases/20.png', 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'OLL' AND case_number = 20 AND is_public = true);

    -- =========================================================================
    -- OLL 21-30
    -- =========================================================================

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'OLL 21 - Cross', 'R U R'' U R U'' R'' U R U2 R''', 'H-shape, double Sune', 'OLL', 21, 2, 11, true, true, ARRAY['cross', 'h-shape', 'intermediate'], 'B L2 B2 U2 B L2 B'' U2 B2 L2 B''', '/images/oll-cases/21.png', 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'OLL' AND case_number = 21 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'OLL 22 - Cross', 'R U2 R2'' U'' R2 U'' R2'' U2 R', 'Pi shape', 'OLL', 22, 2, 9, true, false, ARRAY['cross', 'pi', 'intermediate'], 'R'' U'' R2 B'' R2 U F'' U'' F R2 B R''', '/images/oll-cases/22.png', 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'OLL' AND case_number = 22 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'OLL 23 - Headlights', 'R2 D R'' U2 R D'' R'' U2 R''', 'Headlights pattern', 'OLL', 23, 3, 9, true, false, ARRAY['cross', 'headlights', 'intermediate'], 'F R U R2 U'' R'' F'' R U R2 U'' R'' U', '/images/oll-cases/23.png', 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'OLL' AND case_number = 23 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'OLL 24 - T-Shape', 'r U R'' U'' r'' F R F''', 'Chameleon', 'OLL', 24, 2, 8, true, false, ARRAY['t-shape', 'chameleon', 'intermediate'], 'F2 U F'' R F U'' F'' U R'' U'' F'' U2', '/images/oll-cases/24.png', 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'OLL' AND case_number = 24 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'OLL 25 - T-Shape', 'F'' r U R'' U'' r'' F R', 'Headlights T', 'OLL', 25, 2, 8, true, false, ARRAY['t-shape', 'intermediate'], 'R'' U'' R L B L U'' L'' U2 B'' U2 L''', '/images/oll-cases/25.png', 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'OLL' AND case_number = 25 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'OLL 26 - Sune', 'R U2 R'' U'' R U'' R''', 'The famous Sune algorithm', 'OLL', 26, 1, 7, true, true, ARRAY['t-shape', 'sune', 'beginner'], 'R'' D'' F R2 U B U'' B'' R2 F'' D R U', '/images/oll-cases/26.png', 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'OLL' AND case_number = 26 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'OLL 27 - Anti-Sune', 'R'' U2 R U R'' U R', 'Mirror of Sune', 'OLL', 27, 1, 7, true, true, ARRAY['t-shape', 'antisune', 'beginner'], 'L R F'' R F L F'' R'' F L2 R''', '/images/oll-cases/27.png', 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'OLL' AND case_number = 27 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'OLL 28 - All Corners', 'M'' U'' M U2'' M'' U'' M', 'All corners oriented, edges wrong', 'OLL', 28, 2, 7, true, false, ARRAY['corners', 'intermediate'], 'R'' B'' R'' B F'' U2 B'' F R'' B R U', '/images/oll-cases/28.png', 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'OLL' AND case_number = 28 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'OLL 29 - Awkward', 'R U R'' U'' R U'' R'' F'' U'' F R U R''', 'Awkward shape', 'OLL', 29, 3, 14, true, false, ARRAY['awkward', 'advanced'], 'R2 F2 L'' B D B'' D'' L'' D L2 F2 R2 U''', '/images/oll-cases/29.png', 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'OLL' AND case_number = 29 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'OLL 30 - Awkward', 'L F'' L'' F L'' U2 L d R U R''', 'Awkward shape mirrored', 'OLL', 30, 3, 11, true, false, ARRAY['awkward', 'advanced'], 'R2 U B'' R'' B'' D'' R'' D R B2 U'' R2 U', '/images/oll-cases/30.png', 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'OLL' AND case_number = 30 AND is_public = true);

    -- =========================================================================
    -- OLL 31-40
    -- =========================================================================

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'OLL 31 - P-Shape', 'R'' U'' F U R U'' R'' F'' R', 'P-shape right', 'OLL', 31, 2, 9, true, false, ARRAY['p-shape', 'intermediate'], 'B'' U2 B L U'' L'' U'' B L'' B'' L U2', '/images/oll-cases/31.png', 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'OLL' AND case_number = 31 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'OLL 32 - P-Shape', 'F U R U'' F'' r U R'' U'' r''', 'P-shape left', 'OLL', 32, 2, 10, true, false, ARRAY['p-shape', 'intermediate'], 'L2 F2 R'' D R F'' R'' F D'' R F2 L2 U''', '/images/oll-cases/32.png', 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'OLL' AND case_number = 32 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'OLL 33 - T-Shape', 'R U R'' U'' R'' F R F''', 'Keyhole T-shape', 'OLL', 33, 1, 8, true, true, ARRAY['t-shape', 'beginner'], 'F L'' U L F U'' R U2 R2 F R F U''', '/images/oll-cases/33.png', 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'OLL' AND case_number = 33 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'OLL 34 - C-Shape', 'R U R'' U'' x D'' R'' U R U'' D x''', 'C-shape', 'OLL', 34, 3, 11, true, false, ARRAY['c-shape', 'intermediate'], 'B U B L F L'' B'' L F'' U'' L'' B''', '/images/oll-cases/34.png', 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'OLL' AND case_number = 34 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'OLL 35 - Square', 'R U2 R'' R'' F R F'' R U2 R''', 'Square with bar', 'OLL', 35, 3, 11, true, false, ARRAY['square', 'intermediate'], 'F R'' F'' U'' F R F'' U'' R'' U2 R U', '/images/oll-cases/35.png', 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'OLL' AND case_number = 35 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'OLL 36 - W-Shape', 'L'' U'' L U'' L'' U L U L F'' L'' F', 'W-shape left', 'OLL', 36, 3, 12, true, false, ARRAY['w-shape', 'intermediate'], 'B2 U'' R B L'' R'' D'' B D L B U''', '/images/oll-cases/36.png', 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'OLL' AND case_number = 36 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'OLL 37 - Fish', 'F R'' F'' R U R U'' R''', 'Fish shape', 'OLL', 37, 2, 8, true, false, ARRAY['fish', 'intermediate'], 'B'' R U R B'' R'' B U'' R'' U'' B U''', '/images/oll-cases/37.png', 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'OLL' AND case_number = 37 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'OLL 38 - W-Shape', 'R U R'' U R U'' R'' U'' R'' F R F''', 'W-shape right', 'OLL', 38, 3, 12, true, false, ARRAY['w-shape', 'intermediate'], 'L'' B2 D'' R D'' R'' F'' R F D2 B2 L U', '/images/oll-cases/38.png', 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'OLL' AND case_number = 38 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'OLL 39 - Z-Shape', 'L F'' L'' U'' L U F U'' L''', 'Z-shape left', 'OLL', 39, 3, 9, true, false, ARRAY['z-shape', 'intermediate'], 'B'' U'' B2 L'' B'' L2 U L'' U'' L U'' L'' U', '/images/oll-cases/39.png', 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'OLL' AND case_number = 39 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'OLL 40 - Z-Shape', 'R'' F R U R'' U'' F'' U R', 'Z-shape right', 'OLL', 40, 3, 9, true, false, ARRAY['z-shape', 'intermediate'], 'B U R'' F2 D2 L'' D2 F'' R F'' U B'' U2', '/images/oll-cases/40.png', 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'OLL' AND case_number = 40 AND is_public = true);

    -- =========================================================================
    -- OLL 41-50
    -- =========================================================================

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'OLL 41 - Awkward', 'R U R'' U R U2 R'' F R U R'' U'' F''', 'Y-shape OLL', 'OLL', 41, 3, 13, true, false, ARRAY['awkward', 'advanced'], 'F'' U2 L U2 L2 U2 L'' B F'' L2 B'' F2', '/images/oll-cases/41.png', 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'OLL' AND case_number = 41 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'OLL 42 - Awkward', 'R'' F R F'' R'' F R F'' R U R'' U'' R U R''', 'Double sexy pattern', 'OLL', 42, 3, 16, true, false, ARRAY['awkward', 'advanced'], 'B2 D2 F2 R D2 B'' D2 F2 D2 B'' U2 L U2', '/images/oll-cases/42.png', 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'OLL' AND case_number = 42 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'OLL 43 - P-Shape', 'f'' L'' U'' L U f', 'Easy P left', 'OLL', 43, 1, 6, true, false, ARRAY['p-shape', 'beginner'], 'B'' U R U R'' U'' R'' F R F'' B U''', '/images/oll-cases/43.png', 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'OLL' AND case_number = 43 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'OLL 44 - P-Shape', 'f R U R'' U'' f''', 'Easy P right', 'OLL', 44, 1, 6, true, true, ARRAY['p-shape', 'beginner'], 'F R U'' B L U'' L'' U2 B'' R'' F'' U2', '/images/oll-cases/44.png', 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'OLL' AND case_number = 44 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'OLL 45 - T-Shape', 'F R U R'' U'' F''', 'Easy T-shape', 'OLL', 45, 1, 6, true, true, ARRAY['t-shape', 'beginner'], 'D2 L2 R2 U2 D2 L'' R2 U F U'' F'' L'' U''', '/images/oll-cases/45.png', 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'OLL' AND case_number = 45 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'OLL 46 - C-Shape', 'R'' U'' R'' F R F'' U R', 'C-shape variant', 'OLL', 46, 2, 8, true, false, ARRAY['c-shape', 'intermediate'], 'F U R'' U'' F'' U L F R F'' L'' U2', '/images/oll-cases/46.png', 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'OLL' AND case_number = 46 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'OLL 47 - Small L', 'F'' L'' U'' L U L'' U'' L U F', 'Small L left', 'OLL', 47, 2, 10, true, false, ARRAY['small-l', 'intermediate'], 'R'' U'' R U'' R B'' R'' B'' L'' B'' L B'' U2', '/images/oll-cases/47.png', 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'OLL' AND case_number = 47 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'OLL 48 - Small L', 'F R U R'' U'' R U R'' U'' F''', 'Small L right', 'OLL', 48, 2, 10, true, false, ARRAY['small-l', 'intermediate'], 'R'' U2 R2 U R2 U F R F'' R U2 R'' U', '/images/oll-cases/48.png', 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'OLL' AND case_number = 48 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'OLL 49 - Small L', 'R'' F R'' F'' R2 U2 y R'' F R F''', 'Small L variant', 'OLL', 49, 3, 10, true, false, ARRAY['small-l', 'advanced'], 'B'' L'' R'' U2 R U2 L F B U2 F'' U''', '/images/oll-cases/49.png', 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'OLL' AND case_number = 49 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'OLL 50 - Small L', 'R'' F R2 B'' R2'' F'' R2 B R''', 'Small L advanced', 'OLL', 50, 3, 9, true, false, ARRAY['small-l', 'advanced'], 'B U2 B'' F'' R2 L F2 L'' F2 R2 F U''', '/images/oll-cases/50.png', 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'OLL' AND case_number = 50 AND is_public = true);

    -- =========================================================================
    -- OLL 51-57
    -- =========================================================================

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'OLL 51 - Line', 'f R U R'' U'' R U R'' U'' f''', 'I-shape, bar on side', 'OLL', 51, 2, 10, true, false, ARRAY['line', 'intermediate'], 'B U2 B2 F R'' D'' R2 D R B R2 F'' U2', '/images/oll-cases/51.png', 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'OLL' AND case_number = 51 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'OLL 52 - Line', 'R U R'' U R d'' R U'' R'' F''', 'I-shape with corners', 'OLL', 52, 3, 10, true, false, ARRAY['line', 'intermediate'], 'L'' R2 D B D'' B R'' B'' R B'' L R2', '/images/oll-cases/52.png', 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'OLL' AND case_number = 52 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'OLL 53 - Small L', 'l'' U'' L U'' L'' U L U'' L'' U2 l', 'Small L with l-moves', 'OLL', 53, 3, 11, true, false, ARRAY['small-l', 'advanced'], 'R L2 D2 B D2 B'' D2 B'' R'' L B2 L U', '/images/oll-cases/53.png', 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'OLL' AND case_number = 53 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'OLL 54 - Small L', 'r U R'' U R U'' R'' U R U2'' r''', 'Small L with r-moves', 'OLL', 54, 3, 11, true, false, ARRAY['small-l', 'advanced'], 'R B2 L'' B'' L B L'' B'' L B'' R'' U2', '/images/oll-cases/54.png', 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'OLL' AND case_number = 54 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'OLL 55 - Line', 'R U2 R2 U'' R U'' R'' U2 F R F''', 'Highway pattern', 'OLL', 55, 3, 11, true, false, ARRAY['line', 'advanced'], 'F'' L'' F U'' B'' U B2 F'' L'' B'' L2 F', '/images/oll-cases/55.png', 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'OLL' AND case_number = 55 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'OLL 56 - Line', 'F R U R'' U'' R F'' r U R'' U'' r''', 'I-shape variant', 'OLL', 56, 3, 12, true, false, ARRAY['line', 'advanced'], 'F U'' F'' U2 B F U'' F'' U2 L U'' L'' B''', '/images/oll-cases/56.png', 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'OLL' AND case_number = 56 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'OLL 57 - All Corners', 'R U R'' U'' M'' U R U'' r''', 'All corners oriented variant', 'OLL', 57, 2, 9, true, false, ARRAY['corners', 'intermediate'], 'F2 L F L'' B'' F U F'' U'' B F U', '/images/oll-cases/57.png', 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'OLL' AND case_number = 57 AND is_public = true);

    -- Report results
    SELECT COUNT(*) INTO oll_count_after FROM algorithms WHERE algorithm_set = 'OLL' AND is_public = true;
    RAISE NOTICE 'OLL algorithms after: % added %', oll_count_after, oll_count_after - oll_count_before;
    
END $$;
