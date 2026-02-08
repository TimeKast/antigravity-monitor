# 🦞 BOB — Propuesta: Soporte Multiplataforma (Windows + macOS)

## El Problema

BOB actualmente **solo funciona en Windows** porque toda la automatización depende de:
- **PowerShell** (10 scripts)
- **Win32 API** (user32.dll, gdi32.dll) para detectar ventanas, leer píxeles, hacer clicks y enviar teclas

Nada de esto existe en macOS.

---

## La Solución: Migrar la automatización a Rust nativo

### ¿Qué cambia?

En vez de que Rust lance scripts PowerShell externos, **toda la lógica de automatización se mueve a Rust** usando APIs nativas de cada OS:

| Función | Windows (actual: PowerShell) | Windows (nuevo: Rust) | macOS (nuevo: Rust) |
|---------|------------------------------|----------------------|---------------------|
| Detectar ventanas | `EnumWindows` vía PS1 | `windows` crate | `CGWindowListCopyWindowInfo` |
| Leer píxeles | `GetPixel` vía PS1 | `GetPixel` directo | `CGWindowListCreateImage` |
| Click mouse | `mouse_event` vía PS1 | `SendInput` directo | `CGEventCreateMouseEvent` |
| Enviar teclas | `keybd_event` vía PS1 | `SendInput` directo | `CGEventCreateKeyboardEvent` |
| Traer ventana al frente | `SetForegroundWindow` vía PS1 | Directo | `NSRunningApplication.activate()` |

### ¿Cómo funciona?

```
                    ┌─────────────────────┐
                    │   Frontend (Svelte)  │  ← No cambia
                    └──────────┬──────────┘
                               │ invoke()
                    ┌──────────▼──────────┐
                    │   lib.rs (Tauri)     │  ← Llama al trait PlatformOps
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              │                                  │
    ┌─────────▼─────────┐             ┌─────────▼─────────┐
    │ platform_windows.rs│             │ platform_macos.rs  │
    │ (windows crate)    │             │ (core-graphics)    │
    └────────────────────┘             └────────────────────┘
```

Rust decide **automáticamente** qué código compilar según el OS:
```rust
#[cfg(target_os = "windows")]
mod platform_windows;  // Usa Win32 API nativa

#[cfg(target_os = "macos")]  
mod platform_macos;    // Usa CoreGraphics + CGEvent
```

---

## Beneficios extra (además de macOS)

1. **+Velocidad**: Eliminar PowerShell ahorra ~500ms por cada acción (startup del proceso). En Rust nativo es instantáneo
2. **-Complejidad**: 10 scripts PowerShell (1,300+ líneas) → 0 scripts. Todo en Rust
3. **-Bugs**: Sin problemas de parsing JSON entre PowerShell ↔ Rust
4. **+Mantenibilidad**: Un solo lenguaje, un solo repo, compilación condicional automática

---

## ¿Qué NO cambia?

- ✅ Frontend (Svelte) — idéntico
- ✅ Lógica de polling, backlog, Discord — idéntica
- ✅ Algoritmo de detección de botones (colores RGB) — idéntico
- ✅ Build de Windows sigue funcionando (`npm run tauri build`)

---

## Requisitos en macOS

El usuario necesita dar 2 permisos (una sola vez):
1. **Screen Recording** — Para que BOB pueda leer píxeles de la pantalla
2. **Accessibility** — Para que BOB pueda hacer clicks y enviar teclas

---

## Plan incremental sugerido

| Fase | Qué | Resultado |
|------|-----|-----------|
| **1** | Abstracción + detectar ventanas | BOB abre en macOS y detecta VS Code |
| **2** | Screenshots + detección de botones | BOB identifica Accept/Retry/Ready |
| **3** | Mouse + teclado | BOB puede hacer click y enviar prompts |
| **4** | Migrar Windows de PS1 → Rust | Eliminar scripts PowerShell |

Cada fase es independiente y testeable.

---

## Estimación

- **Fase 1-3 (macOS)**: ~2-3 días de desarrollo
- **Fase 4 (migrar Windows)**: ~1-2 días adicionales
- **Total**: ~1 semana para soporte completo multiplataforma
