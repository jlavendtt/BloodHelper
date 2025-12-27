// app/(tabs)/HighlighterTab.tsx
import FortuneTellerCheckModal from '@/components/modals/FortuneTellerCheckModal';
import NumberSelectModal from '@/components/modals/NumberSelectModal';
import PairAndRoleModal from '@/components/modals/PairAndRoleModal';
import RavenkeeperModal from '@/components/modals/RavenkeeperModal';
import UndertakerModal from '@/components/modals/UndertakerModal';
import PlayersCircleTable from '@/components/PlayersCircleTable';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { RoleName } from '@/models/role';
import { rolesList } from '@/models/rolesList';
import { usePlayersStore } from '@/stores/playerStore';
import { useRoleStore } from '@/stores/roleStore';
import { Image } from 'expo-image';
import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';




type Mode = 'first' | 'other';

const FIRST_NIGHT_ROLES: RoleName[] = [
  RoleName.Poisoner,
  RoleName.Spy,
  RoleName.Washerwoman,
  RoleName.Librarian,
  RoleName.Investigator,
  RoleName.Chef,
  RoleName.Empath,
  RoleName.FortuneTeller,
  RoleName.Butler,
];

const OTHER_NIGHTS_ROLES: RoleName[] = [
  RoleName.Poisoner,
  RoleName.Monk,
  RoleName.Spy,
  RoleName.Imp,
  RoleName.Ravenkeeper,
  RoleName.Undertaker,
  RoleName.Empath,
  RoleName.FortuneTeller,
  RoleName.Butler,
];

const RAVEN_MODAL_ROLES: RoleName[] = [RoleName.Ravenkeeper];
const FT_MODAL_ROLES: RoleName[] = [RoleName.FortuneTeller];
const UNDERTAKER_MODAL_ROLES: RoleName[] = [RoleName.Undertaker];




const LOCKED_NAV_HEIGHT = 150;

