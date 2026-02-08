# XPLAT-013: Companion Extension — State Reading (Silent Detection)

> **Issue ID:** XPLAT-013
> **Priority:** P0
> **Effort:** M
> **Story Points:** 5
> **Status:** 📋 Backlog
> **Epic:** EPIC-XPLAT

---

## 🎯 Objetivo

Implementar la lectura de estado de Antigravity desde dentro de la extensión, reemplazando completamente el escaneo de píxeles. La extensión lee los `when` contexts de Antigravity para saber si hay cambios pendientes, botón de retry, o chat disponible.

## User Story

> Como **BOB**, quiero **conocer el estado de Antigravity sin hacer screenshots** para **ser más rápido, confiable, y no depender de colores de píxeles**.

---

## ✅ Criterios de Aceptación

- [ ] La extensión puede leer: `antigravity.canAcceptOrRejectCommand`
- [ ] La extensión puede leer: `antigravity.canAcceptOrRejectAllAgentEditsInFile`
- [ ] La extensión puede leer: `antigravity.canTriggerTerminalCommandAction`
- [ ] Responde a mensaje `getState` con: `{ hasAcceptButton, hasRetryButton, hasEnterButton, agentWorking }`
- [ ] BOB recibe el estado y lo mapea al tipo `UIStateResult` existente
- [ ] El estado se actualiza en tiempo real (push, no solo poll)

---

## 🥒 Escenarios (Gherkin)

```gherkin
Escenario: Detectar Accept pendiente sin screenshot
  Dado que Antigravity tiene cambios pendientes de aceptar
  Cuando BOB envía mensaje getState
  Entonces la extensión responde con hasAcceptButton=true
  Y BOB lo muestra en el dashboard sin haber tomado screenshot

Escenario: Push notification de cambio de estado
  Dado que la extensión está conectada a BOB
  Cuando el estado de Antigravity cambia (ej: agente termina)
  Entonces la extensión envía un mensaje stateChanged a BOB
  Y BOB actualiza el dashboard inmediatamente
```

---

## 🔧 Contexto Técnico

**Archivos a modificar:**

- `bob-helper-extension/src/extension.ts` — Agregar handlers para getState
- `bob-helper-extension/src/stateReader.ts` — [NEW] Lógica de lectura de when contexts
- `src/lib/store.ts` — Agregar path alternativo: si extensión conectada, usar WebSocket en vez de invoke('detect_ui_state')

### API de VS Code para leer contexts

```typescript
// VS Code expone los when contexts vía:
vscode.commands.executeCommand('getContext', 'antigravity.canAcceptOrRejectCommand')
// Retorna boolean

// Para push notifications, usar:
vscode.extensions.getExtension('antigravity')?.exports
// Si Antigravity expone API pública
```

---

**Dependencias de Issues:**

- Bloqueado por: XPLAT-012
- Bloquea a: XPLAT-015

---

_Creado: 2026-02-08_
_Última actualización: 2026-02-08_
