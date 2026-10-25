FROM maven:3.9.9-eclipse-temurin-21 AS build

WORKDIR /workspace

COPY pom.xml .
RUN mvn -B -ntp dependency:go-offline

COPY src ./src
RUN mvn -B -ntp package

FROM eclipse-temurin:21-jre

WORKDIR /app

RUN groupadd --system --gid 10001 app \
    && useradd --system --uid 10001 --gid app --home-dir /app app \
    && mkdir -p /app/src/main/resources/static/images \
    && chown -R app:app /app

COPY --from=build --chown=app:app /workspace/target/Photo_Gallery_Application-*.jar /app/app.jar

USER app

EXPOSE 8091

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