export default function HighlighterTab() {
  const [pairModalOpen, setPairModalOpen] = useState(false);

type PairState = {
  player1Id: string | null;
  player2Id: string | null;
  highlightedRole: RoleName | null;
};

const [pairStateByRole, setPairStateByRole] = useState<Record<string, PairState>>({});
const [ravenOpen, setRavenOpen] = useState(false);
const [ftOpen, setFtOpen] = useState(false);
const [undertakerOpen, setUndertakerOpen] = useState(false);
type RevealState = { selectedPlayerId: string | null; highlightedRole: RoleName | null };
const [ravenByRole, setRavenByRole] = useState<Record<string, RevealState>>({});
const [undertakerByRole, setUndertakerByRole] = useState<Record<string, RevealState>>({});

// Fortune Teller result per role
const [ftResultByRole, setFtResultByRole] = useState<Record<string, boolean | null>>({});


  const [numberModalOpen, setNumberModalOpen] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState<0 | 1 | 2 | null>(null);
  const { players } = usePlayersStore();
  const assigned = useRoleStore((s) => s.assigned) as Record<string, RoleName | undefined>;
  const [hiOpen, setHiOpen] = useState(false);
  const [mode, setMode] = useState<Mode>('first');
  const [selectedRole, setSelectedRole] = useState<RoleName | null>(null);
  const [locked, setLocked] = useState(false);
  const NUMBER_MODAL_ROLES: RoleName[] = [
  RoleName.Chef,
  RoleName.Empath,
];


const PAIR_MODAL_ROLES: RoleName[] = [
  RoleName.Librarian,
  RoleName.Investigator,
  RoleName.Washerwoman,
];



  const currentPairState: PairState = selectedRole
  ? (pairStateByRole[selectedRole] ?? { player1Id: null, player2Id: null, highlightedRole: null })
  : { player1Id: null, player2Id: null, highlightedRole: null };

  const updatePairStateForCurrentRole = (patch: Partial<PairState>) => {
  if (!selectedRole) return;

  setPairStateByRole((prev) => ({
    ...prev,
    [selectedRole]: {
      ...prev[selectedRole],
      ...patch,
    },
  }));
};

const defaultReveal: RevealState = { selectedPlayerId: null, highlightedRole: null };

const ravenState = selectedRole ? (ravenByRole[selectedRole] ?? defaultReveal) : defaultReveal;
const undertakerState = selectedRole ? (undertakerByRole[selectedRole] ?? defaultReveal) : defaultReveal;
const ftResult = selectedRole ? (ftResultByRole[selectedRole] ?? null) : null;

const updateRaven = (patch: Partial<RevealState>) => {
  if (!selectedRole) return;
  setRavenByRole((prev) => ({
    ...prev,
    [selectedRole]: { ...(prev[selectedRole] ?? defaultReveal), ...patch },
  }));
};

const updateUndertaker = (patch: Partial<RevealState>) => {
  if (!selectedRole) return;
  setUndertakerByRole((prev) => ({
    ...prev,
    [selectedRole]: { ...(prev[selectedRole] ?? defaultReveal), ...patch },
  }));
};

const updateFT = (v: boolean) => {
  if (!selectedRole) return;
  setFtResultByRole((prev) => ({ ...prev, [selectedRole]: v }));
};




  

  // ✅ per-role highlights memory
  const [highlightsByRole, setHighlightsByRole] = useState<Record<string, string[]>>({});

  const roleOrder = useMemo(
    () => (mode === 'first' ? FIRST_NIGHT_ROLES : OTHER_NIGHTS_ROLES),
    [mode]
  );

  const roleByName = useMemo(() => {
    const map = new Map<RoleName, (typeof rolesList)[number]>();
    for (const r of rolesList) map.set(r.title, r);
    return map;
  }, []);

  // ✅ role -> playerId, but only if player still exists
  const playerIdForRole = useMemo(() => {
    const existingPlayerIds = new Set(players.map((p) => p.id));

    const map = new Map<RoleName, string>();
    for (const [playerId, role] of Object.entries(assigned ?? {})) {
      if (!role) continue;
      if (!existingPlayerIds.has(playerId)) continue; // ✅ player removed -> ignore assignment
      map.set(role, playerId);
    }
    return map;
  }, [assigned, players]);

  const rolesInThisMode = useMemo(
    () =>
      roleOrder
        .map((r) => roleByName.get(r))
        .filter(Boolean) as (typeof rolesList)[number][],
    [roleOrder, roleByName]
  );

  // Only roles that actually have a player assigned (navigable when locked)
  const navigableRoles = useMemo(() => {
    return rolesInThisMode
      .map((r) => r.title)
      .filter((title) => Boolean(playerIdForRole.get(title)));
  }, [rolesInThisMode, playerIdForRole]);

  const firstNavigableRole = useMemo(() => navigableRoles[0] ?? null, [navigableRoles]);

  // default selection on mode change
  useEffect(() => {
    setSelectedRole(firstNavigableRole);
  }, [mode, firstNavigableRole]);

  // if selected role becomes unassigned, jump to first available
  useEffect(() => {
    if (selectedRole && !playerIdForRole.get(selectedRole)) {
      setSelectedRole(firstNavigableRole);
    }
  }, [selectedRole, playerIdForRole, firstNavigableRole]);

  const selectedIndex = useMemo(() => {
    if (!selectedRole) return -1;
    return navigableRoles.indexOf(selectedRole);
  }, [selectedRole, navigableRoles]);

  const hasPrev = selectedIndex > 0;
  const hasNext = selectedIndex >= 0 && selectedIndex < navigableRoles.length - 1;

  const goPrev = () => {
    if (!hasPrev) return;
    setSelectedRole(navigableRoles[selectedIndex - 1] ?? null);
  };

  const goNext = () => {
    if (!hasNext) return;
    setSelectedRole(navigableRoles[selectedIndex + 1] ?? null);
  };

  const selectedRoleObj = selectedRole ? roleByName.get(selectedRole) : undefined;
  const focusPlayerId = selectedRole ? playerIdForRole.get(selectedRole) : undefined;

  const focusedPlayer = useMemo(() => {
    if (!focusPlayerId) return undefined;
    return players.find((p) => p.id === focusPlayerId);
  }, [players, focusPlayerId]);

  const playerName = focusedPlayer?.name ?? 'No player';
  const promptText = selectedRoleObj?.prompt?.trim() ? selectedRoleObj.prompt.trim() : 'No prompt.';

  // ✅ role-specific highlights to feed into the table
  const currentHighlights = selectedRole ? (highlightsByRole[selectedRole] ?? []) : [];

  const onHighlightsChangeForCurrentRole = (ids: string[]) => {
    if (!selectedRole) return;
    setHighlightsByRole((prev) => ({
      ...prev,
      [selectedRole]: ids,
    }));
  };

  // split icons into 2 rows (only used when not locked)
  const mid = Math.ceil(rolesInThisMode.length / 2);
  const row1 = rolesInThisMode.slice(0, mid);
  const row2 = rolesInThisMode.slice(mid);

  const renderRow = (row: typeof rolesInThisMode) => (
    <View style={styles.roleRow}>
      {row.map((r) => {
        const isSelected = r.title === selectedRole;
        const hasPlayer = Boolean(playerIdForRole.get(r.title));

        return (
          <Pressable
            key={String(r.title)}
            disabled={!hasPlayer}
            onPress={() => hasPlayer && setSelectedRole(r.title)}
            style={[
              styles.roleChip,
              isSelected && styles.roleChipOn,
              !hasPlayer && styles.roleChipDisabled,
            ]}
          >
            <Image source={r.picture} style={styles.roleIcon} contentFit="contain" />
          </Pressable>
        );
      })}
    </View>
  );

  return (
    <ThemedView style={styles.screen}>
      {/* Top */}
      <View style={styles.top}>
        {!locked ? (
          <>
            <ThemedText type="subtitle">
              {mode === 'first' ? 'First Night Roles' : 'Other Nights Roles'}
            </ThemedText>

            {renderRow(row1)}
            {row2.length > 0 && renderRow(row2)}
          </>
        ) : (
          <View style={[styles.lockedNav, { height: LOCKED_NAV_HEIGHT }]}>
            <Pressable
              onPress={goPrev}
              disabled={!hasPrev}
              style={[styles.arrowBtn, !hasPrev && styles.arrowBtnDisabled]}
            >
              <ThemedText style={styles.arrowText}>‹</ThemedText>
            </Pressable>

            <Pressable
              onPress={goNext}
              disabled={!hasNext}
              style={[styles.arrowBtn, !hasNext && styles.arrowBtnDisabled]}
            >
              <ThemedText style={styles.arrowText}>›</ThemedText>
            </Pressable>
          </View>
        )}

        {/* Prompt line */}
        <View style={styles.promptLine}>
          <ThemedText
            type="defaultSemiBold"
            numberOfLines={1}
            ellipsizeMode="tail"
            style={styles.playerName}
          >
            {playerName}:
          </ThemedText>

          {selectedRoleObj?.picture ? (
            <Image
              source={selectedRoleObj.picture}
              style={styles.promptRoleIcon}
              contentFit="contain"
            />
          ) : null}

          <ThemedText numberOfLines={1} ellipsizeMode="tail" style={styles.promptText}>
            {selectedRoleObj ? promptText : ''}
          </ThemedText>
        </View>
      </View>

      {/* Middle */}
      <View style={styles.middle}>
        <PlayersCircleTable
  players={players}
  mode="highlight"
  radius={150}
  focusPlayerId={focusPlayerId}
  key={selectedRole ?? 'no-role'}
  initialHighlightedIds={currentHighlights}
  onHighlightsChange={onHighlightsChangeForCurrentRole}
  onCenterPressHighlight={() => {
  if (!selectedRole) return;

  if (PAIR_MODAL_ROLES.includes(selectedRole)) {
    setPairModalOpen(true);
    return;
  }

  if (NUMBER_MODAL_ROLES.includes(selectedRole)) {
    setNumberModalOpen(true);
    return;
  }

  if (RAVEN_MODAL_ROLES.includes(selectedRole)) {
    setRavenOpen(true);
    return;
  }

  if (FT_MODAL_ROLES.includes(selectedRole)) {
    setFtOpen(true);
    return;
  }

  if (UNDERTAKER_MODAL_ROLES.includes(selectedRole)) {
    setUndertakerOpen(true);
    return;
  }

  setHiOpen(true);
}}



/>

      </View>

      {/* Bottom */}
      <View style={styles.bottom}>
        <View style={styles.bottomBar}>
          <Pressable
            onPress={() => setMode('first')}
            style={[styles.switchBtn, mode === 'first' && styles.switchOn]}
          >
            <ThemedText>First Night</ThemedText>
          </Pressable>

          <Pressable
            onPress={() => setMode('other')}
            style={[styles.switchBtn, mode === 'other' && styles.switchOn]}
          >
            <ThemedText>Other Nights</ThemedText>
          </Pressable>
        </View>

        <Pressable
          onPress={() => setLocked((v) => !v)}
          style={styles.lockRow}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: locked }}
          accessibilityLabel="Lock"
        >
          <View style={[styles.checkbox, locked && styles.checkboxOn]}>
            {locked ? <ThemedText style={styles.checkmark}>✓</ThemedText> : null}
          </View>
          <ThemedText style={{ opacity: 0.9 }}>Lock</ThemedText>
        </Pressable>
      </View>
      <Modal visible={hiOpen} transparent animationType="fade">
  <View style={styles.hiOverlay}>
    <View style={styles.hiCard}>
      <Text style={styles.hiText}>Hi</Text>

      <Pressable style={styles.hiCloseBtn} onPress={() => setHiOpen(false)}>
        <Text style={styles.hiCloseText}>Close</Text>
      </Pressable>
    </View>
  </View>
