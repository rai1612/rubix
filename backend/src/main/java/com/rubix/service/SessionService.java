package com.rubix.service;

import com.rubix.model.entity.Session;
import com.rubix.model.entity.User;
import com.rubix.model.entity.Scramble;
import com.rubix.repository.SessionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class SessionService {

    private static final Logger logger = LoggerFactory.getLogger(SessionService.class);

    private final SessionRepository sessionRepository;

    public SessionService(SessionRepository sessionRepository) {
        this.sessionRepository = sessionRepository;
    }

    /**
     * Get current active session (returns Optional, doesn't auto-create)
     */
    public Optional<Session> getCurrentSession(User user) {
        return sessionRepository.findActiveSessionByUser(user.getId());
    }

    /**
     * Get current active session or ensure default session exists
     */
    public Session getCurrentOrCreateSession(User user) {
        Optional<Session> activeSession = getCurrentSession(user);
        
        if (activeSession.isPresent()) {
            return activeSession.get();
        } else {
            return ensureDefaultSession(user);
        }
    }

    /**
     * Ensure user has at least one session (creates default if none exist)
     */
    public Session ensureDefaultSession(User user) {
        logger.info("Ensuring default session exists for user: {}", user.getUsername());
        
        // Check if user has any sessions at all
        List<Session> allUserSessions = sessionRepository.findByUserIdOrderByStartedAtDesc(user.getId(), 1);
        
        if (allUserSessions.isEmpty()) {
            // Create first default session
            logger.info("Creating first default session for user: {}", user.getUsername());
            return createNewSession(user, "Default Session", Scramble.PuzzleType.CUBE_3X3);
        } else {
            // Activate the most recent session
            Session mostRecent = allUserSessions.get(0);
            if (!mostRecent.getIsActive()) {
                logger.info("Activating most recent session: {} for user: {}", mostRecent.getId(), user.getUsername());
                mostRecent.setIsActive(true);
                return sessionRepository.save(mostRecent);
            }
            return mostRecent;
        }
    }

    /**
     * Create a new session
     */
    public Session createNewSession(User user, String name, Scramble.PuzzleType puzzleType) {
        logger.info("Creating new session for user: {}", user.getUsername());

        // End any currently active sessions
        endActiveSessionsForUser(user);

        // Generate default name if not provided
        if (name == null || name.trim().isEmpty()) {
            name = generateDefaultSessionName();
        }

        Session session = new Session(user, name, puzzleType);
        return sessionRepository.save(session);
    }

    /**
     * End current active session and automatically create a new one
     */
    public Session endCurrentSession(User user) {
        logger.info("Ending current session and creating new session for user: {}", user.getUsername());
        
        Optional<Session> activeSession = sessionRepository.findActiveSessionByUser(user.getId());
        if (activeSession.isPresent()) {
            Session session = activeSession.get();
            session.endSession();
            sessionRepository.save(session);
            logger.info("Ended session: {} for user: {}", session.getId(), user.getUsername());
        }
        
        // Automatically create a new session
        String newSessionName = generateDefaultSessionName();
        Session newSession = createNewSession(user, newSessionName, Scramble.PuzzleType.CUBE_3X3);
        logger.info("Auto-created new session: {} for user: {}", newSession.getId(), user.getUsername());
        
        return newSession;
    }

    /**
     * Get session by ID
     */
    @Transactional(readOnly = true)
    public Optional<Session> getSessionById(UUID sessionId, User user) {
        return sessionRepository.findByIdAndUserId(sessionId, user.getId());
    }

    /**
     * Get user's sessions
     */
    @Transactional(readOnly = true)
    public List<Session> getUserSessions(User user, int limit) {
        return sessionRepository.findByUserIdOrderByStartedAtDesc(user.getId(), limit);
    }

    /**
     * Get active session for user
     */
    @Transactional(readOnly = true)
    public Optional<Session> getActiveSession(User user) {
        return sessionRepository.findActiveSessionByUser(user.getId());
    }

    /**
     * Update session
     */
    public Session updateSession(UUID sessionId, User user, String name, String notes) {
        logger.debug("Updating session: {}", sessionId);

        Session session = sessionRepository.findByIdAndUserId(sessionId, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Session not found or not owned by user"));

        if (name != null) {
            session.setName(name);
        }
        if (notes != null) {
            session.setNotes(notes);
        }

        return sessionRepository.save(session);
    }

    /**
     * Delete session and all its associated data
     */
    public void deleteSession(UUID sessionId, User user) {
        logger.info("Deleting session: {} for user: {}", sessionId, user.getUsername());

        Session session = sessionRepository.findByIdAndUserId(sessionId, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Session not found or not owned by user"));

        // Prevent deletion of active session
        if (session.getIsActive()) {
            throw new IllegalStateException("Cannot delete active session. Please end the session first.");
        }

        // Prevent deletion of the last session
        List<Session> allUserSessions = sessionRepository.findByUserIdOrderByStartedAtDesc(user.getId(), Integer.MAX_VALUE);
        if (allUserSessions.size() <= 1) {
            throw new IllegalStateException("Cannot delete the last session. At least one session must exist.");
        }

        // Delete session (cascading deletes will handle associated solves)
        sessionRepository.delete(session);
        
        logger.info("Session {} deleted successfully", sessionId);
    }

    /**
     * Switch to existing session (make it active)
     */
    public Session switchToSession(UUID sessionId, User user) {
        logger.debug("Switching to session: {} for user: {}", sessionId, user.getUsername());

        // End current active sessions
        endActiveSessionsForUser(user);

        // Activate the target session
        Session session = sessionRepository.findByIdAndUserId(sessionId, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Session not found or not owned by user"));

        session.setIsActive(true);
        return sessionRepository.save(session);
    }

    // Helper methods

    private void endActiveSessionsForUser(User user) {
        List<Session> activeSessions = sessionRepository.findActiveSessionsByUser(user.getId());
        for (Session session : activeSessions) {
            session.endSession();
        }
        if (!activeSessions.isEmpty()) {
            sessionRepository.saveAll(activeSessions);
        }
    }

    private String generateDefaultSessionName() {
        Instant now = Instant.now();
        java.time.ZonedDateTime zonedNow = now.atZone(java.time.ZoneId.systemDefault());
        int hour = zonedNow.getHour();
        
        // Generate smart session names like frontend
        String sessionType;
        if (hour >= 5 && hour < 12) {
            sessionType = "Morning Practice";
        } else if (hour >= 12 && hour < 17) {
            sessionType = "Afternoon Session";
        } else if (hour >= 17 && hour < 21) {
            sessionType = "Evening Practice";
        } else {
            sessionType = "Late Night Session";
        }
        
        String dayName = zonedNow.format(DateTimeFormatter.ofPattern("EEEE"));
        String timeStr = zonedNow.format(DateTimeFormatter.ofPattern("h:mm a"));
        
        return String.format("%s - %s %s", sessionType, dayName, timeStr);
    }
}
