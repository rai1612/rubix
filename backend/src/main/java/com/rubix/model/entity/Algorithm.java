package com.rubix.model.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.*;

@Entity
@Table(name = "algorithms")
@EntityListeners(AuditingEntityListener.class)
public class Algorithm {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user; // NULL for public algorithms

    @Column(nullable = false, length = 100)
    @NotBlank
    @Size(max = 100)
    private String name;

    @Column(name = "notation_string", nullable = false, length = 1000)
    @NotBlank
    @Size(max = 1000)
    private String notationString;

    @Column(name = "case_description", columnDefinition = "TEXT")
    private String caseDescription;

    @Column(name = "algorithm_set", length = 50)
    @Enumerated(EnumType.STRING)
    private AlgorithmSet algorithmSet;

    @Column(name = "case_number")
    private Integer caseNumber;

    @Column
    @Min(1)
    @Max(5)
    private Integer difficulty;

    @Column(name = "move_count")
    private Integer moveCount;

    @Column(name = "execution_time_ms")
    private Integer executionTimeMs;

    @Column(name = "is_public", nullable = false)
    private Boolean isPublic = false;

    @Column(name = "is_favorite", nullable = false)
    private Boolean isFavorite = false;

    @Column(columnDefinition = "varchar(255)[]")
    private String[] tags;

    @Column(name = "trigger_pattern")
    private String triggerPattern;

    @Column(name = "setup_moves", length = 500)
    private String setupMoves;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(name = "usage_count", nullable = false)
    private Integer usageCount = 0;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    // Constructors
    public Algorithm() {}

    public Algorithm(String name, String notationString, AlgorithmSet algorithmSet) {
        this.name = name;
        this.notationString = notationString;
        this.algorithmSet = algorithmSet;
        this.moveCount = calculateMoveCount(notationString);
    }

