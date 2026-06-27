---
name: fuerzacivil-zamora
description: >-
  Guía completa del monorepo FuerzaCivil/Zamora: Next.js 16 + MapLibre + .NET 10 API +
  PostgreSQL/PostGIS + Docker/Nginx. Usar al trabajar en zamora, FuerzaCivil, centros de
  acopio, mapa interactivo, reportes ciudadanos, admin panel, despliegue vm-lguzman, o
  cualquier tarea en frontend/, backend/, docker-compose.yml.
---

# FuerzaCivil / Zamora — Skill del proyecto

Plataforma humanitaria para coordinación de donaciones y centros de acopio en **Municipio Zamora (Guatire, Miranda, Venezuela)**.

| Entorno | URL |
|---------|-----|
| Producción | https://zamora.verkku.com |
| Local Docker | http://localhost:8080 |
| Repo | https://github.com/Verkku-Tech/zamora |

**Idioma:** responder en **español** cuando el usuario escribe en español.

**Git:** NO hacer `git push` ni commits salvo que el usuario lo pida explícitamente.

---

## Stack y estructura

```
zamora/
├── frontend/                 Next.js 16, MapLibre GL, Tailwind, shadcn/ui
│   ├── app/                  Rutas App Router
│   ├── components/           UI + mapa + admin
│   └── lib/
│       ├── api-client.ts     Cliente HTTP → /api/*
│       ├── auth-context.tsx  JWT en localStorage
│       ├── mock-data.ts      SOLO tipos y constantes (NO arrays mock)
│       └── hooks/use-app-data.ts
├── backend/FuerzaCivil.Api/  .NET 10, EF Core, PostGIS
├── docker-compose.yml        Vars hardcodeadas (sin GitHub Secrets)
├── nginx.conf                / → web:3000, /api → api:8080
└── .github/workflows/deploy-docker.yml
```

| Servicio | Puerto interno | Notas |
|----------|----------------|-------|
| proxy (nginx) | 8080 expuesto | Punto de entrada |
| web (Next.js) | 3000 | standalone build |
| api (.NET) | 8080 | health `/health` |
| db (PostGIS) | 5432 | `fuerzacivil` |

---

## Reglas de arquitectura frontend

### Datos

- **Nunca** reintroducir arrays mock en `mock-data.ts`. Los datos vienen de la API vía `useAppData()`.
- Mapeo API → frontend en `api-client.ts` (`mapPunto`, `mapZona`, `mapConfig`, `buildInsumosMap`).
- Convención de nombres: API usa camelCase (`estadoOperativo`); tipos frontend usan snake_case en algunos campos (`estado_operativo`) — respetar mappers existentes.

### Auth

- Login: `POST /api/Auth/login` → JWT en `localStorage` key `auth_token`.
- Rutas admin protegidas con `useAuth()` + redirect a `/login`.
- CRUD de puntos/insumos/config requiere Bearer token.

### Rutas principales

| Ruta | Descripción |
|------|-------------|
| `/` | Mapa público + reportes + POI detail |
| `/centros` | Lista pública de centros (read-only) |
| `/login` | Login admin |
| `/admin` | Dashboard estadísticas |
| `/admin/map` | Mapa admin + reportes + POI panel |
| `/admin/centros` | CRUD centros |
| `/admin/settings` | Config municipio/mapa default |

---

## Mapa (MapLibre) — reglas críticas

### Componentes del mapa

| Archivo | Rol |
|---------|-----|
| `components/interactive-map.tsx` | Mapa principal: POIs, heatmap zonas, pick mode, controles |
| `components/map/map-floating-controls.tsx` | Botones reportar + geolocalizar |
| `components/map/map-pick-hint.tsx` | Hint compacto en modo selección (NO franja naranja) |
| `components/map/location-picker-map.tsx` | Mapa fullscreen para elegir coords (nuevo centro) |
| `components/map/poi-detail-sheet.tsx` | Panel POI: bottom sheet móvil, sidebar desktop |
| `components/map/legend.tsx` | Leyenda colapsable móvil / fija desktop |
| `components/centro-form-dialog.tsx` | Formulario centro con picker de ubicación |

### Import obligatorio

```tsx
import 'maplibre-gl/dist/maplibre-gl.css'
```

Y en `globals.css`:

```css
.maplibregl-map, .maplibregl-canvas { width: 100% !important; height: 100% !important; }
```

### Contenedor del mapa

- Padre: `relative flex-1 min-h-[50vh] h-[calc(100dvh-56px)] md:h-[calc(100vh-72px)]`
- Mapa interno: `absolute inset-0` + `min-h-[300px]`
- **Siempre** llamar `map.resize()` en `onLoad`, con `ResizeObserver` en el contenedor.
- Cargar mapa con `dynamic(..., { ssr: false })`.

### Estilo de tiles

```tsx
mapStyle="https://tiles.openfreemap.org/styles/liberty"
```

### Modo selección en mapa (reporte)

Props en `InteractiveMap`:

```tsx
reportPickMode={bool}
pickHint="Selecciona la zona afectada en el mapa"
onMapPick={(lat, lng) => ...}      // un clic → acción
onReportPickCancel={() => ...}
onReportClick={() => ...}          // OBLIGATORIO para mostrar botones
pickMarker={{ lat, lng } | null}
sidePanelOpen={!!selectedPoi}      // desplaza controles si hay panel lateral
```

