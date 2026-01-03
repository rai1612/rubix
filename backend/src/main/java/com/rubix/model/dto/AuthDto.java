package com.rubix.model.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AuthDto {

    public static class LoginRequest {
        @NotBlank
        private String username;

        @NotBlank
        private String password;

        // Constructors
        public LoginRequest() {}

        public LoginRequest(String username, String password) {
            this.username = username;
            this.password = password;
        }

        // Getters and Setters
        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }

    public static class LoginResponse {
        private String token;
        private String userId;
        private String username;
        private String email;

        // Constructors
        public LoginResponse() {}

        public LoginResponse(String token, String userId, String username, String email) {
            this.token = token;
            this.userId = userId;
            this.username = username;
            this.email = email;
        }

        // Getters and Setters
        public String getToken() {
            return token;
        }

        public void setToken(String token) {
            this.token = token;
        }

        public String getUserId() {
            return userId;
        }

        public void setUserId(String userId) {
            this.userId = userId;
        }

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }
    }

    public static class RegisterRequest {
        @NotBlank
        @Size(min = 3, max = 50)
        private String username;

        @NotBlank
        @Email
        private String email;

        @NotBlank
        @Size(min = 6, max = 100)
        private String password;

        private String firstName;
        private String lastName;

        // Constructors
        public RegisterRequest() {}

        public RegisterRequest(String username, String email, String password, String firstName, String lastName) {
            this.username = username;
            this.email = email;
            this.password = password;
            this.firstName = firstName;
            this.lastName = lastName;
        }

        // Getters and Setters
        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }

        public String getFirstName() {
            return firstName;
        }

        public void setFirstName(String firstName) {
            this.firstName = firstName;
        }

        public String getLastName() {
            return lastName;
        }

        public void setLastName(String lastName) {
            this.lastName = lastName;
        }
    }

    public static class RegisterResponse {
        private boolean success;
        private String message;
        private String userId;

        // Constructors
        public RegisterResponse() {}

        public RegisterResponse(boolean success, String message, String userId) {
            this.success = success;
            this.message = message;
            this.userId = userId;
        }

        // Getters and Setters
        public boolean isSuccess() {
            return success;
        }

        public void setSuccess(boolean success) {
            this.success = success;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }

        public String getUserId() {
            return userId;
        }

        public void setUserId(String userId) {
            this.userId = userId;
        }
    }

    public static class ValidateResponse {
        private boolean valid;
        private String username;

        // Constructors
        public ValidateResponse() {}

        public ValidateResponse(boolean valid, String username) {
            this.valid = valid;
            this.username = username;
        }

        // Getters and Setters
        public boolean isValid() {
            return valid;
        }

        public void setValid(boolean valid) {
            this.valid = valid;
        }

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }
    }

    public static class UserInfo {
        private String id;
        private String username;
        private String email;
        private String firstName;
        private String lastName;
        private String createdAt;
        private String updatedAt;
        private String lastLoginAt;
        private Boolean isActive;
        private Boolean isVerified;
        private java.util.Map<String, Object> preferences;

        // Constructors
        public UserInfo() {}

        public UserInfo(String id, String username, String email, String firstName, String lastName) {
            this.id = id;
            this.username = username;
            this.email = email;
            this.firstName = firstName;
            this.lastName = lastName;
        }

        // Full constructor
        public UserInfo(String id, String username, String email, String firstName, String lastName, 
                       String createdAt, String updatedAt, String lastLoginAt, Boolean isActive, Boolean isVerified) {
            this.id = id;
            this.username = username;
            this.email = email;
            this.firstName = firstName;
            this.lastName = lastName;
            this.createdAt = createdAt;
            this.updatedAt = updatedAt;
            this.lastLoginAt = lastLoginAt;
            this.isActive = isActive;
            this.isVerified = isVerified;
        }

        // Constructor with preferences
        public UserInfo(String id, String username, String email, String firstName, String lastName, 
                       String createdAt, String updatedAt, String lastLoginAt, Boolean isActive, Boolean isVerified,
                       java.util.Map<String, Object> preferences) {
            this.id = id;
            this.username = username;
            this.email = email;
            this.firstName = firstName;
            this.lastName = lastName;
            this.createdAt = createdAt;
            this.updatedAt = updatedAt;
            this.lastLoginAt = lastLoginAt;
            this.isActive = isActive;
            this.isVerified = isVerified;
            this.preferences = preferences;
        }

        // Getters and Setters
        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getFirstName() {
            return firstName;
        }

        public void setFirstName(String firstName) {
            this.firstName = firstName;
        }

        public String getLastName() {
            return lastName;
        }

        public void setLastName(String lastName) {
            this.lastName = lastName;
        }

        public String getCreatedAt() {
            return createdAt;
        }

        public void setCreatedAt(String createdAt) {
            this.createdAt = createdAt;
        }

        public String getUpdatedAt() {
            return updatedAt;
        }

        public void setUpdatedAt(String updatedAt) {
            this.updatedAt = updatedAt;
        }

        public String getLastLoginAt() {
            return lastLoginAt;
        }

        public void setLastLoginAt(String lastLoginAt) {
            this.lastLoginAt = lastLoginAt;
        }

        public Boolean getIsActive() {
            return isActive;
        }

        public void setIsActive(Boolean isActive) {
            this.isActive = isActive;
        }

        public Boolean getIsVerified() {
            return isVerified;
        }

        public void setIsVerified(Boolean isVerified) {
            this.isVerified = isVerified;
        }

        public java.util.Map<String, Object> getPreferences() {
            return preferences;
        }

        public void setPreferences(java.util.Map<String, Object> preferences) {
            this.preferences = preferences;
        }
    }

    public static class UpdateProfileRequest {
        private String firstName;
        private String lastName;
        private java.util.Map<String, Object> preferences;

        // Constructors
        public UpdateProfileRequest() {}

        public UpdateProfileRequest(String firstName, String lastName) {
            this.firstName = firstName;
            this.lastName = lastName;
        }

        public UpdateProfileRequest(String firstName, String lastName, java.util.Map<String, Object> preferences) {
            this.firstName = firstName;
            this.lastName = lastName;
            this.preferences = preferences;
        }

        // Getters and Setters
        public String getFirstName() {
            return firstName;
        }

        public void setFirstName(String firstName) {
            this.firstName = firstName;
        }

        public String getLastName() {
            return lastName;
        }

        public void setLastName(String lastName) {
            this.lastName = lastName;
        }

        public java.util.Map<String, Object> getPreferences() {
            return preferences;
        }

        public void setPreferences(java.util.Map<String, Object> preferences) {
            this.preferences = preferences;
        }
    }
}
