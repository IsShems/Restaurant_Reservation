# syntax=docker/dockerfile:1

# ---------- Build stage ----------
FROM eclipse-temurin:25-jdk AS build
WORKDIR /workspace

RUN apt-get update \
	; apt-get install -y --no-install-recommends maven \
	; rm -rf /var/lib/apt/lists/*

# Cache dependencies first
COPY backend/pom.xml backend/pom.xml
RUN mvn -f backend/pom.xml -DskipTests dependency:go-offline

# Copy source and build
COPY backend/src backend/src
RUN mvn -f backend/pom.xml -DskipTests clean package

# ---------- Runtime stage ----------
FROM eclipse-temurin:25
WORKDIR /app

COPY --from=build /workspace/backend/target/*SNAPSHOT.jar /app/restaurant-app.jar

EXPOSE 8081

ENTRYPOINT ["java", "-jar", "/app/restaurant-app.jar"]
