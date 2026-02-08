# XPLAT-011: Update Documentation

> **Issue ID:** XPLAT-011
> **Priority:** P2
> **Effort:** S
> **Story Points:** 2
> **Status:** 📋 Backlog
> **Epic:** EPIC-XPLAT

---

## 🎯 Objetivo

Actualizar toda la documentación del proyecto para reflejar el soporte multiplataforma. Incluir instrucciones de instalación, build y configuración para macOS.

## User Story

> Como **nuevo usuario o contributor**, quiero que **la documentación cubra ambos OS** para **poder instalar y usar BOB sin problemas en Mac o Windows**.

---

## ✅ Criterios de Aceptación

- [ ] `README.md` actualizado con soporte macOS mencionado
- [ ] `DEPLOY.md` incluye sección de requisitos e instalación para macOS
- [ ] `DEPLOY.md` incluye instrucciones para conceder permisos en macOS
- [ ] `DEPLOY.md` incluye troubleshooting para macOS (permisos, Retina, etc.)
- [ ] Se elimina o archiva `CROSS-PLATFORM-PROPOSAL.md` (ya implementado)
- [ ] Archivo `CHANGELOG.md` documenta la migración multiplataforma

---

## 🥒 Escenarios (Gherkin)

```gherkin
Escenario: Nuevo usuario en macOS
  Dado que soy un developer con macOS
  Cuando leo DEPLOY.md
  Entonces encuentro instrucciones claras para instalar y ejecutar BOB
  Y sé qué permisos necesito conceder

Escenario: Nuevo usuario en Windows
  Dado que soy un developer con Windows
  Cuando leo DEPLOY.md
  Entonces las instrucciones de Windows siguen siendo correctas
  Y no hay referencias a PowerShell como dependencia
```

---

## 🔧 Contexto Técnico

**Archivos a modificar:**

- `README.md` — Agregar badges de OS, actualizar sección de arquitectura
- `DEPLOY.md` — Agregar sección macOS (requisitos: Xcode CLT, Rust, Node), permisos, troubleshooting
- `CROSS-PLATFORM-PROPOSAL.md` — Marcar como implementado o eliminar

**Archivos a crear:**

- `CHANGELOG.md` — Documentar la migración v2.0

### Estructura sugerida para DEPLOY.md

```markdown
## Requisitos

### Ambos OS
- Node.js >= 18
- Rust >= 1.75
- npm

### Windows
- Visual Studio Build Tools (C++ workload)

### macOS
- Xcode Command Line Tools (`xcode-select --install`)
- Permisos de Screen Recording y Accessibility

## Permisos macOS
1. Abrir System Settings → Privacy & Security → Screen Recording
2. Habilitar "BOB Monitor"
3. Abrir System Settings → Privacy & Security → Accessibility
4. Habilitar "BOB Monitor"
5. Reiniciar BOB
```

---

**Dependencias de Issues:**

- Bloqueado por: XPLAT-010 (cleanup completado)
- Bloquea a: Ninguno (último issue)

## 🧪 Tests Requeridos

- [ ] Manual: Verificar que un usuario nuevo puede seguir DEPLOY.md en macOS y tener BOB funcionando
- [ ] Manual: Verificar que DEPLOY.md sigue siendo correcto para Windows

## 🚫 Out of Scope

- Documentación de contribución (CONTRIBUTING.md)
- CI/CD pipeline docs

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
