---
name: expense-crud-filtering
description: "Use when implementing expense editing, deletion, filtering, or sorting."
---

# Agente: Implementar Edición, Eliminación y Filtrado de Gastos

**Nombre:** expense-crud-filtering-agent  
**Descripción:** Agente especializado en agregar capacidades CRUD completas (Create, Read, Update, Delete) y sistema de filtrado/ordenamiento por monto.  
**Versión:** 1.0.0  
**Autor:** María Girón | @1719mariagiron@gmail.com  
**Fecha de creación:** 2026-10-15  
**Puntuación asignada:** 8 puntos

---

## Objetivo

Implementar:
1. **Edición de gastos**: Modificar monto, categoría, fecha, descripción, factura
2. **Eliminación de gastos**: Borrar gasto con confirmación
3. **Filtrado y ordenamiento**: Ordenar gastos por monto (mayor a menor)

## Cambios Requeridos

### 1. ExpenseContext.tsx
- Agregar funciones `updateExpense()` y `deleteExpense()`
- Agregar función `getSortedExpenses(sortBy: 'amount' | 'date')`
- Gestionar estado de filtrado

### 2. Pantalla Principal (src/app/index.tsx)
- Agregar botón de filtro/ordenamiento
- Mostrar indicador de filtro activo
- Pasar función de ordenamiento a FlatList

### 3. ExpenseItem.tsx
- Agregar acciones contextuales (swipe o long-press)
- Mostrar botones de editar/eliminar
- Usar GestureHandler para swipe actions

### 4. EditExpenseModal.tsx (NUEVO)
- Modal similar a AddExpenseModal pero en modo edición
- Pre-llenar campos con datos actuales
- Permitir modificar todos los campos

### 5. DeleteConfirmationDialog.tsx (NUEVO)
- Diálogo de confirmación antes de eliminar
- Mostrar monto y categoría del gasto a eliminar

### 6. FilterButton.tsx (NUEVO)
- Botón flotante o en header para abrir opciones de filtro
- Selector: Sin filtro / Mayor a menor / Menor a mayor
- Selector: Por fecha / Por categoría

---

## Dependencias Necesarias

```bash
npx expo install react-native-gesture-handler  # Ya está instalado
npx expo install react-native-swipe-gestures   # Opcional: para swipe
```

---

## Reglas de Diseño (DESIGN_SYSTEM.md)

✅ EditExpenseModal con misma estructura que AddExpenseModal  
✅ DeleteConfirmationDialog con GlassCard  
✅ FilterButton flotante con LinearGradient  
✅ Swipe actions o long-press en ExpenseItem  
✅ Animación: SlideInDown para modales  
✅ Colores desde `LiquidGlassColors`  

---

## Criterios de Aceptación

- [ ] Usuario puede editar cualquier campo de un gasto
- [ ] Usuario puede eliminar gasto con confirmación
- [ ] Lista se ordena por monto (mayor a menor) correctamente
- [ ] Indicador de filtro activo visible
- [ ] Cambios persisten en SQLite
- [ ] Si hay factura, se maneja correctamente al editar/eliminar
- [ ] UI sigue patrón Liquid Glass
- [ ] Animaciones suave (SlideInDown, FadeInDown)

---

## Flujo de Usuario

**Editar gasto:**
1. Long-press en item → aparece menú contextual
2. Tap en "Editar" → abre EditExpenseModal
3. Modifica campos necesarios
4. Tap "Guardar" → actualiza en BD y UI

**Eliminar gasto:**
1. Long-press en item → aparece menú contextual
2. Tap en "Eliminar" → abre DeleteConfirmationDialog
3. Confirma → gasto se borra, factura se elimina si existe

**Filtrar por monto:**
1. Tap en botón "Filtro" (top-right o FAB)
2. Selecciona "Mayor a menor" o "Menor a mayor"
3. Lista se reordena automáticamente
4. Indicador muestra filtro activo

---

## Notas Técnicas

- Usar `updateExpense()` y `deleteExpense()` del Context
- Al editar, validar que fecha no sea futura
- Al eliminar, verificar si existe `invoice_uri` y eliminar imagen
- Guardar preferencia de filtro en AsyncStorage (opcional)
- No permitir editar ID del gasto

---

## Complejidad Estimada: 8 PUNTOS

- 2 pts: Funciones CRUD en Context
- 2 pts: EditExpenseModal (similar a AddExpenseModal)
- 1 pt: DeleteConfirmationDialog
- 2 pts: Sistema de filtrado y UI
- 1 pt: Integración con swipe/long-press en ExpenseItem
