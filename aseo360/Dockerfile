# Etapa 1: Construcción (Usamos Maven con Java 21)
FROM maven:3.9.6-eclipse-temurin-21 AS build
COPY . .
RUN mvn clean package -DskipTests

# Etapa 2: Ejecución (Usamos una imagen ligera de Java 21)
FROM eclipse-temurin:21-jre
COPY --from=build /target/aseo360-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","app.jar"]