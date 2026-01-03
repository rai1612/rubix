package com.rubix.service;

import com.rubix.model.entity.*;
import com.rubix.repository.SolveRepository;
import com.rubix.repository.SessionRepository;
import com.rubix.repository.ScrambleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
@Transactional
public class SolveService {

    private static final Logger logger = LoggerFactory.getLogger(SolveService.class);

    private final SolveRepository solveRepository;
    private final SessionRepository sessionRepository;
    private final ScrambleRepository scrambleRepository;
    private final SessionService sessionService;
    
    @PersistenceContext
    private EntityManager entityManager;

    public SolveService(
            SolveRepository solveRepository,
            SessionRepository sessionRepository,
            ScrambleRepository scrambleRepository,
            SessionService sessionService) {
        this.solveRepository = solveRepository;
        this.sessionRepository = sessionRepository;
        this.scrambleRepository = scrambleRepository;
        this.sessionService = sessionService;
    }

    /**
     * Save a new solve
     */
    public Solve createSolve(User user, UUID scrambleId, Integer timeMs, Integer inspectionTimeMs, 
                           Solve.Penalty penalty, Instant solvedAt, String notes) {
        logger.info("Creating solve for user: {}, time: {}ms", user.getUsername(), timeMs);

        // Get or create current session (coordinated with frontend to prevent duplicates)
        Session currentSession = sessionService.getCurrentOrCreateSession(user);

        // Get scramble
        Scramble scramble = scrambleRepository.findById(scrambleId)
                .orElseThrow(() -> new IllegalArgumentException("Scramble not found: " + scrambleId));

        // Create solve
        Solve solve = new Solve(user, currentSession, scramble, timeMs, solvedAt);
        solve.setInspectionTimeMs(inspectionTimeMs != null ? inspectionTimeMs : 0);
        solve.setPenalty(penalty != null ? penalty : Solve.Penalty.NONE);
        solve.setNotes(notes);

        // Calculate TPS if possible
        if (scramble.getMoveCount() != null && timeMs > 0) {
            solve.setMoveCount(scramble.getMoveCount());
            solve.calculateTps();
        }

        Solve savedSolve = solveRepository.save(solve);
        logger.info("Solve saved with ID: {} for session: {}", savedSolve.getId(), currentSession.getId());

        // Update session statistics
        logger.info("Updating session statistics for session: {}", currentSession.getId());
        updateSessionStatistics(currentSession);
        logger.info("Session statistics update completed");

        return savedSolve;
    }

    /**
     * Update an existing solve
     */
    public Solve updateSolve(UUID solveId, User user, Integer timeMs, Solve.Penalty penalty, String notes) {
        logger.debug("Updating solve: {}", solveId);

        Solve solve = solveRepository.findById(solveId)
                .orElseThrow(() -> new IllegalArgumentException("Solve not found: " + solveId));

        // Check ownership
        if (!solve.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("User does not own this solve");
        }

        // Update fields
        if (timeMs != null) {
            solve.setTimeMs(timeMs);
        }
        if (penalty != null) {
            solve.setPenalty(penalty);
        }
        if (notes != null) {
            solve.setNotes(notes);
        }

        // Recalculate TPS if time changed
        if (timeMs != null && solve.getMoveCount() != null) {
            solve.calculateTps();
        }

        Solve savedSolve = solveRepository.save(solve);
        
        // Update session statistics when solve is modified (especially for penalty changes)
        Session session = solve.getSession();
        if (session != null) {
            logger.info("Updating session statistics after solve update for session: {}", session.getId());
            updateSessionStatistics(session);
            logger.info("Session statistics update completed after solve modification");
        }

        return savedSolve;
    }

    /**
     * Delete a solve
     */
    public void deleteSolve(UUID solveId, User user) {
        logger.info("Deleting solve: {} for user: {}", solveId, user.getUsername());

        Solve solve = solveRepository.findById(solveId)
                .orElseThrow(() -> new IllegalArgumentException("Solve not found: " + solveId));

        // Check ownership
        if (!solve.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("User does not own this solve");
        }

        solveRepository.delete(solve);
    }

    /**
     * Get solve by ID
     */
    @Transactional(readOnly = true)
    public Optional<Solve> getSolveById(UUID solveId, User user) {
        return solveRepository.findByIdAndUserId(solveId, user.getId());
    }

    /**
     * Get user's solves with pagination
     */
    @Transactional(readOnly = true)
    public Page<Solve> getUserSolves(User user, Pageable pageable) {
        return solveRepository.findByUserIdOrderBySolvedAtDesc(user.getId(), pageable);
    }

