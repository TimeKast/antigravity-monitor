# XPLAT-002: macOS Window Detection

> **Issue ID:** XPLAT-002
> **Priority:** P0
> **Effort:** S
> **Story Points:** 3
> **Status:** 📋 Backlog
> **Epic:** EPIC-XPLAT

---

## 🎯 Objetivo

Implementar la detección de ventanas de VS Code/Antigravity en macOS usando CoreGraphics. Reemplaza la funcionalidad de `detect-windows.ps1` y `find-instances.ps1` (que usan `EnumWindows` de Win32).

## User Story

> Como **usuario de macOS**, quiero que **BOB detecte mis ventanas de VS Code con Antigravity** para **poder monitorear y automatizar mis instancias**.

---

## ✅ Criterios de Aceptación

- [ ] `platform/macos.rs` implementa `scan_windows()` usando `CGWindowListCopyWindowInfo`
- [ ] Filtra ventanas que contienen "Antigravity" en el título
- [ ] Excluye ventanas del propio BOB
- [ ] Retorna `Vec<WindowInfo>` con handle, título y PID
- [ ] `set_foreground()` trae una ventana al frente usando `NSRunningApplication.activate()`
- [ ] `get_window_rect()` retorna la posición y tamaño de la ventana
- [ ] El botón "Scan" en la UI muestra las ventanas detectadas en macOS

---

## 🥒 Escenarios (Gherkin)

```gherkin
Escenario: Detectar instancia de Antigravity en macOS
  Dado que tengo VS Code abierto con Antigravity activo
  Y el título de la ventana contiene "Antigravity"
  Cuando presiono "Scan" en BOB
  Entonces la instancia aparece en la lista con su título y handle

Escenario: Sin instancias abiertas
  Dado que no hay ventanas de VS Code con Antigravity
  Cuando presiono "Scan" en BOB
  Entonces la lista está vacía y se muestra "No instances found"

Escenario: Excluir ventana de BOB
  Dado que BOB está abierto y VS Code con Antigravity también
  Cuando presiono "Scan"
  Entonces solo aparece VS Code, no la ventana de BOB
```

---

## 🔧 Contexto Técnico

**Archivos a modificar:**

- `src-tauri/src/platform/macos.rs` — Implementar `scan_windows()`, `set_foreground()`, `get_window_rect()`
- `src-tauri/Cargo.toml` — Agregar `core-graphics`, `core-foundation`, `objc2` bajo `[target.'cfg(target_os = "macos")'.dependencies]`

### API macOS a usar

```rust
// CGWindowListCopyWindowInfo retorna un CFArray de CFDictionary
// Cada dict tiene: kCGWindowOwnerName, kCGWindowName, kCGWindowNumber, kCGWindowOwnerPID, kCGWindowBounds
use core_graphics::window::{
    CGWindowListCopyWindowInfo,
    kCGWindowListOptionOnScreenOnly,
    kCGNullWindowID,
};
```

### Equivalencia con el PS1 actual

| `detect-windows.ps1` | macOS equivalente |
|---|---|
| `EnumWindows` callback | `CGWindowListCopyWindowInfo(kCGWindowListOptionOnScreenOnly, kCGNullWindowID)` |
| `GetWindowText` | Dict key `kCGWindowName` |
| `IsWindowVisible` | `kCGWindowListOptionOnScreenOnly` ya filtra |
| `GetWindowThreadProcessId` | Dict key `kCGWindowOwnerPID` |
| Title filter `"Antigravity"` | Same filter en `kCGWindowName` |

---

**Dependencias de Issues:**

- Bloqueado por: XPLAT-001
- Bloquea a: XPLAT-009

## ⚠️ Edge Cases

- VS Code sin título (ventana nueva): Ignorar ventanas con título vacío
- Múltiples monitores: `CGWindowListCopyWindowInfo` devuelve ventanas de todos los monitores
- Retina display: Las coordenadas de bounds son en puntos lógicos, no píxeles físicos

## 🧪 Tests Requeridos

- [ ] Integration: Verificar que `scan_windows("Antigravity")` retorna resultados cuando VS Code está abierto con Antigravity
- [ ] Unit: Verificar que el filtro de título funciona correctamente

## 🚫 Out of Scope

- Pixel scanning (XPLAT-003)
- Mouse/keyboard (XPLAT-004, XPLAT-005)
- Implementación Windows (XPLAT-007)

---

## 📝 Bitácora de Implementación

### Decisiones Tomadas

| Fecha | Decisión | Razón |
|-------|----------|-------|

### Problemas y Soluciones

| Fecha | Problema | Solución |
|-------|----------|----------|

---

## Commits

---

_Creado: 2026-02-08_
_Última actualización: 2026-02-08_
