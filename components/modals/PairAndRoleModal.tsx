// components/modals/PairAndRoleModal.tsx
import { Image } from 'expo-image';
import React, { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { RoleName } from '@/models/role';
import { rolesList } from '@/models/rolesList';

export type Player = { id: string; name: string };

type Props = {
  visible: boolean;
  excludedPlayerId?: string;

  players: Player[];

  // persisted selections (parent-owned)
  player1Id: string | null;
  player2Id: string | null;
  highlightedRole: RoleName | null;

  onChangePlayer1: (id: string | null) => void;
  onChangePlayer2: (id: string | null) => void;
  onChangeHighlightedRole: (role: RoleName | null) => void;

  onClose: () => void;
};

type WhichPicker = 'p1' | 'p2' | null;

export default function PairAndRoleModal({
  visible,
  excludedPlayerId,
  players,
  player1Id,
  player2Id,
  highlightedRole,
  onChangePlayer1,
  onChangePlayer2,
  onChangeHighlightedRole,
  onClose,
}: Props) {
  const [pickerOpen, setPickerOpen] = useState<WhichPicker>(null);

  const availablePlayers = useMemo(() => {
    return players.filter((p) => p.id !== excludedPlayerId);
  }, [players, excludedPlayerId]);

  const playerName = (id: string | null) =>
    availablePlayers.find((p) => p.id === id)?.name ?? 'Select';

  const openPicker = (which: WhichPicker) => setPickerOpen(which);
  const closePicker = () => setPickerOpen(null);

  const pickPlayer = (id: string | null) => {
    if (pickerOpen === 'p1') onChangePlayer1(id);
    if (pickerOpen === 'p2') onChangePlayer2(id);
    closePicker();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Choose players + a role</Text>

          {/* Player pickers */}
          <View style={styles.pickers}>
            <View style={styles.pickerBlock}>
              <Text style={styles.label}>Player 1</Text>
              <Pressable style={styles.dropdown} onPress={() => openPicker('p1')}>
                <Text style={styles.dropdownText}>{playerName(player1Id)}</Text>
              </Pressable>
            </View>

            <View style={styles.pickerBlock}>
              <Text style={styles.label}>Player 2</Text>
              <Pressable style={styles.dropdown} onPress={() => openPicker('p2')}>
                <Text style={styles.dropdownText}>{playerName(player2Id)}</Text>
              </Pressable>
            </View>
          </View>

          {/* Role icons */}
          <Text style={[styles.label, { textAlign: 'center', marginTop: 6 }]}>
            Highlight 1 role
          </Text>

          <ScrollView
            contentContainerStyle={styles.rolesWrap}
            showsVerticalScrollIndicator={false}
          >
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

          {/* Close */}
          <Pressable style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>Close</Text>
          </Pressable>
        </View>

        {/* Simple dropdown list overlay */}
        <Modal visible={pickerOpen !== null} transparent animationType="fade">
          <View style={styles.pickerOverlay}>
            <View style={styles.pickerCard}>
              <Text style={styles.pickerTitle}>
                {pickerOpen === 'p1' ? 'Select Player 1' : 'Select Player 2'}
              </Text>

              <ScrollView style={{ maxHeight: 360 }}>
                <Pressable style={styles.pickRow} onPress={() => pickPlayer(null)}>
                  <Text style={styles.pickText}>— None —</Text>
                </Pressable>

                {availablePlayers.map((p) => (
                  <Pressable key={p.id} style={styles.pickRow} onPress={() => pickPlayer(p.id)}>
                    <Text style={styles.pickText}>{p.name}</Text>
                  </Pressable>
                ))}
              </ScrollView>

              <Pressable style={styles.closeSmall} onPress={closePicker}>
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
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 14,
  },
  card: {
    width: '100%',
    maxWidth: 520,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.85)',
    padding: 18,
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    maxHeight: '85%',
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },

  pickers: { gap: 12 },
  pickerBlock: { gap: 6 },
  label: { color: 'rgba(255,255,255,0.85)', fontWeight: '700' },
  dropdown: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  dropdownText: { color: '#fff', fontWeight: '700' },

  rolesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  roleChip: {
    width: 52,
    height: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleChipOn: {
    backgroundColor: 'rgba(158,0,0,0.35)',
    borderColor: 'rgba(255,0,0,0.6)',
  },
  roleIcon: { width: 38, height: 38 },

  closeBtn: {
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  closeText: { color: '#fff', fontWeight: '800' },

  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 14,
  },
  pickerCard: {
    width: '100%',
    maxWidth: 520,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.92)',
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  pickerTitle: { color: '#fff', fontWeight: '900', fontSize: 16, textAlign: 'center' },
  pickRow: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  pickText: { color: '#fff', fontWeight: '700' },
  closeSmall: { alignSelf: 'center', paddingVertical: 10, paddingHorizontal: 18 },
});
