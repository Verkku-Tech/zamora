# FuerzaCivil — Referencia técnica

## API endpoints

Base URL producción: `https://zamora.verkku.com/api`  
Base URL local Docker: `http://localhost:8080/api`

| Método | Ruta | Auth | Notas |
|--------|------|------|-------|
| POST | `/Auth/login` | — | Body: `{ email, password }` → `{ token, email, expiresAt }` |
| GET | `/PuntosInteres` | — | Query: `tipo`, `search` |
| GET | `/PuntosInteres/{id}` | — | |
| POST | `/PuntosInteres` | JWT | CreatePuntoInteresPayload |
| PUT | `/PuntosInteres/{id}` | JWT | |
| DELETE | `/PuntosInteres/{id}` | JWT | |
| GET | `/ZonasAfectadas` | — | Heatmap en mapa |
| POST | `/ZonasAfectadas` | JWT | |
| GET | `/Insumos` | — | Query: `puntoInteresId` |
| POST/PUT/DELETE | `/Insumos` | JWT | |
| GET | `/Config` | — | Ubicación default, municipio |
| PUT | `/Config` | JWT | |
| POST | `/Reportes` | — | Rate limit 5/min |
| GET | `/Estadisticas` | — | Dashboard |
| GET | `/health` | — | Health check |

### Payload reporte ciudadano

```typescript
{
  latitud: number
  longitud: number
  intensidad: number      // 1-5
  descripcion: string
  reportadoPor: string
}
```

### Payload crear punto

```typescript
{
  tipo: string            // centro_acopio | centro_medico | ...
  nombre: string
  latitud: number
  longitud: number
  direccion?: string
  ciudad?: string
  municipio?: string
  estado?: string
  responsable?: string
  telefono?: string
  capacidad: number
  donacionesRecibidas: number
  beneficiarios: number
  estadoOperativo?: string  // activo | parcial | inactivo
  tiposDonacion?: string[]
}
```

---

## Tipos frontend (`lib/mock-data.ts`)

### TipoPuntoInteres

`centro_acopio`, `centro_medico`, `institucion`, `albergue`, `zona_segura`, `punto_agua`, `punto_distribucion`

### Config default

```typescript
CONFIG_APP = {
  ubicacion_predeterminada: { latitud: 10.4709, longitud: -66.5485, zoom: 13 },
  municipio: 'Zamora',
  estado: 'Miranda',
  pais: 'Venezuela',
}
```

### Constantes UI

- `POI_COLORS`, `POI_ICONS`, `POI_LABELS` — markers y leyenda
- `prioridadColores`, `prioridadNombres`, `categoriaNombres` — insumos

---

## Mapa de archivos frontend

```
app/
  page.tsx              Mapa público
  centros/page.tsx      Lista pública
  login/page.tsx
  admin/
    page.tsx            Dashboard
    map/page.tsx        Mapa admin
    centros/page.tsx    CRUD
    settings/page.tsx
  layout.tsx            viewport, fonts, AuthProvider
  globals.css           tema + maplibre CSS

components/
  interactive-map.tsx
  centro-form-dialog.tsx
  centros-table.tsx
  reporte-dialog.tsx
  poi-detail-sheet.tsx  → components/map/
  admin-navbar.tsx
  public-navbar.tsx
  statistics-panel.tsx
  supplies-panel.tsx
  loading-state.tsx

lib/
  api-client.ts
  auth-context.tsx
  hooks/use-app-data.ts
  mock-data.ts          tipos/constantes ONLY
```

---

## Backend estructura

```
FuerzaCivil.Api/
  Program.cs
  Controllers/
    AuthController.cs
    PuntosInteresController.cs
    ZonasAfectadasController.cs
    InsumosController.cs
    ConfigController.cs
    ReportesController.cs
    EstadisticasController.cs
  Models/
  DTOs/
  Data/
    AppDbContext.cs
    SeedData.cs
  Migrations/
```

### Variables entorno (docker-compose api)

```
ConnectionStrings__DefaultConnection
Jwt__Secret, Jwt__Issuer, Jwt__Audience
Admin__Email, Admin__Password
Cors__Origins__0, Cors__Origins__1
ASPNETCORE_URLS=http://+:8080
```

---

## Flujos de usuario

### Reportar zona (público y admin map)

1. Clic botón naranja (AlertTriangle) en `MapFloatingControls`
2. `reportPickMode=true` → `MapPickHint` visible, cursor crosshair
3. Clic en mapa → `onMapPick(lat, lng)` → abre `ReporteDialog`
4. Submit → `POST /api/Reportes` → `refresh()` actualiza heatmap

### Crear centro (admin)

1. `/admin/centros` → "Nuevo Centro" → `CentroFormDialog`
2. "Seleccionar en el mapa" → `LocationPickerMap`
3. Clic + "Confirmar ubicación" → coords en form
4. Completar campos → `POST /api/PuntosInteres`

### Ver centro en mapa

- Desde tabla admin: `router.push('/admin/map?centro={id}')`
- Query param auto-selecciona POI en `AdminMapContent` useEffect

---

## next.config y Docker frontend

- Build standalone para imagen Docker (`output: 'standalone'` en next.config si configurado).
- `API_INTERNAL_URL` en contenedor web para rewrites server-side si aplica.
- Cliente browser siempre usa `/api` relativo (nginx proxy).

---

## Desarrollo local sin Docker

```bash
# Terminal 1 — API
cd backend/FuerzaCivil.Api
dotnet run   # ~5156

# Terminal 2 — Frontend
cd frontend
npm install
npm run dev  # ~3000, proxy /api
```

Configurar CORS en `appsettings.Development.json` para `http://localhost:3000`.
