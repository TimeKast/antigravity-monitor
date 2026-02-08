# XPLAT-012: Companion Extension — Scaffold & WebSocket Server

> **Issue ID:** XPLAT-012
> **Priority:** P0
> **Effort:** M
> **Story Points:** 5
> **Status:** 📋 Backlog
> **Epic:** EPIC-XPLAT

---

## 🎯 Objetivo

Crear la extensión companion de VS Code/Antigravity ("BOB Helper") que se conecta a BOB via WebSocket en localhost. Esta extensión será el canal de comunicación para modo silent.

## User Story

> Como **usuario de BOB**, quiero **que BOB controle Antigravity sin robar foco** para **poder trabajar en otras tareas mientras BOB ejecuta automáticamente**.

---

## ✅ Criterios de Aceptación

- [ ] Existe el directorio `bob-helper-extension/` con scaffold de extensión VS Code
- [ ] `package.json` tiene nombre "bob-helper", activation event "onStartupFinished"
- [ ] La extensión se activa automáticamente al abrir Antigravity
- [ ] Se conecta a `ws://localhost:9876` (configurable)
- [ ] Reconecta automáticamente si BOB se reinicia
- [ ] BOB (Tauri) inicia un WebSocket server en el puerto configurado
- [ ] Protocolo definido: mensajes JSON con `{type, payload, id}`
- [ ] Handshake inicial intercambia: versión, workspace name, window ID

---

## 🥒 Escenarios (Gherkin)

```gherkin
Escenario: Conexión automática
  Dado que BOB está corriendo con WebSocket server en :9876
  Cuando abro una ventana de Antigravity con la extensión instalada
  Entonces la extensión se conecta automáticamente a BOB
  Y BOB registra la nueva instancia con su workspace name

Escenario: Reconexión
  Dado que la extensión está conectada a BOB
  Cuando BOB se reinicia
  Entonces la extensión intenta reconectar cada 5 segundos
  Y se reconecta cuando BOB vuelve a estar disponible
```

---

## 🔧 Contexto Técnico

**Archivos a crear:**

- `bob-helper-extension/package.json` — Manifest de la extensión
- `bob-helper-extension/src/extension.ts` — Entry point con WebSocket client
- `bob-helper-extension/src/protocol.ts` — Tipos del protocolo de mensajes

**Archivos a modificar:**

- `src-tauri/src/lib.rs` — Agregar WebSocket server (tokio-tungstenite)
- `src-tauri/Cargo.toml` — Agregar dependencia tokio-tungstenite

### Protocolo propuesto

```typescript
interface BobMessage {
  type: 'getState' | 'acceptAll' | 'acceptStep' | 'sendPrompt' | 'retry';
  payload?: Record<string, unknown>;
  id: string;  // Para correlacionar request/response
}

interface ExtensionResponse {
  type: 'state' | 'result' | 'error';
  payload: Record<string, unknown>;
  id: string;
}
```

---

**Dependencias de Issues:**

- Bloqueado por: Ninguno (puede hacerse en paralelo con Fase 1-4)
- Bloquea a: XPLAT-013, XPLAT-014, XPLAT-015

---

_Creado: 2026-02-08_
_Última actualización: 2026-02-08_
