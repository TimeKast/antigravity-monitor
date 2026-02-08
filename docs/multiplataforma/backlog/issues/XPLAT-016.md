# XPLAT-016: Silent Mode Testing & Documentation

> **Issue ID:** XPLAT-016
> **Priority:** P1
> **Effort:** S
> **Story Points:** 3
> **Status:** 📋 Backlog
> **Epic:** EPIC-XPLAT

---

## 🎯 Objetivo

Validar el modo silent end-to-end en Windows y macOS. Documentar instalación de la extensión companion y troubleshooting.

## User Story

> Como **miembro del equipo**, quiero **instrucciones claras para instalar y usar el modo silent** para **poder configurar BOB en mi máquina sin ayuda**.

---

## ✅ Criterios de Aceptación

- [ ] Test E2E: BOB + extensión en Windows — Accept, Retry, sendPrompt sin robar foco
- [ ] Test E2E: BOB + extensión en macOS — Accept, Retry, sendPrompt sin robar foco
- [ ] Test fallback: desinstalar extensión → BOB usa modo legacy automáticamente
- [ ] README actualizado con instrucciones de instalación de extensión
- [ ] DEPLOY.md actualizado con sección "Silent Mode"
- [ ] Troubleshooting: qué hacer si WebSocket no conecta, permisos, etc.

---

**Dependencias de Issues:**

- Bloqueado por: XPLAT-015
- Bloquea a: Ninguno

---

_Creado: 2026-02-08_
_Última actualización: 2026-02-08_
