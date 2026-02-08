# XPLAT-010: Cleanup Dead Code

> **Issue ID:** XPLAT-010
> **Priority:** P2
> **Effort:** S
> **Story Points:** 2
> **Status:** 📋 Backlog
> **Epic:** EPIC-XPLAT

---

## 🎯 Objetivo

Eliminar código muerto, legacy y duplicado detectados durante el discovery. Limpiar la base de código después de la migración a Rust nativo.

## User Story

> Como **desarrollador**, quiero que **el codebase esté limpio y sin código muerto** para **reducir confusión y facilitar mantenimiento**.

---

## ✅ Criterios de Aceptación

- [ ] Eliminar `ui-automation.js` (wrapper Node.js, nunca usado por Tauri)
- [ ] Eliminar `scripts/find-instances.ps1` (no referenciado desde Rust)
- [ ] Eliminar `scripts/debug-colors.ps1` (herramienta de debug, no necesaria en producción)
- [ ] Eliminar `scripts/paste-prompt.ps1` (legacy, reemplazado por `write-to-chat`)
- [ ] Eliminar función `startUIPolling()` de `store.ts` (reemplazada por `startAutoImplementation()`)
- [ ] Eliminar mock data hardcodeada en `scanForInstances()` de `store.ts`
- [ ] Eliminar todos los scripts PS1 si XPLAT-007 está completado
- [ ] Eliminar `get_script_path()` de `lib.rs` si ya no se usan scripts
- [ ] Eliminar todos los `println!` de `lib.rs` (usar sistema de logging)
- [ ] Fijar título en `app.html`: "BOB Monitor" en vez de "Tauri + SvelteKit + Typescript App"
- [ ] Fijar texto de polling indicator en `+page.svelte`: usar intervalo real configurado
- [ ] Activar CSP en `tauri.conf.json` (actualmente `null`)

---

## 🥒 Escenarios (Gherkin)

```gherkin
Escenario: Build limpio
  Dado que se eliminó el código muerto
  Cuando ejecuto `npm run tauri build`
  Entonces compila sin warnings ni errores
  Y el bundle no contiene scripts PowerShell innecesarios

Escenario: Título correcto
  Dado que abro BOB
  Cuando veo la pestaña del navegador/ventana
  Entonces el título dice "BOB Monitor"
```

---

## 🔧 Contexto Técnico

**Archivos a eliminar:**

- `ui-automation.js` — Wrapper Node.js legacy (197 líneas)
- `scripts/find-instances.ps1` — Script alternativo no usado (106 líneas)
- `scripts/debug-colors.ps1` — Debug tool (66 líneas)
- `scripts/paste-prompt.ps1` — Legacy (123 líneas)
- Todos los `scripts/*.ps1` si XPLAT-007 completado

**Archivos a modificar:**

- `src/lib/store.ts` — Eliminar `startUIPolling()`, mock data
- `src/app.html` — Cambiar `<title>` a "BOB Monitor"
- `src/routes/+page.svelte` — Arreglar texto "every 5s" → usar valor real
- `src-tauri/src/lib.rs` — Eliminar `get_script_path()`, `println!`
- `src-tauri/tauri.conf.json` — Configurar CSP adecuado

---

**Dependencias de Issues:**

- Bloqueado por: XPLAT-006 (macOS funcional), XPLAT-007 (Windows migrado)
- Bloquea a: XPLAT-011

## 🧪 Tests Requeridos

- [ ] Integration: Verificar que todas las funciones siguen operando después del cleanup
- [ ] Build: `npm run tauri build` exitoso en ambos OS

## 🚫 Out of Scope

- Refactor de `store.ts` en módulos separados (issue futuro)
- Nuevas funcionalidades

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
