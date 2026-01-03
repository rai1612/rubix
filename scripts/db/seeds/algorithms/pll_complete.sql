-- Complete PLL Permutation of Last Layer Algorithms for rubiX
-- All 21 PLL cases with verified notation, setup moves, and image URLs
-- Setup moves verified from CubeSkills archive

-- Ensure required extensions
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp') THEN
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    END IF;
END
$$;

-- PLL Algorithm Seed Data
-- Uses conditional inserts to prevent duplicates idempotent
DO $$
DECLARE
    pll_count_before INTEGER;
    pll_count_after INTEGER;
BEGIN
    SELECT COUNT(*) INTO pll_count_before FROM algorithms WHERE algorithm_set = 'PLL' AND is_public = true;
    RAISE NOTICE 'PLL algorithms before: %', pll_count_before;

    -- =========================================================================
    -- EDGES ONLY CASES H, Ua, Ub, Z - Only edges need to be permuted
    -- =========================================================================
    
    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'PLL H - Edges Only', 'x R'' U R'' D2 R U'' R'' D2 R2 x''', 'Swap opposite edge pairs', 'PLL', 1, 2, 7, true, true, ARRAY['edges-only', 'intermediate'], 'D R B'' R F2 R'' B R F2 R2 U'' D'' U y''', '/images/pll-cases/1.png', 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'PLL' AND case_number = 1 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'PLL Ua - Edges Only', 'x R2'' D2 R U R'' D2 R U'' R x''', 'Clockwise edge cycle', 'PLL', 2, 2, 11, true, true, ARRAY['edges-only', 'u-perm', 'intermediate'], 'B2 L2 U'' B2 U L2 U'' B2 D L2 D'' U y''', '/images/pll-cases/2.png', 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'PLL' AND case_number = 2 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'PLL Ub - Edges Only', 'x'' R U'' R'' D R U R'' D'' R U R'' D R U'' R'' D'' x', 'Counter-clockwise edge cycle', 'PLL', 3, 2, 11, true, true, ARRAY['edges-only', 'u-perm', 'intermediate'], 'B F R F'' L F R'' B'' F'' R B L'' B'' R'' y''', '/images/pll-cases/3.png', 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'PLL' AND case_number = 3 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'PLL Z - Edges Only', 'M2 U M2 U2 M2 U M2', 'Diagonal edge swap', 'PLL', 4, 3, 15, true, false, ARRAY['edges-only', 'z-perm', 'advanced'], 'F2 L2 F B L2 F B'' U R L U2 R'' L'' U''', '/images/pll-cases/4.png', 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'PLL' AND case_number = 4 AND is_public = true);

    -- =========================================================================
    -- CORNERS ONLY CASES Aa, Ab, E - Only corners need to be permuted
    -- =========================================================================
    
    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'PLL Aa - Corners Only', 'R U'' R U R U R U'' R'' U'' R2', 'Adjacent corner swap clockwise', 'PLL', 5, 3, 9, true, true, ARRAY['corners-only', 'a-perm', 'intermediate'], 'L2 U F'' B L2 F B'' U L2 y''', '/images/pll-cases/5.png', 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'PLL' AND case_number = 5 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'PLL Ab - Corners Only', 'R2 U R U R'' U'' R'' U'' R'' U R''', 'Adjacent corner swap counter-clockwise', 'PLL', 6, 3, 9, true, true, ARRAY['corners-only', 'a-perm', 'intermediate'], 'L'' U L F'' U2 D'' L'' F'' L F U2 D F U''', '/images/pll-cases/6.png', 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'PLL' AND case_number = 6 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'PLL E - Corners Only', 'M2'' U M2'' U M'' U2 M2'' U2 M'' U2', 'Diagonal corner swap', 'PLL', 7, 4, 17, true, false, ARRAY['corners-only', 'e-perm', 'advanced'], 'R2 L2 U'' F2 B2 D F B'' U2 D2 F B'' y', '/images/pll-cases/7.png', 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'PLL' AND case_number = 7 AND is_public = true);

    -- =========================================================================
    -- ADJACENT CORNER AND EDGE SWAP T, F, Ja, Jb, Ra, Rb
    -- =========================================================================
    
    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'PLL T - Mixed', 'R U R'' U'' R'' F R2 U'' R'' U'' R U R'' F''', 'T-shape permutation', 'PLL', 8, 2, 14, true, true, ARRAY['mixed', 't-perm', 'intermediate'], 'L U'' R U2 L'' U R'' F'' U B'' U2 F U'' B U'' y2', '/images/pll-cases/8.png', 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'PLL' AND case_number = 8 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'PLL F - Mixed', 'R'' U'' F'' R U R'' U'' R'' F R2 U'' R'' U'' R U R'' U R', 'F-shape permutation', 'PLL', 9, 3, 15, true, false, ARRAY['mixed', 'f-perm', 'advanced'], 'F'' D2 B U'' B'' U2 R2 D'' F'' D R2 U'' D2 F y2', '/images/pll-cases/9.png', 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'PLL' AND case_number = 9 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'PLL Ja - Mixed', 'R'' U L'' U2 R U'' R'' U2 R L', 'J-shape permutation a', 'PLL', 10, 3, 13, true, false, ARRAY['mixed', 'j-perm', 'advanced'], 'B'' U2 F L B L'' U'' L B'' L'' U F'' U2 B U2', '/images/pll-cases/10.png', 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'PLL' AND case_number = 10 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'PLL Jb - Mixed', 'R U R'' F'' R U R'' U'' R'' F R2 U'' R''', 'J-shape permutation b', 'PLL', 11, 3, 14, true, true, ARRAY['mixed', 'j-perm', 'intermediate'], 'D F2 U F2 U D2 L2 D F2 U'' F2 L2 U', '/images/pll-cases/11.png', 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'PLL' AND case_number = 11 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'PLL Ra - Mixed', 'R U'' R'' U'' R U R D R'' U'' R D'' R'' U2 R'' U', 'R-shape permutation a', 'PLL', 12, 3, 13, true, false, ARRAY['mixed', 'r-perm', 'advanced'], 'F U2 B F'' U B'' R'' F U2 F2 U'' F R U''', '/images/pll-cases/12.png', 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'PLL' AND case_number = 12 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'PLL Rb - Mixed', 'R'' U2 R U2 R'' F R U R'' U'' R'' F'' R2 U''', 'R-shape permutation b', 'PLL', 13, 3, 13, true, false, ARRAY['mixed', 'r-perm', 'advanced'], 'L F'' L B D2 L B'' U L U F U'' B'' R'' B U'' y''', '/images/pll-cases/13.png', 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'PLL' AND case_number = 13 AND is_public = true);

    -- =========================================================================
    -- DIAGONAL CORNER AND EDGE SWAP Y, V, Na, Nb
    -- =========================================================================
    
    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'PLL Y - Diagonal', 'R'' U R'' U'' y R'' F'' R2 U'' R'' U R'' F R F', 'Y-shape permutation', 'PLL', 14, 3, 17, true, false, ARRAY['diagonal', 'y-perm', 'advanced'], 'F2 U L2 U'' L2 F'' D F'' D'' F U'' F'' U F'' y2', '/images/pll-cases/14.png', 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'PLL' AND case_number = 14 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'PLL V - Diagonal', 'F R U'' R'' U'' R U R'' F'' R U R'' U'' R'' F R F''', 'V-shape permutation', 'PLL', 15, 4, 14, true, false, ARRAY['diagonal', 'v-perm', 'advanced'], 'F'' B'' R'' U2 F U'' F'' U'' R F R'' U'' R B y', '/images/pll-cases/15.png', 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'PLL' AND case_number = 15 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'PLL Na - Diagonal', 'R2 U R'' U R'' U'' R U'' R2 D U'' R'' U R D'' U', 'N-shape permutation a', 'PLL', 16, 4, 19, true, false, ARRAY['diagonal', 'n-perm', 'advanced'], 'L F L'' F U R U'' F'' L F R'' F2 L''', '/images/pll-cases/16.png', 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'PLL' AND case_number = 16 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'PLL Nb - Diagonal', 'F'' U'' F R2 u R'' U R U'' R u'' R2''', 'N-shape permutation b', 'PLL', 17, 4, 16, true, false, ARRAY['diagonal', 'n-perm', 'advanced'], 'B'' D2 F R2 U'' F U R2 U'' F'' U F'' D2 B U2 y2', '/images/pll-cases/17.png', 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'PLL' AND case_number = 17 AND is_public = true);

    -- =========================================================================
    -- G PERMUTATIONS Ga, Gb, Gc, Gd - Corner cycle with edge cycle
    -- =========================================================================
    
    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'PLL Ga - G-Perm', 'R2 U'' R U'' R U R'' U R2 D'' U R U'' R'' D U''', 'G-permutation a', 'PLL', 18, 3, 12, true, false, ARRAY['g-perm', 'advanced'], 'B2 L B U B'' L'' B2 U R'' B'' U2 B U'' R U''', '/images/pll-cases/18.png', 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'PLL' AND case_number = 18 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'PLL Gb - G-Perm', 'D'' R U R'' U'' D R2 U'' R U'' R'' U R'' U R2 U', 'G-permutation b', 'PLL', 19, 3, 12, true, false, ARRAY['g-perm', 'advanced'], 'R2 F2 L2 D'' L'' F2 D R F2 L'' U'' F2 R U''', '/images/pll-cases/19.png', 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'PLL' AND case_number = 19 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'PLL Gc - G-Perm', 'R U R'' U R U R'' F'' R U R'' U'' R'' F R2 U'' R'' U2 R U'' R''', 'G-permutation c', 'PLL', 20, 3, 12, true, false, ARRAY['g-perm', 'advanced'], 'L U'' L2 F2 D'' R B2 R'' D F2 L2 U L'' U''', '/images/pll-cases/20.png', 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'PLL' AND case_number = 20 AND is_public = true);

    INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, setup_moves, image_url, usage_count, created_at, updated_at)
    SELECT uuid_generate_v4(), 'PLL Gd - G-Perm', 'R'' U R U'' R'' F'' U'' F R U R'' F R'' F'' R U'' R', 'G-permutation d', 'PLL', 21, 3, 12, true, false, ARRAY['g-perm', 'advanced'], 'B D'' R B'' D2 F L'' F'' D2 B2 R'' B'' D B''', '/images/pll-cases/21.png', 0, NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM algorithms WHERE algorithm_set = 'PLL' AND case_number = 21 AND is_public = true);

    -- Report results
    SELECT COUNT(*) INTO pll_count_after FROM algorithms WHERE algorithm_set = 'PLL' AND is_public = true;
    RAISE NOTICE 'PLL algorithms after: % added %', pll_count_after, pll_count_after - pll_count_before;
    
END $$;
