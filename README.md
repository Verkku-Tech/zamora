# FuerzaCivil — Plataforma de coordinación humanitaria

Sistema de mapa interactivo, centros de acopio e insumos para el municipio Zamora (Guatire, Miranda, Venezuela).

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 16, MapLibre GL, Tailwind |
| Backend | .NET 10 Web API, EF Core |
| Base de datos | PostgreSQL 17 + PostGIS |
| Despliegue | Docker Compose + Nginx |

## Inicio rápido con Docker

```bash
docker compose up -d --build
# App en http://localhost:8080
```

### Credenciales (definidas en docker-compose.yml)

- **Admin:** `admin@fuerzacivil.org` / `Zamora2026!`
- **Puerto:** `8080`

## Desarrollo local

### Requisitos

- Node.js 22+
- .NET 10 SDK
- PostgreSQL 17 con PostGIS

### Backend

```bash
cd backend/FuerzaCivil.Api
dotnet run
# API en http://localhost:5156
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# App en http://localhost:3000 (proxy /api → backend)
```

## GitHub Actions (self-hosted runner)

Repositorio: [Verkku-Tech/zamora](https://github.com/Verkku-Tech/zamora)

El workflow `.github/workflows/deploy-docker.yml` despliega en push a `main`. **No requiere GitHub Secrets** — las variables están en `docker-compose.yml`.

### Self-hosted runner (`vm-lguzman`)

1. En GitHub: [Verkku-Tech/zamora → Settings → Actions → Runners](https://github.com/Verkku-Tech/zamora/settings/actions/runners) → **New self-hosted runner**
2. En el servidor `verkku`:

```bash
mkdir -p ~/actions-runner-zamora && cd ~/actions-runner-zamora
# Descargar y extraer el runner (usa el enlace que GitHub muestra)
./config.sh --url https://github.com/Verkku-Tech/zamora --token TU_TOKEN
sudo ./svc.sh install sa
sudo ./svc.sh start
```

3. Asegurar que Docker y Docker Compose estén instalados en el servidor.

> **Runner configurado:** `vm-lguzman` — el workflow apunta a `[self-hosted, Linux, X64, vm-lguzman]`.

### Reconfigurar runner en verkku (si hace falta)

Tu servicio actual escucha jobs de **`luigiguz-AtlasVPN`**, no de **`Verkku-Tech/zamora`**. Hay que reconfigurarlo:

```bash
cd ~/actions-runner
sudo ./svc.sh stop

# Quitar registro anterior
./config.sh remove

# Token nuevo desde:
# https://github.com/Verkku-Tech/zamora/settings/actions/runners/new
# (o a nivel org: https://github.com/organizations/Verkku-Tech/settings/actions/runners/new)

./config.sh --url https://github.com/Verkku-Tech/zamora --token TU_TOKEN_NUEVO --name vm-lguzman

sudo ./svc.sh install sa
sudo ./svc.sh start
sudo ./svc.sh status
```

Verifica en [Verkku-Tech/zamora → Runners](https://github.com/Verkku-Tech/zamora/settings/actions/runners) que aparece **vm-lguzman** en estado **Idle**.

## API endpoints

| Método | Ruta | Auth |
|--------|------|------|
| POST | `/api/Auth/login` | Público |
| GET | `/api/PuntosInteres` | Público |
| GET | `/api/ZonasAfectadas` | Público |
| GET | `/api/Insumos` | Público |
| GET | `/api/Config` | Público |
| POST | `/api/Reportes` | Público (rate-limited) |
| POST/PUT/DELETE | CRUD admin | JWT Bearer |
| GET | `/health/live` | Público | Liveness (Docker) |
| GET | `/health` | Público | Readiness (incluye PostgreSQL) |

## Estructura

```
zamora/
├── frontend/          Next.js app
├── backend/           .NET 10 API
├── docker-compose.yml
├── nginx.conf
└── .github/workflows/
```

## Licencia

Uso humanitario — Municipio Zamora, Miranda, Venezuela.
