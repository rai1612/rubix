package com.rubix.model.dto;

import com.rubix.model.entity.Session;
import com.rubix.model.entity.Scramble;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

public class SessionDto {
    private UUID id;
    private String name;
    private Scramble.PuzzleType puzzleType;
    private Instant startedAt;
    private Instant endedAt;
    private Boolean isActive;
    private Integer solveCount;
    private Long totalTimeMs;
    private Integer bestTimeMs;
    private Integer worstTimeMs;
    private Integer averageTimeMs;
    private String notes;
    private String[] tags;

    // Computed fields
    private Double averageSeconds;
    private String formattedDuration;

    // Constructors
    public SessionDto() {}

    public SessionDto(UUID id, String name, Scramble.PuzzleType puzzleType, Instant startedAt, 
                     Instant endedAt, Boolean isActive, Integer solveCount, Long totalTimeMs, 
                     Integer bestTimeMs, Integer worstTimeMs, Integer averageTimeMs) {
        this.id = id;
        this.name = name;
        this.puzzleType = puzzleType;
        this.startedAt = startedAt;
        this.endedAt = endedAt;
        this.isActive = isActive;
        this.solveCount = solveCount;
        this.totalTimeMs = totalTimeMs;
        this.bestTimeMs = bestTimeMs;
        this.worstTimeMs = worstTimeMs;
        this.averageTimeMs = averageTimeMs;
        
        // Calculate computed fields
        this.averageSeconds = averageTimeMs != null ? averageTimeMs / 1000.0 : null;
        this.formattedDuration = calculateDuration();
    }

    // Static factory method
    public static SessionDto fromEntity(Session session) {
        SessionDto dto = new SessionDto();
        dto.id = session.getId();
        dto.name = session.getName();
        dto.puzzleType = session.getPuzzleType();
        dto.startedAt = session.getStartedAt();
        dto.endedAt = session.getEndedAt();
        dto.isActive = session.getIsActive();
        dto.solveCount = session.getSolveCount();
        dto.totalTimeMs = session.getTotalTimeMs();
        dto.bestTimeMs = session.getBestTimeMs();
        dto.worstTimeMs = session.getWorstTimeMs();
        dto.averageTimeMs = session.getAverageTimeMs();
        dto.notes = session.getNotes();
        dto.tags = session.getTags();
        
        // Calculate computed fields
        dto.averageSeconds = dto.averageTimeMs != null ? dto.averageTimeMs / 1000.0 : null;
        dto.formattedDuration = dto.calculateDuration();
        
        return dto;
    }

    // Helper methods
    private String calculateDuration() {
        if (startedAt == null) return null;
        
        Instant end = endedAt != null ? endedAt : Instant.now();
        long durationSeconds = end.getEpochSecond() - startedAt.getEpochSecond();
        
        if (durationSeconds < 60) {
            return durationSeconds + "s";
        } else if (durationSeconds < 3600) {
            return (durationSeconds / 60) + "m " + (durationSeconds % 60) + "s";
        } else {
            long hours = durationSeconds / 3600;
            long minutes = (durationSeconds % 3600) / 60;
            return hours + "h " + minutes + "m";
        }
    }

    public String getFormattedBestTime() {
        return bestTimeMs != null ? formatTimeMs(bestTimeMs) : "--";
    }

    public String getFormattedWorstTime() {
        return worstTimeMs != null ? formatTimeMs(worstTimeMs) : "--";
    }

    public String getFormattedAverageTime() {
        return averageTimeMs != null ? formatTimeMs(averageTimeMs) : "--";
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

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Scramble.PuzzleType getPuzzleType() { return puzzleType; }
    public void setPuzzleType(Scramble.PuzzleType puzzleType) { this.puzzleType = puzzleType; }

    public Instant getStartedAt() { return startedAt; }
    public void setStartedAt(Instant startedAt) { this.startedAt = startedAt; }

    public Instant getEndedAt() { return endedAt; }
    public void setEndedAt(Instant endedAt) { this.endedAt = endedAt; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public Integer getSolveCount() { return solveCount; }
    public void setSolveCount(Integer solveCount) { this.solveCount = solveCount; }

    public Long getTotalTimeMs() { return totalTimeMs; }
    public void setTotalTimeMs(Long totalTimeMs) { this.totalTimeMs = totalTimeMs; }

    public Integer getBestTimeMs() { return bestTimeMs; }
    public void setBestTimeMs(Integer bestTimeMs) { this.bestTimeMs = bestTimeMs; }

    public Integer getWorstTimeMs() { return worstTimeMs; }
    public void setWorstTimeMs(Integer worstTimeMs) { this.worstTimeMs = worstTimeMs; }

    public Integer getAverageTimeMs() { return averageTimeMs; }
    public void setAverageTimeMs(Integer averageTimeMs) { this.averageTimeMs = averageTimeMs; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String[] getTags() { return tags; }
    public void setTags(String[] tags) { this.tags = tags; }

    public Double getAverageSeconds() { return averageSeconds; }
    public void setAverageSeconds(Double averageSeconds) { this.averageSeconds = averageSeconds; }

    public String getFormattedDuration() { return formattedDuration; }
    public void setFormattedDuration(String formattedDuration) { this.formattedDuration = formattedDuration; }

    // Request DTOs
    public static class CreateRequest {
        @Size(max = 100, message = "Session name cannot exceed 100 characters")
        private String name;
        
        @NotNull(message = "Puzzle type is required")
        private Scramble.PuzzleType puzzleType = Scramble.PuzzleType.CUBE_3X3;
        
        private String notes;

        // Constructors
        public CreateRequest() {}

        public CreateRequest(String name, Scramble.PuzzleType puzzleType) {
            this.name = name;
            this.puzzleType = puzzleType;
        }

        // Getters and Setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public Scramble.PuzzleType getPuzzleType() { return puzzleType; }
        public void setPuzzleType(Scramble.PuzzleType puzzleType) { this.puzzleType = puzzleType; }

        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }

    public static class UpdateRequest {
        @Size(max = 100, message = "Session name cannot exceed 100 characters")
        private String name;
        
        private String notes;

        // Constructors
        public UpdateRequest() {}

        public UpdateRequest(String name, String notes) {
            this.name = name;
            this.notes = notes;
        }

        // Getters and Setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }

    @Override
    public String toString() {
        return "SessionDto{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", puzzleType=" + puzzleType +
                ", isActive=" + isActive +
                ", solveCount=" + solveCount +
                '}';
    }
}
