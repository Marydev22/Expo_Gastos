import React, { useState } from 'react';
import { Alert, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Expense, CATEGORY_ICONS } from '@/types/expense';
import { LiquidGlassColors, Spacing } from '@/constants/theme';
import { useExpenses } from '@/context/ExpenseContext';
import { GlassCard } from './GlassCard';

interface DeleteConfirmationDialogProps {
  visible: boolean;
  expense: Expense | null;
  onClose: () => void;
}

export const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({ visible, expense, onClose }) => {
  const { deleteExpense } = useExpenses();
  const [isDeleting, setIsDeleting] = useState(false);
  if (!expense) return null;

  const confirm = async () => {
    setIsDeleting(true);
    try {
      await deleteExpense(expense.id);
      onClose();
      Alert.alert('Gasto eliminado', 'El gasto se eliminó correctamente.');
    } catch (error) {
      console.error('Error al eliminar el gasto', error);
      Alert.alert('Error', 'No se pudo eliminar el gasto. Intenta de nuevo.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose}>
        <Animated.View entering={FadeIn} style={StyleSheet.absoluteFill}><BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} /></Animated.View>
      </TouchableOpacity>
      <Animated.View entering={SlideInDown.springify()} style={styles.container}>
        <GlassCard>
          <Text style={styles.icon}>⚠️</Text>
          <Text style={styles.title}>¿Eliminar gasto?</Text>
          <View style={styles.preview}>
            <Text style={styles.categoryIcon}>{CATEGORY_ICONS[expense.category]}</Text>
            <View><Text style={styles.category}>{expense.category}</Text><Text style={styles.amount}>${expense.amount.toFixed(2)}</Text></View>
          </View>
          <Text style={styles.message}>Esta acción no se puede deshacer. Si hay una factura adjunta, también será eliminada.</Text>
          <View style={styles.buttons}>
            <TouchableOpacity style={styles.cancel} onPress={onClose}><Text style={styles.cancelText}>Cancelar</Text></TouchableOpacity>
            <TouchableOpacity style={styles.delete} onPress={confirm} disabled={isDeleting}>
              <LinearGradient colors={[LiquidGlassColors.primary, LiquidGlassColors.secondary]} style={styles.gradient}><Text style={styles.deleteText}>{isDeleting ? 'Eliminando...' : 'Eliminar'}</Text></LinearGradient>
            </TouchableOpacity>
          </View>
        </GlassCard>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFill },
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: Spacing.four },
  icon: { fontSize: 40, textAlign: 'center', marginBottom: Spacing.two },
  title: { fontSize: 20, fontWeight: 'bold', color: LiquidGlassColors.glassText, textAlign: 'center', marginBottom: Spacing.three },
  preview: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,107,157,0.1)', borderRadius: Spacing.two, padding: Spacing.two },
  categoryIcon: { fontSize: 24, marginRight: Spacing.two },
  category: { color: LiquidGlassColors.glassText, fontWeight: '600' },
  amount: { color: LiquidGlassColors.primary, fontWeight: 'bold', fontSize: 16 },
  message: { color: LiquidGlassColors.glassTextSecondary, textAlign: 'center', lineHeight: 18, marginVertical: Spacing.three },
  buttons: { flexDirection: 'row', gap: Spacing.two },
  cancel: { flex: 1, alignItems: 'center', paddingVertical: Spacing.three, borderRadius: Spacing.two, backgroundColor: 'rgba(255,255,255,0.5)' },
  cancelText: { color: LiquidGlassColors.glassText, fontWeight: '600' },
  delete: { flex: 1, overflow: 'hidden', borderRadius: Spacing.two },
  gradient: { paddingVertical: Spacing.three, alignItems: 'center' },
  deleteText: { color: LiquidGlassColors.glassTextLight, fontWeight: 'bold' },
});
