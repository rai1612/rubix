package com.rubix.repository;

import com.rubix.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    /**
     * Find user by username (case-insensitive)
     */
    Optional<User> findByUsernameIgnoreCase(String username);

    /**
     * Find user by email (case-insensitive)
     */
    Optional<User> findByEmailIgnoreCase(String email);

    /**
     * Find user by username or email (case-insensitive)
     */
    @Query("SELECT u FROM User u WHERE LOWER(u.username) = LOWER(:usernameOrEmail) OR LOWER(u.email) = LOWER(:usernameOrEmail)")
    Optional<User> findByUsernameOrEmailIgnoreCase(@Param("usernameOrEmail") String usernameOrEmail);

    /**
     * Find user by OAuth provider and OAuth ID
     */
    Optional<User> findByOauthProviderAndOauthId(User.OAuthProvider oauthProvider, String oauthId);

    /**
     * Check if username exists (case-insensitive)
     */
    boolean existsByUsernameIgnoreCase(String username);

    /**
     * Check if email exists (case-insensitive)
     */
    boolean existsByEmailIgnoreCase(String email);

    /**
     * Find user by verification token
     */
    Optional<User> findByVerificationToken(String verificationToken);

    /**
     * Find user by reset token that hasn't expired
     */
    @Query("SELECT u FROM User u WHERE u.resetToken = :resetToken AND u.resetTokenExpiresAt > :now")
    Optional<User> findByValidResetToken(@Param("resetToken") String resetToken, @Param("now") Instant now);

    /**
     * Find active users
     */
    List<User> findByIsActiveTrue();

    /**
     * Find users by verification status
     */
    List<User> findByIsVerified(boolean verified);

    /**
     * Find users created after a certain date
     */
    List<User> findByCreatedAtAfterOrderByCreatedAtDesc(Instant after);

    /**
     * Find users who haven't logged in recently
     */
    @Query("SELECT u FROM User u WHERE u.lastLoginAt < :threshold OR u.lastLoginAt IS NULL")
    List<User> findInactiveUsers(@Param("threshold") Instant threshold);

    /**
     * Count active users
     */
    long countByIsActiveTrue();

    /**
     * Count verified users
     */
    long countByIsVerifiedTrue();

    /**
     * Find users by OAuth provider
     */
    List<User> findByOauthProvider(User.OAuthProvider oauthProvider);

    /**
     * Update last login time
     */
    @Query("UPDATE User u SET u.lastLoginAt = :loginTime WHERE u.id = :userId")
    void updateLastLoginAt(@Param("userId") UUID userId, @Param("loginTime") Instant loginTime);

    /**
     * Find users with preferences containing specific key
     */
    @Query(value = "SELECT * FROM users WHERE jsonb_exists(preferences, :key)", nativeQuery = true)
    List<User> findUsersWithPreferenceKey(@Param("key") String key);

    /**
     * Search users by username or full name
     */
    @Query("""
        SELECT u FROM User u 
        WHERE LOWER(u.username) LIKE LOWER(CONCAT('%', :searchTerm, '%')) 
           OR LOWER(CONCAT(u.firstName, ' ', u.lastName)) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
           OR LOWER(u.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
           OR LOWER(u.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%'))
        """)
    List<User> searchUsers(@Param("searchTerm") String searchTerm);
}
