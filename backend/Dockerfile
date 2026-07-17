# ─── Etapa 1: compilación con Maven ─────────────────────────────────────────────
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# Copiar solo el pom primero para cachear la descarga de dependencias:
# si no cambia el pom.xml, Docker reutiliza esta capa y el build es mucho más rápido.
COPY pom.xml .
RUN mvn dependency:go-offline -B

COPY src ./src
RUN mvn package -DskipTests -B

# ─── Etapa 2: imagen final solo con el JRE (imagen liviana, ~200MB) ─────────────
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

COPY --from=build /app/target/safari-kids-backend-1.0.0.jar app.jar

EXPOSE 8080

# Mismos límites de memoria que en Railway (contenedor de 512MB)
ENTRYPOINT ["java", "-Xmx256m", "-Xss512k", "-XX:MaxMetaspaceSize=150m", "-XX:ReservedCodeCacheSize=64m", "-XX:+UseSerialGC", "-jar", "app.jar"]
