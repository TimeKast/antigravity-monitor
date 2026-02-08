# XPLAT-015: BOB Frontend — Silent Mode Integration

> **Issue ID:** XPLAT-015
> **Priority:** P0
> **Effort:** M
> **Story Points:** 5
> **Status:** 📋 Backlog
> **Epic:** EPIC-XPLAT

---

## 🎯 Objetivo

Modificar el frontend de BOB (store.ts, UI) para detectar automáticamente si la extensión companion está conectada y usar el canal WebSocket en lugar del flujo PowerShell/Rust.

## User Story

> Como **BOB**, quiero **detectar automáticamente si la extensión companion está disponible** para **usar el modo silent cuando sea posible y fallback al modo legacy cuando no**.

---

## ✅ Criterios de Aceptación

- [ ] BOB detecta instancias conectadas via WebSocket (además de EnumWindows)
- [ ] Si una instancia tiene extensión conectada → usa WebSocket para todo
- [ ] Si no tiene extensión → fallback a PowerShell/Rust (modo legacy)
- [ ] Dashboard muestra indicador: 🔇 (silent) vs 🔊 (legacy) por instancia
- [ ] `checkAndActOnInstance` elige automáticamente el canal correcto
- [ ] Settings tiene opción para preferir modo silent si disponible

---

## 🔧 Contexto Técnico

**Archivos a modificar:**

- `src/lib/store.ts` — Agregar lógica de selección de canal (WebSocket vs invoke)
- `src/lib/types.ts` — Agregar `connectionMode: 'silent' | 'legacy'` a Instance
- `src/routes/+page.svelte` — Mostrar indicador de modo por instancia
- `src/lib/Settings.svelte` — Agregar toggle "Prefer silent mode"
- `src/lib/websocket.ts` — [NEW] WebSocket client manager

### Ejemplo de lógica de selección

```typescript
async function checkAndActOnInstance(instanceId: string): Promise<string> {
  const instance = getInstance(instanceId);
  
  if (instance.connectionMode === 'silent') {
    // Use WebSocket channel
    return await checkAndActViaExtension(instance);
  } else {
    // Use legacy PowerShell/Rust channel
    return await checkAndActViaInvoke(instance);
  }
}
```

---

**Dependencias de Issues:**

- Bloqueado por: XPLAT-013, XPLAT-014
- Bloquea a: XPLAT-016

---

_Creado: 2026-02-08_
_Última actualización: 2026-02-08_
