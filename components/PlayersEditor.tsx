import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useContactImporter } from '@/hooks/useContactImporter';
import { rolesList } from '@/models/rolesList';
import { usePlayersStore } from '@/stores/playerStore';
import { useRoleStore } from '@/stores/roleStore';

import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Affiliation } from '@/models/role';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Alert, Linking, Platform } from 'react-native';


export default function PlayersEditor() {
  const {
    players,
    nameHistory,
    addPlayer,
    addFromHistory,
    removePlayer,
    clearPlayers,
    removeFromHistory,
  } = usePlayersStore();

  const assigned = useRoleStore((s) => s.assigned);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [removeMode, setRemoveMode] = useState(false);

  const norm = (s: string) => s.trim().toLowerCase();

  const previousSorted = useMemo(() => {
    const current = new Set(players.map((p) => norm(p.name)));
    return nameHistory
      .filter((n) => !current.has(norm(n)))
      .slice()
      .sort((a, b) => a.localeCompare(b));
  }, [nameHistory, players]);

  const handleAdd = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    addPlayer(trimmed, phone.trim());
    setName('');
    setPhone('');
  };

  const contactImporter = useContactImporter({
    onPick: (name, phone) => addPlayer(name, phone),
    excludeNames: players.map((p) => p.name),
  });

  const handleChipPress = (n: string) => {
    if (removeMode) removeFromHistory(n);
    else addFromHistory(n);
  };

  const sendRoleText = async (playerId: string) => {
  const p = players.find(x => x.id === playerId);
  if (!p) return;

  const phone = (p.phone ?? '').trim();
  if (!phone) {
    Alert.alert('No phone number', `Add a phone number for ${p.name} first.`);
    return;
  }

  const roleName = assigned[playerId];
  const role = roleName ? rolesList.find(r => r.title === roleName) : undefined;

  const roleText = roleName ? String(roleName) : 'Unknown role';

  // Build team intel based on affiliations
  const playersWithRoles = players
    .map(pl => {
      const rn = assigned[pl.id];
      const r = rn ? rolesList.find(x => x.title === rn) : undefined;
      return { player: pl, roleName: rn, role: r };
    })
    .filter(x => x.role); // only those with known role objects

  const demons = playersWithRoles.filter(x => x.role?.affiliation === Affiliation.Demon);
  const minions = playersWithRoles.filter(x => x.role?.affiliation === Affiliation.Minion);

  const demonNames = demons.map(x => x.player.name);
  const minionNames = minions.map(x => x.player.name);

  const isDemon = role?.affiliation === Affiliation.Demon;
  const isMinion = role?.affiliation === Affiliation.Minion;

  const lines: string[] = [];
  lines.push(`Your role is: ${roleText}`);

  if (isDemon) {
    if (minionNames.length) {
      lines.push(`Your minion(s): ${minionNames.join(', ')}`);
    }
  }

  if (isMinion) {
    if (demonNames.length) {
      lines.push(`Your demon: ${demonNames.join(', ')}`);
    }
    const otherMinions = minionNames.filter(n => n !== p.name);
    if (otherMinions.length) {
      lines.push(`Fellow minion(s): ${otherMinions.join(', ')}`);
    }
  }

  const message = lines.join('\n');

  const sep = Platform.OS === 'ios' ? '&' : '?';
  const url = `sms:${encodeURIComponent(phone)}${sep}body=${encodeURIComponent(message)}`;

  const canOpen = await Linking.canOpenURL(url);
  if (!canOpen) {
    Alert.alert('Cannot open Messages', 'Your device cannot open the SMS composer.');
    return;
  }

  await Linking.openURL(url);
};



  return (
    <ThemedView style={{ gap: 12 }}>
      {/* Add player */}
      <ThemedText type="subtitle">Add Player</ThemedText>
      <View style={styles.row}>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Player name"
          placeholderTextColor="#999"
          style={[styles.input, { flex: 1 }]}
        />
        <TextInput
          value={phone}
          onChangeText={setPhone}
          placeholder="Phone (optional)"
          placeholderTextColor="#999"
          style={[styles.input, { flex: 1 }]}
          keyboardType="phone-pad"
        />
        <Pressable style={styles.btn} onPress={handleAdd}>
          <ThemedText>Add</ThemedText>
        </Pressable>
        <Pressable style={[styles.btn, styles.warn]} onPress={clearPlayers}>
          <ThemedText>Clear All</ThemedText>
        </Pressable>
      </View>

      {/* In Game */}
      <ThemedText type="subtitle">In Game</ThemedText>
      <View style={{ gap: 8 }}>
        {players.map((p) => {
          const roleName = assigned[p.id];
          const role = roleName
            ? rolesList.find((r) => r.title === roleName)
            : undefined;

          return (
            <View key={p.id} style={styles.playerRow}>
              {/* Role icon or ? */}
              {role?.picture ? (
                <Image
                  source={role.picture}
                  style={styles.roleIcon}
                  contentFit="contain"
                />
              ) : (
                <View style={styles.roleUnknown}>
                  <Text style={styles.roleUnknownText}>?</Text>
                </View>
              )}

              {/* Name */}
              <ThemedText style={styles.playerName} numberOfLines={1}>
                {p.name}
              </ThemedText>

              {/* Actions */}
              <View style={styles.actions}>
                <Pressable
                  style={styles.iconBtn}
                  onPress={() => sendRoleText(p.id)}

                >
                  <Ionicons name="send" size={18} color="#fff" />
                </Pressable>

                <Pressable
                  style={[styles.btn, styles.danger]}
                  onPress={() => removePlayer(p.id)}
                >
                  <ThemedText>Remove</ThemedText>
                </Pressable>
              </View>
            </View>
          );
        })}

        {players.length === 0 && (
          <ThemedText style={{ opacity: 0.7 }}>
            No players yet.
          </ThemedText>
        )}
      </View>

      {/* Previously used */}
      <ThemedText type="subtitle">Previously used</ThemedText>
      <View style={styles.chipsGrid}>
        {previousSorted.map((n, i) => {
          const isThird = i % 3 === 2;
          return (
            <Pressable
              key={n}
              onPress={() => handleChipPress(n)}
              style={[
                styles.historyChip,
                !isThird && styles.historyChipRight,
                removeMode && styles.historyChipRemoveMode,
              ]}
            >
              <Text style={styles.chipText} numberOfLines={1}>
                {n}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Remove toggle */}
      <Pressable
        style={[
          styles.btn,
          styles.removeToggle,
          removeMode ? styles.removeOn : styles.removeOff,
        ]}
        onPress={() => setRemoveMode((v) => !v)}
      >
        <ThemedText>
          {removeMode ? 'Remove User: ON' : 'Remove User'}
        </ThemedText>
      </Pressable>

      {/* Import Contacts */}
      <Pressable
        style={[styles.btn, styles.neutral]}
        onPress={contactImporter.openPicker}
      >
        <ThemedText>
          {contactImporter.loading ? 'Loading…' : 'Import Contacts'}
        </ThemedText>
      </Pressable>

      {/* Contacts Modal */}
      <Modal
        visible={contactImporter.open}
        transparent
        animationType="fade"
        onRequestClose={contactImporter.closePicker}
      >
        <View style={styles.modalBackdropOffset}>
          <View style={styles.modalCard}>
            <ThemedText type="subtitle">Import from Contacts</ThemedText>

            <TextInput
              value={contactImporter.query}
              onChangeText={contactImporter.setQuery}
              placeholder="Search name or number"
              placeholderTextColor="#999"
              style={styles.modalInput}
            />

            <View style={{ maxHeight: 360 }}>
              <FlatList
                data={contactImporter.filtered}
                keyboardShouldPersistTaps="handled"
                keyExtractor={(_, i) => String(i)}
                renderItem={({ item }) => {
                  const displayName =
                    (item.name ??
                      `${item.firstName ?? ''} ${item.lastName ?? ''}`.trim()).trim() ||
                    'Unnamed';

                  const displayNumber =
                    item.phoneNumbers?.[0]?.number?.trim() ?? 'No number';

                  return (
                    <Pressable
                      onPress={() => contactImporter.pickContact(item)}
                      style={styles.contactRow}
                    >
                      <View style={{ flex: 1 }}>
                        <ThemedText numberOfLines={1} style={{ fontWeight: '600' }}>
                          {displayName}
                        </ThemedText>
                        <ThemedText numberOfLines={1} style={{ opacity: 0.85 }}>
                          {displayNumber}
                        </ThemedText>
                      </View>
                      <ThemedText>Add</ThemedText>
                    </Pressable>
                  );
                }}
              />
            </View>

            <View style={styles.modalActions}>
              <Pressable
                style={[styles.btn, styles.neutral]}
                onPress={contactImporter.closePicker}
              >
                <ThemedText>Close</ThemedText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const COL_GAP = 8;

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, alignItems: 'center', flexWrap: 'wrap' },

  input: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    color: '#fff',
    minWidth: 120,
  },

  btn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },

  warn: { backgroundColor: 'rgba(255,165,0,0.15)' },
  danger: { backgroundColor: 'rgba(158,0,0,0.25)' },
  neutral: { backgroundColor: 'rgba(255,255,255,0.08)' },

  removeToggle: { alignSelf: 'center' },
  removeOn: {
    backgroundColor: 'rgba(158,0,0,0.25)',
    borderColor: 'rgba(255,0,0,0.35)',
  },
  removeOff: { backgroundColor: 'rgba(255,255,255,0.08)' },

  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  playerName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },

  actions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },

  roleIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },

  roleUnknown: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  roleUnknownText: {
    fontSize: 16,
    fontWeight: '700',
  },

  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  chipsGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  historyChip: {
    width: '31%',
    marginBottom: COL_GAP,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  historyChipRight: { marginRight: COL_GAP },
  historyChipRemoveMode: {
    backgroundColor: 'rgba(158,0,0,0.15)',
    borderColor: 'rgba(255,0,0,0.35)',
  },
  chipText: { color: '#fff' },

  modalBackdropOffset: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: '35%',
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },

  modalCard: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(20,20,20,0.98)',
    gap: 10,
  },

  modalInput: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    color: '#fff',
  },

  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8,
  },

  contactRow: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
});
