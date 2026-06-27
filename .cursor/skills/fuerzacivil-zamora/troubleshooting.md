# FuerzaCivil — Errores conocidos y soluciones

Documento basado en problemas reales resueltos en el proyecto. Consultar **antes** de reintroducir los mismos bugs.

---

## Mapa negro / no renderiza (web)

**Síntoma:** Navbar carga, área del mapa negra. Tiles en Network pueden responder 200.

**Causas y fixes:**

1. Canvas MapLibre con altura 0 por flex layout
   - Contenedor padre: `relative flex-1 min-h-[50vh] h-[calc(...)]`
   - Hijo mapa: `absolute inset-0 min-h-[300px]`
   - `map.resize()` en onLoad + `ResizeObserver`

2. CSS MapLibre no aplicado
   - Import en `interactive-map.tsx`
   - Reglas en `globals.css` para `.maplibregl-map` y `.maplibregl-canvas`

3. SSR de MapLibre
   - `dynamic(() => import('...interactive-map'), { ssr: false })`

---

## Botones reportar no aparecen (solo web o solo admin)

**Síntoma:** Móvil sí, desktop no — o admin map sin botones.

**Causas:**

1. Falta prop `onReportClick` en `InteractiveMap` → botones no se montan
2. Botones detrás del panel POI desktop (mismo `right`, z-index bajo)
   - Fix: `z-50`, desktop en `top-3`, `sidePanelOpen` desplaza posición

3. Confundir `/admin/map` (necesita report flow explícito) con `/` (público)

---

## Franja naranja horrible en modo reporte

**Síntoma:** Banner full-width naranja tapa el mapa.

**Fix:** Usar `MapPickHint` — pastilla compacta centrada arriba con punto pulsante y botón X. **Nunca** volver a `bg-orange-500 inset-x-2` barra ancha.

---

## Panel Info mal en desktop

**Síntoma:** Panel flotante pequeño arriba-derecha del viewport, info incompleta.

**Fix:**
- `PoiDetailSheet` desktop: `absolute top-3 right-3 bottom-3` dentro del contenedor mapa
- Móvil: bottom sheet `fixed`
- No usar `compact` en desktop; info completa siempre en web

---

## Tabla centros no responsive

**Síntoma:** Columnas cortadas en móvil, scroll horizontal inutilizable.

**Fix:** `CentrosTable` — tarjetas en `< md`, tabla en `>= md`.

---

## Nuevo centro con lat/lng manual

**Síntoma:** Usuario debe tipear coordenadas.

**Fix:** `LocationPickerMap` + botón "Seleccionar en el mapa". Validar `locationSet` antes de submit. Editar usa "Cambiar" con coords iniciales.

---

## API no conecta / CORS

**Síntoma:** Frontend no carga datos en producción.

**Checks:**
- `Cors__Origins__0: https://zamora.verkku.com` en docker-compose
- nginx proxy `/api/` → backend
- Frontend usa `/api` relativo, no URL absoluta al backend

---

## API crash al arrancar Docker

**Síntoma:** `fuerzacivil-api-1 is unhealthy`, `dependency failed to start`.

**Causas:**
1. Migraciones bloquean `app.Run()` → healthcheck expira
2. `/health` con Npgsql falla antes de que Kestrel escuche

**Fix:**
- `/health/live` para Docker healthcheck
- `/health` para readiness (PostgreSQL)
- `web` usa `depends_on: api: service_started`
- `start_period: 120s` en api

---

## 404 Vercel Analytics

**Síntoma:** `/_vercel/insights/script.js` 404 en producción.

**Fix:** No usar `@vercel/analytics` — deploy es Docker self-hosted, no Vercel.

---

## Deploy CI falla

**Checks:**
- Runner `vm-lguzman` registrado en `Verkku-Tech/zamora` (no otro repo)
- Docker + compose en servidor
- `docker compose build` pasa localmente antes de push
- Frontend: `npm run build` sin errores

---

## Geolocalización lleva a España u otro país

**Comportamiento esperado:** `navigator.geolocation` usa ubicación real del dispositivo. En dev fuera de Venezuela es normal. Centro default del mapa sigue siendo Guatire (10.4709, -66.5485) vía `CONFIG_APP`.

---

## PowerShell build falla

**Síntoma:** `&&` no es separador válido.

**Fix:** `Set-Location path; npm run build`

---

## Anti-patrones — NO hacer

| ❌ Evitar | ✅ Hacer |
|----------|---------|
| Arrays mock en mock-data.ts | useAppData + API |
| `position: fixed` panel mapa desktop | `absolute` en contenedor mapa |
| Banner naranja full-width pick mode | MapPickHint |
| Inputs lat/lng en formulario centro | LocationPickerMap |
| Olvidar onReportClick en map pages | Pasar siempre si hay reporte |
| git push automático | Solo si usuario pide |
| GitHub Secrets para este proyecto | Vars en docker-compose.yml |
| Tabla única sin vista móvil | Tarjetas + tabla |
| prop `cursor` en `<Map>` react-map-gl | cursor-crosshair en contenedor div |
