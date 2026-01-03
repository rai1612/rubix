package com.rubix.service;

import com.rubix.model.entity.Scramble;
import com.rubix.model.entity.User;
import com.rubix.repository.ScrambleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;

@Service
@Transactional
public class ScrambleService {

    private static final Logger logger = LoggerFactory.getLogger(ScrambleService.class);
    
    private final ScrambleRepository scrambleRepository;
    
    // 3x3 moves for scramble generation
    private static final String[] FACE_MOVES = {"R", "L", "U", "D", "F", "B"};
    private static final String[] MODIFIERS = {"", "'", "2"};
    
    // Move opposites for avoiding consecutive moves on same face
    private static final Map<String, String> OPPOSITE_FACES = Map.of(
        "R", "L", "L", "R",
        "U", "D", "D", "U", 
        "F", "B", "B", "F"
    );

    public ScrambleService(ScrambleRepository scrambleRepository) {
        this.scrambleRepository = scrambleRepository;
    }

    /**
     * Generate a new WCA-compliant 3x3 scramble
     */
    public Scramble generateScramble(Scramble.PuzzleType puzzleType) {
        logger.debug("Generating scramble for puzzle type: {}", puzzleType);
        
        String scrambleText = switch (puzzleType) {
            case CUBE_3X3 -> generate3x3Scramble();
            case CUBE_2X2 -> generate2x2Scramble();
            case CUBE_4X4 -> generate4x4Scramble();
            default -> throw new IllegalArgumentException("Unsupported puzzle type: " + puzzleType);
        };
        
        Scramble scramble = new Scramble(scrambleText, puzzleType, countMoves(scrambleText));
        return scrambleRepository.save(scramble);
    }

    /**
     * Generate a custom scramble from user input
     */
    public Scramble createCustomScramble(String scrambleText, Scramble.PuzzleType puzzleType, User user) {
        logger.debug("Creating custom scramble for user: {}", user.getUsername());
        
        // Validate scramble format
        validateScrambleFormat(scrambleText, puzzleType);
        
        Scramble scramble = new Scramble(scrambleText, puzzleType, countMoves(scrambleText), user);
        return scrambleRepository.save(scramble);
    }

