# Multi-stage build for Spring Boot application

# Build stage
FROM maven:latest AS builder

WORKDIR /app

# Copy pom.xml first for better layer caching
COPY pom.xml .

# Download dependencies
RUN mvn dependency:go-offline -B

# Copy source code
COPY src src

# Build the application
RUN mvn clean package -DskipTests -B

# Runtime stage
FROM eclipse-temurin:21-jre

# Create app user for security
RUN groupadd -r app && useradd -r -g app app

# Install necessary packages
RUN apt-get update && apt-get install -y \
    curl \
    dumb-init \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy the built jar from the builder stage
COPY --from=builder /app/target/rubix-backend-*.jar app.jar

# Change ownership to app user
RUN chown -R app:app /app

# Switch to app user
USER app

# Render provides PORT env variable (typically 10000)
# Remove HEALTHCHECK - Render handles this via healthCheckPath in render.yaml
ENV PORT=10000
EXPOSE 10000

# Set JVM options for containerized environment
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:+UseG1GC -XX:+UseStringDeduplication"

# Use dumb-init as PID 1 to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Run the application with dynamic port support
CMD ["sh", "-c", "java $JAVA_OPTS -Dserver.port=${PORT:-10000} -jar app.jar"]
