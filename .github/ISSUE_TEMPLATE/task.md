---
name: "📋 Task (Sprint)"
about: Tarea de desarrollo para los sprints del MVP
title: "[TASK] "
labels: ["task"]
assignees: []
---

## Descripción

> ¿Qué hay que construir o implementar? Una tarea = una unidad de trabajo completable en una sesión.


## Sprint & Feature

| Campo | Valor |
|---|---|
| **Sprint** | Semana ___ |
| **Feature** | F-0_ — _Nombre feature_ |
| **Área** | Backend / Frontend Web / Mobile / DevOps / QA |
| **Estimado** | ___ horas |


## Contexto Técnico

> Links a secciones de la spec, endpoints, schemas o decisiones de arquitectura relevantes.

- Spec: [docs/FISCORD_SPECIFICATION.md](../../docs/FISCORD_SPECIFICATION.md) — Sección ___
- Endpoint(s): `METHOD /api/v1/...`
- Tabla(s) DB: ___
- ADR relacionado: ADR-00_


## Subtareas

> Desglosa el trabajo en pasos concretos. Cada uno debe ser verificable.

- [ ] ___
- [ ] ___
- [ ] ___


## Criterios de Aceptación (Definition of Done)

> La tarea solo está "Done" cuando todos estos puntos pasan.

- [ ] Código compila sin errores TypeScript (`npm run typecheck`)
- [ ] Linter pasa sin warnings (`npm run lint`)
- [ ] Tests relevantes escritos y en verde (`npm run test`)
- [ ] ___  _(criterio funcional específico)_
- [ ] ___  _(criterio funcional específico)_


## Dependencias

> ¿Esta tarea requiere que otra esté terminada primero?

- Depende de: #___ 
- Bloquea: #___


## Notas de Implementación

> Decisiones técnicas, gotchas conocidos, referencias de código a modificar.

```
// Archivos clave a modificar:
// apps/backend/src/...
// apps/web/src/...
```


## Checklist de Entrega

- [ ] PR creado con título `[TASK] descripción corta`
- [ ] PR referencia este issue (`Closes #___`)
- [ ] Probado en entorno local con datos reales
- [ ] Variables de entorno documentadas en `.env.example` si aplica
- [ ] Sin `console.log` ni código comentado en el PR