    /**
     * Validate scramble format and moves
     */
    public boolean validateScramble(String scrambleText, Scramble.PuzzleType puzzleType) {
        try {
            validateScrambleFormat(scrambleText, puzzleType);
            return true;
        } catch (Exception e) {
            logger.warn("Invalid scramble: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Get scramble by ID
     */
    @Transactional(readOnly = true)
    public Optional<Scramble> getScrambleById(UUID scrambleId) {
        return scrambleRepository.findById(scrambleId);
    }

    /**
     * Get recent scrambles for a puzzle type
     */
    @Transactional(readOnly = true)
    public List<Scramble> getRecentScrambles(Scramble.PuzzleType puzzleType, int limit) {
        return scrambleRepository.findByPuzzleTypeOrderByGeneratedAtDesc(puzzleType.name(), limit);
    }

    // Private helper methods

    private String generate3x3Scramble() {
        List<String> moves = new ArrayList<>();
        String lastFace = "";
        String secondLastFace = "";
        
        // Generate 18-25 moves (WCA standard range)
        int moveCount = ThreadLocalRandom.current().nextInt(18, 26);
        
        for (int i = 0; i < moveCount; i++) {
            String face;
            do {
                face = FACE_MOVES[ThreadLocalRandom.current().nextInt(FACE_MOVES.length)];
            } while (face.equals(lastFace) || 
                    (face.equals(secondLastFace) && OPPOSITE_FACES.get(face) != null && 
                     OPPOSITE_FACES.get(face).equals(lastFace)));
            
            String modifier = MODIFIERS[ThreadLocalRandom.current().nextInt(MODIFIERS.length)];
            moves.add(face + modifier);
            
            secondLastFace = lastFace;
            lastFace = face;
        }
        
        return String.join(" ", moves);
    }

    private String generate2x2Scramble() {
        List<String> moves = new ArrayList<>();
        String lastFace = "";
        String secondLastFace = "";
        
        // 2x2 scrambles are typically 9-11 moves
        int moveCount = ThreadLocalRandom.current().nextInt(9, 12);
        
        for (int i = 0; i < moveCount; i++) {
            String face;
            do {
                face = FACE_MOVES[ThreadLocalRandom.current().nextInt(FACE_MOVES.length)];
            } while (face.equals(lastFace) || 
                    (face.equals(secondLastFace) && OPPOSITE_FACES.get(face) != null && 
                     OPPOSITE_FACES.get(face).equals(lastFace)));
            
            String modifier = MODIFIERS[ThreadLocalRandom.current().nextInt(MODIFIERS.length)];
            moves.add(face + modifier);
            
            secondLastFace = lastFace;
            lastFace = face;
        }
        
        return String.join(" ", moves);
    }

    private String generate4x4Scramble() {
        List<String> moves = new ArrayList<>();
        String lastMove = "";
        
        // 4x4 scrambles include wide moves
        String[] allMoves = {"R", "L", "U", "D", "F", "B", "Rw", "Lw", "Uw", "Dw", "Fw", "Bw"};
        
        // 4x4 scrambles are typically 40-44 moves
        int moveCount = ThreadLocalRandom.current().nextInt(40, 45);
        
        for (int i = 0; i < moveCount; i++) {
            String move;
            do {
                move = allMoves[ThreadLocalRandom.current().nextInt(allMoves.length)];
            } while (isSameFaceGroup(move, lastMove));
            
            String modifier = MODIFIERS[ThreadLocalRandom.current().nextInt(MODIFIERS.length)];
            moves.add(move + modifier);
            lastMove = move;
        }
        
        return String.join(" ", moves);
    }

    private boolean isSameFaceGroup(String move1, String move2) {
        if (move1.isEmpty() || move2.isEmpty()) return false;
        
        String face1 = move1.replace("w", "");
        String face2 = move2.replace("w", "");
        
        return face1.equals(face2) || 
               (OPPOSITE_FACES.containsKey(face1) && OPPOSITE_FACES.get(face1).equals(face2));
    }

    private void validateScrambleFormat(String scrambleText, Scramble.PuzzleType puzzleType) {
        if (scrambleText == null || scrambleText.trim().isEmpty()) {
            throw new IllegalArgumentException("Scramble text cannot be empty");
        }

        String[] moves = scrambleText.trim().split("\\s+");
        
        // Basic length validation
        if (moves.length < 5) {
            throw new IllegalArgumentException("Scramble too short (minimum 5 moves)");
        }
        
        if (moves.length > 50) {
            throw new IllegalArgumentException("Scramble too long (maximum 50 moves)");
        }

        // Validate each move
        for (String move : moves) {
            if (!isValidMove(move, puzzleType)) {
                throw new IllegalArgumentException("Invalid move: " + move);
            }
        }
    }

    private boolean isValidMove(String move, Scramble.PuzzleType puzzleType) {
        if (move == null || move.isEmpty()) return false;
        
        // Remove modifiers to get base move
        String baseMove = move.replaceAll("['\u2019]|2", "");
        
        return switch (puzzleType) {
            case CUBE_2X2, CUBE_3X3 -> Arrays.asList(FACE_MOVES).contains(baseMove);
            case CUBE_4X4, CUBE_5X5, CUBE_6X6, CUBE_7X7 -> 
                Arrays.asList(FACE_MOVES).contains(baseMove) || 
                Arrays.asList("Rw", "Lw", "Uw", "Dw", "Fw", "Bw").contains(baseMove);
            default -> false;
        };
    }

    private int countMoves(String scrambleText) {
        if (scrambleText == null || scrambleText.trim().isEmpty()) {
            return 0;
        }
        return scrambleText.trim().split("\\s+").length;
    }
}
