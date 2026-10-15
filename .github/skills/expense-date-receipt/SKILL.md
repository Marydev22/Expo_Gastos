---
name: expense-date-receipt
description: "Use when adding mandatory expense dates or receipt and invoice image attachments."
version: 1.0.0
license: MIT
---

# SKILL: Implementar Fecha Obligatoria y Captura de Facturas

## Descripción General

Este skill proporciona las implementaciones necesarias para:
1. Validar y capturar la fecha exacta del gasto (obligatorio)
2. Permitir al usuario adjuntar una imagen de factura/comprobante (opcional)
3. Guardar imágenes en FileSystem y vincularlas a la BD

---

## Paso 1: Actualizar Tipos TypeScript

**Archivo:** `src/types/expense.ts`

```typescript
// Agregar al interfaz Expense
export interface Expense {
  id: string;
  amount: number;
  category: Category;
  date: Date;
  invoice_uri?: string;  // ← NUEVO: URI de la imagen en FileSystem
  description?: string;
}
```

---

## Paso 2: Instalar Dependencias

**Ejecutar en terminal:**

```bash
npx expo install expo-image-picker
npx expo install expo-file-system
npx expo install expo-date-picker   # Opcional para DatePicker custom
```

---

## Paso 3: Crear Función Helper para Imágenes

**Archivo:** `src/utils/imageHelper.ts` (NUEVO)

```typescript
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';

const INVOICES_DIR = FileSystem.documentDirectory + 'invoices/';

// Crear directorio de facturas si no existe
export async function ensureInvoiceDirectory() {
  const dirInfo = await FileSystem.getInfoAsync(INVOICES_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(INVOICES_DIR, { intermediates: true });
  }
}

// Guardar imagen de factura
export async function saveInvoiceImage(
  imageUri: string
): Promise<string> {
  try {
    await ensureInvoiceDirectory();
    
    // Generar nombre único: timestamp + número aleatorio
    const fileName = `invoice_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 11)}.jpg`;
    
    const savedUri = INVOICES_DIR + fileName;
    
    // Copiar imagen desde cámara/galería a nuestro directorio
    await FileSystem.copyAsync({
      from: imageUri,
      to: savedUri,
    });
    
    return savedUri;
  } catch (error) {
    console.error('Error guardando imagen:', error);
    throw error;
  }
}

// Eliminar imagen de factura (cuando se borra el gasto)
export async function deleteInvoiceImage(invoiceUri: string) {
  try {
    const fileInfo = await FileSystem.getInfoAsync(invoiceUri);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(invoiceUri);
    }
  } catch (error) {
    console.error('Error eliminando imagen:', error);
  }
}

// Seleccionar imagen desde cámara o galería
export async function pickInvoiceImage(): Promise<string | null> {
  try {
    // Solicitar permisos
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Se requieren permisos de galería');
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false, // Usuario puede editar en galería si quiere
      aspect: [4, 3],
      quality: 0.8, // Comprimir un poco
    });

    if (!result.cancelled) {
      return result.assets[0].uri;
    }
    return null;
  } catch (error) {
    console.error('Error seleccionando imagen:', error);
    throw error;
  }
}

// Sacar foto con cámara
export async function takeCameraPhoto(): Promise<string | null> {
  try {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Se requieren permisos de cámara');
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.cancelled) {
      return result.assets[0].uri;
    }
    return null;
  } catch (error) {
    console.error('Error tomando foto:', error);
    throw error;
  }
}
```

---

## Paso 4: Actualizar Base de Datos

**Archivo:** `src/database/database.ts`

```typescript
export async function initDatabase(db: SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY NOT NULL,
      amount REAL NOT NULL,
      category TEXT NOT NULL,
      date TEXT NOT NULL,
      invoice_uri TEXT,          -- ← NUEVO: URI de factura
      description TEXT
    );
  `);
}
```

---

## Paso 5: Actualizar ExpenseRepository

**Archivo:** `src/database/expenseRepository.ts`

```typescript
// Importar helper de imágenes
import { deleteInvoiceImage } from '@/utils/imageHelper';

// Actualizar interfaz ExpenseRow
interface ExpenseRow {
  id: string;
  amount: number;
  category: string;
  date: string;
  invoice_uri: string | null;  // ← NUEVO
  description: string | null;
}

// Actualizar mapRowToExpense
function mapRowToExpense(row: ExpenseRow): Expense {
  return {
    id: row.id,
    amount: row.amount,
    category: row.category as Category,
    date: new Date(row.date),
    invoice_uri: row.invoice_uri ?? undefined,  // ← NUEVO
    description: row.description ?? undefined,
  };
}

// Actualizar getAllExpenses para incluir invoice_uri
export async function getAllExpenses(db: SQLiteDatabase): Promise<Expense[]> {
  const rows = await db.getAllAsync<ExpenseRow>(
    'SELECT id, amount, category, date, invoice_uri, description FROM expenses ORDER BY date DESC'
  );
  return rows.map(mapRowToExpense);
}

// Actualizar insertExpense
export async function insertExpense(
  db: SQLiteDatabase,
  expense: Expense
): Promise<void> {
  await db.runAsync(
    'INSERT INTO expenses (id, amount, category, date, invoice_uri, description) VALUES (?, ?, ?, ?, ?, ?)',
    expense.id,
    expense.amount,
    expense.category,
    expense.date.toISOString(),
    expense.invoice_uri ?? null,  // ← NUEVO
    expense.description ?? null
  );
}

