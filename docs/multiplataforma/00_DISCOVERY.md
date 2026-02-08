# 🦞 BOB — Discovery: Análisis para Soporte Multiplataforma

_Creado: 2026-02-08_

---

## 1. Contexto

BOB es una herramienta de escritorio (Tauri v2 + Svelte 5 + Rust) que automatiza múltiples instancias de Antigravity en VS Code. Actualmente **solo funciona en Windows** debido a su dependencia en PowerShell y Win32 API.

**Objetivo**: Hacer BOB multiplataforma (Windows + macOS) para que cualquier miembro del equipo pueda usarlo independientemente de su OS.

---

## 2. Arquitectura Actual

```
Frontend (Svelte 5) → invoke() → Backend (Rust/Tauri) → Command::new("powershell") → Scripts PS1 → Win32 API
```

### Stack por Capa

| Capa | Tecnología | Cross-platform? |
|------|-----------|:---:|
| Frontend | Svelte 5 / SvelteKit / TypeScript | ✅ |
| State Management | Svelte stores + localStorage | ✅ |
| Backend Framework | Tauri v2 / Rust | ✅ |
| HTTP (Discord) | reqwest crate | ✅ |
| Logging | chrono + fs | ✅ |
| **Automatización UI** | **PowerShell + Win32 API** | **❌** |
| **Window Detection** | **EnumWindows (user32.dll)** | **❌** |
| **Pixel Scanning** | **GetPixel (gdi32.dll)** | **❌** |
| **Mouse/Keyboard** | **mouse_event / keybd_event** | **❌** |

### Conclusión: Solo la capa de automatización UI necesita cambiar.

---

## 3. Inventario de Dependencias Windows

### Scripts PowerShell (10 archivos, ~1,300 líneas)

| Script | Líneas | Win32 APIs | Función |
|--------|--------|-----------|---------|
| `detect-ui-state.ps1` | 446 | `GetPixel`, `GetDC`, `GetWindowRect`, `SetForegroundWindow`, `mouse_event` | Escanea píxeles para detectar botones (Accept/Retry/Chat) |
| `detect-windows.ps1` | 88 | `EnumWindows`, `GetWindowText`, `IsWindowVisible`, `GetWindowThreadProcessId` | Lista ventanas con "Antigravity" en título |
| `write-to-chat.ps1` | 127 | `SetForegroundWindow`, `SetCursorPos`, `mouse_event`, `keybd_event` | Click en chat → clipboard paste → Enter |
| `click-button.ps1` | 90 | `SetCursorPos`, `mouse_event`, `SetForegroundWindow` | Click en coordenadas de pantalla |
| `accept-dialog.ps1` | 76 | `keybd_event`, `SetForegroundWindow` | Alt+Enter para aceptar diálogos |
| `scroll-to-bottom.ps1` | 67 | `keybd_event`, `SetForegroundWindow` | Ctrl+End para scroll |
| `read-backlog.ps1` | 109 | Ninguna (filesystem) | Cuenta issues completados en `docs/backlog/` |
| `paste-prompt.ps1` | 123 | `SetForegroundWindow`, `SendKeys` | Legacy: busca ventana por título y pega prompt |
| `find-instances.ps1` | 106 | `EnumWindows`, `GetWindowText` | Alternativa a detect-windows (no usada) |
| `debug-colors.ps1` | 66 | `GetPixel`, `GetDC` | Debug: muestra colores RGB del área de chat |

### Backend Rust (`lib.rs` — 577 líneas)

11 comandos Tauri, de los cuales **8 lanzan PowerShell** vía `Command::new("powershell")`:
- `scan_windows`, `detect_ui_state`, `click_button`, `accept_dialog`, `scroll_to_bottom`, `write_to_chat`, `read_backlog`, `paste_prompt`

3 comandos ya son cross-platform:
- `notify_discord` (reqwest HTTP)
- `write_log` (filesystem)
- `get_instance_status` (stub, siempre devuelve "idle")

### Otros Issues Detectados

