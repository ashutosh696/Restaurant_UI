FROM maven:3.9.6-eclipse-temurin-21

WORKDIR /app

# Copy only backend folder
COPY restaurant-service ./restaurant-service

# Move into correct folder
WORKDIR /app/restaurant-service

# Build project
RUN mvn clean package -DskipTests

# Run jar
CMD ["java", "-jar", "target/*.jar"]