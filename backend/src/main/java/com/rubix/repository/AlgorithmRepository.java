package com.rubix.repository;

import com.rubix.model.entity.Algorithm;
import com.rubix.model.entity.Algorithm.AlgorithmSet;
import com.rubix.model.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AlgorithmRepository extends JpaRepository<Algorithm, UUID> {

    // Find public algorithms
    List<Algorithm> findByIsPublicTrueOrderByAlgorithmSetAscCaseNumberAsc();
    
    // Find user's personal algorithms
    List<Algorithm> findByUserOrderByAlgorithmSetAscCaseNumberAsc(User user);
    
    // Find user's favorite algorithms
    List<Algorithm> findByUserAndIsFavoriteTrueOrderByAlgorithmSetAscCaseNumberAsc(User user);
    
    // Find by algorithm set
    List<Algorithm> findByAlgorithmSetAndIsPublicTrueOrderByCaseNumberAsc(AlgorithmSet algorithmSet);
    
    // Find user's algorithms by set
    List<Algorithm> findByUserAndAlgorithmSetOrderByCaseNumberAsc(User user, AlgorithmSet algorithmSet);
    
    // Search algorithms by name or description
    @Query("SELECT a FROM Algorithm a WHERE " +
           "(a.isPublic = true OR a.user = :user) AND " +
           "(LOWER(a.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(a.caseDescription) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(a.notationString) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Algorithm> searchAlgorithms(@Param("query") String query, @Param("user") User user, Pageable pageable);
    
    // Search with algorithm set filter
    @Query("SELECT a FROM Algorithm a WHERE " +
           "(a.isPublic = true OR a.user = :user) AND " +
           "a.algorithmSet = :algorithmSet AND " +
           "(LOWER(a.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(a.caseDescription) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Algorithm> searchAlgorithmsBySet(@Param("query") String query, 
                                        @Param("algorithmSet") AlgorithmSet algorithmSet,
                                        @Param("user") User user, 
                                        Pageable pageable);
    
    // Get popular algorithms (most used)
    @Query("SELECT a FROM Algorithm a WHERE a.isPublic = true ORDER BY a.usageCount DESC")
    List<Algorithm> findPopularAlgorithms(Pageable pageable);
    
    // Get algorithms by difficulty
    List<Algorithm> findByDifficultyAndIsPublicTrueOrderByAlgorithmSetAscCaseNumberAsc(Integer difficulty);
    
    // Get algorithm by set and case number
    Optional<Algorithm> findByAlgorithmSetAndCaseNumberAndIsPublicTrue(AlgorithmSet algorithmSet, Integer caseNumber);
    
    // Count algorithms by set for a user (including public)
    @Query("SELECT COUNT(a) FROM Algorithm a WHERE " +
           "(a.isPublic = true OR a.user = :user) AND a.algorithmSet = :algorithmSet")
    Long countByAlgorithmSetForUser(@Param("algorithmSet") AlgorithmSet algorithmSet, @Param("user") User user);
    
    // Count user's learned algorithms by set (algorithms with usage > 0)
    @Query("SELECT COUNT(a) FROM Algorithm a WHERE " +
           "(a.isPublic = true OR a.user = :user) AND " +
           "a.algorithmSet = :algorithmSet AND a.usageCount > 0")
    Long countLearnedByAlgorithmSetForUser(@Param("algorithmSet") AlgorithmSet algorithmSet, @Param("user") User user);
    
    // Statistics for algorithm sets
    @Query("SELECT a.algorithmSet, COUNT(a), AVG(a.difficulty), AVG(a.moveCount) " +
           "FROM Algorithm a WHERE a.isPublic = true " +
           "GROUP BY a.algorithmSet ORDER BY a.algorithmSet")
    List<Object[]> getAlgorithmSetStatistics();
    
    // Get user's algorithm learning progress
    @Query("SELECT a.algorithmSet, " +
           "COUNT(a) as total, " +
           "SUM(CASE WHEN a.usageCount > 0 THEN 1 ELSE 0 END) as learned " +
           "FROM Algorithm a WHERE (a.isPublic = true OR a.user = :user) " +
           "GROUP BY a.algorithmSet ORDER BY a.algorithmSet")
    List<Object[]> getUserAlgorithmProgress(@Param("user") User user);

    // Advanced search with multiple filters and sorting (tags search handled separately)
    @Query("SELECT a FROM Algorithm a WHERE " +
           "(a.isPublic = true OR a.user = :user) AND " +
           "(:query = '' OR " +
           "LOWER(a.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(a.caseDescription) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(a.notationString) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
           "(:algorithmSet IS NULL OR a.algorithmSet = :algorithmSet) AND " +
           "(:difficulty IS NULL OR a.difficulty = :difficulty) AND " +
           "(:favoriteOnly = false OR a.isFavorite = true) AND " +
           "(:minMoveCount IS NULL OR a.moveCount >= :minMoveCount) AND " +
           "(:maxMoveCount IS NULL OR a.moveCount <= :maxMoveCount)")
    Page<Algorithm> searchAlgorithmsAdvanced(@Param("query") String query,
                                           @Param("algorithmSet") AlgorithmSet algorithmSet,
                                           @Param("difficulty") Integer difficulty,
                                           @Param("favoriteOnly") boolean favoriteOnly,
                                           @Param("minMoveCount") Integer minMoveCount,
                                           @Param("maxMoveCount") Integer maxMoveCount,
                                           @Param("user") User user,
                                           Pageable pageable);

    // Get search suggestions based on algorithm names and descriptions
    @Query("SELECT DISTINCT a.name FROM Algorithm a WHERE " +
           "(a.isPublic = true OR a.user = :user) AND " +
           "LOWER(a.name) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "ORDER BY a.name")
    List<String> getNameSuggestions(@Param("query") String query, @Param("user") User user, Pageable pageable);

    // Get tag suggestions using native query for PostgreSQL array support
    @Query(value = "SELECT DISTINCT tag FROM algorithms a " +
           "CROSS JOIN unnest(a.tags) as tag " +
           "WHERE (a.is_public = true OR a.user_id = :#{#user?.id}) AND " +
           "LOWER(tag) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "ORDER BY tag LIMIT :#{#pageable.pageSize}", 
           nativeQuery = true)
    List<String> getTagSuggestions(@Param("query") String query, @Param("user") User user, Pageable pageable);

    // Get case description suggestions
    @Query("SELECT DISTINCT a.caseDescription FROM Algorithm a WHERE " +
           "(a.isPublic = true OR a.user = :user) AND " +
           "a.caseDescription IS NOT NULL AND " +
           "LOWER(a.caseDescription) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "ORDER BY a.caseDescription")
    List<String> getCaseDescriptionSuggestions(@Param("query") String query, @Param("user") User user, Pageable pageable);

    // Get algorithms with similar characteristics (for recommendations)
    @Query("SELECT a FROM Algorithm a WHERE " +
           "(a.isPublic = true OR a.user = :user) AND " +
           "a.id != :excludeId AND " +
           "(a.algorithmSet = :algorithmSet OR a.difficulty = :difficulty) " +
           "ORDER BY a.usageCount DESC")
    List<Algorithm> getSimilarAlgorithms(@Param("excludeId") UUID excludeId,
                                       @Param("algorithmSet") AlgorithmSet algorithmSet,
                                       @Param("difficulty") Integer difficulty,
                                       @Param("user") User user,
                                       Pageable pageable);

    // Get most used tags using native query for PostgreSQL array support
    @Query(value = "SELECT tag, COUNT(tag) as usage FROM algorithms a " +
           "CROSS JOIN unnest(a.tags) as tag " +
           "WHERE (a.is_public = true OR a.user_id = :#{#user?.id}) " +
           "GROUP BY tag ORDER BY usage DESC LIMIT :#{#pageable.pageSize}", 
           nativeQuery = true)
    List<Object[]> getMostUsedTags(@Param("user") User user, Pageable pageable);

    // Get search statistics
    @Query("SELECT COUNT(a) FROM Algorithm a WHERE a.isPublic = true OR a.user = :user")
    Long getTotalAlgorithmsForUser(@Param("user") User user);

    @Query("SELECT COUNT(DISTINCT a.algorithmSet) FROM Algorithm a WHERE a.isPublic = true OR a.user = :user")
    Long getTotalSetsForUser(@Param("user") User user);

}
