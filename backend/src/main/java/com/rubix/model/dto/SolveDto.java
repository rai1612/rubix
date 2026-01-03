package com.rubix.model.dto;

import com.rubix.model.entity.Solve;
import com.rubix.model.entity.Scramble;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

public class SolveDto {

    private UUID id;
    private UUID scrambleId;
    private String scrambleText;
    private Scramble.PuzzleType puzzleType;
    
    @NotNull(message = "Time is required")
    @Min(value = 1, message = "Time must be positive")
    private Integer timeMs;
    
    @Min(value = 0, message = "Inspection time cannot be negative")
    private Integer inspectionTimeMs;
    
    private Solve.Penalty penalty;
    private Integer adjustedTimeMs;
    private Instant solvedAt;
    private String notes;
    private List<String> tags;
    
    // Performance data
    private Integer moveCount;
    private Double tps;
    
    // Timing breakdown
    private Integer crossTimeMs;
    private Integer f2lTimeMs;
    private Integer ollTimeMs;
    private Integer pllTimeMs;
    
    // Session info
    private UUID sessionId;
    private String sessionName;

    // Constructors
    public SolveDto() {}

    public SolveDto(UUID scrambleId, Integer timeMs, Integer inspectionTimeMs, 
                   Solve.Penalty penalty, Instant solvedAt) {
        this.scrambleId = scrambleId;
        this.timeMs = timeMs;
        this.inspectionTimeMs = inspectionTimeMs;
        this.penalty = penalty;
        this.solvedAt = solvedAt;
    }

