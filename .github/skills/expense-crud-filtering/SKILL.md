---
name: expense-crud-filtering
description: "Use when adding expense editing, deletion, filtering, or sorting."
version: 1.0.0
license: MIT
---

# SKILL: Edición, Eliminación y Filtrado de Gastos

## Descripción General

Este skill proporciona:
1. Funciones CRUD completas (Update, Delete)
2. Modal de edición (EditExpenseModal)
3. Diálogo de confirmación de eliminación
4. Sistema de filtrado y ordenamiento por monto

---

## Paso 1: Extender ExpenseRepository

**Archivo:** `src/database/expenseRepository.ts`

```typescript
// Estas funciones ya se agregaron en el SKILL anterior,
// pero aquí están completas para referencia:

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

export async function deleteExpense(
  db: SQLiteDatabase,
  expenseId: string
): Promise<void> {
  await db.runAsync('DELETE FROM expenses WHERE id = ?', expenseId);
}
```

---

## Paso 2: Extender ExpenseContext

**Archivo:** `src/context/ExpenseContext.tsx`

```typescript
import { deleteInvoiceImage } from '@/utils/imageHelper';
import { 
  updateExpense as updateExpenseDB,
  deleteExpense as deleteExpenseDB 
} from '@/database/expenseRepository';

interface ExpenseContextType {
  expenses: Expense[];
  isLoading: boolean;
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  updateExpense: (expense: Expense) => Promise<void>;      // ← NUEVO
  deleteExpense: (expenseId: string) => Promise<void>;    // ← NUEVO
  getMonthlyTotal: () => number;
  getCurrentMonthExpenses: () => Expense[];
  getSortedExpenses: (sortBy: 'amount' | 'date', order?: 'asc' | 'desc') => Expense[];  // ← NUEVO
}

export const ExpenseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const db = useSQLiteContext();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ... cargarGastos existente ...

  // ← NUEVO: Actualizar gasto
  const updateExpense = async (expense: Expense) => {
    try {
      await updateExpenseDB(db, expense);
      // Actualizar estado local
      setExpenses((prev) =>
        prev.map((e) => (e.id === expense.id ? expense : e))
      );
    } catch (error) {
      console.error('Error actualizando gasto:', error);
      throw error;
    }
  };

  // ← NUEVO: Eliminar gasto
  const deleteExpense = async (expenseId: string) => {
    try {
      // Obtener el gasto para acceder a su factura
      const expense = expenses.find((e) => e.id === expenseId);
      
      // Eliminar imagen si existe
      if (expense?.invoice_uri) {
        await deleteInvoiceImage(expense.invoice_uri);
      }

      // Eliminar de BD
      await deleteExpenseDB(db, expenseId);
      
      // Actualizar estado local
      setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
    } catch (error) {
      console.error('Error eliminando gasto:', error);
      throw error;
    }
  };

  // ← NUEVO: Obtener gastos ordenados
  const getSortedExpenses = (
    sortBy: 'amount' | 'date' = 'date',
    order: 'asc' | 'desc' = 'desc'
  ) => {
    const currentMonth = getCurrentMonthExpenses();
    
    return [...currentMonth].sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'amount') {
        comparison = a.amount - b.amount;
      } else if (sortBy === 'date') {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      
      return order === 'asc' ? comparison : -comparison;
    });
  };

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        isLoading,
        addExpense,
        updateExpense,              // ← NUEVO
        deleteExpense,              // ← NUEVO
        getMonthlyTotal,
        getCurrentMonthExpenses,
        getSortedExpenses,          // ← NUEVO
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};
```

---

## Paso 3: Crear EditExpenseModal.tsx

**Archivo:** `src/components/EditExpenseModal.tsx` (NUEVO)

Esta es casi idéntica a AddExpenseModal, pero:
- Recibe `expense` como prop
- Pre-llena todos los campos
- Botón dice "Guardar" en lugar de "Agregar"

