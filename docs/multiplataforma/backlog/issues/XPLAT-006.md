# XPLAT-006: Write-to-Chat Composite Action

> **Issue ID:** XPLAT-006
> **Priority:** P0
> **Effort:** M
> **Story Points:** 5
> **Status:** 📋 Backlog
> **Epic:** EPIC-XPLAT

---

## 🎯 Objetivo

Implementar la acción compuesta "write to chat" en Rust nativo para macOS, combinando las primitivas de mouse (XPLAT-004) y keyboard (XPLAT-005). Reemplaza `write-to-chat.ps1` (127 líneas). Esta es la acción más crítica: es lo que permite a BOB enviar prompts automáticamente.

## User Story

> Como **usuario de macOS**, quiero que **BOB pueda enviar prompts al chat de Antigravity automáticamente** para **que el ciclo de automatización funcione sin intervención manual**.

---

## ✅ Criterios de Aceptación

- [ ] Función `write_to_chat()` implementada en Rust para macOS
- [ ] Secuencia: focus window → click chat input → clipboard paste → send Enter
- [ ] Maneja timing correcto entre pasos (delays configurables)
- [ ] El comando `write_to_chat` en `lib.rs` funciona en macOS
- [ ] Auto-polling puede enviar prompts en macOS (flujo completo end-to-end)
- [ ] Verificar que el texto se envía correctamente (sin caracteres perdidos)

---

## 🥒 Escenarios (Gherkin)

```gherkin
Escenario: Enviar prompt automático exitoso
  Dado que Antigravity está listo (chat button gris)
  Y el prompt configurado es "Continúa con el siguiente issue"
  Cuando BOB ejecuta write_to_chat
  Entonces la ventana viene al frente
  Y el cursor hace click en el área del chat input
  Y el prompt se pega vía clipboard
  Y se presiona Enter para enviar
  Y el estado cambia a "working" (chat button rojo)

Escenario: Ventana no en frente
  Dado que la ventana de VS Code está minimizada
  Cuando BOB ejecuta write_to_chat
  Entonces primero restaura y trae la ventana al frente
  Y luego ejecuta la secuencia de paste+enter

Escenario: Caracteres especiales en prompt
  Dado que el prompt contiene "áéíóú ñ ¡¿ 🔧"
  Cuando BOB ejecuta write_to_chat
  Entonces el texto se pega correctamente via clipboard (sin problemas de encoding)
```

---

## 🔧 Contexto Técnico

**Archivos a modificar:**

- `src-tauri/src/platform/macos.rs` — Implementar `write_to_chat()` usando primitivas ya existentes
- `src-tauri/src/platform/mod.rs` — Agregar `write_to_chat()` al trait si no está
- `src-tauri/src/lib.rs` — Migrar comando `write_to_chat` a usar platform

### Secuencia de la acción (portada de `write-to-chat.ps1`)

```
1. set_foreground(window_handle)      // Traer ventana al frente
2. sleep(300ms)                       // Esperar activación
3. click_at(chat_input_x, chat_input_y) // Click en área de input
4. sleep(200ms)                       // Esperar focus del input
5. paste_text(prompt)                 // Clipboard + Cmd+V
6. sleep(200ms)                       // Esperar paste completo
7. send_keys([Enter])                 // Enviar
```

### Clipboard en macOS

```rust
// Opción 1: usando pbcopy (simple)
use std::process::Command;
Command::new("pbcopy").stdin(Stdio::piped()).spawn()
    .stdin.write_all(text.as_bytes());

// Opción 2: usando NSPasteboard (nativo, sin spawn)
// Requiere objc2 + objc2-app-kit
```

---

**Dependencias de Issues:**

- Bloqueado por: XPLAT-003 (para saber dónde está el chat input), XPLAT-004 (click), XPLAT-005 (keyboard)
- Bloquea a: XPLAT-010

## ⚠️ Edge Cases

- **Timing**: Los delays deben ser suficientes para que VS Code procese cada acción. Configurables por si algún sistema es más lento
- **Chat input no visible**: Si el panel de chat no está abierto, el click puede fallar
- **Unicode**: Usar clipboard para paste (no keystroke simulation) asegura soporte Unicode

## 🧪 Tests Requeridos

- [ ] Integration: write_to_chat con VS Code abierto verifica que el texto aparece en el chat
- [ ] Unit: Verificar secuencia de llamadas al trait

## 🚫 Out of Scope

- Decidir CUÁNDO enviar el prompt (eso es lógica de `store.ts`)
- Detección de UI (XPLAT-003)

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
