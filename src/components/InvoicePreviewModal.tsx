import React from 'react';
import { Image, Modal, StyleSheet, Text, TouchableOpacity } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { GlassCard } from './GlassCard';
import { LiquidGlassColors, Spacing } from '@/constants/theme';

interface InvoicePreviewModalProps {
  visible: boolean;
  uri: string | null;
  onClose: () => void;
}

// Modal que muestra la factura/comprobante adjunto a un gasto.
// Se abre desde el 📎 de la fila del gasto; tocar el fondo o "Cerrar" lo cierra.
export const InvoicePreviewModal: React.FC<InvoicePreviewModalProps> = ({
  visible,
  uri,
  onClose,
}) => {
  if (!uri) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose}>
        <Animated.View entering={FadeIn} style={StyleSheet.absoluteFill}>
          <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
        </Animated.View>
      </TouchableOpacity>

      <Animated.View entering={FadeInUp.springify()} style={styles.container}>
        <GlassCard style={styles.card}>
          <Text style={styles.title}>Factura / comprobante</Text>
          <Image source={{ uri }} style={styles.image} resizeMode="contain" />
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>Cerrar</Text>
          </TouchableOpacity>
        </GlassCard>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: LiquidGlassColors.glassText,
    textAlign: 'center',
    marginBottom: Spacing.three,
  },
  image: {
    width: '100%',
    height: 320,
    borderRadius: Spacing.two,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    marginBottom: Spacing.three,
  },
  closeButton: {
    backgroundColor: 'rgba(255, 107, 157, 0.15)',
    borderRadius: Spacing.two,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  closeText: {
    color: LiquidGlassColors.secondary,
    fontWeight: '600',
  },
});