```typescript
import React, { useState, useEffect } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Expense, Category, CATEGORIES, CATEGORY_ICONS } from '@/types/expense';
import { LiquidGlassColors, Spacing } from '@/constants/theme';
import { useExpenses } from '@/context/ExpenseContext';
import { pickInvoiceImage, saveInvoiceImage, deleteInvoiceImage } from '@/utils/imageHelper';
import { Image } from 'react-native';

interface EditExpenseModalProps {
  visible: boolean;
  expense: Expense;
  onClose: () => void;
}

export const EditExpenseModal: React.FC<EditExpenseModalProps> = ({
  visible,
  expense,
  onClose,
}) => {
  const { updateExpense } = useExpenses();
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category | null>(null);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [invoiceUri, setInvoiceUri] = useState<string | undefined>();

  // Pre-llenar campos cuando modal abre
  useEffect(() => {
    if (visible && expense) {
      setAmount(expense.amount.toString());
      setCategory(expense.category);
      setDescription(expense.description || '');
      setDate(expense.date);
      setInvoiceUri(expense.invoice_uri);
    }
  }, [visible, expense]);

  const handleSubmit = async () => {
    if (!amount || !category) return;

    try {
      const updatedExpense: Expense = {
        ...expense,
        amount: parseFloat(amount),
        category,
        description: description.trim() || undefined,
        date,
        invoice_uri: invoiceUri,
      };

      await updateExpense(updatedExpense);
      handleClose();
    } catch (error) {
      console.error('Error al actualizar gasto', error);
      Alert.alert('Error', 'No se pudo actualizar el gasto. Intenta de nuevo.');
    }
  };

  const handleAddPhoto = async () => {
    try {
      const imageUri = await pickInvoiceImage();
      if (imageUri) {
        const savedUri = await saveInvoiceImage(imageUri);
        
        // Si había factura anterior, eliminarla
        if (invoiceUri) {
          await deleteInvoiceImage(invoiceUri);
        }
        
        setInvoiceUri(savedUri);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const handleRemovePhoto = async () => {
    if (invoiceUri) {
      await deleteInvoiceImage(invoiceUri);
      setInvoiceUri(undefined);
    }
  };

  const handleClose = () => {
    setAmount('');
    setCategory(null);
    setDescription('');
    setInvoiceUri(undefined);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleClose}
        >
          <Animated.View entering={FadeIn} style={styles.backdropBlur}>
            <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
          </Animated.View>
        </TouchableOpacity>

        <Animated.View entering={SlideInDown.springify()} style={styles.modalContent}>
          <View style={styles.modalBackground}>
            <BlurView intensity={100} tint="light" style={styles.modalBlur}>
              <View style={styles.handleBar} />

              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.scrollContent}
              >
                <Text style={styles.title}>Editar Gasto</Text>

                {/* MONTO */}
                <View style={styles.inputSection}>
                  <Text style={styles.label}>Monto (USD)</Text>
                  <View style={styles.inputContainer}>
                    <Text style={styles.currencySymbol}>$</Text>
                    <TextInput
                      style={styles.input}
                      value={amount}
                      onChangeText={setAmount}
                      keyboardType="decimal-pad"
                      placeholderTextColor={LiquidGlassColors.glassTextSecondary}
                    />
                  </View>
                </View>

                {/* CATEGORÍA */}
                <View style={styles.inputSection}>
                  <Text style={styles.label}>Categoría</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoriesContent}
                  >
                    {CATEGORIES.map((cat) => (
                      <TouchableOpacity
                        key={cat}
                        onPress={() => setCategory(cat)}
                        style={[
                          styles.categoryButton,
                          category === cat && styles.categoryButtonActive,
                        ]}
                      >
                        {category === cat ? (
                          <LinearGradient
                            colors={[
                              LiquidGlassColors.primary,
                              LiquidGlassColors.secondary,
                            ]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.categoryGradient}
                          >
                            <Text style={styles.categoryIcon}>
                              {CATEGORY_ICONS[cat]}
                            </Text>
                            <Text style={styles.categoryTextActive}>{cat}</Text>
                          </LinearGradient>
                        ) : (
                          <>
                            <Text style={styles.categoryIcon}>
                              {CATEGORY_ICONS[cat]}
                            </Text>
                            <Text style={styles.categoryText}>{cat}</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* DESCRIPCIÓN */}
                <View style={styles.inputSection}>
                  <Text style={styles.label}>Descripción (opcional)</Text>
                  <TextInput
                    style={[styles.input, styles.descriptionInput]}
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Ej: Almuerzo, transporte..."
                    placeholderTextColor={LiquidGlassColors.glassTextSecondary}
                    multiline
                  />
                </View>

                {/* FACTURA */}
                <View style={styles.inputSection}>
                  <Text style={styles.label}>Factura/Comprobante (opcional)</Text>
                  {invoiceUri ? (
                    <View style={styles.invoicePreviewContainer}>
                      <Image
                        source={{ uri: invoiceUri }}
                        style={styles.invoicePreview}
                      />
                      <TouchableOpacity
                        style={styles.removePhotoButton}
                        onPress={handleRemovePhoto}
                      >
                        <Text style={styles.removePhotoText}>✕ Remover</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.addPhotoButton}
                      onPress={handleAddPhoto}
                    >
                      <Text style={styles.addPhotoText}>📷 Seleccionar imagen</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* BOTONES */}
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={handleClose}
                  >
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.submitButton,
                      (!amount || !category) && styles.submitButtonDisabled,
                    ]}
                    onPress={handleSubmit}
                    disabled={!amount || !category}
                  >
                    <LinearGradient
                      colors={[
                        LiquidGlassColors.primary,
                        LiquidGlassColors.secondary,
                      ]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.submitGradient}
                    >
                      <Text style={styles.submitButtonText}>Guardar</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </BlurView>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  // ... (copiar styles de AddExpenseModal + agregar):
  invoicePreviewContainer: {
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  invoicePreview: {
    width: '100%',
    height: 150,
    borderRadius: Spacing.two,
    marginBottom: Spacing.two,
  },
  removePhotoButton: {
    backgroundColor: 'rgba(255, 107, 157, 0.2)',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
  },
  removePhotoText: {
    color: LiquidGlassColors.primary,
    fontWeight: '600',
  },
  addPhotoButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: LiquidGlassColors.glassBorder,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  addPhotoText: {
    color: LiquidGlassColors.glassText,
    fontWeight: '600',
  },
});
```

