# Sistema de Feature Flags con SQLite

## Idea

Agregar un servidor Node.js/Express mínimo que sirve los archivos estáticos y expone una API REST que lee una base de datos SQLite local. El cliente obtiene los flags al cargar y aplica el estado a los elementos UI. Si el servidor no responde (timeout 2s), todo permanece habilitado (fail-open).

## Arquitectura

```
npm start
  └─ server.js (puerto 3000)
       ├─ GET /              → sirve index.html (landing)
       ├─ GET /desktop.html  → sirve desktop.html
       ├─ GET /mobile.html   → sirve mobile.html
       ├─ GET /api/flags     → { share: true, analytics: false, ... }
       ├─ PATCH /api/flags/:key → actualiza flag
       ├─ GET /api/flags/details → info completa para admin UI
       ├─ GET /admin         → sirve admin.html
       └─ data/flags.db      → SQLite (better-sqlite3)
```

## Flags a controlar

| Key | Label | Descripción |
|---|---|---|
| `share` | Compartir Tableros | Botón QR/código en el header del tablero (desktop y mobile) |
| `analytics` | Pestaña Análisis | Columna de gráficos en desktop, tab Análisis en mobile |
| `feedback` | Formulario Feedback | Botón 💬 y nudge emergente al hacer login |
| `pwa` | Instalación PWA | Toast desktop / sheet mobile de instalación |

## Archivos a crear

| Archivo | Propósito |
|---|---|
| `package.json` | Dependencias: express + better-sqlite3 |
| `server.js` | Servidor Express + API + inicialización SQLite |
| `admin.html` | Panel web con toggle switches |
| `js/shared/flags.js` | Carga flags del servidor, expone `FLAGS` global |
| `data/.gitkeep` | Mantiene el directorio `data/` en git sin versionar la DB |

## Archivos a modificar

| Archivo | Cambio |
|---|---|
| `desktop.html` | Agregar `flags.js` al orden de scripts; clase `js-feedback-btn` a 2 botones |
| `mobile.html` | Igual; clase `js-feedback-btn` a 2 botones |
| `js/desktop/main.js` | Envolver INIT en `initApp()` async; `applyFlags()`; guards en nudge + PWA |
| `js/mobile/main.js` | Igual; mover `setTimeout(_tryShowInstall)` dentro de `initApp()` |
| `js/desktop/render.js` | Condicionar `container.appendChild(analyticsEl)` con `FLAGS.analytics` |
| `js/mobile/render.js` | Guard en `renderActiveTab()` si analytics flag off |
| `.gitignore` | Agregar `data/*.db`, `data/*.db-shm`, `data/*.db-wal` |

## Panel Admin

Página `/admin` con CSS inline, sin dependencias externas, usando los colores del proyecto:
- Grid de cards, una por flag
- Toggle switch CSS puro
- PATCH a la API al cambiar cada toggle
- Badge de estado "Conectado" / "Sin conexión"

## Comportamiento del cliente (flags.js)

```javascript
var FLAGS = { share: true, analytics: true, feedback: true, pwa: true };

function loadFlags() {
  var timeout = new Promise(function(resolve) { setTimeout(resolve, 2000); });
  var fetchFlags = fetch('/api/flags')
    .then(function(res) { return res.json(); })
    .then(function(data) {
      FLAGS.share     = data.share     !== false;
      FLAGS.analytics = data.analytics !== false;
      FLAGS.feedback  = data.feedback  !== false;
      FLAGS.pwa       = data.pwa       !== false;
    })
    .catch(function() { /* silencioso: FLAGS queda todo true */ });
  return Promise.race([fetchFlags, timeout]);
}
```

- `data.x !== false` garantiza fail-open si el campo es null, undefined o está ausente
- Siempre resuelve (nunca rechaza), se puede usar con `await` sin try/catch

## Elementos HTML afectados por cada flag

| Flag | Desktop | Mobile |
|---|---|---|
| `share` | `#share-board-btn-pc` | `#share-board-btn` |
| `analytics` | `container.appendChild(analyticsEl)` en render.js | `.tab-item[data-tab="analytics"]` |
| `feedback` | `.js-feedback-btn` x2 + guard en `showFeedbackNudgePC()` | `.js-feedback-btn` x2 + guard en `showFeedbackNudge()` |
| `pwa` | guard en `_showInstallToast()` | `setTimeout(_tryShowInstall)` condicionado en `initApp()` |

## Esquema SQLite

```sql
CREATE TABLE IF NOT EXISTS feature_flags (
  key         TEXT PRIMARY KEY,
  enabled     INTEGER NOT NULL DEFAULT 1,
  label       TEXT NOT NULL,
  description TEXT NOT NULL,
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
```

## Para implementar

```bash
npm install
npm start
# Abrir http://localhost:3000/admin
```
