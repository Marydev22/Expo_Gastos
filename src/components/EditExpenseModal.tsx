import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Category, CATEGORIES, CATEGORY_ICONS, Expense } from '@/types/expense';
import { LiquidGlassColors, Spacing } from '@/constants/theme';
import { useExpenses } from '@/context/ExpenseContext';
import { deleteInvoiceImage, pickInvoiceImage, saveInvoiceImage, takeCameraPhoto } from '@/utils/imageHelper';

interface EditExpenseModalProps {
  visible: boolean;
  expense: Expense | null;
  onClose: () => void;
}

const formatDate = (date: Date) => date.toISOString().slice(0, 10);

export const EditExpenseModal: React.FC<EditExpenseModalProps> = ({
  visible,
  expense,
  onClose,
}) => {
  const { updateExpense } = useExpenses();
  const [amount, setAmount] = useState(expense ? String(expense.amount) : '');
  const [category, setCategory] = useState<Category | null>(expense?.category ?? null);
  const [description, setDescription] = useState(expense?.description ?? '');
  const [date, setDate] = useState(expense ? formatDate(new Date(expense.date)) : '');
  const [invoiceUri, setInvoiceUri] = useState<string | undefined>(expense?.invoice_uri);
  const [errors, setErrors] = useState<{
    amount?: string;
    category?: string;
    description?: string;
    date?: string;
  }>({});

  useEffect(() => {
    if (visible && expense) {
      setAmount(String(expense.amount));
      setCategory(expense.category);
      setDescription(expense.description ?? '');
      setDate(formatDate(new Date(expense.date)));
      setInvoiceUri(expense.invoice_uri);
      setErrors({});
    }
  }, [visible, expense]);

  const close = () => {
    setAmount('');
    setCategory(null);
    setDescription('');
    setDate('');
    setInvoiceUri(undefined);
    setErrors({});
    onClose();
  };

  const attachInvoice = async (from: 'camera' | 'gallery') => {
    try {
      const pickedUri = from === 'camera' ? await takeCameraPhoto() : await pickInvoiceImage();
      if (!pickedUri) return;
      // Se copia a la carpeta de la app: ahi sobrevive a la cache del picker
      const savedUri = await saveInvoiceImage(pickedUri);
      setInvoiceUri(savedUri);
    } catch (error) {
      console.error('Error al adjuntar la factura', error);
      Alert.alert(
        'No se pudo adjuntar',
        error instanceof Error ? error.message : 'Intenta de nuevo.',
      );
    }
  };

  // Solo se quita de la vista: el archivo se borra despues de guardar,
  // asi si el usuario cancela la edicion la factura sigue intacta
  const removeInvoice = () => {
    setInvoiceUri(undefined);
  };

  const handleAmountChange = (text: string) => {
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

  const handleCategorySelect = (cat: Category) => {
    setCategory(cat);
    setErrors((prev) => ({ ...prev, category: undefined }));
  };

  const handleDescriptionChange = (text: string) => {
    if (text.length > 400) {
      return;
    }
    const regex = /^[a-zA-Z0-9\s]*$/;
    if (regex.test(text)) {
      setDescription(text);
      setErrors((prev) => ({ ...prev, description: undefined }));
    }
  };

  const isFormValid = () => {
    if (!amount.trim()) return false;
    if (!category) return false;
    if (description.length > 400) return false;
    const descRegex = /^[a-zA-Z0-9\s]*$/;
    if (description && !descRegex.test(description)) return false;
    if (errors.amount || errors.category || errors.description || errors.date) return false;
    return true;
  };

  const submit = async () => {
    if (!expense) return;
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

    const parsedAmount = Number(amount.replace(',', '.'));
    const parsedDate = new Date(`${date}T00:00:00`);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      newErrors.amount = 'Ingresa un monto mayor que cero';
    }
    if (!date || Number.isNaN(parsedDate.getTime()) || parsedDate > new Date()) {
      newErrors.date = 'La fecha debe ser válida y no puede ser futura';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await updateExpense({
        ...expense,
        amount: parsedAmount,
        category,
        description: description.trim() || undefined,
        date: parsedDate,
        invoice_uri: invoiceUri,
      });
      // Si se reemplazo o se quito la factura anterior, recien ahi se borra el archivo
      if (expense.invoice_uri && expense.invoice_uri !== invoiceUri) {
        await deleteInvoiceImage(expense.invoice_uri);
      }
      close();
    } catch (error) {
      console.error('Error al actualizar el gasto', error);
      Alert.alert('Error', 'No se pudo actualizar el gasto. Intenta de nuevo.');
    }
  };

  if (!expense) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={close}>
          <Animated.View entering={FadeIn} style={StyleSheet.absoluteFill}>
            <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
          </Animated.View>
        </TouchableOpacity>
        <Animated.View entering={SlideInDown.springify()} style={styles.sheet}>
          <BlurView intensity={100} tint="light" style={styles.blur}>
            <View style={styles.handle} />
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <Text style={styles.title}>Editar gasto</Text>
              <Text style={styles.label}>Monto (USD)</Text>
              <View style={styles.amountInput}>
                <Text style={styles.currency}>$</Text>
                <TextInput value={amount} onChangeText={handleAmountChange} keyboardType="decimal-pad" style={styles.input} />
              </View>
              {errors.amount && <Text style={styles.errorText}>{errors.amount}</Text>}
              <Text style={styles.label}>Categoría</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories}>
                {CATEGORIES.map((item) => (
                  <TouchableOpacity key={item} onPress={() => handleCategorySelect(item)} style={[styles.category, category === item && styles.categoryActive]}>
                    <Text style={styles.categoryIcon}>{CATEGORY_ICONS[item]}</Text>
                    <Text style={category === item ? styles.categoryTextActive : styles.categoryText}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
              <Text style={styles.label}>Fecha (AAAA-MM-DD)</Text>
              <TextInput value={date} onChangeText={(t) => { setDate(t); setErrors((prev) => ({ ...prev, date: undefined })); }} placeholder="2026-10-15" style={styles.textInput} placeholderTextColor={LiquidGlassColors.glassTextSecondary} />
              {errors.date && <Text style={styles.errorText}>{errors.date}</Text>}
              <Text style={styles.label}>Descripción (opcional)</Text>
              <TextInput value={description} onChangeText={handleDescriptionChange} multiline style={[styles.textInput, styles.description]} placeholder="Ej: Almuerzo..." placeholderTextColor={LiquidGlassColors.glassTextSecondary} />
              {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
              <Text style={styles.charCount}>
                {description.length}/400
              </Text>
              <Text style={styles.label}>Factura (opcional)</Text>
              {invoiceUri ? (
                <View>
                  <Image source={{ uri: invoiceUri }} style={styles.preview} />
                  <TouchableOpacity onPress={removeInvoice}><Text style={styles.remove}>Quitar factura</Text></TouchableOpacity>
                </View>
              ) : (
                <View style={styles.invoiceButtons}>
                  <TouchableOpacity style={styles.invoiceButton} onPress={() => attachInvoice('camera')}>
                    <Text style={styles.invoiceText}>📷 Tomar foto</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.invoiceButton} onPress={() => attachInvoice('gallery')}>
                    <Text style={styles.invoiceText}>🖼️ Galería</Text>
                  </TouchableOpacity>
                </View>
              )}
              <View style={styles.buttons}>
                <TouchableOpacity style={styles.cancel} onPress={close}><Text style={styles.cancelText}>Cancelar</Text></TouchableOpacity>
                <TouchableOpacity
                  style={[styles.save, !isFormValid() && styles.saveDisabled]}
                  onPress={submit}
                  disabled={!isFormValid()}
                >
                  <LinearGradient colors={[LiquidGlassColors.primary, LiquidGlassColors.secondary]} style={styles.gradient}><Text style={styles.saveText}>Guardar</Text></LinearGradient>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </BlurView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFill },
  sheet: { maxHeight: '90%', overflow: 'hidden', borderTopLeftRadius: Spacing.four, borderTopRightRadius: Spacing.four },
  blur: { padding: Spacing.four, backgroundColor: 'rgba(255,255,255,0.45)' },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: LiquidGlassColors.glassTextSecondary, alignSelf: 'center', marginBottom: Spacing.three, opacity: 0.3 },
  title: { fontSize: 24, fontWeight: 'bold', color: LiquidGlassColors.glassText, marginBottom: Spacing.four },
  label: { fontSize: 14, fontWeight: '600', color: LiquidGlassColors.glassText, marginTop: Spacing.three, marginBottom: Spacing.two },
  amountInput: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.5)', borderWidth: 1, borderColor: LiquidGlassColors.glassBorder, borderRadius: Spacing.two, paddingHorizontal: Spacing.three },
  currency: { fontSize: 24, fontWeight: 'bold', color: LiquidGlassColors.primary, marginRight: Spacing.two },
  input: { flex: 1, fontSize: 18, color: LiquidGlassColors.glassText, paddingVertical: Spacing.three },
  textInput: { backgroundColor: 'rgba(255,255,255,0.5)', borderWidth: 1, borderColor: LiquidGlassColors.glassBorder, borderRadius: Spacing.two, color: LiquidGlassColors.glassText, padding: Spacing.three },
  description: { minHeight: 80, textAlignVertical: 'top' },
  categories: { gap: Spacing.two },
  category: { minWidth: 100, alignItems: 'center', padding: Spacing.two, borderRadius: Spacing.two, borderWidth: 1, borderColor: LiquidGlassColors.glassBorder, backgroundColor: 'rgba(255,255,255,0.5)' },
  categoryActive: { backgroundColor: LiquidGlassColors.primary, borderColor: LiquidGlassColors.primary },
  categoryIcon: { fontSize: 24 },
  categoryText: { fontSize: 12, color: LiquidGlassColors.glassText, textAlign: 'center' },
  categoryTextActive: { fontSize: 12, color: LiquidGlassColors.glassTextLight, fontWeight: '600', textAlign: 'center' },
  preview: { width: '100%', height: 140, borderRadius: Spacing.two },
  invoiceButtons: { flexDirection: 'row', gap: Spacing.two },
  invoiceButton: { flex: 1, padding: Spacing.three, borderRadius: Spacing.two, borderWidth: 1, borderColor: LiquidGlassColors.glassBorder, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.5)' },
  invoiceText: { color: LiquidGlassColors.glassText, fontWeight: '600' },
  remove: { color: LiquidGlassColors.primary, textAlign: 'center', padding: Spacing.two, fontWeight: '600' },
  buttons: { flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.four, paddingBottom: Spacing.two },
  cancel: { flex: 1, paddingVertical: Spacing.three, borderRadius: Spacing.two, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.5)' },
  cancelText: { color: LiquidGlassColors.glassText, fontWeight: '600' },
  save: { flex: 1, borderRadius: Spacing.two, overflow: 'hidden' },
  saveDisabled: { opacity: 0.5 },
  gradient: { paddingVertical: Spacing.three, alignItems: 'center' },
  saveText: { color: LiquidGlassColors.glassTextLight, fontWeight: 'bold' },
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
});
