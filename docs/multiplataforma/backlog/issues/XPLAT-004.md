# XPLAT-004: macOS Mouse Click Automation

> **Issue ID:** XPLAT-004
> **Priority:** P0
> **Effort:** S
> **Story Points:** 3
> **Status:** 📋 Backlog
> **Epic:** EPIC-XPLAT

---

## 🎯 Objetivo

Implementar simulación de clicks del mouse en macOS usando CoreGraphics Events. Reemplaza la funcionalidad de `click-button.ps1` (que usa `SetCursorPos` + `mouse_event` de Win32).

## User Story

> Como **usuario de macOS**, quiero que **BOB pueda hacer click en los botones de Antigravity** para **automatizar Accept, Retry y otras acciones**.

---

## ✅ Criterios de Aceptación

- [ ] `platform/macos.rs` implementa `click_at(x, y)` usando `CGEventCreateMouseEvent`
- [ ] El click funciona con coordenadas de pantalla absolutas
- [ ] Maneja correctamente Retina displays (coordenadas lógicas)
- [ ] Implementa `scroll_down()` usando `CGEventCreateScrollWheelEvent`
- [ ] El comando `click_button` en `lib.rs` funciona en macOS
- [ ] "Detect & Act" puede hacer click en botones detectados

---

## 🥒 Escenarios (Gherkin)

```gherkin
Escenario: Click en botón Accept all
  Dado que BOB detectó el botón Accept all en coordenadas (1200, 450)
  Cuando BOB ejecuta click_at(1200, 450)
  Entonces el mouse hace click en esas coordenadas
  Y el botón Accept all se activa

Escenario: Scroll al fondo del chat
  Dado que el chat de Antigravity está scrolleado arriba
  Cuando BOB ejecuta scroll_down()
  Entonces el chat scrollea hacia abajo
```

---

## 🔧 Contexto Técnico

**Archivos a modificar:**

- `src-tauri/src/platform/macos.rs` — Implementar `click_at()`, `scroll_down()`

### API macOS a usar

```rust
use core_graphics::event::{CGEvent, CGEventType, CGMouseButton, CGEventTapLocation};
use core_graphics::event_source::CGEventSource;
use core_graphics::geometry::CGPoint;

pub fn click_at(x: i32, y: i32) -> Result<(), String> {
    let point = CGPoint::new(x as f64, y as f64);
    let source = CGEventSource::new(CGEventSourceStateID::HIDSystemState).unwrap();

    // Mouse down
    let event = CGEvent::new_mouse_event(
        source.clone(), CGEventType::LeftMouseDown,
        point, CGMouseButton::Left
    ).unwrap();
    event.post(CGEventTapLocation::HID);

    // Small delay
    std::thread::sleep(std::time::Duration::from_millis(50));

    // Mouse up
    let event = CGEvent::new_mouse_event(
        source, CGEventType::LeftMouseUp,
        point, CGMouseButton::Left
    ).unwrap();
    event.post(CGEventTapLocation::HID);

    Ok(())
}
```

---

**Dependencias de Issues:**

- Bloqueado por: XPLAT-001
- Bloquea a: XPLAT-006

## ⚠️ Edge Cases

- **Accessibility permission**: `CGEventPost` requiere permiso de Accessibility. Sin él, los eventos se ignoran silenciosamente
- **Retina**: Las coordenadas de CGEvent son en puntos lógicos (no físicos)
- **Ventana no en frente**: Hacer `set_foreground()` antes del click

## 🧪 Tests Requeridos

- [ ] Integration: Click en una posición conocida y verificar que se activó

## 🚫 Out of Scope

- Keyboard events (XPLAT-005)
- Detección de qué clickear (XPLAT-003)

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
