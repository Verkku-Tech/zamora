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
