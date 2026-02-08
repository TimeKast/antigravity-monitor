# XPLAT-014: Companion Extension — Silent Actions (Accept, Retry, Prompt)

> **Issue ID:** XPLAT-014
> **Priority:** P0
> **Effort:** M
> **Story Points:** 5
> **Status:** 📋 Backlog
> **Epic:** EPIC-XPLAT

---

## 🎯 Objetivo

Implementar todas las acciones de BOB como comandos ejecutados internamente por la extensión companion, sin necesidad de robar foco, mover mouse, ni simular teclas.

## User Story

> Como **usuario**, quiero **que BOB acepte cambios y envíe prompts sin interrumpirme** para **poder seguir trabajando mientras BOB opera en background**.

---

## ✅ Criterios de Aceptación

- [ ] `acceptAll` → ejecuta `antigravity.command.accept` sin traer ventana al frente
- [ ] `acceptStep` → ejecuta `antigravity.agent.acceptAgentStep` sin foco
- [ ] `acceptTerminal` → ejecuta `antigravity.terminalCommand.accept` sin foco
- [ ] `retry` → ejecuta click en Retry equivalente (re-run last action)
- [ ] `sendPrompt(text)` → escribe texto en el chat de Antigravity y lo envía
- [ ] Todas las acciones reportan éxito/error a BOB via WebSocket
- [ ] BOB puede hacer `checkAndActOnInstance` completamente via WebSocket

---

## 🥒 Escenarios (Gherkin)

```gherkin
Escenario: Accept silent
  Dado que Antigravity tiene cambios pendientes
  Cuando BOB envía mensaje acceptAll via WebSocket
  Entonces la extensión ejecuta antigravity.command.accept
  Y los cambios se aceptan sin que la ventana tome foco
  Y BOB recibe confirmación de éxito

Escenario: Enviar prompt silent
  Dado que el chat de Antigravity está listo para recibir input
  Cuando BOB envía mensaje sendPrompt con texto "continúa con el siguiente issue"
  Entonces la extensión escribe el texto en el chat input
  Y envía el mensaje automáticamente
  Y BOB recibe confirmación
```

---

## 🔧 Contexto Técnico

**Archivos a modificar:**

- `bob-helper-extension/src/extension.ts` — Agregar handlers para acciones
- `bob-helper-extension/src/actions.ts` — [NEW] Implementación de cada acción

### Comandos Antigravity descubiertos

```typescript
// Accept changes
await vscode.commands.executeCommand('antigravity.command.accept');

// Accept agent step (dialog)
await vscode.commands.executeCommand('antigravity.agent.acceptAgentStep');

// Accept terminal command
await vscode.commands.executeCommand('antigravity.terminalCommand.accept');

// Open chat
await vscode.commands.executeCommand('antigravity.prioritized.chat.open');
```

### Desafío: sendPrompt

No existe `antigravity.sendPrompt(text)`. Opciones:
1. `vscode.commands.executeCommand('antigravity.prioritized.chat.open')` + simular escritura via API
2. Usar Chat Participant API (VS Code 1.93+)
3. Investigar si Antigravity expone extension API pública

---

**Dependencias de Issues:**

- Bloqueado por: XPLAT-012
- Bloquea a: XPLAT-015

---

_Creado: 2026-02-08_
_Última actualización: 2026-02-08_
