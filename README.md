# Photo Gallery

A full-stack photo gallery where members can create albums, upload photos, browse the community, and view images in a full-screen viewer.

## Contents

- [Features](#features)
- [Technology](#technology)
- [Project layout](#project-layout)
- [Requirements](#requirements)
- [Configuration](#configuration)
- [Run locally](#run-locally)
- [Build and test](#build-and-test)
- [API overview](#api-overview)
- [Deployment notes](#deployment-notes)

## Features

- Community page with member profiles and album discovery.
- Account registration and sign-in backed by server-side sessions.
- User-owned album creation and management.
- Photo upload and owner-only photo and album deletion.
- Full-screen photo viewing with previous/next navigation and keyboard controls.
- MongoDB persistence for user, album, and photo records.

## Technology

| Area | Technologies |
| --- | --- |
| Frontend | React 18, Vite, React Router, Tailwind CSS |
| Backend | Java 21, Spring Boot, Spring MVC |
| Database | MongoDB |
| Authentication | HTTP session cookies |

## Project layout

The frontend is nested inside the Spring Boot project. It is a separate Vite application and is built independently from the backend.

```text
Photo_Gallery/
├── README.md
└── Photo_Gallery_Application/
    ├── pom.xml
    ├── mvnw
    ├── mvnw.cmd
    ├── src/
    │   ├── main/java/com/photo/gallery/
    │   └── main/resources/
    └── frontend/
        ├── package.json
        ├── package-lock.json
        ├── vite.config.js
        └── src/
```

## Requirements

- Java 21 or later.
- Node.js and npm (Node.js 18 or later is recommended for Vite 5).
- A reachable MongoDB database.

## Configuration

### Backend

The backend listens on port `8091` by default. Configure its MongoDB connection using the `SPRING_DATA_MONGODB_URI` environment variable. Do not commit database credentials or production secrets.

PowerShell example:

```powershell
$env:SPRING_DATA_MONGODB_URI = "mongodb+srv://<username>:<password>@<cluster>/<database>"
```

The connection string must be URL-encoded where required. Keep credentials out of source control and terminal logs.

### Frontend

The frontend API client uses `VITE_API_BASE` as its backend base URL. If unset, it defaults to `http://localhost:8091`.

PowerShell example for local development:

```powershell
$env:VITE_API_BASE = "http://localhost:8091"
```

Vite embeds `VITE_*` values into the generated frontend bundle at build time. Set the production API URL before running the production build.

## Run locally

Open two terminals from the repository root.

### 1. Start the backend

```powershell
cd .\Photo_Gallery_Application
$env:SPRING_DATA_MONGODB_URI = "mongodb+srv://<username>:<password>@<cluster>/<database>"
.\mvnw.cmd spring-boot:run
```

The backend is available at `http://localhost:8091`.

### 2. Start the frontend

```powershell
cd .\Photo_Gallery_Application\frontend
npm ci
$env:VITE_API_BASE = "http://localhost:8091"
npm run dev
```

Open the Vite URL printed in the terminal (normally `http://localhost:5173`).

## Build and test

Run these commands from the repository root.

### Backend tests

```powershell
cd .\Photo_Gallery_Application
.\mvnw.cmd clean test
```

### Backend package

```powershell
.\mvnw.cmd package
```

The executable Spring Boot JAR is written under `Photo_Gallery_Application\target`.

### Frontend production build

```powershell
cd .\Photo_Gallery_Application\frontend
$env:VITE_API_BASE = "https://api.example.com"
npm ci
npm run build
```

Vite writes the static production bundle to `frontend\dist`.

## API overview

The backend API uses the `/jsonplaceholder.typicode.com` path prefix.

| Resource | Example routes |
| --- | --- |
| Users | `POST /users`, `POST /users/login`, `POST /users/logout`, `GET /users/me`, `GET /users` |
| Albums | `POST /album`, `GET /album/user/{userId}`, `GET /album/{id}`, `DELETE /album/{id}` |
| Photos | `POST /photo/album/{albumId}/upload`, `GET /photo/album/{albumId}`, `DELETE /photo/{id}` |

All routes above are relative to the `/jsonplaceholder.typicode.com` prefix. Mutating album and photo routes require a signed-in session; album mutations are restricted to the album owner. The frontend sends requests with credentials enabled so the session cookie is included.

## Deployment notes

The frontend and backend may be deployed separately even though the frontend directory lives inside the backend project.

### Build and run the backend with Docker

Build the image from the backend directory:

```powershell
cd .\Photo_Gallery_Application
docker build -t photo-gallery-backend .
```

Run it with a MongoDB connection string and a persistent volume for uploaded images:

```powershell
docker run --name photo-gallery-backend `
  -p 8091:8091 `
  -e SPRING_DATA_MONGODB_URI="mongodb+srv://<username>:<password>@<cluster>/<database>" `
  -v photo-gallery-uploads:/app/src/main/resources/static/images `
  photo-gallery-backend
```

The container runs as a non-root user and listens on port `8091`. Keep the MongoDB URI in your deployment platform's secret manager rather than in the image or source control.

Before deploying:

1. Configure `VITE_API_BASE` to the public API URL before building the frontend.
2. Update the allowed frontend origin in `SecurityConfig.java`; it currently permits `http://localhost:5173`.
3. Serve the frontend with SPA fallback routing so direct visits and refreshes on routes such as `/albums/{id}` resolve to `index.html`.
4. Keep MongoDB credentials in the deployment environment or secret manager.
5. Configure session cookies and CORS for the production domains. Cross-origin cookie sessions require a compatible same-site/secure cookie policy and HTTPS.
6. Move uploaded images to persistent storage suitable for the hosting platform. The current backend saves uploads under `src/main/resources/static/images` and constructs image URLs using `http://localhost:8091`, which is intended for local development and should be changed for production.