**Errores evitados:**
- Sin `onReportClick` → no aparecen botones reportar (pasaba en `/admin/map`).
- NO usar franja naranja full-width; usar `MapPickHint` (pastilla centrada).
- NO usar `position: fixed` para paneles dentro del mapa en desktop; usar `absolute` respecto al contenedor del mapa.

### Controles flotantes (`MapFloatingControls`)

- **Móvil:** columna iconos 36px, `right-2.5 bottom-[5.5rem]` (encima del zoom MapLibre).
- **Desktop:** fila horizontal iconos, `top-3 right-3` (sin texto largo).
- `z-50` para quedar sobre controles MapLibre.
- Si `sidePanelOpen`, desplazar `right` para no quedar detrás del panel POI.

### Panel POI (`PoiDetailSheet`)

- **Móvil:** `fixed` bottom sheet, max-h ~52dvh, overlay oscuro.
- **Desktop:** `hidden md:flex absolute top-3 right-3 bottom-3 w-96` — sidebar dentro del mapa.
- Desktop siempre muestra info completa (donaciones, beneficiarios, estado); no usar modo compact en web.

### Nuevo centro — ubicación

- **NO** campos manuales lat/lng en el formulario.
- Botón "Seleccionar en el mapa" → `LocationPickerMap` (fullscreen, clic + confirmar).
- Validar `locationSet` antes de guardar.
- Mismo patrón visual que reporte pero con confirmación explícita.

---

## Responsive

| Componente | Móvil | Desktop |
|------------|-------|---------|
| `centros-table.tsx` | Tarjetas (`md:hidden`) | Tabla (`hidden md:block`) |
| `public-navbar.tsx` | Iconos sin texto | Logo + labels |
| `admin-navbar.tsx` | Iconos centro + hamburger | Nav completa |
| Páginas admin/centros | `px-3 py-4`, títulos `text-2xl` | `md:py-8`, `text-3xl` |
| `layout.tsx` viewport | `width: device-width, initialScale: 1` | — |
| `globals.css` | `overflow-x-hidden` en html/body | — |

---

## Backend (.NET 10)

### Program.cs — puntos clave

- JWT obligatorio (`Jwt:Secret` min 32 chars).
- CORS desde `Cors:Origins` array en config/docker-compose.
- Rate limit `reportes`: 5 req/min en `POST /api/Reportes`.
- Migraciones EF con **30 reintentos × 3s** al arrancar (race condition Docker).
- Health check Npgsql en `/health`.

### Controllers

| Controller | Auth admin |
|------------|------------|
| Auth, PuntosInteres GET, Zonas GET, Insumos GET, Config GET, Reportes POST | Público |
| Puntos/Insumos/Zonas/Config POST PUT DELETE | `[Authorize]` |

### PostGIS

- Coordenadas en modelos con NetTopologySuite.
- No romper migraciones existentes; crear nueva migración si cambia schema.

---

## Docker y despliegue

### Comandos

```bash
docker compose up -d --build          # local/prod
docker compose up -d --build web      # solo frontend
docker compose logs api -f            # debug API
```

### Credenciales (docker-compose.yml)

- Admin: `admin@fuerzacivil.org` / `Zamora2026!`
- DB: `postgres` / `fuerzacivil2026`
- CORS: `https://zamora.verkku.com`, `http://localhost:8080`

### CI/CD

- Workflow: push a `main`/`master` → runner `[self-hosted, Linux, X64, vm-lguzman]`.
- **Sin GitHub Secrets** — vars en compose.
- Cloudflare Tunnel `zamora-verkku` → `localhost:8080`.

### Nginx

- Frontend llama API en `/api` (mismo origen). `api-client.ts` usa `const API_BASE = '/api'`.
- NO añadir Vercel Analytics (`@vercel/analytics`) — falla 404 en self-hosted.

---

## Checklist antes de entregar cambios de mapa/UI

```
- [ ] InteractiveMap tiene contenedor con altura explícita y resize()
- [ ] Botones reportar: onReportClick pasado en TODAS las páginas con mapa
- [ ] Modo pick usa MapPickHint, no banner ancho
- [ ] Paneles mapa usan absolute (desktop), no fixed sobre viewport
- [ ] Formulario centro usa LocationPickerMap, no inputs lat/lng
- [ ] CentrosTable tiene vista móvil en tarjetas
- [ ] npm run build en frontend pasa
- [ ] Cambios CORS si hay nuevo dominio
```

---

## PowerShell (Windows dev)

Usar `;` en lugar de `&&`:

```powershell
Set-Location "...\frontend"; npm run build
```

---

## Patrones de código preferidos

1. **Minimizar scope** — diffs pequeños, no refactorizar lo no pedido.
2. **Reutilizar** componentes mapa existentes antes de crear nuevos.
3. **Convenciones locales** — leer código circundante antes de escribir.
4. **Tests** — solo si el usuario lo pide o aportan valor real.

---

## Recursos adicionales

- API detallada, mappers y modelos: [reference.md](reference.md)
- Errores históricos y soluciones: [troubleshooting.md](troubleshooting.md)
