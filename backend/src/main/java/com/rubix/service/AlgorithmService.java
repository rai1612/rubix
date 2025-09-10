package com.rubix.service;

import com.rubix.controller.AlgorithmController.SearchStats;
import com.rubix.model.dto.AlgorithmDto;
import com.rubix.model.dto.PracticeDataRequest;
import com.rubix.model.entity.Algorithm;
import com.rubix.model.entity.Algorithm.AlgorithmSet;
import com.rubix.model.entity.User;
import com.rubix.repository.AlgorithmRepository;
import com.rubix.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class AlgorithmService {

    @Autowired
    private AlgorithmRepository algorithmRepository;

    @Autowired
    private UserRepository userRepository;

    // Get all public algorithms and user's personal algorithms
    public List<AlgorithmDto> getAllAlgorithms() {
        User currentUser = getCurrentUser();
        List<Algorithm> publicAlgorithms = algorithmRepository.findByIsPublicTrueOrderByAlgorithmSetAscCaseNumberAsc();
        
        if (currentUser != null) {
            List<Algorithm> userAlgorithms = algorithmRepository.findByUserOrderByAlgorithmSetAscCaseNumberAsc(currentUser);
            publicAlgorithms.addAll(userAlgorithms);
        }
        
        return publicAlgorithms.stream()
                .map(AlgorithmDto::fromEntity)
                .collect(Collectors.toList());
    }

    // Get algorithms by set
    public List<AlgorithmDto> getAlgorithmsBySet(AlgorithmSet algorithmSet) {
        User currentUser = getCurrentUser();
        List<Algorithm> algorithms;
        
        if (currentUser != null) {
            algorithms = algorithmRepository.findByUserAndAlgorithmSetOrderByCaseNumberAsc(currentUser, algorithmSet);
            // Add public algorithms if not already present
            List<Algorithm> publicAlgorithms = algorithmRepository.findByAlgorithmSetAndIsPublicTrueOrderByCaseNumberAsc(algorithmSet);
            for (Algorithm publicAlg : publicAlgorithms) {
                if (!algorithms.contains(publicAlg)) {
                    algorithms.add(publicAlg);
                }
            }
        } else {
            algorithms = algorithmRepository.findByAlgorithmSetAndIsPublicTrueOrderByCaseNumberAsc(algorithmSet);
        }
        
        return algorithms.stream()
                .map(AlgorithmDto::fromEntity)
                .collect(Collectors.toList());
    }

    // Search algorithms (backward compatibility)
    public Page<AlgorithmDto> searchAlgorithms(String query, AlgorithmSet algorithmSet, int page, int size) {
        return searchAlgorithmsAdvanced(query, algorithmSet, null, false, "name", "asc", null, null, null, page, size);
    }

    // Advanced search with multiple filters and sorting
    public Page<AlgorithmDto> searchAlgorithmsAdvanced(String query, AlgorithmSet algorithmSet, Integer difficulty, 
                                                      boolean favoriteOnly, String sortBy, String sortOrder,
                                                      Integer minMoveCount, Integer maxMoveCount, String tags,
                                                      int page, int size) {
        User currentUser = getCurrentUser();
        
        // Create sort object
        Sort.Direction direction = sortOrder.equals("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Sort sort = Sort.by(direction, sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        // Clean up query and tags
        String cleanQuery = query != null ? query.trim() : "";
        String cleanTags = tags != null ? tags.trim() : "";
        
        Page<Algorithm> algorithms = algorithmRepository.searchAlgorithmsAdvanced(
            cleanQuery, algorithmSet, difficulty, favoriteOnly, 
            minMoveCount, maxMoveCount, currentUser, pageable);
        
        return algorithms.map(AlgorithmDto::fromEntity);
    }

    // Get popular algorithms
    public List<AlgorithmDto> getPopularAlgorithms(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        List<Algorithm> algorithms = algorithmRepository.findPopularAlgorithms(pageable);
        return algorithms.stream()
                .map(AlgorithmDto::fromEntity)
                .collect(Collectors.toList());
    }

    // Get algorithm by ID
    public Optional<AlgorithmDto> getAlgorithmById(UUID id) {
        User currentUser = getCurrentUser();
        Optional<Algorithm> algorithm = algorithmRepository.findById(id);
        
        if (algorithm.isPresent()) {
            Algorithm alg = algorithm.get();
            // Check if user has access to this algorithm
            if (alg.isPublic() || (currentUser != null && alg.getUser() != null && alg.getUser().equals(currentUser))) {
                return Optional.of(AlgorithmDto.fromEntity(alg));
            }
        }
        
        return Optional.empty();
    }

    // Create a new algorithm
    public AlgorithmDto createAlgorithm(AlgorithmDto.CreateAlgorithmDto createDto) {
        User currentUser = getCurrentUser();
        if (currentUser == null) {
            throw new IllegalStateException("User must be authenticated to create algorithms");
        }

        Algorithm algorithm = new Algorithm();
        algorithm.setUser(currentUser);
        algorithm.setName(createDto.getName());
        algorithm.setNotationString(createDto.getNotationString());
        algorithm.setCaseDescription(createDto.getCaseDescription());
        algorithm.setAlgorithmSet(createDto.getAlgorithmSet());
        algorithm.setCaseNumber(createDto.getCaseNumber());
        algorithm.setDifficulty(createDto.getDifficulty());
        algorithm.setTriggerPattern(createDto.getTriggerPattern());
        algorithm.setSetupMoves(createDto.getSetupMoves());
        algorithm.setIsPublic(false); // User algorithms are private by default
        algorithm.setIsFavorite(false);
        algorithm.setUsageCount(0);

        if (createDto.getTags() != null) {
            algorithm.setTagsList(createDto.getTags());
        }

        Algorithm saved = algorithmRepository.save(algorithm);
        return AlgorithmDto.fromEntity(saved);
    }

    // Update an algorithm
    public Optional<AlgorithmDto> updateAlgorithm(UUID id, AlgorithmDto.CreateAlgorithmDto updateDto) {
        User currentUser = getCurrentUser();
        if (currentUser == null) {
            throw new IllegalStateException("User must be authenticated to update algorithms");
        }

        Optional<Algorithm> optionalAlgorithm = algorithmRepository.findById(id);
        if (optionalAlgorithm.isPresent()) {
            Algorithm algorithm = optionalAlgorithm.get();
            
            // Check if user owns this algorithm
            if (algorithm.getUser() == null || !algorithm.getUser().equals(currentUser)) {
                throw new IllegalArgumentException("User can only update their own algorithms");
            }

            algorithm.setName(updateDto.getName());
            algorithm.setNotationString(updateDto.getNotationString());
            algorithm.setCaseDescription(updateDto.getCaseDescription());
            algorithm.setAlgorithmSet(updateDto.getAlgorithmSet());
            algorithm.setCaseNumber(updateDto.getCaseNumber());
            algorithm.setDifficulty(updateDto.getDifficulty());
            algorithm.setTriggerPattern(updateDto.getTriggerPattern());
            algorithm.setSetupMoves(updateDto.getSetupMoves());

            if (updateDto.getTags() != null) {
                algorithm.setTagsList(updateDto.getTags());
            }

            Algorithm saved = algorithmRepository.save(algorithm);
            return Optional.of(AlgorithmDto.fromEntity(saved));
        }

        return Optional.empty();
    }

    // Delete an algorithm
    public boolean deleteAlgorithm(UUID id) {
        User currentUser = getCurrentUser();
        if (currentUser == null) {
            throw new IllegalStateException("User must be authenticated to delete algorithms");
        }

        Optional<Algorithm> optionalAlgorithm = algorithmRepository.findById(id);
        if (optionalAlgorithm.isPresent()) {
            Algorithm algorithm = optionalAlgorithm.get();
            
            // Check if user owns this algorithm
            if (algorithm.getUser() == null || !algorithm.getUser().equals(currentUser)) {
                throw new IllegalArgumentException("User can only delete their own algorithms");
            }

            algorithmRepository.delete(algorithm);
            return true;
        }

        return false;
    }

    // Toggle favorite status
    public Optional<AlgorithmDto> toggleFavorite(UUID id) {
        User currentUser = getCurrentUser();
        if (currentUser == null) {
            throw new IllegalStateException("User must be authenticated to favorite algorithms");
        }

        Optional<Algorithm> optionalAlgorithm = algorithmRepository.findById(id);
        if (optionalAlgorithm.isPresent()) {
            Algorithm algorithm = optionalAlgorithm.get();
            
            // Check if user has access to this algorithm
            if (!algorithm.isPublic() && (algorithm.getUser() == null || !algorithm.getUser().equals(currentUser))) {
                throw new IllegalArgumentException("User can only favorite accessible algorithms");
            }

            algorithm.setIsFavorite(!algorithm.getIsFavorite());
            Algorithm saved = algorithmRepository.save(algorithm);
            return Optional.of(AlgorithmDto.fromEntity(saved));
        }

        return Optional.empty();
    }

    // Increment usage count (when user practices an algorithm)
    public Optional<AlgorithmDto> incrementUsage(UUID id) {
        return incrementUsage(id, null);
    }
    
    // Increment usage count with optional practice data
    public Optional<AlgorithmDto> incrementUsage(UUID id, PracticeDataRequest practiceData) {
        User currentUser = getCurrentUser();
        if (currentUser == null) {
            throw new IllegalStateException("User must be authenticated to track algorithm usage");
        }

        Optional<Algorithm> optionalAlgorithm = algorithmRepository.findById(id);
        if (optionalAlgorithm.isPresent()) {
            Algorithm algorithm = optionalAlgorithm.get();
            
            // Check if user has access to this algorithm
            if (!algorithm.isPublic() && (algorithm.getUser() == null || !algorithm.getUser().equals(currentUser))) {
                throw new IllegalArgumentException("User can only practice accessible algorithms");
            }

            algorithm.incrementUsageCount();
            
            // Update timing data if provided
            if (practiceData != null && practiceData.getExecutionTimeMs() != null) {
                // Convert milliseconds to seconds for storage
                Double executionTimeSeconds = practiceData.getExecutionTimeMs() / 1000.0;
                
                // Update best time if this is a personal best or first time
                if (algorithm.getExecutionTimeSeconds() == null || 
                    Boolean.TRUE.equals(practiceData.getIsPersonalBest()) ||
                    executionTimeSeconds < algorithm.getExecutionTimeSeconds()) {
                    algorithm.setExecutionTimeSeconds(executionTimeSeconds);
                }
            }
            
            Algorithm saved = algorithmRepository.save(algorithm);
            return Optional.of(AlgorithmDto.fromEntity(saved));
        }

        return Optional.empty();
    }

    // Get user's favorite algorithms
    public List<AlgorithmDto> getFavoriteAlgorithms() {
        User currentUser = getCurrentUser();
        if (currentUser == null) {
            throw new IllegalStateException("User must be authenticated to get favorite algorithms");
        }

        List<Algorithm> algorithms = algorithmRepository.findByUserAndIsFavoriteTrueOrderByAlgorithmSetAscCaseNumberAsc(currentUser);
        return algorithms.stream()
                .map(AlgorithmDto::fromEntity)
                .collect(Collectors.toList());
    }

    // Get algorithm set summaries with user progress
    public List<AlgorithmDto.AlgorithmSetSummaryDto> getAlgorithmSetSummaries() {
        User currentUser = getCurrentUser();
        
        return List.of(AlgorithmSet.values()).stream()
                .map(set -> {
                    Long totalCount = algorithmRepository.countByAlgorithmSetForUser(set, currentUser);
                    Long learnedCount = algorithmRepository.countLearnedByAlgorithmSetForUser(set, currentUser);
                    return new AlgorithmDto.AlgorithmSetSummaryDto(set, totalCount, learnedCount);
                })
                .filter(summary -> summary.getTotalCount() > 0) // Only include sets with algorithms
                .collect(Collectors.toList());
    }

    // Get algorithms by difficulty
    public List<AlgorithmDto> getAlgorithmsByDifficulty(Integer difficulty) {
        List<Algorithm> algorithms = algorithmRepository.findByDifficultyAndIsPublicTrueOrderByAlgorithmSetAscCaseNumberAsc(difficulty);
        return algorithms.stream()
                .map(AlgorithmDto::fromEntity)
                .collect(Collectors.toList());
    }

    // Get search suggestions
    public List<String> getSearchSuggestions(String query, int limit) {
        User currentUser = getCurrentUser();
        Pageable pageable = PageRequest.of(0, limit);
        List<String> suggestions = new ArrayList<>();
        
        // Get name suggestions
        List<String> nameSuggestions = algorithmRepository.getNameSuggestions(query, currentUser, pageable);
        suggestions.addAll(nameSuggestions);
        
        // Get tag suggestions if we have space
        if (suggestions.size() < limit) {
            Pageable tagPageable = PageRequest.of(0, limit - suggestions.size());
            List<String> tagSuggestions = algorithmRepository.getTagSuggestions(query, currentUser, tagPageable);
            suggestions.addAll(tagSuggestions);
        }
        
        // Get case description suggestions if we still have space
        if (suggestions.size() < limit) {
            Pageable casePageable = PageRequest.of(0, limit - suggestions.size());
            List<String> caseSuggestions = algorithmRepository.getCaseDescriptionSuggestions(query, currentUser, casePageable);
            suggestions.addAll(caseSuggestions);
        }
        
        return suggestions.stream().distinct().limit(limit).collect(Collectors.toList());
    }

    // Get search statistics
    public SearchStats getSearchStats() {
        User currentUser = getCurrentUser();
        
        Long totalAlgorithms = algorithmRepository.getTotalAlgorithmsForUser(currentUser);
        Long totalSets = algorithmRepository.getTotalSetsForUser(currentUser);
        
        // Get most used tags
        Pageable tagPageable = PageRequest.of(0, 1);
        List<Object[]> mostUsedTags = algorithmRepository.getMostUsedTags(currentUser, tagPageable);
        String mostPopularTag = mostUsedTags.isEmpty() ? "No tags yet" : (String) mostUsedTags.get(0)[0];
        
        // Get most popular algorithm set by counting algorithms
        List<AlgorithmSet> sets = Arrays.asList(AlgorithmSet.values());
        AlgorithmSet mostPopularSet = sets.stream()
            .max((set1, set2) -> {
                Long count1 = algorithmRepository.countByAlgorithmSetForUser(set1, currentUser);
                Long count2 = algorithmRepository.countByAlgorithmSetForUser(set2, currentUser);
                return count1.compareTo(count2);
            })
            .orElse(AlgorithmSet.OLL);
        
        return new SearchStats(
            totalAlgorithms != null ? totalAlgorithms : 0,
            totalSets != null ? totalSets : 0,
            1L, // Current user count (simplified)
            0L, // Total searches (would need search tracking)
            mostPopularTag,
            mostPopularSet.name()
        );
    }

    // Get similar algorithms for recommendations
    public List<AlgorithmDto> getSimilarAlgorithms(UUID algorithmId, int limit) {
        User currentUser = getCurrentUser();
        Optional<Algorithm> algorithm = algorithmRepository.findById(algorithmId);
        
        if (algorithm.isPresent()) {
            Algorithm alg = algorithm.get();
            Pageable pageable = PageRequest.of(0, limit);
            List<Algorithm> similar = algorithmRepository.getSimilarAlgorithms(
                algorithmId, alg.getAlgorithmSet(), alg.getDifficulty(), currentUser, pageable);
            
            return similar.stream()
                .map(AlgorithmDto::fromEntity)
                .collect(Collectors.toList());
        }
        
        return List.of();
    }

    // Get most used tags
    public List<String> getMostUsedTags(int limit) {
        User currentUser = getCurrentUser();
        Pageable pageable = PageRequest.of(0, limit);
        List<Object[]> tagData = algorithmRepository.getMostUsedTags(currentUser, pageable);
        
        return tagData.stream()
            .map(data -> (String) data[0])
            .collect(Collectors.toList());
    }

    // Helper method to get current authenticated user
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && !authentication.getName().equals("anonymousUser")) {
            Optional<User> user = userRepository.findByUsernameIgnoreCase(authentication.getName());
            return user.orElse(null);
        }
        return null;
    }
}
