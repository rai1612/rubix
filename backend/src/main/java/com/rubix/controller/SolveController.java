package com.rubix.controller;

import com.rubix.model.dto.SolveDto;
import com.rubix.model.entity.Scramble;
import com.rubix.model.entity.Solve;
import com.rubix.model.entity.User;
import com.rubix.service.SolveService;
import com.rubix.service.UserService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.OptionalDouble;
import java.util.UUID;

@RestController
@RequestMapping("/solves")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class SolveController {

    private static final Logger logger = LoggerFactory.getLogger(SolveController.class);

    private final SolveService solveService;
    private final UserService userService;

    public SolveController(SolveService solveService, UserService userService) {
        this.solveService = solveService;
        this.userService = userService;
    }

    /**
     * Create a new solve
     * POST /api/solves
     */
    @PostMapping
    public ResponseEntity<SolveDto> createSolve(
            @Valid @RequestBody SolveDto.CreateRequest request,
            Authentication authentication) {
        
        logger.info("Creating solve for user: {}, time: {}ms", authentication.getName(), request.getTimeMs());
        
        try {
            User user = userService.getCurrentUser(authentication);
            
            Solve solve = solveService.createSolve(
                user,
                request.getScrambleId(),
                request.getTimeMs(),
                request.getInspectionTimeMs(),
                request.getPenalty(),
                request.getSolvedAt(),
                request.getNotes()
            );
            
            SolveDto dto = SolveDto.fromEntity(solve);
            return ResponseEntity.status(HttpStatus.CREATED).body(dto);
            
        } catch (IllegalArgumentException e) {
            logger.warn("Invalid solve creation request: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            logger.error("Error creating solve", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Update an existing solve
     * PUT /api/solves/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<SolveDto> updateSolve(
            @PathVariable UUID id,
            @Valid @RequestBody SolveDto.UpdateRequest request,
            Authentication authentication) {
        
        logger.debug("Updating solve: {}", id);
        
        try {
            User user = userService.getCurrentUser(authentication);
            
            Solve solve = solveService.updateSolve(id, user, request.getTimeMs(), 
                                                 request.getPenalty(), request.getNotes());
            
            SolveDto dto = SolveDto.fromEntity(solve);
            return ResponseEntity.ok(dto);
            
        } catch (IllegalArgumentException e) {
            logger.warn("Invalid solve update request: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            logger.error("Error updating solve", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Delete a solve
     * DELETE /api/solves/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSolve(
            @PathVariable UUID id,
            Authentication authentication) {
        
        logger.info("Deleting solve: {}", id);
        
        try {
            User user = userService.getCurrentUser(authentication);
            solveService.deleteSolve(id, user);
            return ResponseEntity.noContent().build();
            
        } catch (IllegalArgumentException e) {
            logger.warn("Invalid solve delete request: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            logger.error("Error deleting solve", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get solve by ID
     * GET /api/solves/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<SolveDto> getSolve(
            @PathVariable UUID id,
            Authentication authentication) {
        
        logger.debug("Fetching solve: {}", id);
        
        try {
            User user = userService.getCurrentUser(authentication);
            
            return solveService.getSolveById(id, user)
                    .map(solve -> ResponseEntity.ok(SolveDto.fromEntity(solve)))
                    .orElse(ResponseEntity.notFound().build());
                    
        } catch (Exception e) {
            logger.error("Error fetching solve", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get user's solves with pagination
     * GET /api/solves?page=0&size=20
     */
    @GetMapping
    public ResponseEntity<Page<SolveDto>> getUserSolves(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size,
            Authentication authentication) {
        
        logger.debug("Fetching user solves: page={}, size={}", page, size);
        
        try {
            // Validate pagination parameters
            if (page < 0 || size < 1 || size > 100) {
                return ResponseEntity.badRequest().build();
            }
            
            User user = userService.getCurrentUser(authentication);
            Pageable pageable = PageRequest.of(page, size);
            
            Page<Solve> solvePage = solveService.getUserSolves(user, pageable);
            Page<SolveDto> dtosPage = solvePage.map(SolveDto::fromEntity);
            
            return ResponseEntity.ok(dtosPage);
            
        } catch (Exception e) {
            logger.error("Error fetching user solves", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get recent solves
     * GET /api/solves/recent?limit=10
     */
    @GetMapping("/recent")
    public ResponseEntity<List<SolveDto>> getRecentSolves(
            @RequestParam(value = "limit", defaultValue = "10") int limit,
            Authentication authentication) {
        
        logger.debug("Fetching recent solves: limit={}", limit);
        
        try {
            // Validate limit
            if (limit < 1 || limit > 100) {
                return ResponseEntity.badRequest().build();
            }
            
            User user = userService.getCurrentUser(authentication);
            List<Solve> solves = solveService.getRecentSolves(user, limit);
            List<SolveDto> dtos = solves.stream()
                    .map(SolveDto::fromEntity)
                    .toList();
            
            return ResponseEntity.ok(dtos);
            
        } catch (Exception e) {
            logger.error("Error fetching recent solves", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get today's solves
     * GET /api/solves/today
     */
    @GetMapping("/today")
    public ResponseEntity<List<SolveDto>> getTodaysSolves(Authentication authentication) {
        logger.debug("Fetching today's solves");
        
        try {
            User user = userService.getCurrentUser(authentication);
            List<Solve> solves = solveService.getTodaysSolves(user);
            List<SolveDto> dtos = solves.stream()
                    .map(SolveDto::fromEntity)
                    .toList();
            
            return ResponseEntity.ok(dtos);
            
        } catch (Exception e) {
            logger.error("Error fetching today's solves", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get session solves
     * GET /api/solves/session/{sessionId}
     */
    @GetMapping("/session/{sessionId}")
    public ResponseEntity<List<SolveDto>> getSessionSolves(
            @PathVariable UUID sessionId,
            Authentication authentication) {
        
        logger.debug("Fetching session solves: {}", sessionId);
        
        try {
            User user = userService.getCurrentUser(authentication);
            List<Solve> solves = solveService.getSessionSolves(sessionId, user);
            List<SolveDto> dtos = solves.stream()
                    .map(SolveDto::fromEntity)
                    .toList();
            
            return ResponseEntity.ok(dtos);
            
        } catch (IllegalArgumentException e) {
            logger.warn("Invalid session request: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            logger.error("Error fetching session solves", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get personal best
     * GET /api/solves/personal-best?puzzleType=CUBE_3X3
     */
    @GetMapping("/personal-best")
    public ResponseEntity<SolveDto> getPersonalBest(
            @RequestParam(value = "puzzleType", defaultValue = "CUBE_3X3") Scramble.PuzzleType puzzleType,
            Authentication authentication) {
        
        logger.debug("Fetching personal best for puzzle type: {}", puzzleType);
        
        try {
            User user = userService.getCurrentUser(authentication);
            
            return solveService.getPersonalBest(user, puzzleType)
                    .map(solve -> ResponseEntity.ok(SolveDto.fromEntity(solve)))
                    .orElse(ResponseEntity.notFound().build());
                    
        } catch (Exception e) {
            logger.error("Error fetching personal best", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get solve statistics
     * GET /api/solves/statistics?puzzleType=CUBE_3X3
     */
    @GetMapping("/statistics")
    public ResponseEntity<SolveStatistics> getStatistics(
            @RequestParam(value = "puzzleType", defaultValue = "CUBE_3X3") Scramble.PuzzleType puzzleType,
            Authentication authentication) {
        
        logger.debug("Fetching solve statistics for puzzle type: {}", puzzleType);
        
        try {
            User user = userService.getCurrentUser(authentication);
            
            // Calculate current averages
            OptionalDouble ao5 = solveService.calculateCurrentAo5(user, puzzleType);
            OptionalDouble ao12 = solveService.calculateCurrentAo12(user, puzzleType);
            OptionalDouble ao100 = solveService.calculateCurrentAo100(user, puzzleType);
            
            // Get other stats
            long totalSolves = solveService.getSolveCount(user, puzzleType);
            
            SolveStatistics stats = new SolveStatistics();
            stats.totalSolves = totalSolves;
            stats.currentAo5 = ao5.isPresent() ? ao5.getAsDouble() : null;
            stats.currentAo12 = ao12.isPresent() ? ao12.getAsDouble() : null;
            stats.currentAo100 = ao100.isPresent() ? ao100.getAsDouble() : null;
            
            // Get personal best
            solveService.getPersonalBest(user, puzzleType).ifPresent(pb -> {
                stats.personalBest = pb.getAdjustedTimeMs();
            });
            
            return ResponseEntity.ok(stats);
            
        } catch (Exception e) {
            logger.error("Error fetching solve statistics", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get time distribution statistics
     * GET /api/solves/time-distribution?puzzleType=CUBE_3X3
     */
    @GetMapping("/time-distribution")
    public ResponseEntity<TimeDistribution> getTimeDistribution(
            @RequestParam(value = "puzzleType", defaultValue = "CUBE_3X3") Scramble.PuzzleType puzzleType,
            Authentication authentication) {
        
        logger.debug("Fetching time distribution for puzzle type: {}", puzzleType);
        
        try {
            User user = userService.getCurrentUser(authentication);
            
            TimeDistribution distribution = solveService.calculateTimeDistribution(user, puzzleType);
            
            return ResponseEntity.ok(distribution);
            
        } catch (Exception e) {
            logger.error("Error fetching time distribution", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Helper classes
    public static class SolveStatistics {
        public Long totalSolves;
        public Integer personalBest;
        public Double currentAo5;
        public Double currentAo12;
        public Double currentAo100;
        
        // Getters and setters
        public Long getTotalSolves() { return totalSolves; }
        public void setTotalSolves(Long totalSolves) { this.totalSolves = totalSolves; }
        
        public Integer getPersonalBest() { return personalBest; }
        public void setPersonalBest(Integer personalBest) { this.personalBest = personalBest; }
        
        public Double getCurrentAo5() { return currentAo5; }
        public void setCurrentAo5(Double currentAo5) { this.currentAo5 = currentAo5; }
        
        public Double getCurrentAo12() { return currentAo12; }
        public void setCurrentAo12(Double currentAo12) { this.currentAo12 = currentAo12; }
        
        public Double getCurrentAo100() { return currentAo100; }
        public void setCurrentAo100(Double currentAo100) { this.currentAo100 = currentAo100; }
    }

    public static class TimeDistribution {
        public Long sub10Count;
        public Long sub15Count;
        public Long sub20Count;
        public Long sub30Count;
        public Long sub60Count;
        public Long plus60Count;
        public Long dnfCount;
        public Long plusTwoCount;
        public Long totalCount;
        
        // Getters and setters
        public Long getSub10Count() { return sub10Count; }
        public void setSub10Count(Long sub10Count) { this.sub10Count = sub10Count; }
        
        public Long getSub15Count() { return sub15Count; }
        public void setSub15Count(Long sub15Count) { this.sub15Count = sub15Count; }
        
        public Long getSub20Count() { return sub20Count; }
        public void setSub20Count(Long sub20Count) { this.sub20Count = sub20Count; }
        
        public Long getSub30Count() { return sub30Count; }
        public void setSub30Count(Long sub30Count) { this.sub30Count = sub30Count; }
        
        public Long getSub60Count() { return sub60Count; }
        public void setSub60Count(Long sub60Count) { this.sub60Count = sub60Count; }
        
        public Long getPlus60Count() { return plus60Count; }
        public void setPlus60Count(Long plus60Count) { this.plus60Count = plus60Count; }
        
        public Long getDnfCount() { return dnfCount; }
        public void setDnfCount(Long dnfCount) { this.dnfCount = dnfCount; }
        
        public Long getPlusTwoCount() { return plusTwoCount; }
        public void setPlusTwoCount(Long plusTwoCount) { this.plusTwoCount = plusTwoCount; }
        
        public Long getTotalCount() { return totalCount; }
        public void setTotalCount(Long totalCount) { this.totalCount = totalCount; }
    }

    /**
     * Exception handler for this controller
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleIllegalArgument(IllegalArgumentException e) {
        logger.warn("Invalid request: {}", e.getMessage());
        return ResponseEntity.badRequest().body(e.getMessage());
    }

    /**
     * Get session-specific solve statistics
     * GET /api/solves/session/{sessionId}/statistics
     */
    @GetMapping("/session/{sessionId}/statistics")
    public ResponseEntity<SolveStatistics> getSessionStatistics(
            @PathVariable UUID sessionId,
            Authentication authentication) {
        
        logger.debug("Fetching session-specific solve statistics for session: {}", sessionId);
        
        try {
            User user = userService.getCurrentUser(authentication);
            
            // Calculate session-specific averages
            OptionalDouble sessionAo5 = solveService.calculateSessionAo5(sessionId, user);
            OptionalDouble sessionAo12 = solveService.calculateSessionAo12(sessionId, user);
            OptionalDouble sessionAo100 = solveService.calculateSessionAo100(sessionId, user);
            
            // Get session solve count
            List<Solve> sessionSolves = solveService.getSessionSolves(sessionId, user);
            long totalSolves = sessionSolves.size();
            
            SolveStatistics stats = new SolveStatistics();
            stats.totalSolves = totalSolves;
            stats.currentAo5 = sessionAo5.isPresent() ? sessionAo5.getAsDouble() : null;
            stats.currentAo12 = sessionAo12.isPresent() ? sessionAo12.getAsDouble() : null;
            stats.currentAo100 = sessionAo100.isPresent() ? sessionAo100.getAsDouble() : null;
            
            // Personal best is still global (makes sense to compare against all-time best)
            solveService.getPersonalBest(user, Scramble.PuzzleType.CUBE_3X3).ifPresent(pb -> {
                stats.personalBest = pb.getAdjustedTimeMs();
            });
            
            return ResponseEntity.ok(stats);
            
        } catch (IllegalArgumentException e) {
            logger.warn("Invalid session statistics request: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            logger.error("Error fetching session statistics", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleGenericException(Exception e) {
        logger.error("Unexpected error in SolveController", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("An unexpected error occurred");
    }
}