// ← NUEVO: Función para eliminar gasto (útil para Step 2 - Editar/Eliminar)
export async function deleteExpense(
  db: SQLiteDatabase,
  expenseId: string,
  invoiceUri?: string
): Promise<void> {
  // Eliminar imagen si existe
  if (invoiceUri) {
    await deleteInvoiceImage(invoiceUri);
  }
  
  await db.runAsync('DELETE FROM expenses WHERE id = ?', expenseId);
}

// ← NUEVO: Función para actualizar gasto
export async function updateExpense(
  db: SQLiteDatabase,
  expense: Expense
): Promise<void> {
  await db.runAsync(
    'UPDATE expenses SET amount = ?, category = ?, date = ?, invoice_uri = ?, description = ? WHERE id = ?',
    expense.amount,
    expense.category,
    expense.date.toISOString(),
    expense.invoice_uri ?? null,
    expense.description ?? null,
    expense.id
  );
}
```

---

## Paso 6: Actualizar ExpenseContext

**Archivo:** `src/context/ExpenseContext.tsx`

```typescript
// Importar helpers
import { saveInvoiceImage } from '@/utils/imageHelper';

// Actualizar interfaz
interface ExpenseContextType {
  expenses: Expense[];
  isLoading: boolean;
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  getMonthlyTotal: () => number;
  getCurrentMonthExpenses: () => Expense[];
  // ← NUEVO: Para Step 2
  updateExpense: (expense: Expense) => Promise<void>;
  deleteExpense: (expenseId: string) => Promise<void>;
}

// En ExpenseProvider, actualizar addExpense
const addExpense = async (expense: Omit<Expense, 'id'>) => {
  const newExpense: Expense = {
    ...expense,
    id: Date.now().toString() + Math.random().toString(36).slice(2, 11),
  };

  try {
    await insertExpense(db, newExpense);
    setExpenses((prev) => [newExpense, ...prev]);
  } catch (error) {
    console.error('Error al guardar gasto:', error);
    throw error;
  }
};

// ← NUEVO: Agregar updateExpense
const updateExpense = async (expense: Expense) => {
  try {
    await updateExpenseInDB(db, expense);
    setExpenses((prev) =>
      prev.map((e) => (e.id === expense.id ? expense : e))
    );
  } catch (error) {
    console.error('Error actualizando gasto:', error);
    throw error;
  }
};

// ← NUEVO: Agregar deleteExpense
const deleteExpense = async (expenseId: string) => {
  const expense = expenses.find((e) => e.id === expenseId);
  if (!expense) return;

  try {
    await deleteExpenseFromDB(db, expenseId, expense.invoice_uri);
    setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
  } catch (error) {
    console.error('Error eliminando gasto:', error);
    throw error;
  }
};
```

---

## Paso 7: Actualizar AddExpenseModal.tsx

Este es el cambio más importante. Agregar DatePicker + ImagePicker.

**Archivo:** `src/components/AddExpenseModal.tsx`

Ver documentación detallada en `IMPLEMENTATION-AddExpenseModal.md` (incluído en este skill).

**Cambios clave:**
- Importar `DatePicker` de React Native o custom
- Agregar state para `date` y `invoiceUri`
- Agregar botón para seleccionar imagen (cámara/galería)
- Mostrar preview si existe imagen
- Validar fecha ≤ hoy
- Pasar `invoice_uri` a `addExpense()`

---

## Paso 8: Actualizar ExpenseItem.tsx

**Archivo:** `src/components/ExpenseItem.tsx`

```typescript
// Agregar prop para abrir preview de imagen
interface ExpenseItemProps {
  expense: Expense;
  index: number;
  onViewInvoice?: (uri: string) => void;  // ← NUEVO
}

// En render, agregar después de descripción
{expense.invoice_uri && (
  <TouchableOpacity
    onPress={() => onViewInvoice?.(expense.invoice_uri!)}
    style={styles.invoiceButton}
  >
    <Text style={styles.invoiceIcon}>📎</Text>
  </TouchableOpacity>
)}

// Agregar estilos
invoiceButton: {
  padding: Spacing.two,
  backgroundColor: 'rgba(168, 230, 207, 0.3)',
  borderRadius: Spacing.two,
  marginLeft: Spacing.two,
},
invoiceIcon: {
  fontSize: 16,
},
```

---

## Paso 9: Crear Modal para Ver Factura (opcional pero recomendado)

**Archivo:** `src/components/InvoicePreviewModal.tsx` (NUEVO)

Modal simple que muestra la imagen completa cuando el usuario toca el ícono de factura.

---

## Checklist de Implementación

- [ ] Actualizar `Expense` tipo con `invoice_uri`
- [ ] Crear `src/utils/imageHelper.ts`
- [ ] Instalar `expo-image-picker` y `expo-file-system`
- [ ] Alterrar tabla en `database.ts`
- [ ] Actualizar `expenseRepository.ts`
- [ ] Actualizar `ExpenseContext.tsx`
- [ ] Actualizar `AddExpenseModal.tsx` (paso más complejo)
- [ ] Actualizar `ExpenseItem.tsx`
- [ ] Crear `InvoicePreviewModal.tsx` (optional)
- [ ] Testear: agregar gasto con fecha y factura
- [ ] Testear: ver preview de factura
- [ ] Testear: datos persisten después de cerrar app

---

## Diseño (Siguiendo DESIGN_SYSTEM.md)

✅ DatePicker dentro de GlassCard  
✅ Botones con LinearGradient  
✅ Inputs con fondo translúcido  
✅ Preview de imagen en GlassCard con blur  
✅ Ícono de factura (📎) en ExpenseItem  
✅ Modal con SlideInDown animation  

---

## Referencias

- **DESIGN_SYSTEM.md**: Patrones de diseño Liquid Glass
- **AddExpenseModal.tsx**: Referencia para estructura de modal
- **ExpenseContext.tsx**: Referencia para context patterns
