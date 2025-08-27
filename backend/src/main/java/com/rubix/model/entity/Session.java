package com.rubix.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.*;

@Entity
@Table(name = "sessions")
@EntityListeners(AuditingEntityListener.class)
public class Session {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    @NotNull
    private User user;

    @Column(length = 100)
    @Size(max = 100)
    private String name;

    @Column(name = "puzzle_type", nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private Scramble.PuzzleType puzzleType = Scramble.PuzzleType.CUBE_3X3;

    @CreatedDate
    @Column(name = "started_at", nullable = false, updatable = false)
    private Instant startedAt;

    @Column(name = "ended_at")
    private Instant endedAt;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "solve_count", nullable = false)
    private Integer solveCount = 0;

    @Column(name = "total_time_ms", nullable = false)
    private Long totalTimeMs = 0L;

    @Column(name = "best_time_ms")
    private Integer bestTimeMs;

    @Column(name = "worst_time_ms")
    private Integer worstTimeMs;

    @Column(name = "average_time_ms")
    private Integer averageTimeMs;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(columnDefinition = "varchar(255)[]")
    private String[] tags;

    // Relationships
    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @OrderBy("solvedAt DESC")
    @JsonIgnore
    private Set<Solve> solves = new LinkedHashSet<>();

    // Constructors
    public Session() {}

    public Session(User user, String name, Scramble.PuzzleType puzzleType) {
        this.user = user;
        this.name = name;
        this.puzzleType = puzzleType;
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

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Scramble.PuzzleType getPuzzleType() {
        return puzzleType;
    }

    public void setPuzzleType(Scramble.PuzzleType puzzleType) {
        this.puzzleType = puzzleType;
    }

    public Instant getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(Instant startedAt) {
        this.startedAt = startedAt;
    }

    public Instant getEndedAt() {
        return endedAt;
    }

    public void setEndedAt(Instant endedAt) {
        this.endedAt = endedAt;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public Integer getSolveCount() {
        return solveCount;
    }

    public void setSolveCount(Integer solveCount) {
        this.solveCount = solveCount;
    }

    public Long getTotalTimeMs() {
        return totalTimeMs;
    }

    public void setTotalTimeMs(Long totalTimeMs) {
        this.totalTimeMs = totalTimeMs;
    }

    public Integer getBestTimeMs() {
        return bestTimeMs;
    }

    public void setBestTimeMs(Integer bestTimeMs) {
        this.bestTimeMs = bestTimeMs;
    }

    public Integer getWorstTimeMs() {
        return worstTimeMs;
    }

    public void setWorstTimeMs(Integer worstTimeMs) {
        this.worstTimeMs = worstTimeMs;
    }

    public Integer getAverageTimeMs() {
        return averageTimeMs;
    }

    public void setAverageTimeMs(Integer averageTimeMs) {
        this.averageTimeMs = averageTimeMs;
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

    public Set<Solve> getSolves() {
        return solves;
    }

    public void setSolves(Set<Solve> solves) {
        this.solves = solves;
    }

    // Utility methods
    public void addSolve(Solve solve) {
        solves.add(solve);
        solve.setSession(this);
    }

    public void removeSolve(Solve solve) {
        solves.remove(solve);
        solve.setSession(null);
    }

    public Long getDurationMs() {
        if (startedAt == null) return 0L;
        Instant end = endedAt != null ? endedAt : Instant.now();
        return end.toEpochMilli() - startedAt.toEpochMilli();
    }

    public void endSession() {
        this.isActive = false;
        this.endedAt = Instant.now();
    }

    public boolean hasValidSolves() {
        return solveCount > 0 && solves.stream().anyMatch(solve -> solve.getPenalty() != Solve.Penalty.DNF);
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

    // Calculated properties
    public Double getAverageTimeSeconds() {
        return averageTimeMs != null ? averageTimeMs / 1000.0 : null;
    }

    public Double getBestTimeSeconds() {
        return bestTimeMs != null ? bestTimeMs / 1000.0 : null;
    }

    public Double getWorstTimeSeconds() {
        return worstTimeMs != null ? worstTimeMs / 1000.0 : null;
    }

    // Equals and HashCode
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Session session = (Session) o;
        return Objects.equals(id, session.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "Session{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", puzzleType=" + puzzleType +
                ", isActive=" + isActive +
                ", solveCount=" + solveCount +
                ", averageTimeMs=" + averageTimeMs +
                ", startedAt=" + startedAt +
                '}';
    }
}