    /**
     * Get solves for a specific session
     */
    @Transactional(readOnly = true)
    public List<Solve> getSessionSolves(UUID sessionId, User user) {
        // Verify session ownership
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found: " + sessionId));

        if (!session.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("User does not own this session");
        }

        return solveRepository.findBySessionIdOrderBySolvedAtDesc(sessionId);
    }

    /**
     * Get recent solves
     */
    @Transactional(readOnly = true)
    public List<Solve> getRecentSolves(User user, int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        return solveRepository.findRecentSolvesByUser(user.getId(), pageable);
    }

    /**
     * Get solves in date range
     */
    @Transactional(readOnly = true)
    public List<Solve> getSolvesInDateRange(User user, Instant startDate, Instant endDate) {
        return solveRepository.findByUserIdAndSolvedAtBetweenOrderBySolvedAtDesc(
                user.getId(), startDate, endDate);
    }

    /**
     * Get today's solves
     */
    @Transactional(readOnly = true)
    public List<Solve> getTodaysSolves(User user) {
        Instant startOfDay = Instant.now().truncatedTo(ChronoUnit.DAYS);
        Instant endOfDay = startOfDay.plus(1, ChronoUnit.DAYS);
        return getSolvesInDateRange(user, startOfDay, endOfDay);
    }

    /**
     * Get personal best solve
     */
    @Transactional(readOnly = true)
    public Optional<Solve> getPersonalBest(User user, Scramble.PuzzleType puzzleType) {
        return solveRepository.findPersonalBest(user.getId(), puzzleType);
    }

    /**
     * Calculate current Ao5 (Average of 5)
     */
    @Transactional(readOnly = true)
    public OptionalDouble calculateCurrentAo5(User user, Scramble.PuzzleType puzzleType) {
        List<Solve> recentSolves = solveRepository.findRecentValidSolvesByUserAndPuzzleType(
                user.getId(), puzzleType.name(), 5);

        if (recentSolves.size() < 5) {
            return OptionalDouble.empty();
        }

        return calculateAverageOfX(recentSolves, 1); // Remove best and worst
    }

    /**
     * Calculate current Ao12 (Average of 12)
     */
    @Transactional(readOnly = true)
    public OptionalDouble calculateCurrentAo12(User user, Scramble.PuzzleType puzzleType) {
        List<Solve> recentSolves = solveRepository.findRecentValidSolvesByUserAndPuzzleType(
                user.getId(), puzzleType.name(), 12);

        if (recentSolves.size() < 12) {
            return OptionalDouble.empty();
        }

        return calculateAverageOfX(recentSolves, 1); // Remove best and worst
    }

    /**
     * Calculate current Ao100 (Average of 100)
     */
    @Transactional(readOnly = true)
    public OptionalDouble calculateCurrentAo100(User user, Scramble.PuzzleType puzzleType) {
        List<Solve> recentSolves = solveRepository.findRecentValidSolvesByUserAndPuzzleType(
                user.getId(), puzzleType.name(), 100);

        if (recentSolves.size() < 100) {
            return OptionalDouble.empty();
        }

        return calculateAverageOfX(recentSolves, 5); // Remove 5 best and 5 worst
    }

    /**
     * Calculate session-specific Ao5 (Average of 5)
     */
    @Transactional(readOnly = true)
    public OptionalDouble calculateSessionAo5(UUID sessionId, User user) {
        // Verify session ownership first
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found: " + sessionId));

        if (!session.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("User does not own this session");
        }
        
        List<Solve> sessionSolves = solveRepository.findBySessionIdOrderBySolvedAtDesc(sessionId);
        
        // Filter to valid solves only and take last 5
        List<Solve> recentValidSolves = sessionSolves.stream()
                .filter(solve -> solve.getPenalty() != Solve.Penalty.DNF)
                .limit(5)
                .toList();

        if (recentValidSolves.size() < 5) {
            return OptionalDouble.empty();
        }

        return calculateAverageOfX(recentValidSolves, 1); // Remove best and worst
    }

    /**
     * Calculate session-specific Ao12 (Average of 12)
     */
    @Transactional(readOnly = true)
    public OptionalDouble calculateSessionAo12(UUID sessionId, User user) {
        // Verify session ownership first
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found: " + sessionId));

        if (!session.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("User does not own this session");
        }
        
        List<Solve> sessionSolves = solveRepository.findBySessionIdOrderBySolvedAtDesc(sessionId);
        
        // Filter to valid solves only and take last 12
        List<Solve> recentValidSolves = sessionSolves.stream()
                .filter(solve -> solve.getPenalty() != Solve.Penalty.DNF)
                .limit(12)
                .toList();

        if (recentValidSolves.size() < 12) {
            return OptionalDouble.empty();
        }

        return calculateAverageOfX(recentValidSolves, 1); // Remove best and worst
    }

