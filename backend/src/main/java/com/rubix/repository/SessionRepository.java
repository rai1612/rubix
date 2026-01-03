package com.rubix.repository;

import com.rubix.model.entity.Session;
import com.rubix.model.entity.Scramble;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SessionRepository extends JpaRepository<Session, UUID> {

    /**
     * Find session by ID and user ID
     */
    Optional<Session> findByIdAndUserId(UUID id, UUID userId);

    /**
     * Find user's sessions ordered by start time (newest first)
     */
    @Query(value = "SELECT * FROM sessions WHERE user_id = :userId ORDER BY started_at DESC LIMIT :limit", nativeQuery = true)
    List<Session> findByUserIdOrderByStartedAtDesc(@Param("userId") UUID userId, @Param("limit") int limit);

    /**
     * Find active session for user (most recent if multiple exist)
     */
    @Query(value = "SELECT * FROM sessions WHERE user_id = :userId AND is_active = true ORDER BY started_at DESC LIMIT 1", nativeQuery = true)
    Optional<Session> findActiveSessionByUser(@Param("userId") UUID userId);

    /**
     * Find all active sessions for user (for cleanup)
     */
    @Query("SELECT s FROM Session s WHERE s.user.id = :userId AND s.isActive = true")
    List<Session> findActiveSessionsByUser(@Param("userId") UUID userId);

    /**
     * Find sessions by puzzle type
     */
    List<Session> findByUserIdAndPuzzleTypeOrderByStartedAtDesc(UUID userId, Scramble.PuzzleType puzzleType);

    /**
     * Find sessions in date range
     */
    List<Session> findByUserIdAndStartedAtBetweenOrderByStartedAtDesc(UUID userId, Instant startDate, Instant endDate);

    /**
     * Count sessions by user
     */
    long countByUserId(UUID userId);

    /**
     * Count active sessions by user
     */
    long countByUserIdAndIsActive(UUID userId, Boolean isActive);

    /**
     * Find sessions with minimum solve count
     */
    @Query("SELECT s FROM Session s WHERE s.user.id = :userId AND s.solveCount >= :minSolves ORDER BY s.startedAt DESC")
    List<Session> findSessionsWithMinimumSolves(@Param("userId") UUID userId, @Param("minSolves") int minSolves);

    /**
     * Find recent sessions with solve counts
     */
    @Query("""
        SELECT s FROM Session s 
        WHERE s.user.id = :userId 
        ORDER BY s.startedAt DESC
        """)
    List<Session> findRecentSessionsWithSolves(@Param("userId") UUID userId);

    /**
     * Get session statistics
     */
    @Query("""
        SELECT 
            COUNT(s) as totalSessions,
            SUM(s.solveCount) as totalSolves,
            AVG(s.averageTimeMs) as averageTime,
            MIN(s.bestTimeMs) as bestTime
        FROM Session s 
        WHERE s.user.id = :userId 
        AND s.puzzleType = :puzzleType
        """)
    SessionStatistics getSessionStatistics(@Param("userId") UUID userId, @Param("puzzleType") Scramble.PuzzleType puzzleType);

    /**
     * Find sessions by name pattern
     */
    @Query("SELECT s FROM Session s WHERE s.user.id = :userId AND LOWER(s.name) LIKE LOWER(CONCAT('%', :namePattern, '%')) ORDER BY s.startedAt DESC")
    List<Session> findByUserIdAndNameContaining(@Param("userId") UUID userId, @Param("namePattern") String namePattern);

    /**
     * Find sessions with tags
     */
    @Query(value = "SELECT * FROM sessions WHERE user_id = :userId AND tags && :tags ORDER BY started_at DESC", nativeQuery = true)
    List<Session> findByUserIdAndTags(@Param("userId") UUID userId, @Param("tags") String[] tags);

    /**
     * Find long sessions (duration based)
     */
    @Query("""
        SELECT s FROM Session s 
        WHERE s.user.id = :userId 
        AND s.endedAt IS NOT NULL 
        AND (EXTRACT(EPOCH FROM s.endedAt) - EXTRACT(EPOCH FROM s.startedAt)) >= :minDurationSeconds
        ORDER BY s.startedAt DESC
        """)
    List<Session> findLongSessions(@Param("userId") UUID userId, @Param("minDurationSeconds") long minDurationSeconds);

    /**
     * Find sessions by solve count range
     */
    @Query("SELECT s FROM Session s WHERE s.user.id = :userId AND s.solveCount BETWEEN :minSolves AND :maxSolves ORDER BY s.startedAt DESC")
    List<Session> findByUserIdAndSolveCountBetween(@Param("userId") UUID userId, @Param("minSolves") int minSolves, @Param("maxSolves") int maxSolves);

    /**
     * Get today's sessions
     */
    @Query(value = """
        SELECT * FROM sessions 
        WHERE user_id = :userId 
        AND DATE(started_at) = CURRENT_DATE 
        ORDER BY started_at DESC
        """, nativeQuery = true)
    List<Session> findTodaysSessions(@Param("userId") UUID userId);

    /**
     * Get sessions from this week
     */
    @Query(value = """
        SELECT * FROM sessions 
        WHERE user_id = :userId 
        AND started_at >= DATE_TRUNC('week', CURRENT_DATE)
        ORDER BY started_at DESC
        """, nativeQuery = true)
    List<Session> findThisWeeksSessions(@Param("userId") UUID userId);

    /**
     * Find best session by average time
     */
    @Query("""
        SELECT s FROM Session s 
        WHERE s.user.id = :userId 
        AND s.puzzleType = :puzzleType 
        AND s.averageTimeMs IS NOT NULL 
        AND s.solveCount >= :minSolves
        ORDER BY s.averageTimeMs ASC
        """)
    Optional<Session> findBestSessionByAverage(@Param("userId") UUID userId, 
                                             @Param("puzzleType") Scramble.PuzzleType puzzleType, 
                                             @Param("minSolves") int minSolves);

    /**
     * Clean up old inactive sessions
     */
    @Query("DELETE FROM Session s WHERE s.isActive = false AND s.startedAt < :cutoffDate AND s.solveCount = 0")
    void deleteEmptyOldSessions(@Param("cutoffDate") Instant cutoffDate);


    // Interface for statistics projection
    interface SessionStatistics {
        Long getTotalSessions();
        Long getTotalSolves();
        Double getAverageTime();
        Integer getBestTime();
    }
}
