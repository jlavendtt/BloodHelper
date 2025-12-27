// components/modals/NumberSelectModal.tsx
import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  visible: boolean;
  value: 0 | 1 | 2 | null;
  onChange: (v: 0 | 1 | 2) => void;
  onClose: () => void;
};

export default function NumberSelectModal({
  visible,
  value,
  onChange,
  onClose,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Select a number</Text>

          <View style={styles.row}>
            {[0, 1, 2].map((n) => {
              const isSelected = value === n;

              return (
                <Pressable
                  key={n}
                  onPress={() => onChange(n as 0 | 1 | 2)}
                  style={[
                    styles.option,
                    isSelected && styles.optionSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.optionText,
                      isSelected && styles.optionTextSelected,
                    ]}
                  >
                    {n}
                  </Text>
                </Pressable>
              );
            })}
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
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '85%',
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.85)',
    padding: 18,
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  option: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  optionSelected: {
    backgroundColor: 'rgba(158,0,0,0.35)',
    borderColor: 'rgba(255,0,0,0.6)',
  },
  optionText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  optionTextSelected: {
    fontWeight: '800',
  },
  closeBtn: {
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  closeText: {
    color: '#fff',
    fontWeight: '700',
  },
});