    /**
     * Calculate session-specific Ao100 (Average of 100)
     */
    @Transactional(readOnly = true)
    public OptionalDouble calculateSessionAo100(UUID sessionId, User user) {
        // Verify session ownership first
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found: " + sessionId));

        if (!session.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("User does not own this session");
        }
        
        List<Solve> sessionSolves = solveRepository.findBySessionIdOrderBySolvedAtDesc(sessionId);
        
        // Filter to valid solves only and take last 100
        List<Solve> recentValidSolves = sessionSolves.stream()
                .filter(solve -> solve.getPenalty() != Solve.Penalty.DNF)
                .limit(100)
                .toList();

        if (recentValidSolves.size() < 100) {
            return OptionalDouble.empty();
        }

        return calculateAverageOfX(recentValidSolves, 5); // Remove 5 best and 5 worst
    }

    /**
     * Get solve count for user
     */
    @Transactional(readOnly = true)
    public long getSolveCount(User user) {
        return solveRepository.countByUserId(user.getId());
    }

    /**
     * Get solve count for puzzle type
     */
    @Transactional(readOnly = true)
    public long getSolveCount(User user, Scramble.PuzzleType puzzleType) {
        return solveRepository.countByUserIdAndScramblePuzzleType(user.getId(), puzzleType);
    }

    /**
     * Calculate time distribution statistics
     */
    @Transactional(readOnly = true)
    public com.rubix.controller.SolveController.TimeDistribution calculateTimeDistribution(User user, Scramble.PuzzleType puzzleType) {
        logger.debug("Calculating time distribution for user: {}, puzzle type: {}", user.getUsername(), puzzleType);
        
        com.rubix.controller.SolveController.TimeDistribution distribution = new com.rubix.controller.SolveController.TimeDistribution();
        
        // Get all solves for the user and puzzle type
        List<Solve> allSolves = solveRepository.findByUserIdAndPuzzleType(user.getId(), puzzleType);
        
        distribution.totalCount = (long) allSolves.size();
        distribution.dnfCount = allSolves.stream()
                .filter(solve -> solve.getPenalty() == Solve.Penalty.DNF)
                .count();
        distribution.plusTwoCount = allSolves.stream()
                .filter(solve -> solve.getPenalty() == Solve.Penalty.PLUS_TWO)
                .count();
        
        // Count valid solves by time ranges
        List<Solve> validSolves = allSolves.stream()
                .filter(solve -> solve.getPenalty() != Solve.Penalty.DNF)
                .toList();
        
        distribution.sub10Count = validSolves.stream()
                .filter(solve -> solve.getAdjustedTimeMs() < 10000)
                .count();
        distribution.sub15Count = validSolves.stream()
                .filter(solve -> solve.getAdjustedTimeMs() < 15000)
                .count();
        distribution.sub20Count = validSolves.stream()
                .filter(solve -> solve.getAdjustedTimeMs() < 20000)
                .count();
        distribution.sub30Count = validSolves.stream()
                .filter(solve -> solve.getAdjustedTimeMs() < 30000)
                .count();
        distribution.sub60Count = validSolves.stream()
                .filter(solve -> solve.getAdjustedTimeMs() < 60000)
                .count();
        distribution.plus60Count = validSolves.stream()
                .filter(solve -> solve.getAdjustedTimeMs() >= 60000)
                .count();
        
        logger.debug("Time distribution calculated: total={}, sub10={}, sub15={}, sub20={}, dnf={}", 
                distribution.totalCount, distribution.sub10Count, distribution.sub15Count, 
                distribution.sub20Count, distribution.dnfCount);
        
        return distribution;
    }

    /**
     * Calculate session statistics
     */
    @Transactional(readOnly = true)
    public SessionStats calculateSessionStats(UUID sessionId, User user) {
        List<Solve> solves = getSessionSolves(sessionId, user);
        return calculateSessionStats(solves);
    }

    // Helper methods

