# XPLAT-005: macOS Keyboard Automation

> **Issue ID:** XPLAT-005
> **Priority:** P0
> **Effort:** S
> **Story Points:** 3
> **Status:** 📋 Backlog
> **Epic:** EPIC-XPLAT

---

## 🎯 Objetivo

Implementar simulación de teclado en macOS usando CoreGraphics Events. Reemplaza la funcionalidad de `accept-dialog.ps1` (Alt+Enter → Cmd+Enter en macOS), `scroll-to-bottom.ps1` (Ctrl+End → Cmd+End), y la parte de paste/enter de `write-to-chat.ps1`.

## User Story

> Como **usuario de macOS**, quiero que **BOB pueda enviar teclas a VS Code** para **aceptar diálogos, hacer scroll, y enviar prompts**.

---

## ✅ Criterios de Aceptación

- [ ] `platform/macos.rs` implementa `send_keys()` usando `CGEventCreateKeyboardEvent`
- [ ] Soporta modificadores: Cmd, Shift, Alt/Option, Ctrl
- [ ] Implementa `paste_text()`: copia al clipboard + Cmd+V
- [ ] Accept dialog: Cmd+Enter (equivalente macOS de Alt+Enter)
- [ ] Scroll to bottom: Cmd+End (o Cmd+↓)
- [ ] Los comandos `accept_dialog` y `scroll_to_bottom` en `lib.rs` funcionan en macOS

---

## 🥒 Escenarios (Gherkin)

```gherkin
Escenario: Aceptar diálogo con Cmd+Enter
  Dado que Antigravity muestra un diálogo de confirmación
  Cuando BOB envía Cmd+Enter
  Entonces el diálogo se acepta

Escenario: Pegar texto del clipboard
  Dado que el texto "Continúa con el siguiente paso" está en el clipboard
  Cuando BOB envía Cmd+V
  Entonces el texto se pega en el campo activo

Escenario: Enviar Enter para submit
  Dado que el prompt ya está pegado en el chat
  Cuando BOB envía Enter
  Entonces el prompt se envía
```

---

## 🔧 Contexto Técnico

**Archivos a modificar:**

- `src-tauri/src/platform/macos.rs` — Implementar `send_keys()`, `paste_text()`

### API macOS a usar

```rust
use core_graphics::event::{CGEvent, CGEventFlags, CGKeyCode};

// macOS keycodes
const kVK_Return: CGKeyCode = 0x24;
const kVK_Command: CGKeyCode = 0x37;
const kVK_End: CGKeyCode = 0x77;
const kVK_ANSI_V: CGKeyCode = 0x09;

pub fn send_keys(keys: &[Key], modifiers: &[Modifier]) -> Result<(), String> {
    let source = CGEventSource::new(CGEventSourceStateID::HIDSystemState).unwrap();

    for key in keys {
        let keycode = key_to_cgkeycode(key);

        // Key down
        let event = CGEvent::new_keyboard_event(source.clone(), keycode, true).unwrap();
        if modifiers.contains(&Modifier::Cmd) {
            event.set_flags(CGEventFlags::CGEventFlagCommand);
        }
        event.post(CGEventTapLocation::HID);

        std::thread::sleep(std::time::Duration::from_millis(30));

        // Key up
        let event = CGEvent::new_keyboard_event(source.clone(), keycode, false).unwrap();
        event.post(CGEventTapLocation::HID);

        std::thread::sleep(std::time::Duration::from_millis(30));
    }
    Ok(())
}
```

### Mapeo de shortcuts Windows → macOS

| Acción | Windows | macOS |
|--------|---------|-------|
| Accept dialog | Alt+Enter | Cmd+Enter |
| Paste | Ctrl+V | Cmd+V |
| Scroll to bottom | Ctrl+End | Cmd+↓ o Fn+Cmd+→ |

---

**Dependencias de Issues:**

- Bloqueado por: XPLAT-001
- Bloquea a: XPLAT-006

## ⚠️ Edge Cases

- **Mapeo de teclas macOS**: Las teclas varían entre teclados (US/ES/UK). Usar keycodes, no caracteres
- **Cmd vs Ctrl**: macOS usa Cmd donde Windows usa Ctrl. Mapear correctamente en el trait
- **Clipboard**: Usar `NSPasteboard` (objc2) o `std::process::Command("pbcopy")` para escribir al clipboard

## 🧪 Tests Requeridos

- [ ] Integration: Verificar que paste_text pone texto en clipboard y envía Cmd+V
- [ ] Unit: Mapeo de keycodes Key → CGKeyCode

## 🚫 Out of Scope

- Lógica de qué teclas enviar cuándo (eso está en `store.ts`)
- Mouse clicks (XPLAT-004)

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