</Modal>
<NumberSelectModal
  visible={numberModalOpen}
  value={selectedNumber}
  onChange={(v) => setSelectedNumber(v)}
  onClose={() => setNumberModalOpen(false)}
/>
<PairAndRoleModal
  visible={pairModalOpen}
  onClose={() => setPairModalOpen(false)}
  players={players}
  excludedPlayerId={focusPlayerId}
  player1Id={currentPairState.player1Id}
  player2Id={currentPairState.player2Id}
  highlightedRole={currentPairState.highlightedRole}
  onChangePlayer1={(id) => updatePairStateForCurrentRole({ player1Id: id })}
  onChangePlayer2={(id) => updatePairStateForCurrentRole({ player2Id: id })}
  onChangeHighlightedRole={(role) => updatePairStateForCurrentRole({ highlightedRole: role })}
/>
<RavenkeeperModal
  visible={ravenOpen}
  onClose={() => setRavenOpen(false)}
  players={players}
  excludedPlayerId={focusPlayerId}
  selectedPlayerId={ravenState.selectedPlayerId}
  highlightedRole={ravenState.highlightedRole}
  onChangePlayer={(id) => updateRaven({ selectedPlayerId: id })}
  onChangeHighlightedRole={(role) => updateRaven({ highlightedRole: role })}
