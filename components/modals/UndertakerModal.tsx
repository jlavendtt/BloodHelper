// components/modals/UndertakerModal.tsx
import { Image } from 'expo-image';
import React, { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { RoleName } from '@/models/role';
import { rolesList } from '@/models/rolesList';

export type Player = { id: string; name: string };

type Props = {
  visible: boolean;
  players: Player[];
  excludedPlayerId?: string;

  selectedPlayerId: string | null;
  highlightedRole: RoleName | null;

  onChangePlayer: (id: string | null) => void;
  onChangeHighlightedRole: (role: RoleName | null) => void;

  onClose: () => void;
};

export default function UndertakerModal({
  visible,
  players,
  excludedPlayerId,
  selectedPlayerId,
  highlightedRole,
  onChangePlayer,
  onChangeHighlightedRole,
  onClose,
}: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);

  const availablePlayers = useMemo(
    () => players.filter((p) => p.id !== excludedPlayerId),
    [players, excludedPlayerId]
  );

  const selectedName =
    availablePlayers.find((p) => p.id === selectedPlayerId)?.name ?? 'Select';

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Undertaker</Text>

          <View style={{ gap: 6 }}>
            <Text style={styles.label}>Dead player</Text>
            <Pressable style={styles.dropdown} onPress={() => setPickerOpen(true)}>
              <Text style={styles.dropdownText}>{selectedName}</Text>
            </Pressable>
          </View>

          <Text style={[styles.label, { textAlign: 'center', marginTop: 6 }]}>
            Highlight 1 role
          </Text>

          <ScrollView contentContainerStyle={styles.rolesWrap} showsVerticalScrollIndicator={false}>
            {rolesList.map((r) => {
              const isOn = highlightedRole === r.title;
              return (
                <Pressable
                  key={String(r.title)}
                  onPress={() => onChangeHighlightedRole(isOn ? null : r.title)}
                  style={[styles.roleChip, isOn && styles.roleChipOn]}
                >
                  <Image source={r.picture} style={styles.roleIcon} contentFit="contain" />
                </Pressable>
              );
            })}
          </ScrollView>

          <Pressable style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>Close</Text>
          </Pressable>
        </View>

        {/* picker modal */}
        <Modal visible={pickerOpen} transparent animationType="fade">
          <View style={styles.pickerOverlay}>
            <View style={styles.pickerCard}>
              <Text style={styles.pickerTitle}>Select dead player</Text>

              <ScrollView style={{ maxHeight: 360 }}>
                <Pressable
                  style={styles.pickRow}
                  onPress={() => {
                    onChangePlayer(null);
                    setPickerOpen(false);
                  }}
                >
                  <Text style={styles.pickText}>— None —</Text>
                </Pressable>

                {availablePlayers.map((p) => (
                  <Pressable
                    key={p.id}
                    style={styles.pickRow}
                    onPress={() => {
                      onChangePlayer(p.id);
                      setPickerOpen(false);
                    }}
                  >
                    <Text style={styles.pickText}>{p.name}</Text>
                  </Pressable>
                ))}
              </ScrollView>

              <Pressable style={styles.closeSmall} onPress={() => setPickerOpen(false)}>
                <Text style={styles.closeText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center', padding: 14 },
  card: { width: '100%', maxWidth: 520, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.85)', padding: 18, gap: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', maxHeight: '85%' },
  title: { color: '#fff', fontSize: 18, fontWeight: '900', textAlign: 'center' },

  label: { color: 'rgba(255,255,255,0.85)', fontWeight: '800' },
  dropdown: { paddingVertical: 12, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', backgroundColor: 'rgba(255,255,255,0.06)' },
  dropdownText: { color: '#fff', fontWeight: '800' },

  rolesWrap: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, paddingVertical: 6 },
  roleChip: { width: 52, height: 52, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' },
  roleChipOn: { backgroundColor: 'rgba(158,0,0,0.35)', borderColor: 'rgba(255,0,0,0.6)' },
  roleIcon: { width: 38, height: 38 },

  closeBtn: { alignSelf: 'center', paddingVertical: 10, paddingHorizontal: 18, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', backgroundColor: 'rgba(255,255,255,0.06)' },
  closeText: { color: '#fff', fontWeight: '900' },

  pickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center', padding: 14 },
  pickerCard: { width: '100%', maxWidth: 520, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.92)', padding: 16, gap: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  pickerTitle: { color: '#fff', fontWeight: '900', fontSize: 16, textAlign: 'center' },
  pickRow: { paddingVertical: 12, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
  pickText: { color: '#fff', fontWeight: '800' },
  closeSmall: { alignSelf: 'center', paddingVertical: 10, paddingHorizontal: 18 },
});