    private OptionalDouble calculateAverageOfX(List<Solve> solves, int removeCount) {
        if (solves.size() < removeCount * 2 + 1) {
            return OptionalDouble.empty();
        }

        // Count DNFs
        long dnfCount = solves.stream()
                .filter(solve -> solve.getPenalty() == Solve.Penalty.DNF)
                .count();

        // If more than removeCount DNFs, average is DNF (empty)
        if (dnfCount > removeCount) {
            return OptionalDouble.empty();
        }

        // Sort by adjusted time (DNFs go to end)
        List<Solve> sortedSolves = solves.stream()
                .sorted((a, b) -> {
                    if (a.getPenalty() == Solve.Penalty.DNF && b.getPenalty() == Solve.Penalty.DNF) {
                        return 0;
                    }
                    if (a.getPenalty() == Solve.Penalty.DNF) {
                        return 1;
                    }
                    if (b.getPenalty() == Solve.Penalty.DNF) {
                        return -1;
                    }
                    return Integer.compare(a.getAdjustedTimeMs(), b.getAdjustedTimeMs());
                })
                .toList();

        // Remove best and worst times
        List<Solve> middleSolves = sortedSolves.subList(removeCount, sortedSolves.size() - removeCount);

        // Calculate average of remaining times
        double average = middleSolves.stream()
                .filter(solve -> solve.getPenalty() != Solve.Penalty.DNF)
                .mapToInt(Solve::getAdjustedTimeMs)
                .average()
                .orElse(0.0);

        return OptionalDouble.of(average);
    }

    private SessionStats calculateSessionStats(List<Solve> solves) {
        if (solves.isEmpty()) {
            return new SessionStats();
        }

        // Filter valid solves (non-DNF)
        List<Solve> validSolves = solves.stream()
                .filter(solve -> solve.getPenalty() != Solve.Penalty.DNF)
                .toList();

        SessionStats stats = new SessionStats();
        stats.totalSolves = solves.size();
        stats.validSolves = validSolves.size();
        stats.dnfCount = solves.size() - validSolves.size();

        if (!validSolves.isEmpty()) {
            stats.bestTime = validSolves.stream()
                    .mapToInt(Solve::getAdjustedTimeMs)
                    .min()
                    .orElse(0);

            stats.worstTime = validSolves.stream()
                    .mapToInt(Solve::getAdjustedTimeMs)
                    .max()
                    .orElse(0);

            stats.averageTime = validSolves.stream()
                    .mapToInt(Solve::getAdjustedTimeMs)
                    .average()
                    .orElse(0.0);

            stats.totalTime = validSolves.stream()
                    .mapToLong(Solve::getAdjustedTimeMs)
                    .sum();
        }

        return stats;
    }

    /**
     * Update session statistics based on current solves
     */
    private void updateSessionStatistics(Session session) {
        logger.info("Starting session statistics update for session: {}", session.getId());
        
        List<Solve> sessionSolves = solveRepository.findBySessionIdOrderBySolvedAtDesc(session.getId());
        
        // Calculate statistics
        int totalSolves = sessionSolves.size();
        logger.info("Found {} solves for session {}", totalSolves, session.getId());
        
        List<Solve> validSolves = sessionSolves.stream()
                .filter(solve -> solve.getPenalty() != Solve.Penalty.DNF)
                .toList();
        
        logger.info("Found {} valid (non-DNF) solves", validSolves.size());
        session.setSolveCount(totalSolves);
        
        if (!validSolves.isEmpty()) {
            // Calculate total time (sum of valid solves)
            long totalTimeMs = validSolves.stream()
                    .mapToLong(Solve::getAdjustedTimeMs)
                    .sum();
            session.setTotalTimeMs(totalTimeMs);
            
            // Calculate best time
            int bestTimeMs = validSolves.stream()
                    .mapToInt(Solve::getAdjustedTimeMs)
                    .min()
                    .orElse(0);
            session.setBestTimeMs(bestTimeMs);
            
            // Calculate worst time
            int worstTimeMs = validSolves.stream()
                    .mapToInt(Solve::getAdjustedTimeMs)
                    .max()
                    .orElse(0);
            session.setWorstTimeMs(worstTimeMs);
            
            // Calculate average time
            double avgTime = validSolves.stream()
                    .mapToInt(Solve::getAdjustedTimeMs)
                    .average()
                    .orElse(0.0);
            session.setAverageTimeMs((int) Math.round(avgTime));
        } else {
            // No valid solves
            session.setTotalTimeMs(0L);
            session.setBestTimeMs(null);
            session.setWorstTimeMs(null);
            session.setAverageTimeMs(null);
        }
        
        // Save updated session
        Session savedSession = sessionRepository.save(session);
        
        // Force flush to ensure session update is immediately visible to subsequent queries
        entityManager.flush();
        
        logger.info("Session statistics saved: solves={}, avg={}ms, best={}ms", 
                    savedSession.getSolveCount(), savedSession.getAverageTimeMs(), savedSession.getBestTimeMs());
    }

    // Inner class for session statistics
    public static class SessionStats {
        public int totalSolves = 0;
        public int validSolves = 0;
        public int dnfCount = 0;
        public int bestTime = 0;
        public int worstTime = 0;
        public double averageTime = 0.0;
        public long totalTime = 0L;
    }
}
