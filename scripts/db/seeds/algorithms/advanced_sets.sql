-- Advanced Algorithm Sets for rubiX
-- ZBLL, COLL, Winter Variation, and other advanced techniques
-- For expert speedcubers

-- Ensure required extensions
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp') THEN
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    END IF;
END
$$;

-- Advanced Algorithm Seed Data
DO $$
DECLARE
    zbll_count_before INTEGER;
    coll_count_before INTEGER;
    wv_count_before INTEGER;
    zbll_count_after INTEGER;
    coll_count_after INTEGER;
    wv_count_after INTEGER;
BEGIN
    SELECT COUNT(*) INTO zbll_count_before FROM algorithms WHERE algorithm_set = 'ZBLL' AND is_public = true;
    SELECT COUNT(*) INTO coll_count_before FROM algorithms WHERE algorithm_set = 'COLL' AND is_public = true;
    SELECT COUNT(*) INTO wv_count_before FROM algorithms WHERE algorithm_set = 'WV' AND is_public = true;
    RAISE NOTICE 'Advanced algorithms before - ZBLL: %, COLL: %, WV: %', zbll_count_before, coll_count_before, wv_count_before;

    -- =========================================================================
    -- ZBLL Zborowski-Bruchem Last Layer - Sample cases
    -- Full ZBLL has 493 algorithms, these are key examples
    -- =========================================================================
    
    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'ZBLL T1 - Sune Skip', 'R U R'' U R U2 R''', 'ZBLL case with oriented edges, T case', 'ZBLL', 1, 4, 7, true, false, ARRAY['expert', 'zbll', 't-case'], NULL, NULL, 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'ZBLL' AND case_number = 1 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'ZBLL T2 - Anti-Sune Skip', 'R'' U'' R U'' R'' U2 R', 'ZBLL case with oriented edges, T case variant', 'ZBLL', 2, 4, 7, true, false, ARRAY['expert', 'zbll', 't-case'], NULL, NULL, 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'ZBLL' AND case_number = 2 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'ZBLL U1 - U Case', 'R U R'' U R U'' R'' U R U2 R''', 'ZBLL U shape, double Sune', 'ZBLL', 3, 4, 11, true, false, ARRAY['expert', 'zbll', 'u-case'], NULL, NULL, 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'ZBLL' AND case_number = 3 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'ZBLL L1 - L Case', 'R U2 R'' U'' R U'' R''', 'ZBLL L shape variant', 'ZBLL', 4, 4, 7, true, false, ARRAY['expert', 'zbll', 'l-case'], NULL, NULL, 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'ZBLL' AND case_number = 4 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'ZBLL H1 - H Case', 'R U2 R2 U'' R2 U'' R2 U2 R', 'ZBLL H shape, Pi variant', 'ZBLL', 5, 4, 9, true, false, ARRAY['expert', 'zbll', 'h-case'], NULL, NULL, 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'ZBLL' AND case_number = 5 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'ZBLL Pi1 - Pi Case', 'F R U R'' U'' R U R'' U'' F''', 'ZBLL Pi shape', 'ZBLL', 6, 4, 10, true, false, ARRAY['expert', 'zbll', 'pi-case'], NULL, NULL, 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'ZBLL' AND case_number = 6 AND is_public = true);

    -- =========================================================================
    -- COLL Corners of Last Layer - Preserve edge orientation
    -- =========================================================================
    
    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'COLL T1 - T Perm Style', 'R U R'' U'' R'' F R2 U'' R'' U'' R U R'' F''', 'COLL T case, preserves edges', 'COLL', 1, 4, 14, true, false, ARRAY['expert', 'coll', 't-case'], NULL, NULL, 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'COLL' AND case_number = 1 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'COLL T2 - Sune COLL', 'R U2 R'' U'' R U'' R''', 'COLL T variant with Sune motion', 'COLL', 2, 4, 7, true, false, ARRAY['expert', 'coll', 't-case'], NULL, NULL, 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'COLL' AND case_number = 2 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'COLL U1 - U Case', 'R'' U'' R U'' R'' U2 R', 'COLL U case, anti-sune variant', 'COLL', 3, 4, 7, true, false, ARRAY['expert', 'coll', 'u-case'], NULL, NULL, 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'COLL' AND case_number = 3 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'COLL L1 - L Case', 'F R U'' R'' U'' R U R'' F''', 'COLL L shape', 'COLL', 4, 4, 9, true, false, ARRAY['expert', 'coll', 'l-case'], NULL, NULL, 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'COLL' AND case_number = 4 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'COLL H1 - H Case', 'R U R'' U R U'' R'' U R U2 R''', 'COLL H case, double Sune', 'COLL', 5, 4, 11, true, false, ARRAY['expert', 'coll', 'h-case'], NULL, NULL, 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'COLL' AND case_number = 5 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'COLL Pi1 - Pi Case', 'F R'' F'' R U R U'' R''', 'COLL Pi shape', 'COLL', 6, 4, 8, true, false, ARRAY['expert', 'coll', 'pi-case'], NULL, NULL, 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'COLL' AND case_number = 6 AND is_public = true);

    -- =========================================================================
    -- WV Winter Variation - F2L to OLL skip
    -- =========================================================================
    
    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'WV 1 - Right Hand Basic', 'R U R'' F'' U F', 'Basic Winter Variation, right hand', 'WV', 1, 4, 6, true, false, ARRAY['expert', 'wv', 'right-hand'], NULL, NULL, 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'WV' AND case_number = 1 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'WV 2 - Left Hand Basic', 'L'' U'' L F U'' F''', 'Basic Winter Variation, left hand', 'WV', 2, 4, 6, true, false, ARRAY['expert', 'wv', 'left-hand'], NULL, NULL, 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'WV' AND case_number = 2 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'WV 3 - Sune Setup', 'R U'' R'' U R U2 R'' U R U'' R''', 'Winter Variation with Sune setup', 'WV', 3, 4, 11, true, false, ARRAY['expert', 'wv', 'sune'], NULL, NULL, 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'WV' AND case_number = 3 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'WV 4 - Anti-Sune Setup', 'R'' U R U'' R'' U2 R U'' R'' U R', 'Winter Variation with Anti-Sune setup', 'WV', 4, 4, 11, true, false, ARRAY['expert', 'wv', 'antisune'], NULL, NULL, 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'WV' AND case_number = 4 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'WV 5 - Corner Twist', 'R U'' R'' U'' R U R'' U2 R U'' R''', 'Winter Variation corner twist', 'WV', 5, 4, 11, true, false, ARRAY['expert', 'wv', 'corner-twist'], NULL, NULL, 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'WV' AND case_number = 5 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'WV 6 - Edge Flip', 'F R U R'' U'' F'' R U'' R''', 'Winter Variation with edge flip', 'WV', 6, 4, 9, true, false, ARRAY['expert', 'wv', 'edge-flip'], NULL, NULL, 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'WV' AND case_number = 6 AND is_public = true);

    -- Report results
    SELECT COUNT(*) INTO zbll_count_after FROM algorithms WHERE algorithm_set = 'ZBLL' AND is_public = true;
    SELECT COUNT(*) INTO coll_count_after FROM algorithms WHERE algorithm_set = 'COLL' AND is_public = true;
    SELECT COUNT(*) INTO wv_count_after FROM algorithms WHERE algorithm_set = 'WV' AND is_public = true;
    RAISE NOTICE 'Advanced algorithms after - ZBLL: % added %, COLL: % added %, WV: % added %', 
        zbll_count_after, zbll_count_after - zbll_count_before,
        coll_count_after, coll_count_after - coll_count_before,
        wv_count_after, wv_count_after - wv_count_before;
    
END $$;

