package com.rubix.model.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.*;

@Entity
@Table(name = "solves")
@EntityListeners(AuditingEntityListener.class)
public class Solve {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    @NotNull
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "session_id", nullable = false)
    @NotNull
    private Session session;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "scramble_id", nullable = false)
    @NotNull
    private Scramble scramble;

    @Column(name = "time_ms", nullable = false)
    @Min(1)
    private Integer timeMs;

    @Column(name = "inspection_time_ms", nullable = false)
    @Min(0)
    private Integer inspectionTimeMs = 0;

    @Column(nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private Penalty penalty = Penalty.NONE;

    @Column(name = "adjusted_time_ms", nullable = false)
    private Integer adjustedTimeMs;

    @Column(name = "solved_at", nullable = false)
    @NotNull
    private Instant solvedAt;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(columnDefinition = "varchar(255)[]")
    private String[] tags;

    // Performance tracking fields
    @Column(name = "move_count")
    private Integer moveCount;

    @Column(name = "tps")
    private Double tps; // Turns per second

    // Future analytics fields
    @Column(name = "cross_time_ms")
    private Integer crossTimeMs;

    @Column(name = "f2l_time_ms")
    private Integer f2lTimeMs;

    @Column(name = "oll_time_ms")
    private Integer ollTimeMs;

    @Column(name = "pll_time_ms")
    private Integer pllTimeMs;

    // Constructors
    public Solve() {}

    public Solve(User user, Session session, Scramble scramble, Integer timeMs, Instant solvedAt) {
        this.user = user;
        this.session = session;
        this.scramble = scramble;
        this.timeMs = timeMs;
        this.solvedAt = solvedAt;
        this.adjustedTimeMs = calculateAdjustedTime();
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Session getSession() {
        return session;
    }

    public void setSession(Session session) {
        this.session = session;
    }

    public Scramble getScramble() {
        return scramble;
    }

    public void setScramble(Scramble scramble) {
        this.scramble = scramble;
    }

    public Integer getTimeMs() {
        return timeMs;
    }

    public void setTimeMs(Integer timeMs) {
        this.timeMs = timeMs;
        this.adjustedTimeMs = calculateAdjustedTime();
    }

    public Integer getInspectionTimeMs() {
        return inspectionTimeMs;
    }

    public void setInspectionTimeMs(Integer inspectionTimeMs) {
        this.inspectionTimeMs = inspectionTimeMs;
    }

    public Penalty getPenalty() {
        return penalty;
    }

    public void setPenalty(Penalty penalty) {
        this.penalty = penalty;
        this.adjustedTimeMs = calculateAdjustedTime();
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

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String[] getTags() {
        return tags;
    }

    public void setTags(String[] tags) {
        this.tags = tags;
    }

    public Integer getMoveCount() {
        return moveCount;
    }

    public void setMoveCount(Integer moveCount) {
        this.moveCount = moveCount;
        if (moveCount != null && timeMs != null && timeMs > 0) {
            this.tps = (moveCount * 1000.0) / timeMs;
        }
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

    // Utility methods
    private Integer calculateAdjustedTime() {
        if (timeMs == null) return null;
        
        return switch (penalty) {
            case NONE -> timeMs;
            case PLUS_TWO -> timeMs + 2000;
            case DNF -> 999999; // Large number to indicate DNF
        };
    }

    public Double getTimeSeconds() {
        return timeMs != null ? timeMs / 1000.0 : null;
    }

    public Double getAdjustedTimeSeconds() {
        return adjustedTimeMs != null && penalty != Penalty.DNF ? adjustedTimeMs / 1000.0 : null;
    }

    public Double getInspectionTimeSeconds() {
        return inspectionTimeMs != null ? inspectionTimeMs / 1000.0 : null;
    }

    public boolean isDNF() {
        return penalty == Penalty.DNF;
    }

    public boolean hasPenalty() {
        return penalty != Penalty.NONE;
    }

    public boolean isValidForAverage() {
        return penalty != Penalty.DNF;
    }

    public List<String> getTagsList() {
        return tags != null ? Arrays.asList(tags) : new ArrayList<>();
    }

    public void setTagsList(List<String> tagsList) {
        this.tags = tagsList != null ? tagsList.toArray(new String[0]) : null;
    }

    public void addTag(String tag) {
        if (tag != null && !tag.trim().isEmpty()) {
            List<String> currentTags = new ArrayList<>(getTagsList());
            if (!currentTags.contains(tag.trim())) {
                currentTags.add(tag.trim());
                setTagsList(currentTags);
            }
        }
    }

    public void removeTag(String tag) {
        if (tag != null) {
            List<String> currentTags = new ArrayList<>(getTagsList());
            currentTags.remove(tag.trim());
            setTagsList(currentTags);
        }
    }

    // Performance calculations
    public void calculateTps() {
        if (moveCount != null && timeMs != null && timeMs > 0) {
            this.tps = Math.round((moveCount * 1000.0 / timeMs) * 100.0) / 100.0;
        }
    }

    public boolean hasTimingBreakdown() {
        return crossTimeMs != null || f2lTimeMs != null || ollTimeMs != null || pllTimeMs != null;
    }

    public Integer getTotalBreakdownTime() {
        if (!hasTimingBreakdown()) return null;
        
        int total = 0;
        if (crossTimeMs != null) total += crossTimeMs;
        if (f2lTimeMs != null) total += f2lTimeMs;
        if (ollTimeMs != null) total += ollTimeMs;
        if (pllTimeMs != null) total += pllTimeMs;
        
        return total > 0 ? total : null;
    }

    // Formatted display methods
    public String getFormattedTime() {
        if (penalty == Penalty.DNF) return "DNF";
        if (timeMs == null) return "--";
        
        String baseTime = formatTimeMs(timeMs);
        return penalty == Penalty.PLUS_TWO ? baseTime + "+" : baseTime;
    }

    public String getFormattedAdjustedTime() {
        if (penalty == Penalty.DNF) return "DNF";
        if (adjustedTimeMs == null) return "--";
        return formatTimeMs(adjustedTimeMs);
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

    // Equals and HashCode
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Solve solve = (Solve) o;
        return Objects.equals(id, solve.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "Solve{" +
                "id=" + id +
                ", timeMs=" + timeMs +
                ", penalty=" + penalty +
                ", adjustedTimeMs=" + adjustedTimeMs +
                ", solvedAt=" + solvedAt +
                '}';
    }

    // Enums
    public enum Penalty {
        NONE("No penalty"),
        PLUS_TWO("+2 seconds"),
        DNF("Did Not Finish");

        private final String description;

        Penalty(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }
}