---

## Paso 4: Crear DeleteConfirmationDialog.tsx

**Archivo:** `src/components/DeleteConfirmationDialog.tsx` (NUEVO)

```typescript
import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Expense, CATEGORY_ICONS } from '@/types/expense';
import { LiquidGlassColors, Spacing } from '@/constants/theme';
import { useExpenses } from '@/context/ExpenseContext';
import { GlassCard } from './GlassCard';

interface DeleteConfirmationDialogProps {
  visible: boolean;
  expense: Expense | null;
  onClose: () => void;
}

export const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  visible,
  expense,
  onClose,
}) => {
  const { deleteExpense } = useExpenses();

  const handleConfirmDelete = async () => {
    if (!expense) return;

    try {
      await deleteExpense(expense.id);
      onClose();
      Alert.alert('Éxito', 'Gasto eliminado correctamente');
    } catch (error) {
      Alert.alert('Error', 'No se pudo eliminar el gasto');
    }
  };

  if (!expense) return null;

  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(expense.amount);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      >
        <Animated.View entering={FadeIn} style={styles.backdropBlur}>
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
        </Animated.View>
      </TouchableOpacity>

      <Animated.View entering={SlideInDown.springify()} style={styles.dialogContainer}>
        <GlassCard style={styles.card}>
          <View style={styles.content}>
            <Text style={styles.icon}>⚠️</Text>
            <Text style={styles.title}>¿Eliminar gasto?</Text>

            <View style={styles.expensePreview}>
              <Text style={styles.categoryIcon}>
                {CATEGORY_ICONS[expense.category]}
              </Text>
              <View>
                <Text style={styles.category}>{expense.category}</Text>
                <Text style={styles.amount}>{formattedAmount}</Text>
              </View>
            </View>

            <Text style={styles.message}>
              Esta acción no se puede deshacer. Si hay factura adjunta, también será eliminada.
            </Text>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onClose}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleConfirmDelete}
              >
                <LinearGradient
                  colors={['#FF6B9D', '#C44569']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.deleteGradient}
                >
                  <Text style={styles.deleteButtonText}>Eliminar</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </GlassCard>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  backdropBlur: {
    flex: 1,
  },
  dialogContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
  },
  card: {
    maxWidth: 320,
  },
  content: {
    alignItems: 'center',
  },
  icon: {
    fontSize: 40,
    marginBottom: Spacing.two,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: LiquidGlassColors.glassText,
    marginBottom: Spacing.three,
  },
  expensePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 157, 0.1)',
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    marginBottom: Spacing.three,
    width: '100%',
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: Spacing.two,
  },
  category: {
    fontSize: 14,
    color: LiquidGlassColors.glassText,
    fontWeight: '600',
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: LiquidGlassColors.primary,
  },
  message: {
    fontSize: 13,
    color: LiquidGlassColors.glassTextSecondary,
    textAlign: 'center',
    marginBottom: Spacing.four,
    lineHeight: 18,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: Spacing.two,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: Spacing.two,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: LiquidGlassColors.glassText,
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    borderRadius: Spacing.two,
    overflow: 'hidden',
  },
  deleteGradient: {
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: LiquidGlassColors.glassTextLight,
    fontWeight: 'bold',
  },
});
```

