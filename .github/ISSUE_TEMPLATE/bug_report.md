---
name: "🐛 Bug Report"
about: Reportar un comportamiento incorrecto en FISCORD
title: "[BUG] "
labels: ["bug", "triage"]
assignees: []
---

## Descripción del Bug

> Describe claramente qué está fallando y cuál es el impacto.


## Pasos para Reproducir

1. Ir a '...'
2. Hacer clic en '...'
3. Ingresar los valores '...'
4. Ver el error

**¿Se reproduce consistentemente?**
- [ ] Siempre
- [ ] A veces (frecuencia aproximada: ___)
- [ ] Solo una vez


## Comportamiento Esperado

> ¿Qué debería haber pasado según la spec o el comportamiento previo?


## Comportamiento Actual

> ¿Qué está pasando en realidad?


## Evidencia

> Screenshots, videos, logs de consola, respuesta de la API. Borra esta sección si no aplica.

```
// Pega aquí logs, stack traces o respuestas de error
```


## Datos de Reproducción

> Si el bug involucra datos específicos (RNC, NCF, montos), incluye ejemplos válidos para reproducirlo.

| Campo | Valor de prueba |
|---|---|
| RNC Proveedor | |
| NCF | |
| Monto | |
| Fecha | |


## Entorno

| Atributo | Valor |
|---|---|
| **Entorno** | `development` / `staging` / `production` |
| **Área** | Web / Móvil / API / DB |
| **Browser / OS** | Ej: Chrome 124, Windows 11 |
| **Versión app móvil** | Ej: 1.0.0 (build 10) |
| **Endpoint afectado** | Ej: `POST /api/v1/invoices` |
| **Código de error HTTP** | Ej: 400, 500 |


## Impacto

- [ ] 🔴 **Crítico** — pérdida de datos, fallo de seguridad o bloqueo total de la app
- [ ] 🟠 **Alto** — feature principal no funciona, sin workaround
- [ ] 🟡 **Medio** — feature parcialmente funciona o tiene workaround
- [ ] 🟢 **Bajo** — cosmético o edge case poco frecuente


## ¿Afecta Compliance DGII?

<!-- Si el bug genera datos incorrectos en el 606, marca esto como CRÍTICO -->

- [ ] No
- [ ] Sí — puede generar errores en la exportación 606 / datos inválidos

