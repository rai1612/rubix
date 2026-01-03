package com.rubix.model.dto;

import com.rubix.model.entity.Scramble;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.UUID;

public class ScrambleDto {

    private UUID id;
    
    @NotBlank(message = "Scramble text is required")
    @Size(max = 500, message = "Scramble text must be less than 500 characters")
    private String scrambleText;
    
    @NotNull(message = "Puzzle type is required")
    private Scramble.PuzzleType puzzleType;
    
    private Integer algorithmMoves;
    private Integer moveCount;
    private Instant generatedAt;
    private Boolean isCustom;
    private Integer difficultyRating;
    private String createdByUsername;

    // Constructors
    public ScrambleDto() {}

    public ScrambleDto(String scrambleText, Scramble.PuzzleType puzzleType) {
        this.scrambleText = scrambleText;
        this.puzzleType = puzzleType;
    }

    // Static factory methods
    public static ScrambleDto fromEntity(Scramble scramble) {
        ScrambleDto dto = new ScrambleDto();
        dto.setId(scramble.getId());
        dto.setScrambleText(scramble.getScrambleText());
        dto.setPuzzleType(scramble.getPuzzleType());
        dto.setAlgorithmMoves(scramble.getAlgorithmMoves());
        dto.setMoveCount(scramble.getMoveCount());
        dto.setGeneratedAt(scramble.getGeneratedAt());
        dto.setIsCustom(scramble.getIsCustom());
        dto.setDifficultyRating(scramble.getDifficultyRating());
        
        if (scramble.getCreatedByUser() != null) {
            dto.setCreatedByUsername(scramble.getCreatedByUser().getUsername());
        }
        
        return dto;
    }

    public static ScrambleDto createRequest(String scrambleText, Scramble.PuzzleType puzzleType) {
        return new ScrambleDto(scrambleText, puzzleType);
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getScrambleText() {
        return scrambleText;
    }

    public void setScrambleText(String scrambleText) {
        this.scrambleText = scrambleText;
    }

    public Scramble.PuzzleType getPuzzleType() {
        return puzzleType;
    }

    public void setPuzzleType(Scramble.PuzzleType puzzleType) {
        this.puzzleType = puzzleType;
    }

    public Integer getAlgorithmMoves() {
        return algorithmMoves;
    }

    public void setAlgorithmMoves(Integer algorithmMoves) {
        this.algorithmMoves = algorithmMoves;
    }

    public Integer getMoveCount() {
        return moveCount;
    }

    public void setMoveCount(Integer moveCount) {
        this.moveCount = moveCount;
    }

    public Instant getGeneratedAt() {
        return generatedAt;
    }

    public void setGeneratedAt(Instant generatedAt) {
        this.generatedAt = generatedAt;
    }

    public Boolean getIsCustom() {
        return isCustom;
    }

    public void setIsCustom(Boolean isCustom) {
        this.isCustom = isCustom;
    }

    public Integer getDifficultyRating() {
        return difficultyRating;
    }

    public void setDifficultyRating(Integer difficultyRating) {
        this.difficultyRating = difficultyRating;
    }

    public String getCreatedByUsername() {
        return createdByUsername;
    }

    public void setCreatedByUsername(String createdByUsername) {
        this.createdByUsername = createdByUsername;
    }

    // Utility methods
    public boolean isGenerated() {
        return !Boolean.TRUE.equals(isCustom);
    }

    public String getFormattedMoves() {
        if (scrambleText == null || scrambleText.trim().isEmpty()) {
            return "";
        }
        
        // Format for better readability - add spaces after every 4-5 moves
        String[] moves = scrambleText.trim().split("\\s+");
        StringBuilder formatted = new StringBuilder();
        
        for (int i = 0; i < moves.length; i++) {
            if (i > 0 && i % 5 == 0) {
                formatted.append("\n");
            } else if (i > 0) {
                formatted.append(" ");
            }
            formatted.append(moves[i]);
        }
        
        return formatted.toString();
    }

    public String getPuzzleDisplayName() {
        return puzzleType != null ? puzzleType.getDisplayName() : "Unknown";
    }

    @Override
    public String toString() {
        return "ScrambleDto{" +
                "id=" + id +
                ", puzzleType=" + puzzleType +
                ", moveCount=" + moveCount +
                ", isCustom=" + isCustom +
                ", scrambleText='" + (scrambleText != null && scrambleText.length() > 50 ? 
                    scrambleText.substring(0, 50) + "..." : scrambleText) + '\'' +
                '}';
    }

    // Request DTOs for specific operations
    public static class GenerateRequest {
        @NotNull(message = "Puzzle type is required")
        private Scramble.PuzzleType puzzleType = Scramble.PuzzleType.CUBE_3X3;

        public GenerateRequest() {}

        public GenerateRequest(Scramble.PuzzleType puzzleType) {
            this.puzzleType = puzzleType;
        }

        public Scramble.PuzzleType getPuzzleType() {
            return puzzleType;
        }

        public void setPuzzleType(Scramble.PuzzleType puzzleType) {
            this.puzzleType = puzzleType;
        }
    }

    public static class CreateCustomRequest {
        @NotBlank(message = "Scramble text is required")
        @Size(max = 500, message = "Scramble text must be less than 500 characters")
        private String scrambleText;
        
        @NotNull(message = "Puzzle type is required")
        private Scramble.PuzzleType puzzleType = Scramble.PuzzleType.CUBE_3X3;
        
        private Integer difficultyRating;

        public CreateCustomRequest() {}

        public CreateCustomRequest(String scrambleText, Scramble.PuzzleType puzzleType) {
            this.scrambleText = scrambleText;
            this.puzzleType = puzzleType;
        }

        public String getScrambleText() {
            return scrambleText;
        }

        public void setScrambleText(String scrambleText) {
            this.scrambleText = scrambleText;
        }

        public Scramble.PuzzleType getPuzzleType() {
            return puzzleType;
        }

        public void setPuzzleType(Scramble.PuzzleType puzzleType) {
            this.puzzleType = puzzleType;
        }

        public Integer getDifficultyRating() {
            return difficultyRating;
        }

        public void setDifficultyRating(Integer difficultyRating) {
            this.difficultyRating = difficultyRating;
        }
    }

    public static class ValidateRequest {
        @NotBlank(message = "Scramble text is required")
        private String scrambleText;
        
        @NotNull(message = "Puzzle type is required")
        private Scramble.PuzzleType puzzleType = Scramble.PuzzleType.CUBE_3X3;

        public ValidateRequest() {}

        public ValidateRequest(String scrambleText, Scramble.PuzzleType puzzleType) {
            this.scrambleText = scrambleText;
            this.puzzleType = puzzleType;
        }

        public String getScrambleText() {
            return scrambleText;
        }

        public void setScrambleText(String scrambleText) {
            this.scrambleText = scrambleText;
        }

        public Scramble.PuzzleType getPuzzleType() {
            return puzzleType;
        }

        public void setPuzzleType(Scramble.PuzzleType puzzleType) {
            this.puzzleType = puzzleType;
        }
    }

    public static class ValidateResponse {
        private boolean valid;
        private String message;

        public ValidateResponse(boolean valid, String message) {
            this.valid = valid;
            this.message = message;
        }

        public boolean isValid() {
            return valid;
        }

        public void setValid(boolean valid) {
            this.valid = valid;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }
}
