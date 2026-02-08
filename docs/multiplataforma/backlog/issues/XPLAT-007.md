# XPLAT-007: Windows Migration PS1 → Rust

> **Issue ID:** XPLAT-007
> **Priority:** P1
> **Effort:** L
> **Story Points:** 8
> **Status:** 📋 Backlog
> **Epic:** EPIC-XPLAT

---

## 🎯 Objetivo

Migrar la implementación Windows de scripts PowerShell a Rust nativo usando el crate `windows`. Esto elimina el overhead de ~500ms por spawn de PowerShell y unifica la base de código.

## User Story

> Como **usuario de Windows**, quiero que **BOB use automatización nativa en vez de PowerShell** para **que sea más rápido y no dependa de la instalación de PowerShell**.

---

## ✅ Criterios de Aceptación

- [ ] `platform/windows.rs` implementa todas las funciones del trait `PlatformOps`
- [ ] Usa el crate `windows` para Win32 API directa (no `Command::new("powershell")`)
- [ ] `scan_windows()` — `EnumWindows` + `GetWindowText` nativo
- [ ] `capture_region()` / pixel detection — `GetDC` + `GetPixel` o `BitBlt` nativo
- [ ] `click_at()` — `SendInput` nativo
- [ ] `send_keys()` — `SendInput` nativo
- [ ] `set_foreground()` — `SetForegroundWindow` nativo
- [ ] Toda la funcionalidad actual se preserva (zero regresión)
- [ ] Los 10 scripts PowerShell pueden eliminarse

---

## 🥒 Escenarios (Gherkin)

```gherkin
Escenario: Performance mejorado en Windows
  Dado que BOB está corriendo en Windows
  Cuando detecta el estado de UI
  Entonces el tiempo de respuesta es <100ms (vs ~800ms con PowerShell)

Escenario: Funcionalidad preservada
  Dado que todas las funciones estaban en PowerShell
  Cuando migro a Rust nativo
  Entonces scan, detect, click, keyboard, write-to-chat funcionan igual
```

---

## 🔧 Contexto Técnico

**Archivos a crear/modificar:**

- `src-tauri/src/platform/windows.rs` — Implementar `PlatformOps` completo
- `src-tauri/Cargo.toml` — Agregar crate `windows` con features necesarios
- `src-tauri/src/lib.rs` — Eliminar todos los `Command::new("powershell")`

### Crate `windows` features necesarios

```toml
[target.'cfg(target_os = "windows")'.dependencies]
windows = { version = "0.58", features = [
    "Win32_UI_WindowsAndMessaging",
    "Win32_Graphics_Gdi",
    "Win32_UI_Input_KeyboardAndMouse",
    "Win32_Foundation",
    "Win32_System_Threading",
] }
```

### Mapeo PS1 → Rust

| Script PS1 | Función Win32 | Crate `windows` equivalent |
|-----------|--------------|---------------------------|
| `detect-windows.ps1` | `EnumWindows`, `GetWindowText` | `windows::Win32::UI::WindowsAndMessaging::*` |
| `detect-ui-state.ps1` | `GetPixel`, `GetDC` | `windows::Win32::Graphics::Gdi::*` |
| `click-button.ps1` | `SetCursorPos`, `mouse_event` | `windows::Win32::UI::Input::KeyboardAndMouse::SendInput` |
| `accept-dialog.ps1` | `keybd_event` | `SendInput` con `KEYBDINPUT` |
| `scroll-to-bottom.ps1` | `keybd_event` | `SendInput` con `KEYBDINPUT` |
| `write-to-chat.ps1` | Combo de arriba + clipboard | Combo + `SetClipboardData` |

---

**Dependencias de Issues:**

- Bloqueado por: XPLAT-001
- Bloquea a: XPLAT-010

## ⚠️ Edge Cases

- **Testing en Windows**: Requiere acceso a máquina Windows para verificar
- **Backward compatibility**: Asegurar que los mismos botones se detectan con la misma precisión

## 🧪 Tests Requeridos

- [ ] Integration: Todas las funciones previas siguen operando correctamente en Windows
- [ ] Benchmark: Comparar tiempos PS1 vs Rust nativo

## 🚫 Out of Scope

- Mejoras de funcionalidad (solo migración 1:1)
- Implementación macOS (XPLAT-002 a XPLAT-006)

---

## 📝 Bitácora de Implementación

### Decisiones Tomadas

| Fecha | Decisión | Razón |
|-------|----------|-------|

---

## Commits

---

_Creado: 2026-02-08_
_Última actualización: 2026-02-08_
