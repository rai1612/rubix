# Security Configuration Guide

This document explains how to securely configure the rubiX application using environment variables.

## Environment Setup

### 1. Create Environment File

Copy the example environment file and customize it with your values:

```bash
cp env.example .env
```

> **⚠️ Important**: The `.env` file is already added to `.gitignore` and should NEVER be committed to version control.

### 2. Required Environment Variables

Edit your `.env` file and provide values for the following required variables:

#### Database Configuration
```env
POSTGRES_PASSWORD=your_secure_password_here
SPRING_DATASOURCE_PASSWORD=your_secure_password_here
```

#### JWT Secret
Generate a secure 256-bit JWT secret:
```bash
# Generate a secure JWT secret
openssl rand -hex 32
```

Then add it to your `.env` file:
```env
JWT_SECRET=your_generated_256_bit_secret_here
```

### 3. Optional OAuth2 Configuration

If you want to enable Google or GitHub login:

#### Google OAuth2
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Create OAuth2 credentials
5. Add your credentials to `.env`:
```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

#### GitHub OAuth2
1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create a new OAuth App
3. Add your credentials to `.env`:
```env
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

## Running the Application

### Development Mode

1. **Infrastructure services only** (recommended for local development):
```bash
./dev-infrastructure.sh
```

2. **Start backend** (in a new terminal):
```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

3. **Start frontend** (in another terminal):
```bash
cd frontend
npm run dev
```

### Docker Compose

Make sure your `.env` file is properly configured, then:

```bash
# Full stack with Docker
docker-compose up -d

# Development mode with hot reloading
docker-compose -f docker-compose.yml -f docker-compose.override.yml up -d
```

## Security Best Practices

### 1. Environment Variables
- ✅ All sensitive data is now externalized to environment variables
- ✅ No hardcoded credentials in source code
- ✅ `.env` files are excluded from version control

### 2. Passwords
- Use strong, unique passwords for database access
- Never reuse development passwords in production
- Consider using password managers for generating secure passwords

### 3. JWT Secrets
- Always generate a new, random JWT secret for each environment
- Use a cryptographically secure random generator
- JWT secret should be at least 256 bits (32 bytes)

### 4. OAuth2 Credentials
- Keep OAuth2 client secrets secure
- Use different OAuth2 apps for development and production
- Regularly rotate OAuth2 credentials

### 5. Production Deployment
- Use a proper secrets management system (e.g., AWS Secrets Manager, HashiCorp Vault)
- Enable SSL/TLS for all communications
- Regularly update dependencies and base images
- Implement proper logging and monitoring

## Troubleshooting

### Missing Environment Variables
If you get errors about missing environment variables:

1. Check that your `.env` file exists and has the correct values
2. Ensure Docker Compose can read the `.env` file (it should be in the same directory as `docker-compose.yml`)
3. For Spring Boot, check that the profile is correctly set

### Database Connection Issues
1. Verify PostgreSQL is running
2. Check database credentials in your `.env` file
3. Ensure the database name, username, and password match

### JWT Token Issues
1. Verify the JWT secret is set correctly
2. Generate a new JWT secret if needed
3. Clear browser storage/cookies if testing authentication

## File Security Checklist

Before committing code, ensure:
- [ ] `.env` file is NOT committed
- [ ] No hardcoded passwords or secrets in source code
- [ ] All sensitive configuration uses environment variables
- [ ] `.gitignore` includes common sensitive file patterns
- [ ] Environment variables have secure defaults or no defaults for sensitive values
