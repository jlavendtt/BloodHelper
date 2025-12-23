import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useContactImporter } from '@/hooks/useContactImporter';
import { usePlayersStore } from '@/stores/playerStore';
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



export default function PlayersEditor() {
  const {
    players,
    nameHistory,
    addPlayer,
    addFromHistory,
    removePlayer,
    clearPlayers,
    removeFromHistory,
    updatePlayer,
  } = usePlayersStore();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [removeMode, setRemoveMode] = useState(false);

  // modal edit state
  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');

  const norm = (s: string) => s.trim().toLowerCase();

  const previousSorted = useMemo(() => {
    const current = new Set(players.map(p => norm(p.name)));
    return nameHistory
      .filter(n => !current.has(norm(n)))
      .slice()
      .sort((a, b) => a.localeCompare(b));
  }, [nameHistory, players]);

  const handleAdd = () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    addPlayer(trimmedName, phone.trim());
    setName('');
    setPhone('');
  };

  const contactImporter = useContactImporter({
  onPick: (name, phone) => addPlayer(name, phone),
  excludeNames: players.map(p => p.name), // ✅ filters out already-added
});


  const handleChipPress = (n: string) => {
    if (removeMode) {
      removeFromHistory(n);
    } else {
      addFromHistory(n);
    }
  };

  const startEdit = (id: string) => {
    const p = players.find(x => x.id === id);
    if (!p) return;
    setEditingId(id);
    setEditName(p.name ?? '');
    setEditPhone(p.phone ?? '');
    setEditOpen(true);
  };

  const closeEdit = () => {
    setEditOpen(false);
    setEditingId(null);
    setEditName('');
    setEditPhone('');
  };

  const saveEdit = () => {
    if (!editingId) return;
    const nextName = editName.trim();
    if (!nextName) return;
    updatePlayer(editingId, {
      name: nextName,
      phone: editPhone.trim(),
    });
    closeEdit();
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
          returnKeyType="next"
        />
        <TextInput
          value={phone}
          onChangeText={setPhone}
          placeholder="Phone (optional)"
          placeholderTextColor="#999"
          style={[styles.input, { flex: 1 }]}
          keyboardType="phone-pad"
          returnKeyType="done"
          onSubmitEditing={handleAdd}
        />
        <Pressable style={styles.btn} onPress={handleAdd}>
          <ThemedText>Add</ThemedText>
        </Pressable>
        <Pressable style={[styles.btn, styles.warn]} onPress={clearPlayers}>
          <ThemedText>Clear All</ThemedText>
        </Pressable>
      </View>

      {/* In game */}
      <ThemedText type="subtitle">In Game</ThemedText>
      <View style={{ gap: 8 }}>
        {players.map((p) => (
          <View key={p.id} style={styles.playerRowOneLine}>
            <ThemedText style={styles.playerNameInline} numberOfLines={1}>
              {p.name}
            </ThemedText>

            <View style={styles.rightInline}>
              <ThemedText style={styles.phoneInline} numberOfLines={1}>
                {p.phone?.trim() ? p.phone : 'No number'}
              </ThemedText>

              <Pressable
                style={[styles.btn, styles.neutral]}
                onPress={() => startEdit(p.id)}
              >
                <ThemedText>Edit</ThemedText>
              </Pressable>

              <Pressable
                style={[styles.btn, styles.danger]}
                onPress={() => removePlayer(p.id)}
              >
                <ThemedText>Remove</ThemedText>
              </Pressable>
            </View>
          </View>
        ))}

        {players.length === 0 && (
          <ThemedText style={{ opacity: 0.7 }}>
            No players yet. Add one above or pick from previously used.
          </ThemedText>
        )}
      </View>

      {/* Previously used */}
      <ThemedText type="subtitle">Previously used</ThemedText>
      <View style={styles.chipsGrid}>
        {previousSorted.length === 0 ? (
          <ThemedText style={{ opacity: 0.7 }}>No previous names yet.</ThemedText>
        ) : (
          previousSorted.map((n, i) => {
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
          })
        )}
      </View>

      {/* Remove toggle */}
      <Pressable
        style={[
          styles.btn,
          styles.removeToggle,
          removeMode ? styles.removeOn : styles.removeOff,
        ]}
        onPress={() => setRemoveMode(v => !v)}
      >
        <ThemedText>
          {removeMode ? 'Remove User: ON' : 'Remove User'}
        </ThemedText>
      </Pressable>

      <Pressable style={[styles.btn, styles.neutral]} onPress={contactImporter.openPicker}>
  <ThemedText>{contactImporter.loading ? 'Loading…' : 'Import Contacts'}</ThemedText>
</Pressable>

{!!contactImporter.error && (
  <ThemedText style={{ opacity: 0.8 }}>{contactImporter.error}</ThemedText>
)}

      {/* Edit Modal (TOP OF PAGE) */}
      <Modal
  visible={editOpen}
  transparent
  animationType="fade"
  onRequestClose={closeEdit}
>
  <View style={styles.modalBackdropOffset}>
    <View style={styles.modalCard}>
      <ThemedText type="subtitle">Edit Player</ThemedText>

      <ThemedText style={styles.modalLabel}>Name</ThemedText>
      <TextInput
        value={editName}
        onChangeText={setEditName}
        placeholder="Name"
        placeholderTextColor="#999"
        style={styles.modalInput}
        autoFocus
      />

      <ThemedText style={styles.modalLabel}>Phone</ThemedText>
      <TextInput
        value={editPhone}
        onChangeText={setEditPhone}
        placeholder="Phone (optional)"
        placeholderTextColor="#999"
        style={styles.modalInput}
        keyboardType="phone-pad"
      />

      <View style={styles.modalActions}>
        <Pressable style={[styles.btn, styles.neutral]} onPress={closeEdit}>
          <ThemedText>Cancel</ThemedText>
        </Pressable>
        <Pressable style={[styles.btn, styles.save]} onPress={saveEdit}>
          <ThemedText>Save</ThemedText>
        </Pressable>
      </View>
    </View>
  </View>
</Modal>
<Modal
  visible={contactImporter.open}
  transparent
  animationType="fade"
  onRequestClose={contactImporter.closePicker}
>
  <View style={styles.modalBackdropOffset}>
    <View style={styles.modalCard}>
      <ThemedText type="subtitle">Import from Contacts</ThemedText>

      {/* Limited access notice + actions */}
      {contactImporter.access === 'limited' && (
        <View style={{ gap: 8 }}>
          <ThemedText style={{ opacity: 0.85 }}>
            Contacts access is set to selected contacts only. Add more contacts or allow full access.
          </ThemedText>

          <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'flex-end' }}>
            <Pressable
              style={[styles.btn, styles.neutral]}
              onPress={contactImporter.selectMoreContacts}
            >
              <ThemedText>
                {contactImporter.loading ? 'Loading…' : 'Select more'}
              </ThemedText>
            </Pressable>

            <Pressable
              style={[styles.btn, styles.neutral]}
              onPress={contactImporter.openSettings}
            >
              <ThemedText>Open Settings</ThemedText>
            </Pressable>
          </View>
        </View>
      )}

      <TextInput
        value={contactImporter.query}
        onChangeText={contactImporter.setQuery}
        placeholder="Search name or number"
        placeholderTextColor="#999"
        style={styles.modalInput}
      />

      <View style={{ maxHeight: 360 }}>
        <FlatList<import('expo-contacts').Contact>
          data={contactImporter.filtered}
          keyboardShouldPersistTaps="handled"
          keyExtractor={(item, index) => {
            const name =
              (item.name ??
                `${item.firstName ?? ''} ${item.lastName ?? ''}`.trim()).trim() ||
              'Unnamed';
            const phone = item.phoneNumbers?.[0]?.number?.trim() ?? '';
            return `${name}__${phone}__${index}`;
          }}
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
                <ThemedText style={{ opacity: 0.8 }}>Add</ThemedText>
              </Pressable>
            );
          }}
          ListEmptyComponent={
            <ThemedText style={{ opacity: 0.7, paddingVertical: 10 }}>
              {contactImporter.loading ? 'Loading…' : 'No contacts found.'}
            </ThemedText>
          }
        />
      </View>

      <View style={styles.modalActions}>
        <Pressable
          style={[styles.btn, styles.neutral]}
          onPress={contactImporter.closePicker}
        >
          <ThemedText>Close</ThemedText>
        </Pressable>

        <Pressable
          style={[styles.btn, styles.neutral]}
          onPress={contactImporter.openPicker}
        >
          <ThemedText>{contactImporter.loading ? 'Loading…' : 'Open again'}</ThemedText>
        </Pressable>

        <Pressable
          style={[styles.btn, styles.neutral]}
          onPress={contactImporter.refresh}
        >
          <ThemedText>{contactImporter.loading ? 'Loading…' : 'Refresh'}</ThemedText>
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

  modalBackdropOffset: {
  flex: 1,
  justifyContent: 'flex-start',
  paddingTop: '35%',          // 👈 pushes modal ~20% down screen
  paddingHorizontal: 16,
  backgroundColor: 'rgba(0,0,0,0.55)',
},


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
  save: { backgroundColor: 'rgba(0,158,90,0.22)' },
  neutral: { backgroundColor: 'rgba(255,255,255,0.08)' },

  removeToggle: { alignSelf: 'center' },
  removeOn: {
    backgroundColor: 'rgba(158,0,0,0.25)',
    borderColor: 'rgba(255,0,0,0.35)',
  },
  removeOff: { backgroundColor: 'rgba(255,255,255,0.08)' },

  playerRowOneLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  playerNameInline: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },

  rightInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  phoneInline: {
    maxWidth: 140,
    opacity: 0.85,
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

  // 🔽 TOP-ALIGNED MODAL
  modalBackdropTop: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 24,
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

  modalLabel: { opacity: 0.8 },

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
