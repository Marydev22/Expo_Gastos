import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Expense, CATEGORY_ICONS } from '@/types/expense';
import { GlassCard } from './GlassCard';
import { LiquidGlassColors, Spacing } from '@/constants/theme';

interface ExpenseItemProps {
  expense: Expense;
  index: number; // sirve para que cada fila entre un poquito despues de la anterior
  onEdit?: (expense: Expense) => void;
  onDelete?: (expense: Expense) => void;
  onViewInvoice?: (uri: string) => void;
}

// Una fila de la lista de gastos
export const ExpenseItem: React.FC<ExpenseItemProps> = ({ expense, index, onEdit, onDelete, onViewInvoice }) => {
  // Queda algo como "15 oct"
  const formattedDate = new Date(expense.date).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
  });

  // Queda algo como "$15.50"
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(expense.amount);

  return (
    <Animated.View entering={FadeInDown.delay(index * 100).springify()} style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.9}
        onLongPress={() => Alert.alert(
          'Opciones del gasto',
          `${expense.category} · ${formattedAmount}`,
          [
            { text: 'Editar', onPress: () => onEdit?.(expense) },
            { text: 'Eliminar', onPress: () => onDelete?.(expense), style: 'destructive' },
            { text: 'Cancelar', style: 'cancel' },
          ],
        )}
      >
        <GlassCard>
          <View style={styles.content}>
            <View style={styles.leftSection}>
              <View style={styles.iconContainer}>
                <LinearGradient
                  colors={[LiquidGlassColors.primary, LiquidGlassColors.secondary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.iconGradient}
                >
                  <Text style={styles.icon}>{CATEGORY_ICONS[expense.category]}</Text>
                </LinearGradient>
              </View>
              <View style={styles.infoContainer}>
                <Text style={styles.category}>{expense.category}</Text>
                {expense.description && (
                  <Text style={styles.description} numberOfLines={1}>
                    {expense.description}
                  </Text>
                )}
                {/* Solo aparece si el gasto tiene comprobante adjunto */}
                {expense.invoice_uri && (
                  <TouchableOpacity
                    style={styles.invoiceBadge}
                    onPress={() => onViewInvoice?.(expense.invoice_uri!)}
                    accessibilityRole="button"
                    accessibilityLabel="Ver factura adjunta"
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <Text style={styles.invoiceBadgeText}>📎 Factura adjunta</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
            <View style={styles.rightSection}>
              <Text style={styles.amount}>{formattedAmount}</Text>
              <Text style={styles.date}>{formattedDate}</Text>
              {/* Acciones visibles del gasto; el long-press sigue abriendo el mismo menú */}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => onEdit?.(expense)}
                  accessibilityRole="button"
                  accessibilityLabel={`Editar gasto de ${expense.category}`}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.actionIcon}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => onDelete?.(expense)}
                  accessibilityRole="button"
                  accessibilityLabel={`Eliminar gasto de ${expense.category}`}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.actionIcon}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </GlassCard>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.two,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    marginRight: Spacing.two,
  },
  iconGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 24,
  },
  infoContainer: {
    flex: 1,
  },
  invoiceBadge: {
    alignSelf: 'flex-start',
    marginTop: Spacing.one,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    borderRadius: Spacing.one,
    backgroundColor: 'rgba(168, 230, 207, 0.35)',
  },
  invoiceBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: LiquidGlassColors.glassText,
  },
  category: {
    fontSize: 16,
    fontWeight: '600',
    color: LiquidGlassColors.glassText,
    marginBottom: 2,
  },
  description: {
    fontSize: 13,
    color: LiquidGlassColors.glassTextSecondary,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.one,
    marginTop: Spacing.one,
  },
  actionButton: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.one,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderWidth: 1,
    borderColor: LiquidGlassColors.glassBorder,
  },
  actionIcon: {
    fontSize: 14,
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: LiquidGlassColors.primary,
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    color: LiquidGlassColors.glassTextSecondary,
  },
});
