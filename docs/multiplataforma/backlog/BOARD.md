# 🦞 BOB Multiplataforma — Board

_Última actualización: 2026-02-08_

---

## 📊 Resumen

| Métrica | Valor |
|---------|-------|
| Total Issues | 11 |
| Story Points | 43 |
| Estimación | ~1 semana |

---

## 🗺️ Epic: XPLAT — Cross-Platform Support

### Fase 1: Foundation ⭐ Empezar aquí

| Issue | Título | P | Effort | SP | Status | Bloqueado por |
|-------|--------|---|--------|:--:|--------|--------------|
| [XPLAT-001](issues/XPLAT-001.md) | Platform Abstraction Trait | P0 | M | 5 | 📋 Backlog | — |
| [XPLAT-002](issues/XPLAT-002.md) | macOS Window Detection | P0 | S | 3 | 📋 Backlog | XPLAT-001 |

### Fase 2: Vision

| Issue | Título | P | Effort | SP | Status | Bloqueado por |
|-------|--------|---|--------|:--:|--------|--------------|
| [XPLAT-003](issues/XPLAT-003.md) | macOS Screenshot + Pixel Detection | P0 | L | 8 | 📋 Backlog | XPLAT-001 |

### Fase 3: Interaction

| Issue | Título | P | Effort | SP | Status | Bloqueado por |
|-------|--------|---|--------|:--:|--------|--------------|
| [XPLAT-004](issues/XPLAT-004.md) | macOS Mouse Click Automation | P0 | S | 3 | 📋 Backlog | XPLAT-001 |
| [XPLAT-005](issues/XPLAT-005.md) | macOS Keyboard Automation | P0 | S | 3 | 📋 Backlog | XPLAT-001 |
| [XPLAT-006](issues/XPLAT-006.md) | Write-to-Chat Composite Action | P0 | M | 5 | 📋 Backlog | XPLAT-003, 004, 005 |

### Fase 4: Consolidation

| Issue | Título | P | Effort | SP | Status | Bloqueado por |
|-------|--------|---|--------|:--:|--------|--------------|
| [XPLAT-007](issues/XPLAT-007.md) | Windows Migration PS1 → Rust | P1 | L | 8 | 📋 Backlog | XPLAT-001 |
| [XPLAT-008](issues/XPLAT-008.md) | Configurable Project Paths | P1 | S | 2 | 📋 Backlog | XPLAT-001 |
| [XPLAT-009](issues/XPLAT-009.md) | macOS Permissions & Entitlements | P1 | S | 2 | 📋 Backlog | XPLAT-002 |
| [XPLAT-010](issues/XPLAT-010.md) | Cleanup Dead Code | P2 | S | 2 | 📋 Backlog | XPLAT-006, 007 |
| [XPLAT-011](issues/XPLAT-011.md) | Update Documentation | P2 | S | 2 | 📋 Backlog | XPLAT-010 |

---

## 📐 Dependency Graph

```
XPLAT-001 (Trait) ──┬── XPLAT-002 (Windows) ── XPLAT-009 (Permisos)
                    ├── XPLAT-003 (Pixels) ─────┐
                    ├── XPLAT-004 (Mouse) ───────┤
                    ├── XPLAT-005 (Keyboard) ────┤
                    ├── XPLAT-007 (Win→Rust) ──┐ │
                    └── XPLAT-008 (Paths)      │ │
                                               │ │
                              XPLAT-006 (Chat) ◄┘─┘
                                    │
                              XPLAT-010 (Cleanup) ◄── XPLAT-007
                                    │
                              XPLAT-011 (Docs)
```

---

## 📚 Documentación

| Documento | Descripción |
|-----------|-------------|
| [00_DISCOVERY.md](../00_DISCOVERY.md) | Análisis completo del codebase y dependencias Windows |
| [01_MIGRATION_PLAN.md](../01_MIGRATION_PLAN.md) | Plan de migración con fases, arquitectura y risks |
