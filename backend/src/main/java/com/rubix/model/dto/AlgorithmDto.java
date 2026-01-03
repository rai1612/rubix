package com.rubix.model.dto;

import com.rubix.model.entity.Algorithm;
import com.rubix.model.entity.Algorithm.AlgorithmSet;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public class AlgorithmDto {
    
    private UUID id;
    private String name;
    private String notationString;
    private String caseDescription;
    private AlgorithmSet algorithmSet;
    private Integer caseNumber;
    private Integer difficulty;
    private Integer moveCount;
    private Integer executionTimeMs;
    private Boolean isPublic;
    private Boolean isFavorite;
    private List<String> tags;
    private String triggerPattern;
    private String setupMoves;
    private Instant createdAt;
    private Instant updatedAt;
    private Integer usageCount;
    private String fullName;
    private Double executionTimeSeconds;
    private Boolean isUserAlgorithm;
    private String imageUrl;

    // Default constructor
    public AlgorithmDto() {}

    // Constructor from entity
    public AlgorithmDto(Algorithm algorithm) {
        this.id = algorithm.getId();
        this.name = algorithm.getName();
        this.notationString = algorithm.getNotationString();
        this.caseDescription = algorithm.getCaseDescription();
        this.algorithmSet = algorithm.getAlgorithmSet();
        this.caseNumber = algorithm.getCaseNumber();
        this.difficulty = algorithm.getDifficulty();
        this.moveCount = algorithm.getMoveCount();
        this.executionTimeMs = algorithm.getExecutionTimeMs();
        this.isPublic = algorithm.getIsPublic();
        this.isFavorite = algorithm.getIsFavorite();
        this.tags = algorithm.getTagsList();
        this.triggerPattern = algorithm.getTriggerPattern();
        this.setupMoves = algorithm.getSetupMoves();
        this.createdAt = algorithm.getCreatedAt();
        this.updatedAt = algorithm.getUpdatedAt();
        this.usageCount = algorithm.getUsageCount();
        this.fullName = algorithm.getFullName();
        this.executionTimeSeconds = algorithm.getExecutionTimeSeconds();
        this.isUserAlgorithm = algorithm.isUserAlgorithm();
        this.imageUrl = algorithm.getImageUrl();
    }

    // Static factory method
    public static AlgorithmDto fromEntity(Algorithm algorithm) {
        return new AlgorithmDto(algorithm);
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
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

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
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

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public Double getExecutionTimeSeconds() {
        return executionTimeSeconds;
    }

    public void setExecutionTimeSeconds(Double executionTimeSeconds) {
        this.executionTimeSeconds = executionTimeSeconds;
    }

    public Boolean getIsUserAlgorithm() {
        return isUserAlgorithm;
    }

    public void setIsUserAlgorithm(Boolean isUserAlgorithm) {
        this.isUserAlgorithm = isUserAlgorithm;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    // Additional DTOs for specific responses
    public static class AlgorithmSetSummaryDto {
        private AlgorithmSet algorithmSet;
        private String displayName;
        private String description;
        private Long totalCount;
        private Long learnedCount;
        private Double averageDifficulty;
        private Double averageMoveCount;
        private Boolean isLastLayer;
        private Boolean isAdvanced;

        public AlgorithmSetSummaryDto() {}

        public AlgorithmSetSummaryDto(AlgorithmSet algorithmSet, Long totalCount, Long learnedCount) {
            this.algorithmSet = algorithmSet;
            this.displayName = algorithmSet.getDisplayName();
            this.description = algorithmSet.getDescription();
            this.totalCount = totalCount;
            this.learnedCount = learnedCount;
            this.isLastLayer = algorithmSet.isLastLayer();
            this.isAdvanced = algorithmSet.isAdvanced();
        }

        // Getters and setters
        public AlgorithmSet getAlgorithmSet() { return algorithmSet; }
        public void setAlgorithmSet(AlgorithmSet algorithmSet) { this.algorithmSet = algorithmSet; }
        public String getDisplayName() { return displayName; }
        public void setDisplayName(String displayName) { this.displayName = displayName; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public Long getTotalCount() { return totalCount; }
        public void setTotalCount(Long totalCount) { this.totalCount = totalCount; }
        public Long getLearnedCount() { return learnedCount; }
        public void setLearnedCount(Long learnedCount) { this.learnedCount = learnedCount; }
        public Double getAverageDifficulty() { return averageDifficulty; }
        public void setAverageDifficulty(Double averageDifficulty) { this.averageDifficulty = averageDifficulty; }
        public Double getAverageMoveCount() { return averageMoveCount; }
        public void setAverageMoveCount(Double averageMoveCount) { this.averageMoveCount = averageMoveCount; }
        public Boolean getIsLastLayer() { return isLastLayer; }
        public void setIsLastLayer(Boolean isLastLayer) { this.isLastLayer = isLastLayer; }
        public Boolean getIsAdvanced() { return isAdvanced; }
        public void setIsAdvanced(Boolean isAdvanced) { this.isAdvanced = isAdvanced; }
    }

    public static class CreateAlgorithmDto {
        private String name;
        private String notationString;
        private String caseDescription;
        private AlgorithmSet algorithmSet;
        private Integer caseNumber;
        private Integer difficulty;
        private List<String> tags;
        private String triggerPattern;
        private String setupMoves;

        // Getters and setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getNotationString() { return notationString; }
        public void setNotationString(String notationString) { this.notationString = notationString; }
        public String getCaseDescription() { return caseDescription; }
        public void setCaseDescription(String caseDescription) { this.caseDescription = caseDescription; }
        public AlgorithmSet getAlgorithmSet() { return algorithmSet; }
        public void setAlgorithmSet(AlgorithmSet algorithmSet) { this.algorithmSet = algorithmSet; }
        public Integer getCaseNumber() { return caseNumber; }
        public void setCaseNumber(Integer caseNumber) { this.caseNumber = caseNumber; }
        public Integer getDifficulty() { return difficulty; }
        public void setDifficulty(Integer difficulty) { this.difficulty = difficulty; }
        public List<String> getTags() { return tags; }
        public void setTags(List<String> tags) { this.tags = tags; }
        public String getTriggerPattern() { return triggerPattern; }
        public void setTriggerPattern(String triggerPattern) { this.triggerPattern = triggerPattern; }
        public String getSetupMoves() { return setupMoves; }
        public void setSetupMoves(String setupMoves) { this.setupMoves = setupMoves; }
    }
}
