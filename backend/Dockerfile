# Use a lightweight JDK base image
FROM openjdk:17-jdk-slim

# Workdir inside the container
WORKDIR /app

# Copy the built jar into the container
COPY target/*.jar app.jar

# Expose port 8080 (optional for clarity)
EXPOSE 8080

# Run the JAR
ENTRYPOINT ["java", "-jar", "app.jar"]