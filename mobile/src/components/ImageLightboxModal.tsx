import { Modal, View, Image, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { X } from 'lucide-react-native';
import { colors } from '../theme/colors';

export interface ImageLightboxProps {
  visible: boolean;
  imageUrl: string | null;
  title?: string;
  subtitle?: string;
  meta?: string;
  onClose: () => void;
}

export function ImageLightboxModal({ visible, imageUrl, title, subtitle, meta, onClose }: ImageLightboxProps) {
  if (!imageUrl) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.container}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X color="#fff" size={20} />
          </TouchableOpacity>
          <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="contain" />
          {(title || subtitle || meta) && (
            <View style={styles.infoPanel}>
              {title ? <Text style={styles.title}>{title}</Text> : null}
              {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
              {meta ? <Text style={styles.meta}>{meta}</Text> : null}
            </View>
          )}
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(12, 10, 29, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    width: '100%',
    maxHeight: '90%',
    borderRadius: 24,
    backgroundColor: '#0F172A',
    overflow: 'hidden',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 2,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 320,
    backgroundColor: '#111827',
  },
  infoPanel: {
    padding: 18,
    gap: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  subtitle: {
    fontSize: 14,
    color: '#E2E8F0',
  },
  meta: {
    fontSize: 12,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
