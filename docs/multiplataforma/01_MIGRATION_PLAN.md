# 🦞 BOB — Plan de Migración Multiplataforma

_Creado: 2026-02-08_

---

## Objetivo

Migrar la capa de automatización UI de PowerShell/Win32 a Rust nativo, habilitando soporte para **Windows y macOS** desde un solo codebase.

---

## Arquitectura Target

```
                    ┌─────────────────────┐
                    │   Frontend (Svelte)  │  ← Sin cambios
                    └──────────┬──────────┘
                               │ invoke()
                    ┌──────────▼──────────┐
                    │   lib.rs (Tauri)     │  ← Llama trait PlatformOps
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                                  │
    ┌─────────▼─────────┐             ┌─────────▼─────────┐
    │ platform_windows.rs│             │ platform_macos.rs  │
    │ (windows crate)    │             │ (core-graphics)    │
    └────────────────────┘             └────────────────────┘
```

### Compilación condicional

```rust
#[cfg(target_os = "windows")]
mod platform_windows;

#[cfg(target_os = "macos")]
mod platform_macos;
```

Rust compila **solo** el módulo del OS actual. Un solo binario por plataforma.

---

## Fases de Implementación

### Fase 1: Foundation (XPLAT-001, XPLAT-002)
**Objetivo**: BOB detecta ventanas en ambos OS

- Crear trait `PlatformOps` con la API unificada
- Implementar `scan_windows()` en macOS usando `CGWindowListCopyWindowInfo`
- Crear wrapper Windows que preserve la funcionalidad PS1 actual
- Modificar `lib.rs` para usar el trait

**Criterio de éxito**: `npm run tauri dev` compila en macOS, botón "Scan" detecta ventanas de VS Code.

---

### Fase 2: Vision (XPLAT-003)
**Objetivo**: BOB puede "ver" el estado de la UI en macOS

- Implementar `capture_region()` en macOS usando `CGWindowListCreateImage`
- Portar la lógica de detección de colores (Accept=azul/verde, Retry=rojo, Chat=gris/rojo)
- Extraer detección de colores a módulo compartido (`color.rs`)

**Criterio de éxito**: "Detect UI" muestra el estado correcto de una ventana de Antigravity en macOS.

---

### Fase 3: Interaction (XPLAT-004, XPLAT-005, XPLAT-006)
**Objetivo**: BOB puede interactuar con la UI en macOS

- Implementar `click_at()` usando `CGEventCreateMouseEvent`
- Implementar `send_keys()` usando `CGEventCreateKeyboardEvent`
- Componer `write_to_chat()` (focus → click input → paste → enter)

**Criterio de éxito**: "Detect & Act" funciona en macOS. Auto-polling completa el flujo.

---

### Fase 4: Consolidation (XPLAT-007, XPLAT-008, XPLAT-009, XPLAT-010, XPLAT-011)
**Objetivo**: Eliminar PowerShell, pulir, documentar

- Migrar Windows de PS1 a Rust nativo (windows crate)
- Hacer configurable el path base de proyectos
- Agregar entitlements macOS en Info.plist
- Limpiar código muerto
- Actualizar documentación

**Criterio de éxito**: Zero scripts PowerShell. Build funcional en ambos OS. DEPLOY.md actualizado.

---

## Dependencias entre Issues

```mermaid
graph LR
    XPLAT001["XPLAT-001<br/>Platform Trait"] --> XPLAT002["XPLAT-002<br/>macOS Windows"]
    XPLAT001 --> XPLAT003["XPLAT-003<br/>macOS Pixels"]
    XPLAT001 --> XPLAT004["XPLAT-004<br/>macOS Mouse"]
    XPLAT001 --> XPLAT005["XPLAT-005<br/>macOS Keyboard"]
    XPLAT003 --> XPLAT006["XPLAT-006<br/>Write to Chat"]
    XPLAT004 --> XPLAT006
    XPLAT005 --> XPLAT006
    XPLAT001 --> XPLAT007["XPLAT-007<br/>Windows→Rust"]
    XPLAT006 --> XPLAT010["XPLAT-010<br/>Cleanup"]
    XPLAT007 --> XPLAT010
    XPLAT002 --> XPLAT009["XPLAT-009<br/>Permisos"]
    XPLAT001 --> XPLAT008["XPLAT-008<br/>Config Paths"]
    XPLAT010 --> XPLAT011["XPLAT-011<br/>Docs"]
```

---

## Risks

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|:---:|:---:|------------|
| Permisos macOS denegados por usuario | Media | Alto | Mostrar instrucciones claras en la UI |
| Colores de Antigravity cambian con update | Media | Alto | Extraer colores a config |
| Retina (2x) altera coordenadas de pixel | Alta | Medio | Usar logical coordinates |
| CGWindowListCreateImage requiere Screen Recording | Seguro | Alto | Documentar en onboarding |

---

_Última actualización: 2026-02-08_
