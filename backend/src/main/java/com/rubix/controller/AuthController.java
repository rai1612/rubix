package com.rubix.controller;

import com.rubix.model.dto.AuthDto;
import com.rubix.model.entity.User;
import com.rubix.security.JwtUtil;
import com.rubix.security.UserPrincipal;
import com.rubix.service.UserService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    private final AuthenticationManager authenticationManager;
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthController(AuthenticationManager authenticationManager,
                         UserService userService,
                         PasswordEncoder passwordEncoder,
                         JwtUtil jwtUtil) {
        this.authenticationManager = authenticationManager;
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    /**
     * Authenticate user and return JWT token
     */
    @PostMapping("/login")
    public ResponseEntity<AuthDto.LoginResponse> login(@Valid @RequestBody AuthDto.LoginRequest request) {
        logger.info("Login attempt for user: {}", request.getUsername());

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);

            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            String jwt = jwtUtil.generateJwtToken(authentication);

            // Update last login
            User user = userService.findByUsernameOrEmail(request.getUsername()).orElseThrow();
            user.setLastLoginAt(Instant.now());
            userService.updateUser(user);

            return ResponseEntity.ok(new AuthDto.LoginResponse(
                    jwt,
                    userPrincipal.getId().toString(),
                    userPrincipal.getUsername(),
                    userPrincipal.getEmail()
            ));

        } catch (Exception e) {
            logger.warn("Authentication failed for user: {}", request.getUsername());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new AuthDto.LoginResponse(null, null, null, null));
        }
    }

    /**
     * Register new user
     */
    @PostMapping("/register")
    public ResponseEntity<AuthDto.RegisterResponse> register(@Valid @RequestBody AuthDto.RegisterRequest request) {
        logger.info("Registration attempt for user: {}", request.getUsername());

        try {
            // Check if user already exists
            if (userService.findByUsernameOrEmail(request.getUsername()).isPresent() ||
                userService.findByUsernameOrEmail(request.getEmail()).isPresent()) {
                return ResponseEntity.badRequest()
                        .body(new AuthDto.RegisterResponse(false, "Username or email already exists", null));
            }

            // Create new user
            User user = new User();
            user.setUsername(request.getUsername());
            user.setEmail(request.getEmail());
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
            user.setFirstName(request.getFirstName());
            user.setLastName(request.getLastName());
            user.setIsActive(true);
            user.setIsVerified(true); // For MVP, auto-verify users

            User savedUser = userService.createUser(user);
            logger.info("Successfully created user: {}", savedUser.getUsername());

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new AuthDto.RegisterResponse(true, "User registered successfully", savedUser.getId().toString()));

        } catch (Exception e) {
            logger.error("Error during registration for user: {}", request.getUsername(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new AuthDto.RegisterResponse(false, "Registration failed", null));
        }
    }

    /**
     * Validate JWT token
     */
    @GetMapping("/validate")
    public ResponseEntity<AuthDto.ValidateResponse> validateToken(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                if (jwtUtil.validateJwtToken(token)) {
                    String username = jwtUtil.getUserNameFromJwtToken(token);
                    return ResponseEntity.ok(new AuthDto.ValidateResponse(true, username));
                }
            }
            return ResponseEntity.ok(new AuthDto.ValidateResponse(false, null));
        } catch (Exception e) {
            return ResponseEntity.ok(new AuthDto.ValidateResponse(false, null));
        }
    }

    /**
     * Get current user info
     */
    @GetMapping("/me")
    public ResponseEntity<AuthDto.UserInfo> getCurrentUser(Authentication authentication) {
        try {
            User user = userService.getCurrentUser(authentication);
            return ResponseEntity.ok(new AuthDto.UserInfo(
                    user.getId().toString(),
                    user.getUsername(),
                    user.getEmail(),
                    user.getFirstName(),
                    user.getLastName(),
                    user.getCreatedAt() != null ? user.getCreatedAt().toString() : null,
                    user.getUpdatedAt() != null ? user.getUpdatedAt().toString() : null,
                    user.getLastLoginAt() != null ? user.getLastLoginAt().toString() : null,
                    user.getIsActive(),
                    user.getIsVerified(),
                    user.getPreferences()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    /**
     * Update user profile
     */
    @PutMapping("/profile")
    public ResponseEntity<AuthDto.UserInfo> updateProfile(
            @Valid @RequestBody AuthDto.UpdateProfileRequest request,
            Authentication authentication) {
        logger.info("Profile update request for user: {}", authentication.getName());

        try {
            User user = userService.getCurrentUser(authentication);
            
            // Update fields if provided
            if (request.getFirstName() != null) {
                user.setFirstName(request.getFirstName());
            }
            if (request.getLastName() != null) {
                user.setLastName(request.getLastName());
            }
            if (request.getPreferences() != null) {
                user.setPreferences(request.getPreferences());
            }

            User updatedUser = userService.updateUser(user);
            logger.info("Successfully updated profile for user: {}", updatedUser.getUsername());

            return ResponseEntity.ok(new AuthDto.UserInfo(
                    updatedUser.getId().toString(),
                    updatedUser.getUsername(),
                    updatedUser.getEmail(),
                    updatedUser.getFirstName(),
                    updatedUser.getLastName(),
                    updatedUser.getCreatedAt() != null ? updatedUser.getCreatedAt().toString() : null,
                    updatedUser.getUpdatedAt() != null ? updatedUser.getUpdatedAt().toString() : null,
                    updatedUser.getLastLoginAt() != null ? updatedUser.getLastLoginAt().toString() : null,
                    updatedUser.getIsActive(),
                    updatedUser.getIsVerified(),
                    updatedUser.getPreferences()
            ));

        } catch (Exception e) {
            logger.error("Error updating profile for user: {}", authentication.getName(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Temporary endpoint to generate BCrypt hash for testing
    @GetMapping("/generate-hash/{password}")
    public ResponseEntity<String> generateHash(@PathVariable String password) {
        String hash = passwordEncoder.encode(password);
        return ResponseEntity.ok(hash);
    }
}
