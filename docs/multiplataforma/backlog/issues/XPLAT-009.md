# XPLAT-009: macOS Permissions and Entitlements

> **Issue ID:** XPLAT-009
> **Priority:** P1
> **Effort:** S
> **Story Points:** 2
> **Status:** 📋 Backlog
> **Epic:** EPIC-XPLAT

---

## 🎯 Objetivo

Configurar los permisos y entitlements necesarios para que BOB funcione correctamente en macOS. Sin estos permisos, los screenshots devuelven imágenes negras y los eventos de mouse/keyboard se ignoran silenciosamente.

## User Story

> Como **usuario de macOS**, quiero que **BOB me solicite los permisos necesarios de forma clara** para **poder empezar a usarlo sin confusion**.

---

## ✅ Criterios de Aceptación

- [ ] `Info.plist` incluye `NSScreenRecordingUsageDescription` con explicación clara
- [ ] `Info.plist` incluye `NSAccessibilityUsageDescription` con explicación clara
- [ ] Entitlements file incluye los permisos necesarios
- [ ] `tauri.conf.json` actualizado para macOS bundle (DMG/APP)
- [ ] Al abrir BOB por primera vez en macOS, se solicitan permisos correctamente
- [ ] La UI muestra un aviso si los permisos no están concedidos

---

## 🥒 Escenarios (Gherkin)

```gherkin
Escenario: Primera ejecución en macOS
  Dado que es la primera vez que abro BOB en macOS
  Cuando la app intenta capturar screenshot
  Entonces macOS muestra el diálogo de Screen Recording permission
  Y el mensaje explica claramente por qué BOB necesita el permiso

Escenario: Permisos no concedidos
  Dado que el usuario no concedió Screen Recording
  Cuando BOB intenta "Detect UI"
  Entonces muestra un mensaje de error indicando que falta el permiso
  Y proporciona instrucciones para habilitarlo en System Settings

Escenario: Permisos concedidos
  Dado que el usuario concedió Screen Recording y Accessibility
  Cuando BOB ejecuta scan + detect + act
  Entonces todo funciona correctamente
```

---

## 🔧 Contexto Técnico

**Archivos a crear/modificar:**

- `src-tauri/Info.plist` — Agregar descripciones de permisos
- `src-tauri/entitlements.plist` — Entitlements para macOS
- `src-tauri/tauri.conf.json` — Configurar macOS bundle settings

### Info.plist entries

```xml
<key>NSScreenRecordingUsageDescription</key>
<string>BOB necesita acceso a la pantalla para detectar el estado de la interfaz de Antigravity (botones Accept, Retry, estado del chat).</string>

<key>NSAccessibilityUsageDescription</key>
<string>BOB necesita acceso de accesibilidad para automatizar clicks y enviar teclas a las ventanas de VS Code.</string>
```

### Detección de permisos en Rust

```rust
#[cfg(target_os = "macos")]
pub fn check_screen_recording_permission() -> bool {
    // CGPreflightScreenCaptureAccess() en macOS 10.15+
    // Si retorna false, llamar CGRequestScreenCaptureAccess()
}
```

---

**Dependencias de Issues:**

- Bloqueado por: XPLAT-002 (necesita el build macOS funcional)
- Bloquea a: Ninguno

## ⚠️ Edge Cases

- **macOS Ventura+**: Los permisos requieren reinicio de la app después de concederse
- **Distribución sin App Store**: Sin notarización, macOS muestra warning de desarrollador no identificado
- **Sandbox**: Tauri puede necesitar desactivar sandbox para acceder a Accessibility API

## 🧪 Tests Requeridos

- [ ] Manual: Verificar que los diálogos de permisos aparecen correctamente
- [ ] Manual: Verificar que todo funciona después de conceder permisos

## 🚫 Out of Scope

- Notarización para distribución en App Store
- Code signing

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
