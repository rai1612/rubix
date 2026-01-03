package com.rubix.controller;

import com.rubix.model.dto.AlgorithmDto;
import com.rubix.model.entity.Algorithm;
import com.rubix.model.entity.Algorithm.AlgorithmSet;
import com.rubix.service.AlgorithmService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/algorithms/data")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class AlgorithmDataController {

    private final AlgorithmService algorithmService;

    public AlgorithmDataController(AlgorithmService algorithmService) {
        this.algorithmService = algorithmService;
    }

    /**
     * Populate database with essential speedcubing algorithms
     * This is a one-time setup endpoint for development/demo purposes
     */
    @PostMapping("/populate")
    public ResponseEntity<String> populateAlgorithms() {
        try {
            // Clear existing algorithms (for demo purposes)
            // algorithmService.deleteAll(); // Uncomment if needed

            int count = 0;

            // Essential OLL algorithms
            count += createAlgorithm("OLL 26 - Sune", "R U R' U R U2 R'", 
                "Most famous OLL algorithm, T-shaped case", AlgorithmSet.OLL, 26, 1, 7, 
                Arrays.asList("beginner", "sune", "t-shape"));

            count += createAlgorithm("OLL 27 - Anti-Sune", "R' U' R U' R' U2 R", 
                "Mirror of sune algorithm", AlgorithmSet.OLL, 27, 1, 7, 
                Arrays.asList("beginner", "antisune", "t-shape"));

            count += createAlgorithm("OLL 21 - H Case", "R U R' U R U' R' U R U2 R'", 
                "H-shaped case on top layer", AlgorithmSet.OLL, 21, 2, 11, 
                Arrays.asList("h-case", "intermediate"));

            count += createAlgorithm("OLL 22 - Pi Case", "R U2 R2 U' R2 U' R2 U2 R", 
                "Pi-shaped case with headlights", AlgorithmSet.OLL, 22, 3, 9, 
                Arrays.asList("pi-case", "intermediate"));

            count += createAlgorithm("OLL 44 - P Case Right", "f R U R' U' f'", 
                "P-shaped case, right-handed version", AlgorithmSet.OLL, 44, 1, 6, 
                Arrays.asList("p-case", "beginner"));

            count += createAlgorithm("OLL 45 - P Case Left", "F R U R' U' F'", 
                "P-shaped case, left-handed version", AlgorithmSet.OLL, 45, 1, 6, 
                Arrays.asList("p-case", "beginner"));

            // Essential PLL algorithms
            count += createAlgorithm("PLL Aa - Adjacent Corner Swap", "x R' U R D2 R' U' R D2 R2 x'", 
                "Swaps two adjacent corners clockwise", AlgorithmSet.PLL, 1, 3, 9, 
                Arrays.asList("corner-swap", "adjacent"));

            count += createAlgorithm("PLL Ab - Adjacent Corner Swap", "x R2 D2 R U R' D2 R U' R x'", 
                "Swaps two adjacent corners counter-clockwise", AlgorithmSet.PLL, 2, 3, 9, 
                Arrays.asList("corner-swap", "adjacent"));

            count += createAlgorithm("PLL H - Edge Swap", "M2 U M2 U2 M2 U M2", 
                "Swaps opposite edges", AlgorithmSet.PLL, 8, 2, 7, 
                Arrays.asList("edge-swap", "opposite"));

            count += createAlgorithm("PLL T - T Permutation", "R U R' F' R U R' U' R' F R2 U' R'", 
                "Swaps adjacent corners and adjacent edges", AlgorithmSet.PLL, 18, 2, 13, 
                Arrays.asList("mixed", "t-perm"));

            count += createAlgorithm("PLL Ua - Clockwise Edge Cycle", "R U' R U R U R U' R' U' R2", 
                "Cycles three edges clockwise", AlgorithmSet.PLL, 19, 2, 11, 
                Arrays.asList("edge-cycle", "u-perm"));

            count += createAlgorithm("PLL Ub - Counter-clockwise Edge Cycle", "R2 U R U R' U' R' U' R' U R'", 
                "Cycles three edges counter-clockwise", AlgorithmSet.PLL, 20, 2, 11, 
                Arrays.asList("edge-cycle", "u-perm"));

            // Essential F2L algorithms
            count += createAlgorithm("F2L Basic Insert", "R U' R'", 
                "Most basic F2L insertion", AlgorithmSet.F2L, 1, 1, 3, 
                Arrays.asList("beginner", "basic-insert"));

            count += createAlgorithm("F2L Sexy Move", "R U R' U'", 
                "Most important F2L algorithm", AlgorithmSet.F2L, 11, 1, 4, 
                Arrays.asList("beginner", "sexy-move"));

            count += createAlgorithm("F2L Sledgehammer", "R' F R F'", 
                "Essential F2L algorithm", AlgorithmSet.F2L, 9, 1, 4, 
                Arrays.asList("beginner", "sledgehammer"));

            count += createAlgorithm("F2L Corner First", "R U R' U' R U R'", 
                "Insert corner then pair with edge", AlgorithmSet.F2L, 2, 1, 7, 
                Arrays.asList("beginner", "corner-first"));

            count += createAlgorithm("F2L Split Pair", "R U R' U2 R U' R'", 
                "Separate connected pair and insert", AlgorithmSet.F2L, 4, 2, 7, 
                Arrays.asList("intermediate", "split-pair"));

            // Advanced algorithms
            count += createAlgorithm("ZBLL T Case", "R U R' U R U2 R' L' U' L U' L' U2 L", 
                "ZBLL for T-shaped last layer", AlgorithmSet.ZBLL, 1, 5, 14, 
                Arrays.asList("advanced", "zbll", "t-case"));

            count += createAlgorithm("Winter Variation", "R U R' U R U' R'", 
                "Winter Variation case 1", AlgorithmSet.WV, 1, 3, 7, 
                Arrays.asList("advanced", "winter-variation"));

            return ResponseEntity.ok("Successfully populated " + count + " algorithms into the database!");

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body("Error populating algorithms: " + e.getMessage());
        }
    }

    /**
     * Get count of algorithms in database
     */
    @GetMapping("/count")
    public ResponseEntity<String> getAlgorithmCount() {
        try {
            // This would need to be implemented in AlgorithmService
            return ResponseEntity.ok("Algorithm count endpoint - implement in service");
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body("Error getting count: " + e.getMessage());
        }
    }

    private int createAlgorithm(String name, String notation, String description, 
                               AlgorithmSet algorithmSet, Integer caseNumber, Integer difficulty, 
                               Integer moveCount, List<String> tags) {
        try {
            // Create using the DTO approach that the service expects
            AlgorithmDto.CreateAlgorithmDto createDto = new AlgorithmDto.CreateAlgorithmDto();
            createDto.setName(name);
            createDto.setNotationString(notation);
            createDto.setCaseDescription(description);
            createDto.setAlgorithmSet(algorithmSet);
            createDto.setCaseNumber(caseNumber);
            createDto.setDifficulty(difficulty);
            createDto.setTags(tags);

            algorithmService.createAlgorithm(createDto);
            return 1;
        } catch (Exception e) {
            System.err.println("Failed to create algorithm: " + name + " - " + e.getMessage());
            return 0;
        }
    }
}
