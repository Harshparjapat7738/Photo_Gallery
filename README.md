# Photo Gallery

A full-stack photo gallery for browsing seeded users, albums, and photos.

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

- Browse five demo users and their albums.
- View album photos in a responsive gallery and full-screen viewer.
- PostgreSQL persistence for user, album, and photo records.

## Technology

| Area | Technologies |
| --- | --- |
| Frontend | React 18, Vite, React Router, Tailwind CSS |
| Backend | Java 21, Spring Boot, Spring MVC |
| Database | PostgreSQL |

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
- A reachable PostgreSQL database.

## Configuration

### Backend

The backend listens on port `8091` by default. Configure its PostgreSQL connection using the `DATABASE_URL`, `DB_USERNAME`, and `DB_PASSWORD` environment variables. All three are required; keep credentials out of source control and terminal logs.

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

| Resource | GET routes |
| --- | --- |
| Users | `/jsonplaceholder.typicode.com/users` |
| Albums | `/jsonplaceholder.typicode.com/album`, `/jsonplaceholder.typicode.com/album/user/{userId}`, `/jsonplaceholder.typicode.com/album/{id}` |
| Photos | `/jsonplaceholder.typicode.com/photo/album/{albumId}`, `/jsonplaceholder.typicode.com/photo/{id}` |

These are read-only gallery endpoints; account, upload, and mutation endpoints are not implemented.

On startup, the backend ensures five demo users have three albums each and at least 15 sample photos per album. The sample photo URLs refer to images in `frontend/public/images`, which Vite serves from the frontend origin. The seed is safe to run on later startups: existing demo users, albums, and photos are reused rather than duplicated.

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
2. Update the allowed frontend origin in `CorsConfig.java`; it currently permits `http://localhost:5173`.
3. Serve the frontend with SPA fallback routing so direct visits and refreshes on routes such as `/albums/{id}` resolve to `index.html`.
4. Keep database credentials in the deployment environment or secret manager.
5. The demo gallery images are served by the frontend from `frontend/public/images`; the backend does not serve or store gallery image files.
