package com.rubix.controller;

import com.rubix.model.dto.SessionDto;
import com.rubix.model.entity.Session;
import com.rubix.model.entity.User;
import com.rubix.service.SessionService;
import com.rubix.service.UserService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/sessions")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class SessionController {

    private static final Logger logger = LoggerFactory.getLogger(SessionController.class);

    private final SessionService sessionService;
    private final UserService userService;

    public SessionController(SessionService sessionService, UserService userService) {
        this.sessionService = sessionService;
        this.userService = userService;
    }

    /**
     * Get current active session
     * GET /api/sessions/current
     */
    @GetMapping("/current")
    public ResponseEntity<SessionDto> getCurrentSession(Authentication authentication) {
        logger.debug("Fetching current session for user: {}", authentication.getName());
        
        try {
            User user = userService.getCurrentUser(authentication);
            
            return sessionService.getActiveSession(user)
                    .map(session -> ResponseEntity.ok(SessionDto.fromEntity(session)))
                    .orElse(ResponseEntity.notFound().build());
                    
        } catch (Exception e) {
            logger.error("Error fetching current session", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get current session or create new one
     * GET /api/sessions/current-or-create
     */
    @GetMapping("/current-or-create")
    public ResponseEntity<SessionDto> getCurrentOrCreateSession(Authentication authentication) {
        logger.debug("Getting or creating current session for user: {}", authentication.getName());
        
        try {
            User user = userService.getCurrentUser(authentication);
            Session session = sessionService.getCurrentOrCreateSession(user);
            return ResponseEntity.ok(SessionDto.fromEntity(session));
            
        } catch (Exception e) {
            logger.error("Error getting or creating current session", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get user's sessions
     * GET /api/sessions?limit=10
     */
    @GetMapping
    public ResponseEntity<List<SessionDto>> getUserSessions(
            @RequestParam(value = "limit", defaultValue = "10") int limit,
            Authentication authentication) {
        
        logger.debug("Fetching user sessions: limit={}", limit);
        
        try {
            // Validate limit
            if (limit < 1 || limit > 100) {
                return ResponseEntity.badRequest().build();
            }
            
            User user = userService.getCurrentUser(authentication);
            List<Session> sessions = sessionService.getUserSessions(user, limit);
            List<SessionDto> dtos = sessions.stream()
                    .map(SessionDto::fromEntity)
                    .toList();
            
            return ResponseEntity.ok(dtos);
            
        } catch (Exception e) {
            logger.error("Error fetching user sessions", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get session by ID
     * GET /api/sessions/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<SessionDto> getSession(
            @PathVariable UUID id,
            Authentication authentication) {
        
        logger.debug("Fetching session by ID: {}", id);
        
        try {
            User user = userService.getCurrentUser(authentication);
            
            return sessionService.getSessionById(id, user)
                    .map(session -> ResponseEntity.ok(SessionDto.fromEntity(session)))
                    .orElse(ResponseEntity.notFound().build());
                    
        } catch (Exception e) {
            logger.error("Error fetching session", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Create new session
     * POST /api/sessions
     */
    @PostMapping
    public ResponseEntity<SessionDto> createSession(
            @Valid @RequestBody SessionDto.CreateRequest request,
            Authentication authentication) {
        
        logger.info("Creating session for user: {}, name: {}", authentication.getName(), request.getName());
        
        try {
            User user = userService.getCurrentUser(authentication);
            
            Session session = sessionService.createNewSession(
                user,
                request.getName(),
                request.getPuzzleType()
            );
            
            SessionDto dto = SessionDto.fromEntity(session);
            return ResponseEntity.status(HttpStatus.CREATED).body(dto);
            
        } catch (Exception e) {
            logger.error("Error creating session", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Update session
     * PUT /api/sessions/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<SessionDto> updateSession(
            @PathVariable UUID id,
            @Valid @RequestBody SessionDto.UpdateRequest request,
            Authentication authentication) {
        
        logger.debug("Updating session: {}", id);
        
        try {
            User user = userService.getCurrentUser(authentication);
            
            Session session = sessionService.updateSession(id, user, request.getName(), request.getNotes());
            SessionDto dto = SessionDto.fromEntity(session);
            return ResponseEntity.ok(dto);
            
        } catch (IllegalArgumentException e) {
            logger.warn("Invalid session update request: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            logger.error("Error updating session", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * End current session
     * POST /api/sessions/end-current
     */
    @PostMapping("/end-current")
    public ResponseEntity<SessionDto> endCurrentSession(Authentication authentication) {
        logger.info("Ending current session and creating new session for user: {}", authentication.getName());
        
        try {
            User user = userService.getCurrentUser(authentication);
            Session newSession = sessionService.endCurrentSession(user);
            SessionDto dto = SessionDto.fromEntity(newSession);
            return ResponseEntity.ok(dto);
            
        } catch (Exception e) {
            logger.error("Error ending current session", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Switch to (activate) an existing session
     * POST /api/sessions/{id}/activate
     */
    @PostMapping("/{id}/activate")
    public ResponseEntity<SessionDto> activateSession(
            @PathVariable UUID id,
            Authentication authentication) {
        
        logger.info("Activating session: {} for user: {}", id, authentication.getName());
        
        try {
            User user = userService.getCurrentUser(authentication);
            Session session = sessionService.switchToSession(id, user);
            SessionDto dto = SessionDto.fromEntity(session);
            return ResponseEntity.ok(dto);
            
        } catch (IllegalArgumentException e) {
            logger.warn("Invalid session activation request: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            logger.error("Error activating session", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Delete session
     * DELETE /api/sessions/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSession(
            @PathVariable UUID id,
            Authentication authentication) {
        
        logger.info("Deleting session: {} by user: {}", id, authentication.getName());
        
        try {
            User user = userService.getCurrentUser(authentication);
            sessionService.deleteSession(id, user);
            return ResponseEntity.noContent().build();
            
        } catch (IllegalArgumentException e) {
            logger.warn("Invalid session deletion request: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            logger.warn("Cannot delete session: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            logger.error("Error deleting session", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
