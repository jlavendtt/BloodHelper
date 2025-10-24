

// components/RoleSelector.tsx
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Affiliation, RoleName } from '@/models/role';
import { useRoleStore } from '@/stores/roleStore';
import React, { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, View } from 'react-native';

interface RoleSelectorProps {
  playerId: string;
  label?: string;                 // Button label
  affiliation?: Affiliation;      // Optional filter
}

export default function RoleSelector({ playerId, label = 'Select Role', affiliation }: RoleSelectorProps) {
  const [open, setOpen] = useState(false);

  const assignRole = useRoleStore(s => s.assignRole);
  const available = useRoleStore(s => s.availableForPlayer(playerId, affiliation));
  const current = useRoleStore(s => s.assigned[playerId]);

  const data = useMemo(() => {
    // Put current selection (if any) at the top for quick access
    const rest = available.filter(r => r.title !== current);
    return current ? [{ title: current } as any].concat(rest) : rest;
  }, [available, current]);

  const onChoose = (roleName: RoleName | undefined) => {
    assignRole(playerId, roleName);
    setOpen(false);
  };

  return (
    <>
      <Pressable style={styles.button} onPress={() => setOpen(true)}>
        <ThemedText type="defaultSemiBold">{current ?? label}</ThemedText>
      </Pressable>

      <Modal visible={open} animationType="fade" transparent onRequestClose={() => setOpen(false)}>
        <View style={styles.overlay}>
          <ThemedView style={styles.sheet}>
            <ThemedText type="title" style={{ marginBottom: 8 }}>Choose a Role</ThemedText>

            <FlatList
              data={data}
              keyExtractor={(item) => String(item.title)}
              renderItem={({ item }) => (
                <Pressable style={styles.row} onPress={() => onChoose(item.title)}>
                  <ThemedText>{item.title}</ThemedText>
                </Pressable>
              )}
              ItemSeparatorComponent={() => <View style={styles.sep} />}
              style={{ maxHeight: 360 }}
            />

            <View style={{ height: 12 }} />
            <View style={styles.actions}>
              <Pressable style={[styles.actionBtn, styles.clear]} onPress={() => onChoose(undefined)}>
                <ThemedText>Clear</ThemedText>
              </Pressable>
              <Pressable style={[styles.actionBtn, styles.close]} onPress={() => setOpen(false)}>
                <ThemedText>Close</ThemedText>
              </Pressable>
            </View>
          </ThemedView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(0,0,0,0.2)'
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  sheet: {
    width: '100%',
    maxWidth: 520,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)'
  },
  row: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  sep: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)'
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  actionBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)'
  },
  clear: {
    backgroundColor: 'rgba(158,0,0,0.25)'
  },
  close: {
    backgroundColor: 'rgba(255,255,255,0.06)'
  }
});


