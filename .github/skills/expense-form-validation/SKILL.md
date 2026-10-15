---
name: expense-form-validation
description: "Use when adding form controls and validation for expense forms."
version: 1.0.0
license: MIT
---
# SKILL: Controles de Validación en Formularios

## Descripción General

Este skill implementa:
1. Validación del campo monto (solo números, máximo 2 decimales, obligatorio)
2. Validación del campo categoría (mensaje de error si no seleccionado, obligatorio)
3. Validación del campo descripción (solo alfanumérico, máximo 400 caracteres, opcional)

---

## Paso 1: Actualizar AddExpenseModal.tsx

**Archivo:** `src/components/AddExpenseModal.tsx`

### 1.1 Añadir estados de error

```typescript
const [errors, setErrors] = useState<{
  amount?: string;
  category?: string;
  description?: string;
}>({});
```

### 1.2 Validar campo monto

```typescript
const handleAmountChange = (text: string) => {
  // Permitir solo números y máximo 2 decimales
  const regex = /^\d*\.?\d{0,2}$/;
  if (regex.test(text) || text === '') {
    setAmount(text);
    if (text.trim() === '') {
      setErrors((prev) => ({ ...prev, amount: 'El monto es obligatorio' }));
    } else {
      setErrors((prev) => ({ ...prev, amount: undefined }));
    }
  }
};
```

### 1.3 Validar campo categoría

```typescript
const handleCategorySelect = (cat: Category) => {
  setCategory(cat);
  setErrors((prev) => ({ ...prev, category: undefined }));
};
```

### 1.4 Validar campo descripción

```typescript
const handleDescriptionChange = (text: string) => {
  // Limitar a 400 caracteres
  if (text.length > 400) {
    return;
  }
  // Solo permitir letras, números y espacios
  const regex = /^[a-zA-Z0-9\s]*$/;
  if (regex.test(text)) {
    setDescription(text);
    setErrors((prev) => ({ ...prev, description: undefined }));
  }
};
```

### 1.5 Validar al enviar

```typescript
const handleSubmit = async () => {
  // Validaciones finales
  const newErrors: typeof errors = {};
  
  if (!amount.trim()) {
    newErrors.amount = 'El monto es obligatorio';
  }
  
  if (!category) {
    newErrors.category = 'Debes seleccionar una categoría';
  }
  
  if (description.length > 400) {
    newErrors.description = 'La descripción no puede exceder 400 caracteres';
  }
  
  const descRegex = /^[a-zA-Z0-9\s]*$/;
  if (description && !descRegex.test(description)) {
    newErrors.description = 'Solo se permiten letras, números y espacios';
  }
  
  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }
  
  try {
    // ... lógica existente
  } catch (error) {
    console.error('Error al agregar gasto', error);
    Alert.alert('Error', 'No se pudo agregar el gasto. Intenta de nuevo.');
  }
};
```

### 1.6 Mostrar errores en UI

Añadir debajo de cada campo:

**Monto:**
```typescript
{errors.amount && <Text style={styles.errorText}>{errors.amount}</Text>}
```

**Categoría:**
```typescript
{errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
```

**Descripción:**
```typescript
{errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
<Text style={styles.charCount}>
  {description.length}/400
</Text>
```

### 1.7 Estilos de error

```typescript
errorText: {
  color: '#FF6B9D',
  fontSize: 12,
  marginTop: Spacing.one,
  fontWeight: '500',
},
charCount: {
  color: LiquidGlassColors.glassTextSecondary,
  fontSize: 11,
  marginTop: Spacing.one,
  textAlign: 'right',
},
```

### 1.8 Mejorar estado del botón

```typescript
const isFormValid = () => {
  return amount.trim() !== '' && category !== null && !errors.amount && !errors.category && !errors.description;
};

<TouchableOpacity
  style={[
    styles.submitButton,
    !isFormValid() && styles.submitButtonDisabled,
  ]}
  onPress={handleSubmit}
  disabled={!isFormValid()}
>
```

---

## Paso 2: Actualizar EditExpenseModal.tsx

Aplicar exactamente las mismas validaciones.

**Archivo:** `src/components/EditExpenseModal.tsx`

- Añadir mismo estado `errors`
- Implementar `handleAmountChange`, `handleDescriptionChange`, `handleCategorySelect` con validaciones
- Añadir validación en `handleSubmit`
- Mostrar mensajes de error y contador de caracteres
- Deshabilitar botón si formulario inválido
- Al pre-llenar campos con expense, también validar

```typescript
useEffect(() => {
  if (visible && expense) {
    setAmount(expense.amount.toString());
    setCategory(expense.category);
    setDescription(expense.description || '');
    setDate(expense.date);
    setInvoiceUri(expense.invoice_uri);
    setErrors({});
  }
}, [visible, expense]);
```

---

## Checklist de Implementación

- [ ] Añadir estado de errores en AddExpenseModal
- [ ] Implementar validación de monto (regex para 2 decimales)
- [ ] Implementar validación de categoría con mensaje
- [ ] Implementar validación de descripción (alfanumérico, max 400)
- [ ] Mostrar errores visualmente
- [ ] Añadir contador de caracteres para descripción
- [ ] Deshabilitar botón si formulario inválido
- [ ] Aplicar mismas validaciones en EditExpenseModal
- [ ] Probar casos: monto vacío, sin categoría, descripción con caracteres especiales
- [ ] Probar descripción con 400+ caracteres
- [ ] Verificar que campo descripción vacío es permitido

---

## Pruebas Sugeridas

| Caso | Resultado esperado |
|---|---|
| Monto vacío | Error "El monto es obligatorio", botón deshabilitado |
| Monto "100" | Válido |
| Monto "100.50" | Válido |
| Monto "100.500" | No permitido (más de 2 decimales) |
| Monto "abc" | No permitido por regex |
| Sin categoría | Error "Debes seleccionar una categoría" al guardar |
| Descripción "Almuerzo trabajo" | Válido |
| Descripción "Compra@tienda" | Rechazado (caracter @) |
| Descripción con 400 caracteres | Válido |
| Descripción con 401 caracteres | Rechazado / truncado |
| Descripción vacía | Válido (opcional) |

---

## Diseño (Siguiendo DESIGN_SYSTEM.md)

✅ Errores con color `#FF6B9D` (consistente con alertas)  
✅ Uso de `LiquidGlassColors` y `Spacing`  
✅ Contador de caracteres en gris secundario  
✅ Botón deshabilitado con opacidad reducida  
✅ Mensajes claros y concisos  
✅ Coherencia entre ambos modales