    public Algorithm(User user, String name, String notationString, AlgorithmSet algorithmSet) {
        this(name, notationString, algorithmSet);
        this.user = user;
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

    public String getNotationString() {
        return notationString;
    }

    public void setNotationString(String notationString) {
        this.notationString = notationString;
        this.moveCount = calculateMoveCount(notationString);
    }

    public String getCaseDescription() {
        return caseDescription;
    }

    public void setCaseDescription(String caseDescription) {
        this.caseDescription = caseDescription;
    }

    public AlgorithmSet getAlgorithmSet() {
        return algorithmSet;
    }

    public void setAlgorithmSet(AlgorithmSet algorithmSet) {
        this.algorithmSet = algorithmSet;
    }

    public Integer getCaseNumber() {
        return caseNumber;
    }

    public void setCaseNumber(Integer caseNumber) {
        this.caseNumber = caseNumber;
    }

    public Integer getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(Integer difficulty) {
        this.difficulty = difficulty;
    }

    public Integer getMoveCount() {
        return moveCount;
    }

    public void setMoveCount(Integer moveCount) {
        this.moveCount = moveCount;
    }

    public Integer getExecutionTimeMs() {
        return executionTimeMs;
    }

    public void setExecutionTimeMs(Integer executionTimeMs) {
        this.executionTimeMs = executionTimeMs;
    }

    public Boolean getIsPublic() {
        return isPublic;
    }

    public void setIsPublic(Boolean isPublic) {
        this.isPublic = isPublic;
    }

    public Boolean getIsFavorite() {
        return isFavorite;
    }

    public void setIsFavorite(Boolean isFavorite) {
        this.isFavorite = isFavorite;
    }

    public String[] getTags() {
        return tags;
    }

    public void setTags(String[] tags) {
        this.tags = tags;
    }

    public String getTriggerPattern() {
        return triggerPattern;
    }

    public void setTriggerPattern(String triggerPattern) {
        this.triggerPattern = triggerPattern;
    }

    public String getSetupMoves() {
        return setupMoves;
    }

    public void setSetupMoves(String setupMoves) {
        this.setupMoves = setupMoves;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Integer getUsageCount() {
        return usageCount;
    }

    public void setUsageCount(Integer usageCount) {
        this.usageCount = usageCount;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    // Utility methods
    private Integer calculateMoveCount(String notation) {
        if (notation == null || notation.trim().isEmpty()) {
            return 0;
        }
        
        // Split by spaces and count non-empty parts
        String[] moves = notation.trim().split("\\s+");
        return moves.length;
    }

    public void incrementUsageCount() {
        this.usageCount = (this.usageCount != null ? this.usageCount : 0) + 1;
    }

    public boolean isPublic() {
        return Boolean.TRUE.equals(isPublic);
    }

    public boolean isFavorite() {
        return Boolean.TRUE.equals(isFavorite);
    }

    public boolean isUserAlgorithm() {
        return user != null;
    }

    public String getFullName() {
        if (algorithmSet != null && caseNumber != null) {
            return algorithmSet.getDisplayName() + " " + caseNumber + " - " + name;
        } else if (algorithmSet != null) {
            return algorithmSet.getDisplayName() + " - " + name;
        }
        return name;
    }

    public Double getExecutionTimeSeconds() {
        return executionTimeMs != null ? executionTimeMs / 1000.0 : null;
    }
    
    public void setExecutionTimeSeconds(Double executionTimeSeconds) {
        this.executionTimeMs = executionTimeSeconds != null ? (int) Math.round(executionTimeSeconds * 1000.0) : null;
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

    public boolean hasTag(String tag) {
        return getTagsList().contains(tag);
    }

    public String getDifficultyText() {
        if (difficulty == null) return "Unknown";
        return switch (difficulty) {
            case 1 -> "Beginner";
            case 2 -> "Easy";
            case 3 -> "Intermediate";
            case 4 -> "Advanced";
            case 5 -> "Expert";
            default -> "Unknown";
        };
    }

    // Equals and HashCode
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Algorithm algorithm = (Algorithm) o;
        return Objects.equals(id, algorithm.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "Algorithm{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", algorithmSet=" + algorithmSet +
                ", caseNumber=" + caseNumber +
                ", difficulty=" + difficulty +
                ", moveCount=" + moveCount +
                ", isPublic=" + isPublic +
                '}';
    }

    // Enums
    public enum AlgorithmSet {
        OLL("OLL", "Orientation of the Last Layer"),
        PLL("PLL", "Permutation of the Last Layer"),
        F2L("F2L", "First Two Layers"),
        CROSS("Cross", "Cross"),
        CMLL("CMLL", "Corners of the Last Layer - Minus Last"),
        LSE("LSE", "Last Six Edges"),
        COLL("COLL", "Corners of the Last Layer"),
        ZBLL("ZBLL", "Zborowski-Bruchem Last Layer"),
        VLS("VLS", "Valk Last Slot"),
        WV("WV", "Winter Variation"),
        SV("SV", "Summer Variation"),
        ELS("ELS", "Edge Last Slot"),
        CLS("CLS", "Corner Last Slot"),
        OH("1H", "One-Handed"),
        BLD("BLD", "Blindfolded"),
        CUSTOM("Custom", "Custom Algorithm");

        private final String displayName;
        private final String description;

        AlgorithmSet(String displayName, String description) {
            this.displayName = displayName;
            this.description = description;
        }

        public String getDisplayName() {
            return displayName;
        }

        public String getDescription() {
            return description;
        }

        public static AlgorithmSet fromDisplayName(String displayName) {
            for (AlgorithmSet set : values()) {
                if (set.getDisplayName().equalsIgnoreCase(displayName)) {
                    return set;
                }
            }
            throw new IllegalArgumentException("Unknown algorithm set: " + displayName);
        }

        public boolean isLastLayer() {
            return this == OLL || this == PLL || this == COLL || this == ZBLL;
        }

        public boolean isAdvanced() {
            return this == ZBLL || this == VLS || this == WV || this == SV || this == ELS || this == CLS;
        }
    }
}
