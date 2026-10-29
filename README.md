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
- PostgreSQL persistence for user, album, and photo records.

## Technology

| Area | Technologies |
| --- | --- |
| Frontend | React 18, Vite, React Router, Tailwind CSS |
| Backend | Java 21, Spring Boot, Spring MVC |
| Database | PostgreSQL |
| Authentication | HTTP session cookies |

## Project layout

The frontend and backend are independent projects in sibling directories.

```text
Photo_Gallery/
├── README.md
├── backend/
│   ├── pom.xml
│   ├── mvnw
│   └── src/
│       ├── main/java/com/photo/gallery/
│       └── main/resources/
└── frontend/
    ├── package.json
    ├── package-lock.json
    ├── vite.config.js
    └── src/
```

## Requirements

- Java 21 or later.
- Node.js and npm (Node.js 18 or later is recommended for Vite 5).
- A reachable PostgreSQL database (an embedded H2 database is used locally when `DATABASE_URL` is unset).

## Configuration

### Backend

The backend listens on port `8091` by default. Configure its PostgreSQL connection using the `DATABASE_URL` environment variable (Render sets this automatically for managed PostgreSQL databases), with optional `DB_USERNAME` and `DB_PASSWORD`. Locally, the backend falls back to an embedded H2 database when `DATABASE_URL` is unset, so no local PostgreSQL is required for development. Do not commit database credentials or production secrets.

PowerShell example:

```powershell
$env:DATABASE_URL = "jdbc:postgresql://<host>:<port>/<database>"
$env:DB_USERNAME = "<username>"
$env:DB_PASSWORD = "<password>"
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
cd .\backend
$env:DATABASE_URL = "jdbc:postgresql://<host>:<port>/<database>"
$env:DB_USERNAME = "<username>"
$env:DB_PASSWORD = "<password>"
.\mvnw.cmd spring-boot:run
```

Omitting `DATABASE_URL` falls back to an embedded H2 database for local development.

The backend is available at `http://localhost:8091`.

### 2. Start the frontend

```powershell
cd .\frontend
npm ci
$env:VITE_API_BASE = "http://localhost:8091"
npm run dev
```

Open the Vite URL printed in the terminal (normally `http://localhost:5173`).

## Build and test

Run these commands from the repository root.

### Backend tests

```powershell
cd .\backend
.\mvnw.cmd clean test
```

### Backend package

```powershell
cd .\backend
.\mvnw.cmd package
```

The executable Spring Boot JAR is written under `backend\target`.

### Frontend production build

```powershell
cd .\frontend
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

On first startup, the backend creates five demo users with three albums each and at least 15 sample photos per album. The sample photo URLs refer to images in `frontend/public/images`, which Vite serves from the frontend origin. The seed is safe to run on later startups: existing demo users, albums, and photos are reused rather than duplicated.

## Deployment notes

The frontend and backend are separate projects and can be deployed independently.

### Build and run the backend with Docker

Build the image from the repository root:

```powershell
docker build -t photo-gallery-backend .\backend
```

Run it with a PostgreSQL connection string:

```powershell
docker run --name photo-gallery-backend `
  -p 8091:8091 `
  -e DATABASE_URL="jdbc:postgresql://<host>:<port>/<database>" `
  -e DB_USERNAME="<username>" `
  -e DB_PASSWORD="<password>" `
  photo-gallery-backend
```

The container runs as a non-root user and listens on port `8091`. Keep the database credentials in your deployment platform's secret manager rather than in the image or source control.

Before deploying:

1. Configure `VITE_API_BASE` to the public API URL before building the frontend.
2. Update the allowed frontend origin in `SecurityConfig.java`; it currently permits `http://localhost:5173`.
3. Serve the frontend with SPA fallback routing so direct visits and refreshes on routes such as `/albums/{id}` resolve to `index.html`.
4. Keep database credentials in the deployment environment or secret manager.
5. Configure session cookies and CORS for the production domains. Cross-origin cookie sessions require a compatible same-site/secure cookie policy and HTTPS.
6. The demo gallery images are served by the frontend from `frontend/public/images`; the backend does not serve or store gallery image files.
