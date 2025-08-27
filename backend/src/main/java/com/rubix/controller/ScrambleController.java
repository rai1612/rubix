package com.rubix.controller;

import com.rubix.model.dto.ScrambleDto;
import com.rubix.model.entity.Scramble;
import com.rubix.model.entity.User;
import com.rubix.service.ScrambleService;
import com.rubix.service.UserService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/scrambles")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class ScrambleController {

    private static final Logger logger = LoggerFactory.getLogger(ScrambleController.class);

    private final ScrambleService scrambleService;
    private final UserService userService;

    public ScrambleController(ScrambleService scrambleService, UserService userService) {
        this.scrambleService = scrambleService;
        this.userService = userService;
    }

    /**
     * Generate a new scramble
     * GET /api/scrambles/generate?type=3x3
     */
    @GetMapping("/generate")
    public ResponseEntity<ScrambleDto> generateScramble(
            @RequestParam(value = "type", defaultValue = "CUBE_3X3") Scramble.PuzzleType puzzleType) {
        
        logger.info("Generating scramble for puzzle type: {}", puzzleType);
        
        try {
            Scramble scramble = scrambleService.generateScramble(puzzleType);
            ScrambleDto dto = ScrambleDto.fromEntity(scramble);
            
            logger.debug("Generated scramble: {} moves", dto.getMoveCount());
            return ResponseEntity.ok(dto);
            
        } catch (IllegalArgumentException e) {
            logger.warn("Invalid puzzle type requested: {}", puzzleType);
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            logger.error("Error generating scramble", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Generate a new scramble (POST version for complex requests)
     * POST /api/scrambles/generate
     */
    @PostMapping("/generate")
    public ResponseEntity<ScrambleDto> generateScramblePost(@Valid @RequestBody ScrambleDto.GenerateRequest request) {
        logger.info("Generating scramble via POST for puzzle type: {}", request.getPuzzleType());
        
        try {
            Scramble scramble = scrambleService.generateScramble(request.getPuzzleType());
            ScrambleDto dto = ScrambleDto.fromEntity(scramble);
            return ResponseEntity.ok(dto);
            
        } catch (Exception e) {
            logger.error("Error generating scramble via POST", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Create a custom scramble
     * POST /api/scrambles/custom
     */
    @PostMapping("/custom")
    public ResponseEntity<ScrambleDto> createCustomScramble(
            @Valid @RequestBody ScrambleDto.CreateCustomRequest request,
            Authentication authentication) {
        
        logger.info("Creating custom scramble for user: {}", authentication.getName());
        
        try {
            User user = userService.getCurrentUser(authentication);
            Scramble scramble = scrambleService.createCustomScramble(
                request.getScrambleText(), 
                request.getPuzzleType(), 
                user
            );
            
            ScrambleDto dto = ScrambleDto.fromEntity(scramble);
            return ResponseEntity.status(HttpStatus.CREATED).body(dto);
            
        } catch (IllegalArgumentException e) {
            logger.warn("Invalid custom scramble: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            logger.error("Error creating custom scramble", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Validate a scramble
     * POST /api/scrambles/validate
     */
    @PostMapping("/validate")
    public ResponseEntity<ScrambleDto.ValidateResponse> validateScramble(
            @Valid @RequestBody ScrambleDto.ValidateRequest request) {
        
        logger.debug("Validating scramble for puzzle type: {}", request.getPuzzleType());
        
        try {
            boolean isValid = scrambleService.validateScramble(request.getScrambleText(), request.getPuzzleType());
            String message = isValid ? "Scramble is valid" : "Scramble format is invalid";
            
            ScrambleDto.ValidateResponse response = new ScrambleDto.ValidateResponse(isValid, message);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error validating scramble", e);
            ScrambleDto.ValidateResponse response = new ScrambleDto.ValidateResponse(false, "Validation error: " + e.getMessage());
            return ResponseEntity.ok(response);
        }
    }

    /**
     * Get scramble by ID
     * GET /api/scrambles/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ScrambleDto> getScramble(@PathVariable UUID id) {
        logger.debug("Fetching scramble by ID: {}", id);
        
        return scrambleService.getScrambleById(id)
                .map(scramble -> ResponseEntity.ok(ScrambleDto.fromEntity(scramble)))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get recent scrambles
     * GET /api/scrambles/recent?type=3x3&limit=10
     */
    @GetMapping("/recent")
    public ResponseEntity<List<ScrambleDto>> getRecentScrambles(
            @RequestParam(value = "type", defaultValue = "CUBE_3X3") Scramble.PuzzleType puzzleType,
            @RequestParam(value = "limit", defaultValue = "10") int limit) {
        
        logger.debug("Fetching recent scrambles: type={}, limit={}", puzzleType, limit);
        
        try {
            // Validate limit
            if (limit < 1 || limit > 100) {
                return ResponseEntity.badRequest().build();
            }
            
            List<Scramble> scrambles = scrambleService.getRecentScrambles(puzzleType, limit);
            List<ScrambleDto> dtos = scrambles.stream()
                    .map(ScrambleDto::fromEntity)
                    .toList();
            
            return ResponseEntity.ok(dtos);
            
        } catch (Exception e) {
            logger.error("Error fetching recent scrambles", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get puzzle types
     * GET /api/scrambles/puzzle-types
     */
    @GetMapping("/puzzle-types")
    public ResponseEntity<List<PuzzleTypeInfo>> getPuzzleTypes() {
        logger.debug("Fetching available puzzle types");
        
        List<PuzzleTypeInfo> puzzleTypes = List.of(
            new PuzzleTypeInfo(Scramble.PuzzleType.CUBE_2X2, "2x2x2 Cube", true),
            new PuzzleTypeInfo(Scramble.PuzzleType.CUBE_3X3, "3x3x3 Cube", true),
            new PuzzleTypeInfo(Scramble.PuzzleType.CUBE_4X4, "4x4x4 Cube", true),
            new PuzzleTypeInfo(Scramble.PuzzleType.CUBE_5X5, "5x5x5 Cube", false),
            new PuzzleTypeInfo(Scramble.PuzzleType.PYRAMINX, "Pyraminx", false),
            new PuzzleTypeInfo(Scramble.PuzzleType.MEGAMINX, "Megaminx", false),
            new PuzzleTypeInfo(Scramble.PuzzleType.SKEWB, "Skewb", false)
        );
        
        return ResponseEntity.ok(puzzleTypes);
    }

    // Helper classes
    public static class PuzzleTypeInfo {
        private Scramble.PuzzleType type;
        private String displayName;
        private boolean supported;

        public PuzzleTypeInfo(Scramble.PuzzleType type, String displayName, boolean supported) {
            this.type = type;
            this.displayName = displayName;
            this.supported = supported;
        }

        // Getters
        public Scramble.PuzzleType getType() { return type; }
        public String getDisplayName() { return displayName; }
        public boolean isSupported() { return supported; }
        
        // Setters
        public void setType(Scramble.PuzzleType type) { this.type = type; }
        public void setDisplayName(String displayName) { this.displayName = displayName; }
        public void setSupported(boolean supported) { this.supported = supported; }
    }

    /**
     * Exception handler for this controller
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleIllegalArgument(IllegalArgumentException e) {
        logger.warn("Invalid request: {}", e.getMessage());
        return ResponseEntity.badRequest().body(e.getMessage());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleGenericException(Exception e) {
        logger.error("Unexpected error in ScrambleController", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("An unexpected error occurred");
    }
}
