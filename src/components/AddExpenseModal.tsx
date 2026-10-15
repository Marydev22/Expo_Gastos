import React, { useState } from 'react';
import {
  Image,
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
import { Category, CATEGORIES, CATEGORY_ICONS } from '@/types/expense';
import { LiquidGlassColors, Spacing } from '@/constants/theme';
import { useExpenses } from '@/context/ExpenseContext';
import {
  deleteInvoiceImage,
  pickInvoiceImage,
  saveInvoiceImage,
  takeCameraPhoto,
} from '@/utils/imageHelper';

interface AddExpenseModalProps {
  visible: boolean;
  onClose: () => void;
}

// Fecha por defecto: el dia en que se registra el gasto (AAAA-MM-DD)
const todayIso = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
};

// Modal que sube desde abajo para registrar un gasto.
// Para poder agregarlo hacen falta el monto, la categoria y la fecha;
// la descripcion y la factura/comprobante son opcionales.
export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  visible,
  onClose,
}) => {
  const { addExpense } = useExpenses();
  // El monto es string porque asi trabaja el TextInput; se pasa a numero al guardar
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category | null>(null);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(todayIso());
  const [invoiceUri, setInvoiceUri] = useState<string | undefined>();
  const [errors, setErrors] = useState<{
    amount?: string;
    category?: string;
    description?: string;
    date?: string;
  }>({});

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
      if (text.length > 400) {
        setErrors((prev) => ({ ...prev, description: 'La descripción no puede exceder 400 caracteres' }));
      } else {
        setErrors((prev) => ({ ...prev, description: undefined }));
      }
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

  // async porque ahora hay que esperar a que el gasto se guarde en el telefono
  const handleSubmit = async () => {
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
    // La fecha es obligatoria: tiene que ser un dia valido y no puede ser futuro
    if (!date || Number.isNaN(parsedDate.getTime()) || parsedDate > new Date()) {
      newErrors.date = 'La fecha es obligatoria, debe ser válida y no puede ser futura';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!category) {
      return;
    }

    try {
      await addExpense({
        amount: parsedAmount,
        category,
        date: parsedDate,
        description: description.trim() || undefined,
        invoice_uri: invoiceUri,
      });
    } catch (error) {
      // Si no se pudo guardar, se avisa y el modal queda abierto con los datos
      console.error('Error al guardar el gasto', error);
      Alert.alert('Error', 'No se pudo guardar el gasto. Intenta de nuevo.');
      return;
    }

    // Reset form (la factura ya quedó guardada, por eso NO se borra el archivo)
    setAmount('');
    setCategory(null);
    setDescription('');
    setDate(todayIso());
    setInvoiceUri(undefined);
    setErrors({});
    onClose();
  };

  // Adjunta la factura desde la camara o la galeria y la copia a la carpeta de la app
  const attachInvoice = async (from: 'camera' | 'gallery') => {
    try {
      const pickedUri = from === 'camera' ? await takeCameraPhoto() : await pickInvoiceImage();
      if (!pickedUri) return;
      const savedUri = await saveInvoiceImage(pickedUri);
      // Si ya había una factura, la nueva la reemplaza
      if (invoiceUri) {
        await deleteInvoiceImage(invoiceUri);
      }
      setInvoiceUri(savedUri);
    } catch (error) {
      console.error('Error al adjuntar la factura', error);
      Alert.alert(
        'No se pudo adjuntar',
        error instanceof Error ? error.message : 'Intenta de nuevo.',
      );
    }
  };

  // El gasto todavía no existe en la base, asi que la copia pendiente
  // si se puede borrar en el momento sin romper nada
  const removeInvoice = async () => {
    if (invoiceUri) {
      await deleteInvoiceImage(invoiceUri);
    }
    setInvoiceUri(undefined);
  };

  // Si el usuario cancela, la copia de la factura ya no le sirve a nadie
  const discardInvoice = async () => {
    if (invoiceUri) {
      await deleteInvoiceImage(invoiceUri);
      setInvoiceUri(undefined);
    }
  };

  // Igual que al guardar, se limpia el formulario para que no quede texto viejo
  const handleClose = async () => {
    await discardInvoice();
    setAmount('');
    setCategory(null);
    setDescription('');
    setDate(todayIso());
    setErrors({});
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
        keyboardVerticalOffset={0}
      >
        {/* Tocar el fondo tambien cierra el modal */}
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleClose}
        >
          <Animated.View entering={FadeIn} style={styles.backdropBlur}>
            <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
          </Animated.View>
        </TouchableOpacity>

        <Animated.View
          entering={SlideInDown.springify()}
          style={styles.modalContent}
        >
          <View style={styles.modalBackground}>
            <BlurView intensity={100} tint="light" style={styles.modalBlur}>
              <View style={styles.handleBar} />

              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.scrollContent}
              >
                <Text style={styles.title}>Agregar Gasto</Text>

                <View style={styles.inputSection}>
                  <Text style={styles.label}>Monto (USD)</Text>
                  <View style={styles.inputContainer}>
                    <Text style={styles.currencySymbol}>$</Text>
                    <TextInput
                      style={styles.input}
                      value={amount}
                      onChangeText={handleAmountChange}
                      placeholder="0.00"
                      keyboardType="decimal-pad"
                      placeholderTextColor={LiquidGlassColors.glassTextSecondary}
                    />
                  </View>
                  {errors.amount && <Text style={styles.errorText}>{errors.amount}</Text>}
                </View>

                <View style={styles.inputSection}>
                  <Text style={styles.label}>Categoría</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.categoriesScroll}
                    contentContainerStyle={styles.categoriesContent}
                  >
                    {/* La elegida se pinta con el gradiente */}
                    {CATEGORIES.map((cat) => (
                      <TouchableOpacity
                        key={cat}
                        onPress={() => handleCategorySelect(cat)}
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
                  {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
                </View>

                <View style={styles.inputSection}>
                  <Text style={styles.label}>Fecha (obligatoria)</Text>
                  <View style={styles.dateRow}>
                    <Text style={styles.dateIcon}>📅</Text>
                    <TextInput
                      style={[styles.input, styles.dateInput]}
                      value={date}
                      onChangeText={(t) => {
                        setDate(t);
                        setErrors((prev) => ({ ...prev, date: undefined }));
                      }}
                      placeholder="AAAA-MM-DD"
                      keyboardType="numbers-and-punctuation"
                      placeholderTextColor={LiquidGlassColors.glassTextSecondary}
                    />
                    {/* Atajo para volver al día de hoy si el usuario se equivoca */}
                    <TouchableOpacity style={styles.todayButton} onPress={() => { setDate(todayIso()); setErrors((prev) => ({ ...prev, date: undefined })); }}>
                      <Text style={styles.todayButtonText}>Hoy</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.inputSection}>
                  <Text style={styles.label}>Descripción (opcional)</Text>
                  <TextInput
                    style={[styles.input, styles.descriptionInput]}
                    value={description}
                    onChangeText={handleDescriptionChange}
                    placeholder="Ej: Almuerzo, transporte a la universidad..."
                    placeholderTextColor={LiquidGlassColors.glassTextSecondary}
                    multiline
                  />
                  {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
                  <Text style={styles.charCount}>
                    {description.length}/400
                  </Text>
                </View>

                <View style={styles.inputSection}>
                  <Text style={styles.label}>Factura / comprobante (opcional)</Text>
                  {invoiceUri ? (
                    <View style={styles.invoicePreviewContainer}>
                      <Image source={{ uri: invoiceUri }} style={styles.invoicePreview} />
                      <TouchableOpacity style={styles.removePhotoButton} onPress={removeInvoice}>
                        <Text style={styles.removePhotoText}>✕ Quitar factura</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.invoiceButtons}>
                      <TouchableOpacity style={styles.invoiceButton} onPress={() => attachInvoice('camera')}>
                        <Text style={styles.invoiceButtonText}>📷 Tomar foto</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.invoiceButton} onPress={() => attachInvoice('gallery')}>
                        <Text style={styles.invoiceButtonText}>🖼️ Galería</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

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
                      !isFormValid() && styles.submitButtonDisabled,
                    ]}
                    onPress={handleSubmit}
                    disabled={!isFormValid()}
                  >
                    <LinearGradient
                      colors={[LiquidGlassColors.primary, LiquidGlassColors.secondary]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.submitGradient}
                    >
                      <Text style={styles.submitButtonText}>Agregar</Text>
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  backdropBlur: {
    flex: 1,
  },
  modalContent: {
    borderTopLeftRadius: Spacing.four,
    borderTopRightRadius: Spacing.four,
    overflow: 'hidden',
    maxHeight: '80%',
  },
  modalBackground: {
    // Bajito a proposito: si es casi opaco no se ve el blur del fondo
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderTopLeftRadius: Spacing.four,
    borderTopRightRadius: Spacing.four,
  },
  modalBlur: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.four,
    maxHeight: '100%',
  },
  scrollContent: {
    paddingBottom: Spacing.four,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: LiquidGlassColors.glassTextSecondary,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.three,
    marginTop: Spacing.two,
    opacity: 0.3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: LiquidGlassColors.glassText,
    marginBottom: Spacing.four,
  },
  inputSection: {
    marginBottom: Spacing.four,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: LiquidGlassColors.glassText,
    marginBottom: Spacing.two,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: LiquidGlassColors.glassBorder,
    paddingHorizontal: Spacing.three,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: 'bold',
    color: LiquidGlassColors.primary,
    marginRight: Spacing.one,
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: LiquidGlassColors.glassText,
    paddingVertical: Spacing.three,
  },
  descriptionInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: LiquidGlassColors.glassBorder,
    paddingHorizontal: Spacing.three,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: LiquidGlassColors.glassBorder,
    paddingHorizontal: Spacing.three,
  },
  dateIcon: {
    fontSize: 18,
    marginRight: Spacing.two,
  },
  dateInput: {
    paddingVertical: Spacing.three,
  },
  todayButton: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.one,
    backgroundColor: 'rgba(255, 107, 157, 0.15)',
  },
  todayButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: LiquidGlassColors.secondary,
  },
  invoicePreviewContainer: {
    alignItems: 'center',
  },
  invoicePreview: {
    width: '100%',
    height: 150,
    borderRadius: Spacing.two,
    marginBottom: Spacing.two,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  removePhotoButton: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
    backgroundColor: 'rgba(255, 107, 157, 0.2)',
  },
  removePhotoText: {
    color: LiquidGlassColors.primary,
    fontWeight: '600',
  },
  invoiceButtons: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  invoiceButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: LiquidGlassColors.glassBorder,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  invoiceButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: LiquidGlassColors.glassText,
  },
  categoriesScroll: {
    marginHorizontal: -Spacing.two,
  },
  categoriesContent: {
    paddingHorizontal: Spacing.two,
    gap: Spacing.two,
  },
  categoryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: LiquidGlassColors.glassBorder,
    padding: Spacing.two,
    minWidth: 100,
    alignItems: 'center',
  },
  categoryButtonActive: {
    borderColor: 'transparent',
  },
  categoryGradient: {
    padding: Spacing.two,
    borderRadius: Spacing.two,
    alignItems: 'center',
    width: '100%',
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: Spacing.one,
  },
  categoryText: {
    fontSize: 12,
    color: LiquidGlassColors.glassText,
    textAlign: 'center',
  },
  categoryTextActive: {
    fontSize: 12,
    color: LiquidGlassColors.glassTextLight,
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: LiquidGlassColors.glassBorder,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: LiquidGlassColors.glassText,
  },
  submitButton: {
    flex: 1,
    borderRadius: Spacing.two,
    overflow: 'hidden',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitGradient: {
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: LiquidGlassColors.glassTextLight,
  },
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
