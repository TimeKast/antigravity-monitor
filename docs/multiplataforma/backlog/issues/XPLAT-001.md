# XPLAT-001: Platform Abstraction Trait

> **Issue ID:** XPLAT-001
> **Priority:** P0
> **Effort:** M
> **Story Points:** 5
> **Status:** 📋 Backlog
> **Epic:** EPIC-XPLAT

---

## 🎯 Objetivo

Crear la capa de abstracción que define la API unificada para operaciones de automatización UI. Este trait será implementado de forma distinta en cada OS (macOS y Windows), permitiendo que `lib.rs` llame a las mismas funciones sin importar la plataforma.

## User Story

> Como **desarrollador**, quiero **una API de plataforma unificada** para **poder agregar soporte de nuevos OS sin modificar la lógica de negocio**.

---

## ✅ Criterios de Aceptación

- [ ] Existe el módulo `src-tauri/src/platform/mod.rs` con el trait `PlatformOps`
- [ ] El trait define funciones para: scan_windows, get_window_rect, capture_region, get_pixel_color, click_at, send_keys, set_foreground, scroll
- [ ] Existen tipos compartidos: `WindowInfo`, `Rect`, `Color`, `Key`, `Modifier`
- [ ] Existe `platform/color.rs` con la lógica de clasificación de colores (is_accept_button, is_retry_button, is_gray_button, is_red_button)
- [ ] `lib.rs` compila usando el trait en vez de `Command::new("powershell")` para al menos un comando
- [ ] Compilación condicional funciona: `#[cfg(target_os)]` selecciona el módulo correcto

---

## 🥒 Escenarios (Gherkin)

```gherkin
Escenario: Compilación condicional en macOS
  Dado que estoy compilando en macOS
  Cuando ejecuto `cargo build`
  Entonces se compila `platform/macos.rs` y NO `platform/windows.rs`

Escenario: Compilación condicional en Windows
  Dado que estoy compilando en Windows
  Cuando ejecuto `cargo build`
  Entonces se compila `platform/windows.rs` y NO `platform/macos.rs`

Escenario: Detección de color Accept (compartido)
  Dado que tengo un pixel con R=69 G=130 B=236
  Cuando evalúo `is_accept_button_color()`
  Entonces retorna true
```

---

## 🔧 Contexto Técnico

**Archivos a crear:**

- `src-tauri/src/platform/mod.rs` — Trait `PlatformOps`, tipos compartidos, re-exports
- `src-tauri/src/platform/color.rs` — Lógica de clasificación de colores extraída de `detect-ui-state.ps1`
- `src-tauri/src/platform/macos.rs` — Stub vacío con `todo!()` por ahora
- `src-tauri/src/platform/windows.rs` — Stub vacío con `todo!()` por ahora

**Archivos a modificar:**

- `src-tauri/src/lib.rs` — Agregar `mod platform;` y refactorizar `scan_windows` para usar el trait
- `src-tauri/Cargo.toml` — Agregar dependencias condicionales

### Trait propuesto

```rust
pub struct WindowInfo {
    pub handle: u64,
    pub title: String,
    pub pid: u32,
}

pub struct Rect {
    pub x: i32,
    pub y: i32,
    pub width: i32,
    pub height: i32,
}

pub struct Color {
    pub r: u8,
    pub g: u8,
    pub b: u8,
}

pub trait PlatformOps {
    fn scan_windows(filter: &str) -> Result<Vec<WindowInfo>, String>;
    fn get_window_rect(handle: u64) -> Result<Rect, String>;
    fn capture_region(rect: &Rect) -> Result<Vec<u8>, String>; // ARGB pixels
    fn click_at(x: i32, y: i32) -> Result<(), String>;
    fn send_keys(keys: &[Key], modifiers: &[Modifier]) -> Result<(), String>;
    fn set_foreground(handle: u64) -> Result<(), String>;
    fn scroll_down(x: i32, y: i32, amount: i32) -> Result<(), String>;
    fn paste_text(text: &str) -> Result<(), String>;
}
```

---

**Dependencias de Issues:**

- Bloqueado por: Ninguno
- Bloquea a: XPLAT-002, XPLAT-003, XPLAT-004, XPLAT-005, XPLAT-007, XPLAT-008

## ⚠️ Edge Cases

- Doble target en CI: Asegurar que se pueda cross-compilar sin errores de imports
- Tipos de handle: En Windows es `HWND` (isize), en macOS es `CGWindowID` (u32). Unificar como `u64`

## 🧪 Tests Requeridos

- [ ] Unit: `color.rs` — test cada clasificación de color con valores conocidos de `detect-ui-state.ps1`
- [ ] Unit: Trait compila correctamente en ambos targets

## 🚫 Out of Scope

- Implementación real de las funciones (solo stubs)
- Migración de otros comandos Tauri (solo `scan_windows` como prueba de concepto)

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
