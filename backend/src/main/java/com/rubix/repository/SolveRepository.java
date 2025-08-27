package com.rubix.repository;

import com.rubix.model.entity.Scramble;
import com.rubix.model.entity.Solve;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SolveRepository extends JpaRepository<Solve, UUID> {

    /**
     * Find solve by ID and user ID
     */
    Optional<Solve> findByIdAndUserId(UUID id, UUID userId);

    /**
     * Find user's solves ordered by solve time (newest first)
     */
    Page<Solve> findByUserIdOrderBySolvedAtDesc(UUID userId, Pageable pageable);

    /**
     * Find solves for a specific session
     */
    List<Solve> findBySessionIdOrderBySolvedAtDesc(UUID sessionId);

    /**
     * Find solves in date range
     */
    List<Solve> findByUserIdAndSolvedAtBetweenOrderBySolvedAtDesc(UUID userId, Instant startDate, Instant endDate);

    /**
     * Count solves by user
     */
    long countByUserId(UUID userId);

    /**
     * Count solves by user and puzzle type
     */
    @Query("SELECT COUNT(s) FROM Solve s WHERE s.user.id = :userId AND s.scramble.puzzleType = :puzzleType")
    long countByUserIdAndScramblePuzzleType(@Param("userId") UUID userId, @Param("puzzleType") Scramble.PuzzleType puzzleType);

    /**
     * Find recent solves by user (limited)
     */
    @Query(value = "SELECT * FROM solves WHERE user_id = :userId ORDER BY solved_at DESC LIMIT :limit", nativeQuery = true)
    List<Solve> findRecentSolvesByUser(@Param("userId") UUID userId, @Param("limit") int limit);

    /**
     * Find recent valid solves (non-DNF) by user and puzzle type
     */
    @Query(value = """
        SELECT s.* FROM solves s 
        JOIN scrambles sc ON s.scramble_id = sc.id
        WHERE s.user_id = :userId 
        AND sc.puzzle_type = :puzzleType 
        AND s.penalty != 'DNF' 
        ORDER BY s.solved_at DESC
        LIMIT :limit
        """, nativeQuery = true)
    List<Solve> findRecentValidSolvesByUserAndPuzzleType(@Param("userId") UUID userId, 
                                                        @Param("puzzleType") String puzzleType, 
                                                        @Param("limit") int limit);

    /**
     * Find personal best solve (fastest valid time)
     */
    @Query("""
        SELECT s FROM Solve s 
        WHERE s.user.id = :userId 
        AND s.scramble.puzzleType = :puzzleType 
        AND s.penalty != 'DNF' 
        ORDER BY s.adjustedTimeMs ASC 
        LIMIT 1
        """)
    Optional<Solve> findPersonalBest(@Param("userId") UUID userId, @Param("puzzleType") Scramble.PuzzleType puzzleType);

    /**
     * Find solves by puzzle type for user
     */
    @Query("SELECT s FROM Solve s WHERE s.user.id = :userId AND s.scramble.puzzleType = :puzzleType ORDER BY s.solvedAt DESC")
    List<Solve> findByUserIdAndPuzzleType(@Param("userId") UUID userId, @Param("puzzleType") Scramble.PuzzleType puzzleType);

    /**
     * Find best times for user by puzzle type
     */
    @Query("""
        SELECT s FROM Solve s 
        WHERE s.user.id = :userId 
        AND s.scramble.puzzleType = :puzzleType 
        AND s.penalty != 'DNF' 
        ORDER BY s.adjustedTimeMs ASC
        """)
    List<Solve> findBestTimesByUserAndPuzzleType(@Param("userId") UUID userId, 
                                                @Param("puzzleType") Scramble.PuzzleType puzzleType, 
                                                Pageable pageable);

    /**
     * Find solves with specific penalty
     */
    List<Solve> findByUserIdAndPenaltyOrderBySolvedAtDesc(UUID userId, Solve.Penalty penalty);

    /**
     * Find solves in session with valid times only
     */
    @Query("SELECT s FROM Solve s WHERE s.session.id = :sessionId AND s.penalty != 'DNF' ORDER BY s.solvedAt ASC")
    List<Solve> findValidSolvesBySession(@Param("sessionId") UUID sessionId);

    /**
     * Get statistics for time ranges
     */
    @Query("""
        SELECT 
            COUNT(s) as total,
            COUNT(CASE WHEN s.penalty != 'DNF' THEN 1 END) as valid,
            MIN(CASE WHEN s.penalty != 'DNF' THEN s.adjustedTimeMs END) as best,
            MAX(CASE WHEN s.penalty != 'DNF' THEN s.adjustedTimeMs END) as worst,
            AVG(CASE WHEN s.penalty != 'DNF' THEN s.adjustedTimeMs END) as average
        FROM Solve s 
        WHERE s.user.id = :userId 
        AND s.scramble.puzzleType = :puzzleType
        AND s.solvedAt BETWEEN :startDate AND :endDate
        """)
    SolveStatistics getStatisticsInRange(@Param("userId") UUID userId, 
                                       @Param("puzzleType") Scramble.PuzzleType puzzleType,
                                       @Param("startDate") Instant startDate, 
                                       @Param("endDate") Instant endDate);

    /**
     * Find solves by tags
     */
    @Query(value = "SELECT * FROM solves WHERE user_id = :userId AND tags && :tags ORDER BY solved_at DESC", nativeQuery = true)
    List<Solve> findByUserIdAndTags(@Param("userId") UUID userId, @Param("tags") String[] tags);

    /**
     * Find recent sessions with solve counts
     */
    @Query("""
        SELECT s.session.id, COUNT(s) as solveCount 
        FROM Solve s 
        WHERE s.user.id = :userId 
        GROUP BY s.session.id 
        ORDER BY MAX(s.solvedAt) DESC
        """)
    List<Object[]> findRecentSessionsWithCounts(@Param("userId") UUID userId, Pageable pageable);

    /**
     * Get daily solve counts for date range
     */
    @Query(value = """
        SELECT DATE(solved_at) as solve_date, COUNT(*) as solve_count
        FROM solves 
        WHERE user_id = :userId 
        AND solved_at BETWEEN :startDate AND :endDate
        GROUP BY DATE(solved_at)
        ORDER BY solve_date DESC
        """, nativeQuery = true)
    List<Object[]> getDailySolveCounts(@Param("userId") UUID userId, 
                                     @Param("startDate") Instant startDate, 
                                     @Param("endDate") Instant endDate);

    /**
     * Find solves with timing breakdown data
     */
    @Query("""
        SELECT s FROM Solve s 
        WHERE s.user.id = :userId 
        AND (s.crossTimeMs IS NOT NULL OR s.f2lTimeMs IS NOT NULL OR s.ollTimeMs IS NOT NULL OR s.pllTimeMs IS NOT NULL)
        ORDER BY s.solvedAt DESC
        """)
    List<Solve> findSolvesWithTimingBreakdown(@Param("userId") UUID userId);

    /**
     * Get average TPS for user
     */
    @Query("SELECT AVG(s.tps) FROM Solve s WHERE s.user.id = :userId AND s.tps IS NOT NULL")
    Optional<Double> getAverageTps(@Param("userId") UUID userId);

    /**
     * Find solves by scramble
     */
    List<Solve> findByScrambleIdOrderBySolvedAtDesc(UUID scrambleId);

    /**
     * Count DNF solves for user
     */
    long countByUserIdAndPenalty(UUID userId, Solve.Penalty penalty);

    /**
     * Find sub-X times
     */
    @Query("""
        SELECT s FROM Solve s 
        WHERE s.user.id = :userId 
        AND s.scramble.puzzleType = :puzzleType 
        AND s.penalty != 'DNF' 
        AND s.adjustedTimeMs < :timeThresholdMs 
        ORDER BY s.adjustedTimeMs ASC
        """)
    List<Solve> findSubXTimes(@Param("userId") UUID userId, 
                             @Param("puzzleType") Scramble.PuzzleType puzzleType, 
                             @Param("timeThresholdMs") int timeThresholdMs);

    // Interface for statistics projection
    interface SolveStatistics {
        Long getTotal();
        Long getValid();
        Integer getBest();
        Integer getWorst();
        Double getAverage();
    }
}
