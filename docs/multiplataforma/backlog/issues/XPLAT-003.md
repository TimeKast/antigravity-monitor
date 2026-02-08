# XPLAT-003: macOS Screenshot and Pixel Detection

> **Issue ID:** XPLAT-003
> **Priority:** P0
> **Effort:** L
> **Story Points:** 8
> **Status:** 📋 Backlog
> **Epic:** EPIC-XPLAT

---

## 🎯 Objetivo

Implementar la captura de screenshots y análisis de píxeles en macOS para detectar el estado de la UI de Antigravity (botones Accept, Retry, color del chat button). Reemplaza la funcionalidad de `detect-ui-state.ps1` (446 líneas) que usa `GetPixel`/`GetDC` de Win32.

## User Story

> Como **usuario de macOS**, quiero que **BOB detecte los botones Accept, Retry y el estado del chat** para **poder automatizar las acciones de Antigravity**.

---

## ✅ Criterios de Aceptación

- [ ] `platform/macos.rs` implementa `capture_region()` usando `CGWindowListCreateImage`
- [ ] Se puede extraer el color RGB de cualquier pixel de la imagen capturada
- [ ] Maneja correctamente displays Retina (2x scaling)
- [ ] La lógica de `detect-ui-state.ps1` está portada al módulo compartido `color.rs`
- [ ] Detecta correctamente: Accept all button, Retry button, chat gray button, chat red button, pause button
- [ ] El comando `detect_ui_state` en `lib.rs` retorna `UIStateResult` correcto en macOS
- [ ] "Detect UI" en la UI muestra el estado correcto

---

## 🥒 Escenarios (Gherkin)

```gherkin
Escenario: Detectar botón Accept all
  Dado que Antigravity completó cambios en archivos
  Y el botón "Accept all" es visible
  Cuando ejecuto "Detect UI" en BOB
  Entonces el estado muestra has_accept_button = true
  Y las coordenadas del botón son correctas

Escenario: Detectar chat listo (gray button)
  Dado que Antigravity terminó de procesar
  Y el botón del chat es gris
  Cuando ejecuto "Detect UI"
  Entonces chat_button_color = "gray"

Escenario: Detectar agente trabajando (red button)
  Dado que Antigravity está procesando
  Y el botón del chat es rojo
  Cuando ejecuto "Detect UI"
  Entonces chat_button_color = "red"

Escenario: Manejar Retina display
  Dado que estoy en un MacBook con Retina display (2x)
  Cuando capturo screenshot de una ventana
  Entonces las coordenadas de píxeles se convierten correctamente entre puntos lógicos y físicos
```

---

## 🔧 Contexto Técnico

**Archivos a crear/modificar:**

- `src-tauri/src/platform/macos.rs` — Implementar `capture_region()`, helper `get_pixel_from_image()`
- `src-tauri/src/platform/color.rs` — Portar lógica de detección de colores desde `detect-ui-state.ps1`
- `src-tauri/src/lib.rs` — Migrar `detect_ui_state` de PowerShell a platform trait

### API macOS a usar

```rust
use core_graphics::display::{CGDisplay};
use core_graphics::image::CGImage;
use core_graphics::window::CGWindowListCreateImage;
use core_graphics::geometry::{CGRect, CGPoint, CGSize};

// Capturar región de pantalla
let image = CGDisplay::screenshot(
    CGRect::new(
        &CGPoint::new(x as f64, y as f64),
        &CGSize::new(width as f64, height as f64)
    ),
    kCGWindowListOptionOnScreenOnly,
    kCGNullWindowID,
    kCGWindowImageDefault
).unwrap();

// Extraer pixel data
let data = image.data();
let bytes_per_row = image.bytes_per_row();
let bpp = image.bits_per_pixel() / 8;
// Pixel at (px, py): offset = py * bytes_per_row + px * bpp
// Format: BGRA on macOS
```

### Lógica de colores a portar (de `detect-ui-state.ps1`)

| Color | RGB Condition | Significado |
|-------|-------------|-------------|
| Gray button | R∈[100,180], G∈[100,180], B∈[100,180], |R-G|<20, |G-B|<20 | Chat listo |
| Red button | R≥150, G<100, B<100 | Agente trabajando |
| Blue/Accept | R<100, G≥100, B≥150 | Accept button |
| Green/Accept | R<100, G≥130, B<100 | Accept button alternativo |

---

**Dependencias de Issues:**

- Bloqueado por: XPLAT-001
- Bloquea a: XPLAT-006

## ⚠️ Edge Cases

- **Retina 2x**: `CGWindowListCreateImage` devuelve imagen a resolución física (2x). Multiplicar coordenadas lógicas × scale factor
- **Ventana parcialmente oculta**: Screenshot puede incluir contenido de otras ventanas. Considerar usar `kCGWindowImageBoundsIgnoreFraming`
- **Dark mode vs Light mode**: Los colores de los botones de Antigravity son los mismos porque VS Code usa su propio tema
- **Screen Recording permission**: Si no se concede, `CGWindowListCreateImage` retorna imagen negra

## 🧪 Tests Requeridos

- [ ] Unit: `color.rs` — test clasificación de colores con los valores exactos del PS1
- [ ] Unit: Conversión de coordenadas para Retina
- [ ] Integration: Captura de screenshot retorna datos válidos (>0 bytes)

## 🚫 Out of Scope

- Mouse click en los botones detectados (XPLAT-004)
- Simulación de teclado (XPLAT-005)

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
