package com.rubix.model.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Request DTO for practice session data
 */
public class PracticeDataRequest {
    
    @JsonProperty("executionTimeMs")
    private Double executionTimeMs;
    
    @JsonProperty("isPersonalBest")
    private Boolean isPersonalBest;
    
    @JsonProperty("practiceDate")
    private String practiceDate; // ISO string format
    
    // Default constructor
    public PracticeDataRequest() {}
    
    // Constructor with all fields
    public PracticeDataRequest(Double executionTimeMs, Boolean isPersonalBest, String practiceDate) {
        this.executionTimeMs = executionTimeMs;
        this.isPersonalBest = isPersonalBest;
        this.practiceDate = practiceDate;
    }
    
    // Getters and setters
    public Double getExecutionTimeMs() {
        return executionTimeMs;
    }
    
    public void setExecutionTimeMs(Double executionTimeMs) {
        this.executionTimeMs = executionTimeMs;
    }
    
    public Boolean getIsPersonalBest() {
        return isPersonalBest;
    }
    
    public void setIsPersonalBest(Boolean isPersonalBest) {
        this.isPersonalBest = isPersonalBest;
    }
    
    public String getPracticeDate() {
        return practiceDate;
    }
    
    public void setPracticeDate(String practiceDate) {
        this.practiceDate = practiceDate;
    }
    
    @Override
    public String toString() {
        return "PracticeDataRequest{" +
                "executionTimeMs=" + executionTimeMs +
                ", isPersonalBest=" + isPersonalBest +
                ", practiceDate='" + practiceDate + '\'' +
                '}';
    }
}
