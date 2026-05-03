FROM eclipse-temurin:17-jdk

WORKDIR /app

# Copy everything
COPY . .

# Give permission to mvnw
RUN chmod +x mvnw

# Build project
RUN ./mvnw clean package -DskipTests

# Run jar
CMD ["java", "-jar", "target/*.jar"]