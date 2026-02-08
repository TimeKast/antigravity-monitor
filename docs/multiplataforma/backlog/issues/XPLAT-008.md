# XPLAT-008: Configurable Project Paths

> **Issue ID:** XPLAT-008
> **Priority:** P1
> **Effort:** S
> **Story Points:** 2
> **Status:** 📋 Backlog
> **Epic:** EPIC-XPLAT

---

## 🎯 Objetivo

Eliminar el path hardcodeado `C:\Users\flevik\Proyectos Timekast\` en `store.ts` y hacerlo configurable desde Settings. Usar el separador de paths correcto según el OS.

## User Story

> Como **usuario de cualquier OS**, quiero **configurar la ruta base de mis proyectos** para **que BOB funcione en cualquier máquina, no solo en la de flevik**.

---

## ✅ Criterios de Aceptación

- [ ] Settings incluye un campo "Projects Base Path" editable
- [ ] `extractProjectPath()` usa el valor configurado en vez del hardcode
- [ ] Funciona con paths de Windows (`C:\Users\...`) y macOS (`/Users/...`)
- [ ] El setting se persiste en localStorage
- [ ] Si el campo está vacío, se intenta extraer el path del título de la ventana

---

## 🥒 Escenarios (Gherkin)

```gherkin
Escenario: Configurar base path en macOS
  Dado que el usuario está en macOS
  Y configura Projects Base Path como "/Users/usuario/proyectos"
  Cuando se detecta una ventana con título "proyecto-x - Antigravity"
  Entonces el project path se resuelve como "/Users/usuario/proyectos/proyecto-x"

Escenario: Configurar base path en Windows
  Dado que el usuario está en Windows
  Y configura Projects Base Path como "C:\Users\dev\Projects"
  Cuando se detecta una ventana con título "mi-app - Antigravity"
  Entonces el project path se resuelve como "C:\Users\dev\Projects\mi-app"

Escenario: Base path vacío
  Dado que el campo Projects Base Path está vacío
  Cuando se detecta una ventana
  Entonces se usa solo el nombre del proyecto extraído del título (sin path base)
  Y el backlog tracking se deshabilita para esa instancia
```

---

## 🔧 Contexto Técnico

**Archivos a modificar:**

- `src/lib/store.ts` — Modificar `extractProjectPath()` en línea ~247, usar setting configurable
- `src/lib/types.ts` — Agregar `projectsBasePath: string` a `Settings`
- `src/lib/Settings.svelte` — Agregar campo de input para Projects Base Path

### Código actual (a reemplazar)

```typescript
// store.ts:247 — HARDCODED
function extractProjectPath(title: string): string {
    const projectName = extractProjectName(title);
    return `C:\\Users\\flevik\\Proyectos Timekast\\${projectName}`;
}
```

### Código target

```typescript
function extractProjectPath(title: string): string {
    const projectName = extractProjectName(title);
    const basePath = get(settings).projectsBasePath;
    if (!basePath) return projectName;
    // Use OS-appropriate separator
    const sep = basePath.includes('/') ? '/' : '\\';
    return `${basePath}${sep}${projectName}`;
}
```

---

**Dependencias de Issues:**

- Bloqueado por: XPLAT-001
- Bloquea a: Ninguno (puede hacerse en paralelo)

## ⚠️ Edge Cases

- Path con trailing slash vs sin él
- Spaces en el path
- Path con caracteres especiales (acentos, ñ)

## 🧪 Tests Requeridos

- [ ] Unit: `extractProjectPath` con distintos base paths y OS separators

## 🚫 Out of Scope

- Auto-detección del path base (feature separada)
- Validación de que el path existe en el filesystem

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
