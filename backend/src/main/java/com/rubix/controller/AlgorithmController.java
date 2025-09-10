package com.rubix.controller;

import com.rubix.model.dto.AlgorithmDto;
import com.rubix.model.dto.PracticeDataRequest;
import com.rubix.model.entity.Algorithm.AlgorithmSet;
import com.rubix.service.AlgorithmService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/algorithms")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://localhost:8080"}, 
             allowCredentials = "true", maxAge = 3600)
public class AlgorithmController {

    @Autowired
    private AlgorithmService algorithmService;

    // Get all algorithms (public + user's personal algorithms)
    @GetMapping
    public ResponseEntity<List<AlgorithmDto>> getAllAlgorithms() {
        List<AlgorithmDto> algorithms = algorithmService.getAllAlgorithms();
        return ResponseEntity.ok(algorithms);
    }

    // Get algorithms by set
    @GetMapping("/set/{algorithmSet}")
    public ResponseEntity<List<AlgorithmDto>> getAlgorithmsBySet(@PathVariable String algorithmSet) {
        try {
            AlgorithmSet set = AlgorithmSet.valueOf(algorithmSet.toUpperCase());
            List<AlgorithmDto> algorithms = algorithmService.getAlgorithmsBySet(set);
            return ResponseEntity.ok(algorithms);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Search algorithms with advanced filters
    @GetMapping("/search")
    public ResponseEntity<Page<AlgorithmDto>> searchAlgorithms(
            @RequestParam(required = false, defaultValue = "") String query,
            @RequestParam(required = false) String algorithmSet,
            @RequestParam(required = false) Integer difficulty,
            @RequestParam(defaultValue = "false") boolean favoriteOnly,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortOrder,
            @RequestParam(required = false) Integer minMoveCount,
            @RequestParam(required = false) Integer maxMoveCount,
            @RequestParam(required = false, defaultValue = "") String tags,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        // Validate sortBy parameter
        if (!sortBy.matches("name|difficulty|moveCount|usageCount|createdAt")) {
            return ResponseEntity.badRequest().build();
        }
        
        // Validate sortOrder parameter  
        if (!sortOrder.matches("asc|desc")) {
            return ResponseEntity.badRequest().build();
        }
        
        AlgorithmSet set = null;
        if (algorithmSet != null && !algorithmSet.isEmpty()) {
            try {
                set = AlgorithmSet.valueOf(algorithmSet.toUpperCase());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().build();
            }
        }

        Page<AlgorithmDto> algorithms = algorithmService.searchAlgorithmsAdvanced(
            query, set, difficulty, favoriteOnly, sortBy, sortOrder, 
            minMoveCount, maxMoveCount, tags, page, size);
        return ResponseEntity.ok(algorithms);
    }

    // Get search suggestions
    @GetMapping("/search/suggestions")
    public ResponseEntity<List<String>> getSearchSuggestions(
            @RequestParam String query,
            @RequestParam(defaultValue = "10") int limit) {
        if (query == null || query.trim().length() < 2) {
            return ResponseEntity.ok(List.of());
        }
        List<String> suggestions = algorithmService.getSearchSuggestions(query.trim(), limit);
        return ResponseEntity.ok(suggestions);
    }

    // Get search statistics
    @GetMapping("/search/stats")
    public ResponseEntity<SearchStats> getSearchStats() {
        SearchStats stats = algorithmService.getSearchStats();
        return ResponseEntity.ok(stats);
    }

    // Get popular algorithms
    @GetMapping("/popular")
    public ResponseEntity<List<AlgorithmDto>> getPopularAlgorithms(
            @RequestParam(defaultValue = "10") int limit) {
        List<AlgorithmDto> algorithms = algorithmService.getPopularAlgorithms(limit);
        return ResponseEntity.ok(algorithms);
    }

    // Get algorithm by ID
    @GetMapping("/{id}")
    public ResponseEntity<AlgorithmDto> getAlgorithmById(@PathVariable UUID id) {
        Optional<AlgorithmDto> algorithm = algorithmService.getAlgorithmById(id);
        return algorithm.map(ResponseEntity::ok)
                        .orElse(ResponseEntity.notFound().build());
    }

    // Get similar algorithms
    @GetMapping("/{id}/similar")
    public ResponseEntity<List<AlgorithmDto>> getSimilarAlgorithms(
            @PathVariable UUID id,
            @RequestParam(defaultValue = "5") int limit) {
        List<AlgorithmDto> similar = algorithmService.getSimilarAlgorithms(id, limit);
        return ResponseEntity.ok(similar);
    }

    // Create a new algorithm
    @PostMapping
    public ResponseEntity<AlgorithmDto> createAlgorithm(@Valid @RequestBody AlgorithmDto.CreateAlgorithmDto createDto) {
        try {
            AlgorithmDto created = algorithmService.createAlgorithm(createDto);
            return ResponseEntity.ok(created);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(401).build(); // Unauthorized
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Update an algorithm
    @PutMapping("/{id}")
    public ResponseEntity<AlgorithmDto> updateAlgorithm(
            @PathVariable UUID id,
            @Valid @RequestBody AlgorithmDto.CreateAlgorithmDto updateDto) {
        try {
            Optional<AlgorithmDto> updated = algorithmService.updateAlgorithm(id, updateDto);
            return updated.map(ResponseEntity::ok)
                          .orElse(ResponseEntity.notFound().build());
        } catch (IllegalStateException e) {
            return ResponseEntity.status(401).build(); // Unauthorized
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(403).build(); // Forbidden
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Delete an algorithm
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAlgorithm(@PathVariable UUID id) {
        try {
            boolean deleted = algorithmService.deleteAlgorithm(id);
            return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(401).build(); // Unauthorized
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(403).build(); // Forbidden
        }
    }

    // Toggle favorite status
    @PostMapping("/{id}/favorite")
    public ResponseEntity<AlgorithmDto> toggleFavorite(@PathVariable UUID id) {
        try {
            Optional<AlgorithmDto> updated = algorithmService.toggleFavorite(id);
            return updated.map(ResponseEntity::ok)
                          .orElse(ResponseEntity.notFound().build());
        } catch (IllegalStateException e) {
            return ResponseEntity.status(401).build(); // Unauthorized
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(403).build(); // Forbidden
        }
    }

    // Increment usage count (when user practices an algorithm)
    @PostMapping("/{id}/practice")
    public ResponseEntity<AlgorithmDto> incrementUsage(@PathVariable UUID id, @RequestBody(required = false) PracticeDataRequest practiceData) {
        try {
            Optional<AlgorithmDto> updated = algorithmService.incrementUsage(id, practiceData);
            return updated.map(ResponseEntity::ok)
                          .orElse(ResponseEntity.notFound().build());
        } catch (IllegalStateException e) {
            return ResponseEntity.status(401).build(); // Unauthorized
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(403).build(); // Forbidden
        }
    }

    // Get user's favorite algorithms
    @GetMapping("/favorites")
    public ResponseEntity<List<AlgorithmDto>> getFavoriteAlgorithms() {
        try {
            List<AlgorithmDto> algorithms = algorithmService.getFavoriteAlgorithms();
            return ResponseEntity.ok(algorithms);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(401).build(); // Unauthorized
        }
    }

    // Get algorithm set summaries with user progress
    @GetMapping("/sets/summary")
    public ResponseEntity<List<AlgorithmDto.AlgorithmSetSummaryDto>> getAlgorithmSetSummaries() {
        List<AlgorithmDto.AlgorithmSetSummaryDto> summaries = algorithmService.getAlgorithmSetSummaries();
        return ResponseEntity.ok(summaries);
    }

    // Get algorithms by difficulty
    @GetMapping("/difficulty/{difficulty}")
    public ResponseEntity<List<AlgorithmDto>> getAlgorithmsByDifficulty(@PathVariable Integer difficulty) {
        if (difficulty < 1 || difficulty > 5) {
            return ResponseEntity.badRequest().build();
        }
        List<AlgorithmDto> algorithms = algorithmService.getAlgorithmsByDifficulty(difficulty);
        return ResponseEntity.ok(algorithms);
    }

    // Get available algorithm sets
    @GetMapping("/sets")
    public ResponseEntity<List<AlgorithmSetInfo>> getAlgorithmSets() {
        List<AlgorithmSetInfo> sets = List.of(AlgorithmSet.values()).stream()
                .map(set -> new AlgorithmSetInfo(
                    set.name(),
                    set.getDisplayName(),
                    set.getDescription(),
                    set.isLastLayer(),
                    set.isAdvanced()
                ))
                .toList();
        return ResponseEntity.ok(sets);
    }

    // Get most used tags
    @GetMapping("/tags/popular")
    public ResponseEntity<List<String>> getMostUsedTags(
            @RequestParam(defaultValue = "20") int limit) {
        List<String> tags = algorithmService.getMostUsedTags(limit);
        return ResponseEntity.ok(tags);
    }

    // Inner class for search statistics
    public static class SearchStats {
        private Long totalAlgorithms;
        private Long totalSets;
        private Long userCount;
        private Long totalSearches;
        private String mostPopularTag;
        private String mostPopularSet;

        public SearchStats(Long totalAlgorithms, Long totalSets, Long userCount, Long totalSearches, 
                          String mostPopularTag, String mostPopularSet) {
            this.totalAlgorithms = totalAlgorithms;
            this.totalSets = totalSets;
            this.userCount = userCount;
            this.totalSearches = totalSearches;
            this.mostPopularTag = mostPopularTag;
            this.mostPopularSet = mostPopularSet;
        }

        // Getters
        public Long getTotalAlgorithms() { return totalAlgorithms; }
        public Long getTotalSets() { return totalSets; }
        public Long getUserCount() { return userCount; }
        public Long getTotalSearches() { return totalSearches; }
        public String getMostPopularTag() { return mostPopularTag; }
        public String getMostPopularSet() { return mostPopularSet; }

        // Setters
        public void setTotalAlgorithms(Long totalAlgorithms) { this.totalAlgorithms = totalAlgorithms; }
        public void setTotalSets(Long totalSets) { this.totalSets = totalSets; }
        public void setUserCount(Long userCount) { this.userCount = userCount; }
        public void setTotalSearches(Long totalSearches) { this.totalSearches = totalSearches; }
        public void setMostPopularTag(String mostPopularTag) { this.mostPopularTag = mostPopularTag; }
        public void setMostPopularSet(String mostPopularSet) { this.mostPopularSet = mostPopularSet; }
    }

    // Inner class for algorithm set information
    public static class AlgorithmSetInfo {
        private String name;
        private String displayName;
        private String description;
        private boolean isLastLayer;
        private boolean isAdvanced;

        public AlgorithmSetInfo(String name, String displayName, String description, boolean isLastLayer, boolean isAdvanced) {
            this.name = name;
            this.displayName = displayName;
            this.description = description;
            this.isLastLayer = isLastLayer;
            this.isAdvanced = isAdvanced;
        }

        // Getters
        public String getName() { return name; }
        public String getDisplayName() { return displayName; }
        public String getDescription() { return description; }
        public boolean isLastLayer() { return isLastLayer; }
        public boolean isAdvanced() { return isAdvanced; }

        // Setters
        public void setName(String name) { this.name = name; }
        public void setDisplayName(String displayName) { this.displayName = displayName; }
        public void setDescription(String description) { this.description = description; }
        public void setLastLayer(boolean lastLayer) { isLastLayer = lastLayer; }
        public void setAdvanced(boolean advanced) { isAdvanced = advanced; }
    }
}
