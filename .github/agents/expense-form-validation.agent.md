---
name: expense-form-validation
description: "Use when implementing form controls and validation for expense forms."
---
# Agente: Implementar Controles de Validación en Formularios

**Nombre:** expense-form-validation-agent  
**Descripción:** Agente especializado en implementar validaciones y controles de entrada para formularios de gastos, asegurando que los campos cumplan con reglas específicas de formato y obligatoriedad.  
**Versión:** 1.0.0  
**Autor:** María Girón | @1719mariagiron@gmail.com  
**Fecha de creación:** 2026-10-15  
**Puntuación asignada:** 3 puntos

---

## Objetivo

Implementar controles de validación en los formularios de gastos:

1. **Campo monto**: Solo debe aceptar números y con dos decimales. Debe ser obligatorio.
2. **Campo categoría**: Debe mostrarse un mensaje cuando el usuario intente guardar sin seleccionar una categoría (obligatorio).
3. **Campo descripción (opcional)**: No debe admitir caracteres especiales, solo números y letras del alfabeto. Tamaño máximo de hasta 400 caracteres.

---

## Cambios Requeridos

### 1. AddExpenseModal.tsx
- Implementar validación para el campo monto (formato numérico con máximo 2 decimales)
- Validar campo categoría y mostrar mensaje de error si no está seleccionada
- Validar campo descripción (solo alfanumérico, máximo 400 caracteres)
- Deshabilitar botón "Guardar" hasta que todos los campos obligatorios sean válidos
- Mostrar mensajes de error visualmente

### 2. EditExpenseModal.tsx
- Aplicar las mismas validaciones que AddExpenseModal
- Validaciones en tiempo real o al intentar guardar

---

## Reglas de Diseño (DESIGN_SYSTEM.md)

✅ Usar colores y espaciados de `LiquidGlassColors` y `Spacing`  
✅ Mostrar mensajes de error con estilo consistente al diseño Liquid Glass  
✅ Animaciones suaves si se muestran errores  
✅ Mantener coherencia visual entre AddExpenseModal y EditExpenseModal  
✅ Indicadores visuales para campos inválidos

---

## Criterios de Aceptación

- [ ] Campo monto solo acepta números y hasta 2 decimales
- [ ] Campo monto es obligatorio (no permite guardar vacío)
- [ ] Al intentar guardar sin categoría seleccionada, se muestra mensaje de error
- [ ] Campo categoría es obligatorio
- [ ] Campo descripción solo acepta letras (a-z, A-Z) y números (0-9). No caracteres especiales
- [ ] Campo descripción tiene límite máximo de 400 caracteres
- [ ] Campo descripción es opcional (permite guardar vacío)
- [ ] Botón Guardar se deshabilita cuando hay errores de validación
- [ ] Mensajes de error son claros y visibles para el usuario
- [ ] Validaciones funcionan tanto en AddExpenseModal como EditExpenseModal
- [ ] UI sigue el patrón Liquid Glass

---

## Flujo de Usuario

**Agregar gasto con validaciones:**

1. Usuario ingresa monto (solo números, hasta 2 decimales)
2. Usuario selecciona categoría (obligatorio)
3. Usuario ingresa descripción (opcional, solo alfanumérico, max 400 chars)
4. Si intenta guardar sin categoría → aparece mensaje: "Debes seleccionar una categoría"
5. Botón "Guardar" solo se habilita si monto es válido y categoría seleccionada
6. Al guardar, todos los datos se validan antes de persistir

---

## Notas Técnicas

- Para monto: usar regex `/^\d*\.?\d{0,2}$/` para permitir decimales con máximo 2 dígitos
- Para descripción: usar regex `/^[a-zA-Z0-9\s]*$/` (permite espacios, solo alfanumérico)
- Validar en tiempo real (onChangeText) para mejor UX
- Mostrar errores debajo de cada campo afectado
- Truncar descripción a 400 caracteres si excede
- Usar estado para errores: `errors: { amount?: string, category?: string, description?: string }`
- No permitir caracteres especiales en descripción (ej: @, #, $, %, !, ., ,, etc. según requerimiento)

---

## Complejidad Estimada: 3 PUNTOS

- 1 pt: Validación de campo monto (formato y obligatoriedad)
- 1 pt: Validación de campo categoría con mensaje de error
- 1 pt: Validación de campo descripción (alfanumérico, max 400 chars)
