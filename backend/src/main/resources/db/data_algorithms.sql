-- Curated speedcubing algorithms for rubiX
-- This file loads essential CFOP algorithms with duplicate prevention

-- Only load algorithms if none exist (prevents duplicates on restart)
DO $$
BEGIN
    -- Check if algorithms already exist
    IF NOT EXISTS (SELECT 1 FROM algorithms WHERE is_public = true LIMIT 1) THEN
        
        -- Essential OLL algorithms (most common cases)
        INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, usage_count, created_at, updated_at) VALUES
(uuid_generate_v4(), 'OLL 26 - Sune', 'R U R'' U R U2 R''', 'Most famous OLL algorithm, T-shaped case', 'OLL', 26, 1, 7, true, true, ARRAY['beginner', 'sune', 't-shape'], 0, NOW(), NOW()),
(uuid_generate_v4(), 'OLL 27 - Anti-Sune', 'R'' U'' R U'' R'' U2 R', 'Mirror of sune algorithm', 'OLL', 27, 1, 7, true, true, ARRAY['beginner', 'antisune', 't-shape'], 0, NOW(), NOW()),
(uuid_generate_v4(), 'OLL 21 - H Case', 'R U R'' U R U'' R'' U R U2 R''', 'H-shaped case on top layer', 'OLL', 21, 2, 11, true, false, ARRAY['h-case', 'intermediate'], 0, NOW(), NOW()),
(uuid_generate_v4(), 'OLL 22 - Pi Case', 'R U2 R2 U'' R2 U'' R2 U2 R', 'Pi-shaped case with headlights', 'OLL', 22, 3, 9, true, false, ARRAY['pi-case', 'intermediate'], 0, NOW(), NOW()),
(uuid_generate_v4(), 'OLL 44 - P Case Right', 'f R U R'' U'' f''', 'P-shaped case, right-handed version', 'OLL', 44, 1, 6, true, false, ARRAY['p-case', 'beginner'], 0, NOW(), NOW()),
(uuid_generate_v4(), 'OLL 45 - P Case Left', 'F R U R'' U'' F''', 'P-shaped case, left-handed version', 'OLL', 45, 1, 6, true, false, ARRAY['p-case', 'beginner'], 0, NOW(), NOW());

-- Essential PLL algorithms (most common permutations)
INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, usage_count, created_at, updated_at) VALUES
(uuid_generate_v4(), 'PLL Aa - Adjacent Corner Swap', 'x R'' U R D2 R'' U'' R D2 R2 x''', 'Swaps two adjacent corners clockwise', 'PLL', 1, 3, 9, true, true, ARRAY['corner-swap', 'adjacent'], 0, NOW(), NOW()),
(uuid_generate_v4(), 'PLL Ab - Adjacent Corner Swap', 'x R2 D2 R U R'' D2 R U'' R x''', 'Swaps two adjacent corners counter-clockwise', 'PLL', 2, 3, 9, true, true, ARRAY['corner-swap', 'adjacent'], 0, NOW(), NOW()),
(uuid_generate_v4(), 'PLL H - Edge Swap', 'M2 U M2 U2 M2 U M2', 'Swaps opposite edges', 'PLL', 8, 2, 7, true, true, ARRAY['edge-swap', 'opposite'], 0, NOW(), NOW()),
(uuid_generate_v4(), 'PLL T - T Permutation', 'R U R'' F'' R U R'' U'' R'' F R2 U'' R''', 'Swaps adjacent corners and adjacent edges', 'PLL', 18, 2, 13, true, true, ARRAY['mixed', 't-perm'], 0, NOW(), NOW()),
(uuid_generate_v4(), 'PLL Ua - Clockwise Edge Cycle', 'R U'' R U R U R U'' R'' U'' R2', 'Cycles three edges clockwise', 'PLL', 19, 2, 11, true, true, ARRAY['edge-cycle', 'u-perm'], 0, NOW(), NOW()),
(uuid_generate_v4(), 'PLL Ub - Counter-clockwise Edge Cycle', 'R2 U R U R'' U'' R'' U'' R'' U R''', 'Cycles three edges counter-clockwise', 'PLL', 20, 2, 11, true, true, ARRAY['edge-cycle', 'u-perm'], 0, NOW(), NOW());

        -- Essential F2L algorithms (fundamental cases)
        INSERT INTO algorithms (id, name, notation_string, case_description, algorithm_set, case_number, difficulty, move_count, is_public, is_favorite, tags, usage_count, created_at, updated_at) VALUES
        (uuid_generate_v4(), 'F2L Basic Insert', 'R U'' R''', 'Most basic F2L insertion', 'F2L', 1, 1, 3, true, true, ARRAY['beginner', 'basic-insert'], 0, NOW(), NOW()),
        (uuid_generate_v4(), 'F2L Sexy Move', 'R U R'' U''', 'Most important F2L algorithm', 'F2L', 11, 1, 4, true, true, ARRAY['beginner', 'sexy-move'], 0, NOW(), NOW()),
        (uuid_generate_v4(), 'F2L Sledgehammer', 'R'' F R F''', 'Essential F2L algorithm', 'F2L', 9, 1, 4, true, false, ARRAY['beginner', 'sledgehammer'], 0, NOW(), NOW()),
        (uuid_generate_v4(), 'F2L Corner First', 'R U R'' U'' R U R''', 'Insert corner then pair with edge', 'F2L', 2, 1, 7, true, true, ARRAY['beginner', 'corner-first'], 0, NOW(), NOW()),
        (uuid_generate_v4(), 'F2L Split Pair', 'R U R'' U2 R U'' R''', 'Separate connected pair and insert', 'F2L', 4, 2, 7, true, false, ARRAY['intermediate', 'split-pair'], 0, NOW(), NOW());
        
        RAISE NOTICE 'Successfully loaded % algorithms', (SELECT COUNT(*) FROM algorithms WHERE is_public = true);
    ELSE
        RAISE NOTICE 'Algorithms already exist, skipping data load to prevent duplicates';
    END IF;
END
$$;
