package com.rubix.model.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

@Entity
@Table(name = "scrambles")
@EntityListeners(AuditingEntityListener.class)
public class Scramble {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "scramble_text", nullable = false, length = 500)
    @NotBlank
    @Size(max = 500)
    private String scrambleText;

    @Column(name = "puzzle_type", nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private PuzzleType puzzleType = PuzzleType.CUBE_3X3;

    @Column(name = "algorithm_moves", nullable = false)
    @Min(1)
    private Integer algorithmMoves;

    @Column(name = "move_count", insertable = false, updatable = false)
    private Integer moveCount; // Generated column in database

    @CreatedDate
    @Column(name = "generated_at", nullable = false, updatable = false)
    private Instant generatedAt;

    @Column(name = "is_custom", nullable = false)
    private Boolean isCustom = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_id")
    private User createdByUser;

    @Column(name = "difficulty_rating")
    private Integer difficultyRating;

    // Constructors
    public Scramble() {}

    public Scramble(String scrambleText, PuzzleType puzzleType, Integer algorithmMoves) {
        this.scrambleText = scrambleText;
        this.puzzleType = puzzleType;
        this.algorithmMoves = algorithmMoves;
    }

    public Scramble(String scrambleText, PuzzleType puzzleType, Integer algorithmMoves, User createdByUser) {
        this(scrambleText, puzzleType, algorithmMoves);
        this.createdByUser = createdByUser;
        this.isCustom = true;
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

    public PuzzleType getPuzzleType() {
        return puzzleType;
    }

    public void setPuzzleType(PuzzleType puzzleType) {
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

    public User getCreatedByUser() {
        return createdByUser;
    }

    public void setCreatedByUser(User createdByUser) {
        this.createdByUser = createdByUser;
    }

    public Integer getDifficultyRating() {
        return difficultyRating;
    }

    public void setDifficultyRating(Integer difficultyRating) {
        this.difficultyRating = difficultyRating;
    }

    // Utility methods
    public boolean isGenerated() {
        return !isCustom;
    }

    public boolean hasUser() {
        return createdByUser != null;
    }

    // Equals and HashCode
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Scramble scramble = (Scramble) o;
        return Objects.equals(id, scramble.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "Scramble{" +
                "id=" + id +
                ", puzzleType=" + puzzleType +
                ", moveCount=" + moveCount +
                ", isCustom=" + isCustom +
                ", scrambleText='" + (scrambleText != null && scrambleText.length() > 50 ? 
                    scrambleText.substring(0, 50) + "..." : scrambleText) + '\'' +
                '}';
    }

    // Enums
    public enum PuzzleType {
        CUBE_2X2("2x2"),
        CUBE_3X3("3x3"),
        CUBE_4X4("4x4"),
        CUBE_5X5("5x5"),
        CUBE_6X6("6x6"),
        CUBE_7X7("7x7"),
        PYRAMINX("pyraminx"),
        MEGAMINX("megaminx"),
        SKEWB("skewb"),
        SQUARE_1("square-1"),
        CLOCK("clock"),
        ONE_HANDED("3x3oh"),
        BLINDFOLDED("3x3bld"),
        FEET("3x3ft");

        private final String displayName;

        PuzzleType(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }

        public static PuzzleType fromDisplayName(String displayName) {
            for (PuzzleType type : values()) {
                if (type.getDisplayName().equalsIgnoreCase(displayName)) {
                    return type;
                }
            }
            throw new IllegalArgumentException("Unknown puzzle type: " + displayName);
        }

        public boolean isCube() {
            return name().startsWith("CUBE_");
        }

        public boolean isSpeedEvent() {
            return this != BLINDFOLDED && this != FEET;
        }
    }
}
