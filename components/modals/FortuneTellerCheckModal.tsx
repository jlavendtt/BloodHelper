// components/modals/FortuneTellerCheckModal.tsx
import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  visible: boolean;
  value: boolean | null;
  onChange: (v: boolean) => void;
  onClose: () => void;
};

export default function FortuneTellerCheckModal({ visible, value, onChange, onClose }: Props) {
  const isGreen = value === true;
  const isRed = value === false;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Fortune Teller</Text>
          <Text style={styles.subtitle}>Select result</Text>

          <View style={styles.row}>
            <Pressable
              onPress={() => onChange(true)}
              style={[styles.choice, isGreen && styles.choiceOnGreen]}
            >
              <Text style={[styles.choiceText, isGreen && styles.choiceTextOn]}>✓</Text>
            </Pressable>

            <Pressable
              onPress={() => onChange(false)}
              style={[styles.choice, isRed && styles.choiceOnRed]}
            >
              <Text style={[styles.choiceText, isRed && styles.choiceTextOn]}>✕</Text>
            </Pressable>
          </View>

          <Pressable style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center', padding: 14 },
  card: { width: '100%', maxWidth: 420, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.85)', padding: 18, gap: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  title: { color: '#fff', fontSize: 18, fontWeight: '900', textAlign: 'center' },
  subtitle: { color: 'rgba(255,255,255,0.85)', textAlign: 'center', marginTop: -8, fontWeight: '700' },

  row: { flexDirection: 'row', justifyContent: 'center', gap: 18, marginTop: 6 },
  choice: {
    width: 78,
    height: 78,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceOnGreen: { backgroundColor: 'rgba(0,255,0,0.18)', borderColor: 'rgba(0,255,0,0.55)' },
  choiceOnRed: { backgroundColor: 'rgba(255,0,0,0.18)', borderColor: 'rgba(255,0,0,0.55)' },
  choiceText: { color: '#fff', fontSize: 40, fontWeight: '900' },
  choiceTextOn: { transform: [{ scale: 1.05 }] },

  closeBtn: { alignSelf: 'center', paddingVertical: 10, paddingHorizontal: 18, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', backgroundColor: 'rgba(255,255,255,0.06)' },
  closeText: { color: '#fff', fontWeight: '900' },
});