    // Static factory methods
    public static SolveDto fromEntity(Solve solve) {
        SolveDto dto = new SolveDto();
        dto.setId(solve.getId());
        dto.setScrambleId(solve.getScramble().getId());
        dto.setScrambleText(solve.getScramble().getScrambleText());
        dto.setPuzzleType(solve.getScramble().getPuzzleType());
        dto.setTimeMs(solve.getTimeMs());
        dto.setInspectionTimeMs(solve.getInspectionTimeMs());
        dto.setPenalty(solve.getPenalty());
        dto.setAdjustedTimeMs(solve.getAdjustedTimeMs());
        dto.setSolvedAt(solve.getSolvedAt());
        dto.setNotes(solve.getNotes());
        dto.setTags(solve.getTagsList());
        dto.setMoveCount(solve.getMoveCount());
        dto.setTps(solve.getTps());
        dto.setCrossTimeMs(solve.getCrossTimeMs());
        dto.setF2lTimeMs(solve.getF2lTimeMs());
        dto.setOllTimeMs(solve.getOllTimeMs());
        dto.setPllTimeMs(solve.getPllTimeMs());
        
        if (solve.getSession() != null) {
            dto.setSessionId(solve.getSession().getId());
            dto.setSessionName(solve.getSession().getName());
        }
        
        return dto;
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getScrambleId() {
        return scrambleId;
    }

    public void setScrambleId(UUID scrambleId) {
        this.scrambleId = scrambleId;
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

    public Integer getTimeMs() {
        return timeMs;
    }

    public void setTimeMs(Integer timeMs) {
        this.timeMs = timeMs;
    }

    public Integer getInspectionTimeMs() {
        return inspectionTimeMs;
    }

    public void setInspectionTimeMs(Integer inspectionTimeMs) {
        this.inspectionTimeMs = inspectionTimeMs;
    }

    public Solve.Penalty getPenalty() {
        return penalty;
    }

    public void setPenalty(Solve.Penalty penalty) {
        this.penalty = penalty;
    }

    public Integer getAdjustedTimeMs() {
        return adjustedTimeMs;
    }

    public void setAdjustedTimeMs(Integer adjustedTimeMs) {
        this.adjustedTimeMs = adjustedTimeMs;
    }

    public Instant getSolvedAt() {
        return solvedAt;
    }

    public void setSolvedAt(Instant solvedAt) {
        this.solvedAt = solvedAt;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }

    public Integer getMoveCount() {
        return moveCount;
    }

    public void setMoveCount(Integer moveCount) {
        this.moveCount = moveCount;
    }

    public Double getTps() {
        return tps;
    }

    public void setTps(Double tps) {
        this.tps = tps;
    }

    public Integer getCrossTimeMs() {
        return crossTimeMs;
    }

    public void setCrossTimeMs(Integer crossTimeMs) {
        this.crossTimeMs = crossTimeMs;
    }

    public Integer getF2lTimeMs() {
        return f2lTimeMs;
    }

    public void setF2lTimeMs(Integer f2lTimeMs) {
        this.f2lTimeMs = f2lTimeMs;
    }

    public Integer getOllTimeMs() {
        return ollTimeMs;
    }

    public void setOllTimeMs(Integer ollTimeMs) {
        this.ollTimeMs = ollTimeMs;
    }

    public Integer getPllTimeMs() {
        return pllTimeMs;
    }

    public void setPllTimeMs(Integer pllTimeMs) {
        this.pllTimeMs = pllTimeMs;
    }

    public UUID getSessionId() {
        return sessionId;
    }

    public void setSessionId(UUID sessionId) {
        this.sessionId = sessionId;
    }

    public String getSessionName() {
        return sessionName;
    }

    public void setSessionName(String sessionName) {
        this.sessionName = sessionName;
    }

    // Utility methods
    public Double getTimeSeconds() {
        return timeMs != null ? timeMs / 1000.0 : null;
    }

    public Double getAdjustedTimeSeconds() {
        return adjustedTimeMs != null && penalty != Solve.Penalty.DNF ? adjustedTimeMs / 1000.0 : null;
    }

    public boolean isDNF() {
        return penalty == Solve.Penalty.DNF;
    }

    public boolean hasPenalty() {
        return penalty != null && penalty != Solve.Penalty.NONE;
    }


    public String getFormattedTime() {
        if (penalty == Solve.Penalty.DNF) return "DNF";
        if (timeMs == null) return "--";
        
        String baseTime = formatTimeMs(timeMs);
        return penalty == Solve.Penalty.PLUS_TWO ? baseTime + "+" : baseTime;
    }

    public boolean hasTimingBreakdown() {
        return crossTimeMs != null || f2lTimeMs != null || ollTimeMs != null || pllTimeMs != null;
    }

    private String formatTimeMs(Integer ms) {
        if (ms == null) return "--";
        
        double seconds = ms / 1000.0;
        if (seconds >= 60) {
            int minutes = (int) (seconds / 60);
            double remainingSeconds = seconds % 60;
            return String.format("%d:%05.2f", minutes, remainingSeconds);
        } else {
            return String.format("%.2f", seconds);
        }
    }

    @Override
    public String toString() {
        return "SolveDto{" +
                "id=" + id +
                ", timeMs=" + timeMs +
                ", penalty=" + penalty +
                ", adjustedTimeMs=" + adjustedTimeMs +
                ", puzzleType=" + puzzleType +
                '}';
    }

    // Request DTOs for specific operations
    public static class CreateRequest {
        @NotNull(message = "Scramble ID is required")
        private UUID scrambleId;
        
        @NotNull(message = "Time is required")
        @Min(value = 1, message = "Time must be positive")
        private Integer timeMs;
        
        @Min(value = 0, message = "Inspection time cannot be negative")
        private Integer inspectionTimeMs = 0;
        
        private Solve.Penalty penalty = Solve.Penalty.NONE;
        
        @NotNull(message = "Solve time is required")
        private Instant solvedAt;
        
        private String notes;

        // Constructors
        public CreateRequest() {}

        public CreateRequest(UUID scrambleId, Integer timeMs, Integer inspectionTimeMs, 
                           Solve.Penalty penalty, Instant solvedAt) {
            this.scrambleId = scrambleId;
            this.timeMs = timeMs;
            this.inspectionTimeMs = inspectionTimeMs;
            this.penalty = penalty;
            this.solvedAt = solvedAt;
        }

        // Getters and Setters
        public UUID getScrambleId() { return scrambleId; }
        public void setScrambleId(UUID scrambleId) { this.scrambleId = scrambleId; }
        
        public Integer getTimeMs() { return timeMs; }
        public void setTimeMs(Integer timeMs) { this.timeMs = timeMs; }
        
        public Integer getInspectionTimeMs() { return inspectionTimeMs; }
        public void setInspectionTimeMs(Integer inspectionTimeMs) { this.inspectionTimeMs = inspectionTimeMs; }
        
        public Solve.Penalty getPenalty() { return penalty; }
        public void setPenalty(Solve.Penalty penalty) { this.penalty = penalty; }
        
        public Instant getSolvedAt() { return solvedAt; }
        public void setSolvedAt(Instant solvedAt) { this.solvedAt = solvedAt; }
        
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }

    public static class UpdateRequest {
        private Integer timeMs;
        private Solve.Penalty penalty;
        private String notes;
        private List<String> tags;

        // Performance data
        private Integer crossTimeMs;
        private Integer f2lTimeMs;
        private Integer ollTimeMs;
        private Integer pllTimeMs;

        // Getters and Setters
        public Integer getTimeMs() { return timeMs; }
        public void setTimeMs(Integer timeMs) { this.timeMs = timeMs; }
        
        public Solve.Penalty getPenalty() { return penalty; }
        public void setPenalty(Solve.Penalty penalty) { this.penalty = penalty; }
        
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
        
        public List<String> getTags() { return tags; }
        public void setTags(List<String> tags) { this.tags = tags; }
        
        public Integer getCrossTimeMs() { return crossTimeMs; }
        public void setCrossTimeMs(Integer crossTimeMs) { this.crossTimeMs = crossTimeMs; }
        
        public Integer getF2lTimeMs() { return f2lTimeMs; }
        public void setF2lTimeMs(Integer f2lTimeMs) { this.f2lTimeMs = f2lTimeMs; }
        
        public Integer getOllTimeMs() { return ollTimeMs; }
        public void setOllTimeMs(Integer ollTimeMs) { this.ollTimeMs = ollTimeMs; }
        
        public Integer getPllTimeMs() { return pllTimeMs; }
        public void setPllTimeMs(Integer pllTimeMs) { this.pllTimeMs = pllTimeMs; }
    }
}