/>

<FortuneTellerCheckModal
  visible={ftOpen}
  value={ftResult}
  onChange={(v) => updateFT(v)}
  onClose={() => setFtOpen(false)}
/>

<UndertakerModal
  visible={undertakerOpen}
  onClose={() => setUndertakerOpen(false)}
  players={players}
  excludedPlayerId={focusPlayerId}
  selectedPlayerId={undertakerState.selectedPlayerId}
  highlightedRole={undertakerState.highlightedRole}
  onChangePlayer={(id) => updateUndertaker({ selectedPlayerId: id })}
  onChangeHighlightedRole={(role) => updateUndertaker({ highlightedRole: role })}
/>




    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 12, gap: 12 },
  top: { gap: 8 },
  middle: { flex: 1, justifyContent: 'center' },
  bottom: { gap: 10 },

  roleRow: { flexDirection: 'row', justifyContent: 'center', gap: 10 },
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
    backgroundColor: 'rgba(158,0,0,0.25)',
    borderColor: 'rgba(255,0,0,0.5)',
  },
  roleChipDisabled: { opacity: 0.25 },
  roleIcon: { width: 38, height: 38 },

  lockedNav: { flexDirection: 'row', gap: 12 },
  arrowBtn: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowBtnDisabled: { opacity: 0.25 },
  arrowText: { fontSize: 44, lineHeight: 44, opacity: 0.95 },

  promptLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginBottom: 150,
  },
  playerName: { maxWidth: 140 },
  promptRoleIcon: { width: 18, height: 18, opacity: 0.95 },
  promptText: { flex: 1, opacity: 0.9 },

  bottomBar: { flexDirection: 'row', gap: 10 },
  switchBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  switchOn: {
    backgroundColor: 'rgba(158,0,0,0.25)',
    borderColor: 'rgba(255,0,0,0.5)',
  },

  lockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: {
    backgroundColor: 'rgba(158,0,0,0.25)',
    borderColor: 'rgba(255,0,0,0.5)',
  },
  checkmark: { fontSize: 12, lineHeight: 12 },

  hiOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.55)',
  justifyContent: 'center',
  alignItems: 'center',
},
hiCard: {
  width: '85%',
  borderRadius: 14,
  backgroundColor: 'rgba(0,0,0,0.85)',
  padding: 18,
  gap: 14,
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.12)',
},
hiText: {
  color: '#fff',
  fontSize: 20,
  fontWeight: '700',
  textAlign: 'center',
},
hiCloseBtn: {
  alignSelf: 'center',
  paddingVertical: 10,
  paddingHorizontal: 18,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.12)',
  backgroundColor: 'rgba(255,255,255,0.06)',
},
hiCloseText: {
  color: '#fff',
  fontWeight: '700',
},

});