---

## Paso 5: Actualizar ExpenseItem.tsx para Acciones

**Archivo:** `src/components/ExpenseItem.tsx`

Agregar long-press o swipe actions para editar/eliminar:

```typescript
import { useExpenses } from '@/context/ExpenseContext';

interface ExpenseItemProps {
  expense: Expense;
  index: number;
  onEdit?: (expense: Expense) => void;        // ← NUEVO
  onDelete?: (expense: Expense) => void;      // ← NUEVO
  onViewInvoice?: (uri: string) => void;
}

export const ExpenseItem: React.FC<ExpenseItemProps> = ({
  expense,
  index,
  onEdit,
  onDelete,
  onViewInvoice,
}) => {
  const handleLongPress = () => {
    // Mostrar ActionSheetIOS (iOS) o crear menú contextual
    alert('Opciones', '', [
      { text: 'Editar', onPress: () => onEdit?.(expense) },
      { text: 'Eliminar', onPress: () => onDelete?.(expense), style: 'destructive' },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100).springify()}
      onLongPress={handleLongPress}
      style={styles.container}
    >
      {/* ... resto del contenido ... */}
    </Animated.View>
  );
};
```

---

## Paso 6: Actualizar Pantalla Principal (index.tsx)

**Archivo:** `src/app/index.tsx`

```typescript
const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);

const displayExpenses = sortBy === 'amount' 
  ? getSortedExpenses('amount', 'desc')
  : getCurrentMonthExpenses();

// En FlatList:
<FlatList
  data={displayExpenses}
  keyExtractor={(item) => item.id}
  renderItem={({ item, index }) => (
    <ExpenseItem
      expense={item}
      index={index}
      onEdit={setEditingExpense}
      onDelete={setDeletingExpense}
    />
  )}
  // ...
/>

// Modales:
<EditExpenseModal
  visible={editingExpense !== null}
  expense={editingExpense || ({} as Expense)}
  onClose={() => setEditingExpense(null)}
/>

<DeleteConfirmationDialog
  visible={deletingExpense !== null}
  expense={deletingExpense}
  onClose={() => setDeletingExpense(null)}
/>

// Botón de filtro (en top-right):
<TouchableOpacity
  style={styles.filterButton}
  onPress={() => setSortBy(sortBy === 'date' ? 'amount' : 'date')}
>
  <Text style={styles.filterText}>
    {sortBy === 'amount' ? '💰' : '📅'}
  </Text>
</TouchableOpacity>
```

---

## Checklist de Implementación

- [ ] Extender ExpenseRepository con `updateExpense` y `deleteExpense`
- [ ] Extender ExpenseContext con funciones CRUD
- [ ] Crear `EditExpenseModal.tsx`
- [ ] Crear `DeleteConfirmationDialog.tsx`
- [ ] Actualizar `ExpenseItem.tsx` con long-press
- [ ] Actualizar `index.tsx` con filtrado y estado
- [ ] Testear edición de gastos
- [ ] Testear eliminación con confirmación
- [ ] Testear ordenamiento por monto
- [ ] Verificar que factura se elimina al borrar gasto

---

## Diseño (Siguiendo DESIGN_SYSTEM.md)

✅ EditExpenseModal idéntico a AddExpenseModal  
✅ DeleteConfirmationDialog con GlassCard  
✅ Animaciones SlideInDown + FadeIn  
✅ Botón de filtro con ícono dinámico  
✅ Colors desde `LiquidGlassColors`  

---

## Referencias

- **DESIGN_SYSTEM.md**: Patrones Liquid Glass
- **AddExpenseModal.tsx**: Referencia estructura
- **ExpenseContext.tsx**: Referencia contexto
- **ExpenseItem.tsx**: Referencia estructura item
