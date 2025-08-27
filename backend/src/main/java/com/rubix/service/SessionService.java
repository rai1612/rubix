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
     * Get current active session or create a new one
     */
    public Session getCurrentOrCreateSession(User user) {
        Optional<Session> activeSession = sessionRepository.findActiveSessionByUser(user.getId());
        
        if (activeSession.isPresent()) {
            return activeSession.get();
        } else {
            return createNewSession(user, null, Scramble.PuzzleType.CUBE_3X3);
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
     * End current active session
     */
    public void endCurrentSession(User user) {
        logger.debug("Ending current session for user: {}", user.getUsername());
        
        Optional<Session> activeSession = sessionRepository.findActiveSessionByUser(user.getId());
        if (activeSession.isPresent()) {
            Session session = activeSession.get();
            session.endSession();
            sessionRepository.save(session);
        }
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
     * Delete session
     */
    public void deleteSession(UUID sessionId, User user) {
        logger.info("Deleting session: {} for user: {}", sessionId, user.getUsername());

        Session session = sessionRepository.findByIdAndUserId(sessionId, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Session not found or not owned by user"));

        sessionRepository.delete(session);
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
        String timestamp = DateTimeFormatter.ofPattern("MMM dd, HH:mm")
                .format(Instant.now().atZone(java.time.ZoneId.systemDefault()));
        return "Practice Session - " + timestamp;
    }
}
