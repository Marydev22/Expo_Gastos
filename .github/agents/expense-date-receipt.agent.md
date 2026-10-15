---
name: expense-date-receipt
description: "Use when implementing mandatory expense dates or attaching receipt and invoice images."
---

# Agente: Implementar Campo de Fecha y Adjunto de Factura

**Nombre:** expense-date-receipt-agent  
**Descripción:** Agente especializado en agregar validación de fecha obligatoria y captura de imágenes de facturas/comprobantes mediante image picker.  
**Versión:** 1.0.0  
**Autor:** María Girón | @1719mariagiron@gmail.com  
**Fecha de creación:** 2026-10-15  

---

## Objetivo

Implementar dos nuevos campos en el formulario de gastos:
1. **Campo de Fecha** (obligatorio): DatePicker para seleccionar el día del gasto
2. **Campo de Factura** (opcional): Image Picker para adjuntar comprobante/factura

## Contexto del Proyecto

- **Stack:** React Native + Expo SDK 57 + TypeScript
- **Persistencia:** SQLite (`expo-sqlite`)
- **Diseño:** Liquid Glass (blur, gradientes, GlassCard)
- **Estructura:** Component-based con Context API

## Cambios Requeridos

### 1. Actualizar tipos (`src/types/expense.ts`)
- Agregar campo `invoice_uri?: string` al interfaz `Expense`
- El campo `date` ya existe pero necesita validación

### 2. Extender AddExpenseModal.tsx
- Importar `expo-image-picker` para seleccionar imágenes
- Agregar componente DatePicker (native o custom)
- Validar que fecha sea ≤ hoy (no fechas futuras)
- Mostrar preview de imagen adjunta

### 3. Actualizar ExpenseContext.tsx
- Modificar función `addExpense` para aceptar `invoice_uri`
- Agregar validación de fecha en contexto

### 4. Actualizar Base de Datos
- Alterar tabla `expenses` en `database.ts`: agregar columna `invoice_uri TEXT`
- Crear función `saveInvoiceImage()` para guardar archivo en FileSystem
- Actualizar `expenseRepository.ts` para manejar la nueva columna

### 5. Actualizar ExpenseItem.tsx
- Mostrar ícono de factura (📎) si existe `invoice_uri`
- Permitir tap para ver preview de imagen

---

## Dependencias Necesarias

```bash
npx expo install expo-image-picker
npx expo install expo-file-system  # Para guardar imágenes localmente
npx expo install react-native-date-picker  # Opcional: DatePicker custom
```

## Reglas de Diseño (DESIGN_SYSTEM.md)

✅ Usar `GlassCard` para la vista previa de imagen  
✅ Inputs con fondo `rgba(255,255,255,0.5)`, borde `glassBorder`  
✅ Modal con `KeyboardAvoidingView` + `ScrollView`  
✅ Colores desde `LiquidGlassColors`  
✅ Animaciones: `SlideInDown` para modal, `FadeInDown` para items  

---

## Criterios de Aceptación

- [ ] Fecha es obligatoria y no permite fechas futuras
- [ ] Usuario puede seleccionar imagen desde cámara o galería
- [ ] Imagen se guarda en FileSystem y se vincula a gasto
- [ ] Preview de imagen en ExpenseItem si existe
- [ ] Si usuario borra la imagen, se elimina del FileSystem
- [ ] UI sigue patrón Liquid Glass
- [ ] Datos persisten en SQLite

---

## Notas Adicionales

- Las imágenes se guardarán en `FileSystem.documentDirectory + 'invoices/'`
- El URI se almacenará en BD como referencia local
- Para exportar datos en el futuro, será fácil acceder a las imágenes
