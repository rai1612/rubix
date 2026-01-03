-- F2L First Two Layers and CROSS Algorithms for rubiX
-- Essential F2L cases and cross techniques for CFOP method
-- These are foundational algorithms for speedcubing

-- Ensure required extensions
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp') THEN
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    END IF;
END
$$;

-- F2L and CROSS Algorithm Seed Data
DO $$
DECLARE
    f2l_count_before INTEGER;
    f2l_count_after INTEGER;
    cross_count_before INTEGER;
    cross_count_after INTEGER;
BEGIN
    SELECT COUNT(*) INTO f2l_count_before FROM algorithms WHERE algorithm_set = 'F2L' AND is_public = true;
    SELECT COUNT(*) INTO cross_count_before FROM algorithms WHERE algorithm_set = 'CROSS' AND is_public = true;
    RAISE NOTICE 'F2L algorithms before: %, CROSS before: %', f2l_count_before, cross_count_before;

    -- =========================================================================
    -- BASIC F2L CASES Cases 1-10 - Most common insertions
    -- =========================================================================
    
    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'F2L 1 - Basic Insert Right', 'R U'' R''', 'Corner and edge in top layer, colors matching', 'F2L', 1, 1, 3, true, true, ARRAY['basic', 'beginner'], 'R U R''', NULL, 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'F2L' AND case_number = 1 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'F2L 2 - Basic Insert Left', 'F'' U F', 'Mirror of case 1, left hand insertion', 'F2L', 2, 1, 3, true, true, ARRAY['basic', 'beginner'], 'F'' U'' F', NULL, 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'F2L' AND case_number = 2 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'F2L 3 - Easy Pair', 'U'' R U R''', 'Connected pair, easy insertion', 'F2L', 3, 1, 4, true, true, ARRAY['basic', 'beginner'], 'R U'' R'' U', NULL, 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'F2L' AND case_number = 3 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'F2L 4 - Easy Pair Mirror', 'U F'' U'' F', 'Mirror of case 3', 'F2L', 4, 1, 4, true, false, ARRAY['basic', 'beginner'], 'F'' U F U''', NULL, 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'F2L' AND case_number = 4 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'F2L 5 - Split Pair Right', 'U R U'' R''', 'Split pair, corner color on top', 'F2L', 5, 1, 4, true, true, ARRAY['basic', 'beginner'], 'R U R'' U''', NULL, 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'F2L' AND case_number = 5 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'F2L 6 - Split Pair Left', 'U'' F'' U F', 'Mirror of case 5', 'F2L', 6, 1, 4, true, false, ARRAY['basic', 'beginner'], 'F'' U'' F U', NULL, 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'F2L' AND case_number = 6 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'F2L 7 - Connected Wrong', 'U R U2'' R'' U R U'' R''', 'Pair connected but wrong orientation', 'F2L', 7, 2, 8, true, false, ARRAY['intermediate', 'connected'], NULL, NULL, 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'F2L' AND case_number = 7 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'F2L 8 - Connected Wrong Mirror', 'U'' F'' U2 F U'' F'' U F', 'Mirror of case 7', 'F2L', 8, 2, 8, true, false, ARRAY['intermediate', 'connected'], NULL, NULL, 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'F2L' AND case_number = 8 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'F2L 9 - Sledgehammer', 'R'' F R F''', 'Classic sledgehammer algorithm', 'F2L', 9, 1, 4, true, true, ARRAY['basic', 'sledgehammer', 'beginner'], 'F R'' F'' R', NULL, 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'F2L' AND case_number = 9 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'F2L 10 - Hedgeslammer', 'F R'' F'' R', 'Reverse sledgehammer', 'F2L', 10, 1, 4, true, false, ARRAY['basic', 'hedgeslammer', 'beginner'], 'R'' F R F''', NULL, 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'F2L' AND case_number = 10 AND is_public = true);

    -- =========================================================================
    -- SEXY MOVE VARIATIONS Cases 11-15
    -- =========================================================================
    
    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'F2L 11 - Sexy Move', 'R U R'' U''', 'The classic sexy move', 'F2L', 11, 1, 4, true, true, ARRAY['basic', 'sexy-move', 'beginner'], 'U R U'' R''', NULL, 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'F2L' AND case_number = 11 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'F2L 12 - Reverse Sexy', 'U R U'' R''', 'Reverse sexy move', 'F2L', 12, 1, 4, true, true, ARRAY['basic', 'sexy-move', 'beginner'], 'R U R'' U''', NULL, 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'F2L' AND case_number = 12 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'F2L 13 - Double Sexy', 'R U R'' U'' R U R'' U''', 'Double sexy move', 'F2L', 13, 2, 8, true, false, ARRAY['intermediate', 'sexy-move'], NULL, NULL, 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'F2L' AND case_number = 13 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'F2L 14 - Triple Sexy', 'R U R'' U'' R U R'' U'' R U R'' U''', 'Triple sexy move', 'F2L', 14, 2, 12, true, false, ARRAY['intermediate', 'sexy-move'], NULL, NULL, 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'F2L' AND case_number = 14 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'F2L 15 - Corner First', 'R U2 R'' U'' R U R''', 'Insert corner first approach', 'F2L', 15, 2, 7, true, false, ARRAY['intermediate', 'corner-first'], NULL, NULL, 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'F2L' AND case_number = 15 AND is_public = true);

    -- =========================================================================
    -- ADVANCED F2L CASES Cases 16-25
    -- =========================================================================
    
    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'F2L 16 - Edge in Slot', 'R U'' R'' U R U'' R'' U R U'' R''', 'Edge already in slot, corner on top', 'F2L', 16, 2, 11, true, false, ARRAY['intermediate', 'edge-in-slot'], NULL, NULL, 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'F2L' AND case_number = 16 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'F2L 17 - Corner in Slot', 'R U R'' U'' R U R'' U'' R U R''', 'Corner already in slot, edge on top', 'F2L', 17, 2, 11, true, false, ARRAY['intermediate', 'corner-in-slot'], NULL, NULL, 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'F2L' AND case_number = 17 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'F2L 18 - Both in Slot Wrong', 'R U'' R'' U'' R U R'' U2 R U'' R''', 'Both pieces in slot but wrong', 'F2L', 18, 3, 11, true, false, ARRAY['advanced', 'both-in-slot'], NULL, NULL, 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'F2L' AND case_number = 18 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'F2L 19 - Edge Flip', 'R U'' R'' U y'' R'' U R', 'Edge needs to be flipped', 'F2L', 19, 2, 7, true, false, ARRAY['intermediate', 'edge-flip'], NULL, NULL, 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'F2L' AND case_number = 19 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'F2L 20 - Hidden Edge', 'R2 U2 R'' U'' R U'' R'' U2 R''', 'Edge hidden in wrong slot', 'F2L', 20, 3, 9, true, false, ARRAY['advanced', 'hidden-edge'], NULL, NULL, 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'F2L' AND case_number = 20 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'F2L 21 - Twisted Corner', 'R U2 R'' U'' R U R'' U'' R U'' R''', 'Corner twisted in slot', 'F2L', 21, 3, 11, true, false, ARRAY['advanced', 'twisted-corner'], NULL, NULL, 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'F2L' AND case_number = 21 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'F2L 22 - Keyhole', 'R U R'' U'' y'' R U'' R'' U y', 'Keyhole method insertion', 'F2L', 22, 2, 9, true, false, ARRAY['intermediate', 'keyhole'], NULL, NULL, 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'F2L' AND case_number = 22 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'F2L 23 - Multislotting', 'R U R'' U'' R U'' R'' U R U R''', 'Working with multiple slots', 'F2L', 23, 3, 11, true, false, ARRAY['advanced', 'multislot'], NULL, NULL, 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'F2L' AND case_number = 23 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'F2L 24 - Pseudo Slot', 'F R U R'' U'' F'' R U R'' U'' R U R''', 'Pseudo slot technique', 'F2L', 24, 3, 13, true, false, ARRAY['advanced', 'pseudo-slot'], NULL, NULL, 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'F2L' AND case_number = 24 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'F2L 25 - Advanced Insert', 'R U'' R'' U R'' D'' R U'' R'' D R', 'Advanced insertion technique', 'F2L', 25, 3, 11, true, false, ARRAY['advanced', 'advanced-insert'], NULL, NULL, 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'F2L' AND case_number = 25 AND is_public = true);

    -- =========================================================================
    -- CROSS ALGORITHMS - White cross techniques
    -- =========================================================================
    
    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'Cross 1 - Basic Setup', 'F'' D'' L'' D', 'Basic cross edge insertion', 'CROSS', 1, 1, 4, true, true, ARRAY['basic', 'beginner'], NULL, NULL, 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'CROSS' AND case_number = 1 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'Cross 2 - Edge Flip', 'F D R'' D''', 'Flip edge into cross position', 'CROSS', 2, 1, 4, true, false, ARRAY['basic', 'beginner'], NULL, NULL, 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'CROSS' AND case_number = 2 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'Cross 3 - Back Insert', 'B'' D'' R'' D', 'Insert edge from back', 'CROSS', 3, 1, 4, true, false, ARRAY['basic', 'beginner'], NULL, NULL, 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'CROSS' AND case_number = 3 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'Cross 4 - X-Cross Setup', 'F D R U2 R'' D'' F''', 'Extended cross with first F2L pair', 'CROSS', 4, 3, 7, true, false, ARRAY['advanced', 'x-cross'], NULL, NULL, 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'CROSS' AND case_number = 4 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'Cross 5 - Oriented Cross', 'D R F D'' F''', 'Cross with edge orientation', 'CROSS', 5, 2, 5, true, false, ARRAY['intermediate', 'oriented'], NULL, NULL, 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'CROSS' AND case_number = 5 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'Cross 6 - Pseudo Cross', 'R D'' R'' U2 R D R''', 'Pseudo cross technique', 'CROSS', 6, 3, 7, true, false, ARRAY['advanced', 'pseudo'], NULL, NULL, 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'CROSS' AND case_number = 6 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'Cross 7 - Color Neutral', 'U R D'' R'' U''', 'Color neutral approach', 'CROSS', 7, 2, 5, true, false, ARRAY['intermediate', 'color-neutral'], NULL, NULL, 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'CROSS' AND case_number = 7 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'Cross 8 - Block Building', 'R F R'' F''', 'Cross via block building', 'CROSS', 8, 2, 4, true, false, ARRAY['intermediate', 'block'], NULL, NULL, 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'CROSS' AND case_number = 8 AND is_public = true);

    -- Report results
    SELECT COUNT(*) INTO f2l_count_after FROM algorithms WHERE algorithm_set = 'F2L' AND is_public = true;
    SELECT COUNT(*) INTO cross_count_after FROM algorithms WHERE algorithm_set = 'CROSS' AND is_public = true;
    RAISE NOTICE 'F2L algorithms after: % added %', f2l_count_after, f2l_count_after - f2l_count_before;
    RAISE NOTICE 'CROSS algorithms after: % added %', cross_count_after, cross_count_after - cross_count_before;
    
END $$;

