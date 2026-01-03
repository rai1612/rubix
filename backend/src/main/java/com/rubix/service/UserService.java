package com.rubix.service;

import com.rubix.model.entity.User;
import com.rubix.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Get current user from authentication context
     */
    @Transactional(readOnly = true)
    public User getCurrentUser(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new IllegalArgumentException("No authenticated user found");
        }

        String username = authentication.getName();
        return findByUsernameOrEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }

    /**
     * Find user by username or email
     */
    @Transactional(readOnly = true)
    public Optional<User> findByUsernameOrEmail(String usernameOrEmail) {
        return userRepository.findByUsernameOrEmailIgnoreCase(usernameOrEmail);
    }

    /**
     * Find user by ID
     */
    @Transactional(readOnly = true)
    public Optional<User> findById(UUID userId) {
        return userRepository.findById(userId);
    }

    /**
     * Create a new user
     */
    public User createUser(User user) {
        logger.info("Creating new user: {}", user.getUsername());
        
        // Check if username or email already exists
        if (userRepository.existsByUsernameIgnoreCase(user.getUsername())) {
            throw new IllegalArgumentException("Username already exists: " + user.getUsername());
        }
        
        if (userRepository.existsByEmailIgnoreCase(user.getEmail())) {
            throw new IllegalArgumentException("Email already exists: " + user.getEmail());
        }
        
        // Set default values
        if (user.getIsActive() == null) {
            user.setIsActive(true);
        }
        if (user.getIsVerified() == null) {
            user.setIsVerified(false);
        }
        
        User savedUser = userRepository.save(user);
        logger.debug("User created with ID: {}", savedUser.getId());
        
        return savedUser;
    }

    /**
     * Update an existing user
     */
    public User updateUser(User user) {
        logger.debug("Updating user: {}", user.getId());
        return userRepository.save(user);
    }

    /**
     * Update user last login time
     */
    public void updateLastLogin(UUID userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setLastLoginAt(Instant.now());
            userRepository.save(user);
        }
    }

    /**
     * Check if username exists
     */
    @Transactional(readOnly = true)
    public boolean usernameExists(String username) {
        return userRepository.existsByUsernameIgnoreCase(username);
    }

    /**
     * Check if email exists
     */
    @Transactional(readOnly = true)
    public boolean emailExists(String email) {
        return userRepository.existsByEmailIgnoreCase(email);
    }

    /**
     * Find user by OAuth info
     */
    @Transactional(readOnly = true)
    public Optional<User> findByOAuth(User.OAuthProvider provider, String oauthId) {
        return userRepository.findByOauthProviderAndOauthId(provider, oauthId);
    }

    /**
     * Create OAuth user
     */
    public User createOAuthUser(String email, String username, String firstName, String lastName, 
                               User.OAuthProvider provider, String oauthId) {
        logger.info("Creating OAuth user: {} via {}", username, provider);
        
        User user = new User();
        user.setEmail(email);
        user.setUsername(username);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setOauthProvider(provider);
        user.setOauthId(oauthId);
        user.setIsVerified(true); // OAuth users are automatically verified
        user.setIsActive(true);
        
        return userRepository.save(user);
    }

    /**
     * For development/testing - create demo user
     */
    public User getOrCreateDemoUser() {
        return findByUsernameOrEmail("demo@rubix.local")
                .orElseGet(() -> {
                    User demoUser = new User();
                    demoUser.setUsername("demo_user");
                    demoUser.setEmail("demo@rubix.local");
                    demoUser.setFirstName("Demo");
                    demoUser.setLastName("User");
                    demoUser.setIsActive(true);
                    demoUser.setIsVerified(true);
                    demoUser.setOauthProvider(User.OAuthProvider.LOCAL);
                    return userRepository.save(demoUser);
                });
    }
}