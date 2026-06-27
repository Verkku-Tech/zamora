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
# 1. Copiar variables de entorno
cp .env.example .env
# Editar .env con contraseñas seguras

# 2. Levantar todo el stack
docker compose up -d --build

# 3. Abrir en el navegador
# http://localhost:8080
```

### Credenciales por defecto (cambiar en .env)

- **Admin:** `admin@fuerzacivil.org` / valor de `ADMIN_PASSWORD` en `.env`
- **Puerto:** `8080` (nginx proxy → frontend + API)

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

El workflow `.github/workflows/deploy-docker.yml` despliega automáticamente en push a `main`.

### Configurar secrets en GitHub

| Secret | Descripción |
|--------|-------------|
| `POSTGRES_PASSWORD` | Contraseña de PostgreSQL |
| `JWT_SECRET` | Clave JWT (mín. 32 caracteres) |
| `ADMIN_EMAIL` | Email del administrador |
| `ADMIN_PASSWORD` | Contraseña del administrador |
| `PUBLIC_URL` | URL pública (ej. `https://fuerzacivil.example.com`) |
| `WEB_PORT` | Puerto expuesto (default `8080`) |

### Instalar self-hosted runner

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
| GET | `/health` | Público |

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