1. **Path hardcodeado** en `store.ts:247`: `C:\Users\flevik\Proyectos Timekast\` — solo funciona en una máquina
2. **Código muerto**: `ui-automation.js` (wrapper Node.js, no usado), `find-instances.ps1` (no referenciado), `startUIPolling()` (reemplazado por `startAutoImplementation()`)
3. **Duplicación**: `get_script_path()` helper existe pero solo se usa en 3 de 8 comandos
4. **CSP desactivado**: `tauri.conf.json` tiene `"csp": null`
5. **Título genérico**: `app.html` dice "Tauri + SvelteKit + Typescript App"
6. **Polling indicator**: UI dice "every 5s" pero el intervalo real es configurable (default 20s)

---

## 4. Equivalencias macOS

| Función | Windows (Win32) | macOS (CoreGraphics / AppKit) |
|---------|----------------|------------------------------|
| Listar ventanas | `EnumWindows` + `GetWindowText` | `CGWindowListCopyWindowInfo` |
| Obtener rect de ventana | `GetWindowRect` | `CGWindowListCopyWindowInfo` (bounds) |
| Screenshot de región | `GetPixel` (uno por uno) | `CGWindowListCreateImage` (screenshot completo) |
| Leer color de pixel | `GetPixel` | Extraer bytes del `CGImage` (ARGB) |
| Click mouse | `SetCursorPos` + `mouse_event` | `CGEventCreateMouseEvent` + `CGEventPost` |
| Enviar tecla | `keybd_event` | `CGEventCreateKeyboardEvent` + `CGEventPost` |
| Traer ventana al frente | `SetForegroundWindow` | `NSRunningApplication.activate()` vía objc2 |
| Scroll mouse | `mouse_event(WHEEL)` | `CGEventCreateScrollWheelEvent` |

### Crates Rust disponibles

| Crate | Versión | Para qué |
|-------|---------|----------|
| `core-graphics` | 0.24 | Screenshots, pixel data |
| `core-foundation` | 0.10 | String/Data types para interop |
| `objc2` | 0.5 | Acceso a NSWorkspace/NSRunningApplication |
| `cocoa` | 0.26 | Alternativa a objc2 para AppKit |
| `windows` | 0.58 | Win32 API nativa desde Rust (reemplazo de PS1) |

### Permisos requeridos en macOS

1. **Screen Recording** — Para `CGWindowListCreateImage` (leer píxeles de la pantalla)
2. **Accessibility** — Para `CGEventPost` (inyectar clicks y keystroke)

Estos permisos se solicitan al primer uso y el usuario los concede manualmente en System Settings.

---

## 5. Propuesta: Migración a Rust Nativo

### Estrategia elegida: Todo en Rust con compilación condicional

En vez de reemplazar PowerShell con otros scripts (AppleScript, bash), migrar toda la lógica directamente a Rust. El compilador incluye solo el código del OS actual.

### Beneficios

- **Un solo codebase** — Sin mantener scripts separados por OS
- **Más rápido** — Eliminar PowerShell startup (~500ms por acción) en Windows
- **Type-safe** — Errores detectados en compilación, no en runtime
- **Menor superficie de ataque** — Sin ejecución de scripts externos

### Estructura propuesta

```
src-tauri/src/
├── lib.rs              # Comandos Tauri (modificado: usa platform trait)
├── main.rs             # Sin cambios
├── platform/
│   ├── mod.rs          # Trait PlatformOps + types compartidos
│   ├── macos.rs        # Implementación macOS (CoreGraphics + CGEvent)
│   ├── windows.rs      # Implementación Windows (windows crate)
│   └── color.rs        # Lógica de detección de colores (compartida)
```

---

## 6. Estimación

| Fase | Descripción | Esfuerzo | Dependencias |
|------|------------|----------|-------------|
| 1 | Platform trait + macOS window detection | S | Ninguna |
| 2 | macOS screenshot + pixel detection | M | Fase 1 |
| 3 | macOS mouse + keyboard automation | M | Fase 1 |
| 4 | Write-to-chat composite | S | Fase 2, 3 |
| 5 | Windows migration PS1 → Rust | M | Fase 1 |
| 6 | Config paths + permisos + polish | S | Fase 1-4 |

**Total estimado**: ~1 semana de desarrollo

---

_Este documento es el resultado del análisis completo del codebase de BOB realizado el 2026-02-08._
