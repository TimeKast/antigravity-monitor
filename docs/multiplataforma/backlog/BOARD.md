# 🦞 BOB Multiplataforma — Board

_Última actualización: 2026-02-08_

---

## 📊 Resumen

| Métrica | Valor |
|---------|-------|
| Total Issues | 16 |
| Story Points | 66 |
| Estimación | ~2-3 semanas |

---

## 🗺️ Epic: XPLAT — Cross-Platform Support + Silent Mode

### Fase 1: Foundation ⭐ Empezar aquí

| Issue | Título | P | Effort | SP | Status | Bloqueado por |
|-------|--------|---|--------|:--:|--------|--------------:|
| [XPLAT-001](issues/XPLAT-001.md) | Platform Abstraction Trait | P0 | M | 5 | 📋 Backlog | — |
| [XPLAT-002](issues/XPLAT-002.md) | macOS Window Detection | P0 | S | 3 | 📋 Backlog | XPLAT-001 |

### Fase 2: Vision

| Issue | Título | P | Effort | SP | Status | Bloqueado por |
|-------|--------|---|--------|:--:|--------|--------------:|
| [XPLAT-003](issues/XPLAT-003.md) | macOS Screenshot + Pixel Detection | P0 | L | 8 | 📋 Backlog | XPLAT-001 |

### Fase 3: Interaction

| Issue | Título | P | Effort | SP | Status | Bloqueado por |
|-------|--------|---|--------|:--:|--------|--------------:|
| [XPLAT-004](issues/XPLAT-004.md) | macOS Mouse Click Automation | P0 | S | 3 | 📋 Backlog | XPLAT-001 |
| [XPLAT-005](issues/XPLAT-005.md) | macOS Keyboard Automation | P0 | S | 3 | 📋 Backlog | XPLAT-001 |
| [XPLAT-006](issues/XPLAT-006.md) | Write-to-Chat Composite Action | P0 | M | 5 | 📋 Backlog | XPLAT-003, 004, 005 |

### Fase 4: Consolidation

| Issue | Título | P | Effort | SP | Status | Bloqueado por |
|-------|--------|---|--------|:--:|--------|--------------:|
| [XPLAT-007](issues/XPLAT-007.md) | Windows Migration PS1 → Rust | P1 | L | 8 | 📋 Backlog | XPLAT-001 |
| [XPLAT-008](issues/XPLAT-008.md) | Configurable Project Paths | P1 | S | 2 | 📋 Backlog | XPLAT-001 |
| [XPLAT-009](issues/XPLAT-009.md) | macOS Permissions & Entitlements | P1 | S | 2 | 📋 Backlog | XPLAT-002 |
| [XPLAT-010](issues/XPLAT-010.md) | Cleanup Dead Code | P2 | S | 2 | 📋 Backlog | XPLAT-006, 007 |
| [XPLAT-011](issues/XPLAT-011.md) | Update Documentation | P2 | S | 2 | 📋 Backlog | XPLAT-010 |

### Fase 5: Silent Mode 🔇 (puede empezar en paralelo con Fase 1)

| Issue | Título | P | Effort | SP | Status | Bloqueado por |
|-------|--------|---|--------|:--:|--------|--------------:|
| [XPLAT-012](issues/XPLAT-012.md) | Companion Extension Scaffold + WebSocket | P0 | M | 5 | 📋 Backlog | — |
| [XPLAT-013](issues/XPLAT-013.md) | Silent State Reading (via VS Code API) | P0 | M | 5 | 📋 Backlog | XPLAT-012 |
| [XPLAT-014](issues/XPLAT-014.md) | Silent Actions (Accept, Retry, Prompt) | P0 | M | 5 | 📋 Backlog | XPLAT-012 |
| [XPLAT-015](issues/XPLAT-015.md) | BOB Frontend — Silent Mode Integration | P0 | M | 5 | 📋 Backlog | XPLAT-013, 014 |
| [XPLAT-016](issues/XPLAT-016.md) | Silent Mode Testing & Documentation | P1 | S | 3 | 📋 Backlog | XPLAT-015 |

---

## 📐 Dependency Graph

```
        ┌── FASE 1-4: CROSS-PLATFORM ──────────────────────────────────────┐
        │                                                                   │
        │  XPLAT-001 (Trait) ──┬── XPLAT-002 (Windows) ── XPLAT-009       │
        │                      ├── XPLAT-003 (Pixels) ─────┐              │
        │                      ├── XPLAT-004 (Mouse) ───────┤              │
        │                      ├── XPLAT-005 (Keyboard) ────┤              │
        │                      ├── XPLAT-007 (Win→Rust) ──┐ │              │
        │                      └── XPLAT-008 (Paths)      │ │              │
        │                                XPLAT-006 (Chat) ◄┘─┘             │
        │                                      │                           │
        │                                XPLAT-010 (Cleanup) ◄── 007      │
        │                                      │                           │
        │                                XPLAT-011 (Docs)                  │
        └──────────────────────────────────────────────────────────────────┘

        ┌── FASE 5: SILENT MODE (PARALELO) ────────────────────────────────┐
        │                                                                   │
        │  XPLAT-012 (Extension+WS) ──┬── XPLAT-013 (State Reading)       │
        │                              └── XPLAT-014 (Silent Actions)      │
        │                                        │          │              │
        │                                  XPLAT-015 (Frontend) ◄──┘      │
        │                                        │                         │
        │                                  XPLAT-016 (Test+Docs)           │
        └──────────────────────────────────────────────────────────────────┘
```

> 💡 **Fase 5 no depende de Fase 1-4.** Se puede empezar inmediatamente con el BOB actual en Windows.

---

## 🔄 Compatibilidad con BOB actual (Windows)

La Fase 5 (Silent Mode) **SÍ funciona con el BOB actual** sin necesidad de la migración Rust:

| Operación actual | Flujo legacy (PS1) | Flujo silent (extension) |
|---|---|---|
| `detectUIState` → `detect-ui-state.ps1` | Screenshot + pixel scan | `getContext('antigravity.canAcceptOrRejectCommand')` |
| `clickAcceptButton` → `click-button.ps1` | `SetForegroundWindow` + click | `executeCommand('antigravity.command.accept')` |
| `acceptDialog` → `accept-dialog.ps1` | `SetForegroundWindow` + Alt+Enter | `executeCommand('antigravity.agent.acceptAgentStep')` |
| `writeToChat` → `write-to-chat.ps1` | `SetForegroundWindow` + paste | Chat API directa |

**Beneficio inmediato**: Silent mode en Windows hoy, sin esperar migración multiplataforma.

---

## 📚 Documentación

| Documento | Descripción |
|-----------|-------------|
| [00_DISCOVERY.md](../00_DISCOVERY.md) | Análisis completo del codebase y dependencias Windows |
| [01_MIGRATION_PLAN.md](../01_MIGRATION_PLAN.md) | Plan de migración con fases, arquitectura y risks |
