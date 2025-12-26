// components/PlayersCircleTable.tsx
import { Image } from 'expo-image';
import React, { useEffect, useMemo, useState } from 'react';
import {
  LayoutChangeEvent,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';

import { RoleName } from '@/models/role';
import { rolesList } from '@/models/rolesList';
import { useRoleStore } from '@/stores/roleStore';

export type Player = { id: string; name: string };

type PlayerPressCtx = {
  player: Player;
  index: number;
  mode: 'table' | 'highlight';
  selectedRole?: RoleName;

  // current order / selection (swap mode)
  order: Player[];
  selectedIdx: number | null;

  // highlight state (highlight mode)
  highlighted: Set<string>;
};

type Props = {
  players: Player[];

  /**
   * ✅ Best approach:
   * - keep ONE component
   * - default behavior is your existing "table" behavior
   * - if mode="highlight", it behaves like the highlighter
   */
  mode?: 'table' | 'highlight';

  /**
   * Optional override callback. If provided, it runs FIRST.
   * Return true to stop built-in behavior.
   */
  onPlayerPress?: (ctx: PlayerPressCtx) => boolean | void;

  // --- table behavior (assign) ---
  selectedRole?: RoleName;
  onAssignRole?: (playerId: string) => void; // called when selectedRole exists and user taps a player

  // --- highlight behavior ---
  initialHighlightedIds?: string[];
  onHighlightsChange?: (ids: string[]) => void;

  // --- layout / misc ---
  radius?: number;
  style?: ViewStyle;
  showRing?: boolean;
  onOrderChange?: (nextPlayers: Player[]) => void;
};

export default function PlayersCircleTable({
  players,
  mode = 'table',
  onPlayerPress,

  selectedRole,
  onAssignRole,

  initialHighlightedIds = [],
  onHighlightsChange,

  radius,
  style,
  showRing = true,
  onOrderChange,
}: Props) {
  const [container, setContainer] = useState({ width: 0, height: 0 });
  const [showConfirm, setShowConfirm] = useState(false);

  // maintain a local, swappable order of players
  const [order, setOrder] = useState<Player[]>(players);
  useEffect(() => {
    const curIds = order.map(p => p.id).join('|');
    const nextIds = players.map(p => p.id).join('|');
    if (curIds !== nextIds) setOrder(players);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [players]);

  // chosen for swap (table mode)
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  // double-tap detection (table mode)
  const [lastTapAt, setLastTapAt] = useState(0);
  const [lastTapId, setLastTapId] = useState<string | null>(null);
  const DOUBLE_TAP_MS = 300;

  // role store (table mode)
  const assigned = useRoleStore((s) => s.assigned);
  const resetAssignments = useRoleStore((s) => s.resetAssignments);
  const assignRole = useRoleStore((s) => s.assignRole);      // used to clear if unassignRole isn't present
  const unassignRole = useRoleStore((s) => s.unassignRole);  // if you have it

  // Role picture lookup
  const rolePicMap = useMemo(() => {
    const m = new Map<RoleName, any>();
    rolesList.forEach((r) => m.set(r.title, r.picture));
    return m;
  }, []);

  // highlight state
  const [highlighted, setHighlighted] = useState<Set<string>>(
    () => new Set(initialHighlightedIds),
  );

  useEffect(() => {
    setHighlighted(new Set(initialHighlightedIds));
  }, [initialHighlightedIds.join('|')]);

  const emitHighlights = (set: Set<string>) => {
    onHighlightsChange?.(order.map(p => p.id).filter(id => set.has(id)));
  };

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width !== container.width || height !== container.height) {
      setContainer({ width, height });
    }
  };

  const angleStep = order.length > 0 ? (2 * Math.PI) / order.length : 0;

  const r = useMemo(() => {
    if (radius) return radius;
    const minSide = Math.min(container.width, container.height);
    return Math.max(80, Math.floor(minSide / 2) - 30);
  }, [radius, container]);

  const centerX = container.width / 2;
  const centerY = container.height / 2;

  // center undo modal confirm
  const handleConfirmCenterAction = () => {
    setShowConfirm(false);

    if (mode === 'highlight') {
      const next = new Set<string>();
      setHighlighted(next);
      emitHighlights(next);
      return;
    }

    resetAssignments();
  };

  const toggleHighlight = (playerId: string) => {
    const next = new Set(highlighted);
    if (next.has(playerId)) next.delete(playerId);
    else next.add(playerId);
    setHighlighted(next);
    emitHighlights(next);
  };

  // main tap handler for each player chip
  const handlePressPlayer = (idx: number) => {
    const player = order[idx];
    console.log(selectedRole)


    // Optional override: if it returns true, skip built-in behavior
    const stop = onPlayerPress?.({
      player,
      index: idx,
      mode,
      selectedRole,
      order,
      selectedIdx,
      highlighted,
    });
    if (stop === true) {
      console.log('stop was true')
      return;
    }

    // HIGHLIGHT MODE: toggle
    if (mode === 'highlight') {
      toggleHighlight(player.id);
      return;
    }

    // TABLE MODE: your original behavior (double-tap clear, assign, swap)
    const now = Date.now();

    // 1) Double-tap on same player → clear role
    if (lastTapId === player.id && now - lastTapAt < DOUBLE_TAP_MS) {
      if (unassignRole) unassignRole(player.id);
      else assignRole(player.id, undefined as any);

      setLastTapId(null);
      setSelectedIdx(null);
      return;
    }
    setLastTapAt(now);
    setLastTapId(player.id);

    // 2) If a role is selected → assign immediately (no swap)
    if (selectedRole) {
      console.log('yes there was a selected role')
      onAssignRole?.(player.id);
      setSelectedIdx(null);
      return;
    }

    // 3) Otherwise → swap mode (tap one, then another)
    if (selectedIdx === null) {
      setSelectedIdx(idx);
      return;
    }
    if (selectedIdx === idx) {
      setSelectedIdx(null);
      return;
    }

    const next = order.slice();
    const tmp = next[selectedIdx];
    next[selectedIdx] = next[idx];
    next[idx] = tmp;
    setOrder(next);
    setSelectedIdx(null);
    onOrderChange?.(next);
  };

  return (
    <View style={[styles.container, style]} onLayout={onLayout}>
      {showRing && (
        <View
          pointerEvents="none"
          style={[
            styles.ring,
            {
              width: r * 2,
              height: r * 2,
              left: centerX - r,
              top: centerY - r,
            },
          ]}
        />
      )}

      {/* Players around the ring */}
      {order.map((p, index) => {
        const angle = index * angleStep - Math.PI / 2; // start at top
        const x = r * Math.cos(angle);
        const y = r * Math.sin(angle);

        const roleName = mode === 'table' ? (assigned[p.id] as RoleName | undefined) : undefined;
        const rolePic = roleName ? rolePicMap.get(roleName) : undefined;

        const isSwapSelected = mode === 'table' && selectedIdx === index;
        const isHighlighted = mode === 'highlight' && highlighted.has(p.id);

        return (
          <Pressable
            key={p.id}
            onPress={() => handlePressPlayer(index)}
            style={({ pressed }) => [
              styles.item,
              {
                left: centerX + x - ITEM_W / 2,
                top: centerY + y - ITEM_H / 2,
                opacity: pressed ? 0.85 : 1,

                borderColor: mode === 'highlight'
                  ? (isHighlighted ? 'rgba(255,0,0,0.9)' : 'rgba(255,255,255,0.15)')
                  : (isSwapSelected ? 'rgba(255,0,0,0.9)' : 'rgba(255,255,255,0.15)'),

                shadowOpacity: mode === 'highlight'
                  ? (isHighlighted ? 0.45 : 0.25)
                  : (isSwapSelected ? 0.45 : 0.25),

                backgroundColor: mode === 'highlight'
                  ? (isHighlighted ? 'rgba(158,0,0,0.25)' : 'rgba(0,0,0,0.25)')
                  : 'rgba(0,0,0,0.25)',
              },
            ]}
          >
            <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
              {p.name}
            </Text>

            {/* Icons only in table mode */}
            {mode === 'table' ? (
              rolePic ? (
                <Image source={rolePic} style={styles.icon} contentFit="cover" />
              ) : (
                <View style={styles.placeholder} />
              )
            ) : null}
          </Pressable>
        );
      })}

      {/* Center undo button */}
      <Pressable
        onPress={() => setShowConfirm(true)}
        style={[
          styles.centerBtn,
          {
            left: centerX - CENTER_BTN / 2,
            top: centerY - CENTER_BTN / 2,
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel={mode === 'highlight' ? 'Clear highlights' : 'Reset all roles'}
      >
        <Image
          source={require('@/assets/meta/undo.png')}
          style={styles.centerImg}
          contentFit="contain"
        />
      </Pressable>

      {/* Confirm modal */}
      <Modal
        visible={showConfirm}
        animationType="fade"
        transparent
        onRequestClose={() => setShowConfirm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {mode === 'highlight' ? 'Clear all highlights?' : 'Reset all roles?'}
            </Text>
            <Text style={styles.modalBody}>
              {mode === 'highlight'
                ? 'This will unhighlight every player.'
                : "This will unassign every player's role. You can’t undo this action."}
            </Text>

            <View style={styles.modalActions}>
              <Pressable
                style={[styles.mBtn, styles.mCancel]}
                onPress={() => setShowConfirm(false)}
              >
                <Text style={styles.mText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.mBtn, styles.mAccept]}
                onPress={handleConfirmCenterAction}
              >
                <Text style={[styles.mText, styles.mTextStrong]}>Accept</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// chip sizing
const ITEM_W = 80;
const ITEM_H = 44;
const CENTER_BTN = 56;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 600,
    top: -100,

    // RN doesn't support 'fixed' — use relative/absolute
    position: 'relative',
  },
  ring: {
    position: 'absolute',
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  item: {
    position: 'absolute',
    width: ITEM_W,
    height: ITEM_H,
    borderRadius: ITEM_H / 2,
    borderWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    paddingHorizontal: 0,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  name: {
    color: '#fff',
    fontSize: 14,
    flex: 1,
    paddingRight: 0,

    // helps avoid vertical clipping in pills
    lineHeight: 18,
    includeFontPadding: false,
    textAlignVertical: 'center',
    paddingVertical: 2,
  },
  icon: {
    width: 24,
    height: 24,
    borderRadius: 6,
  },
  placeholder: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  centerBtn: {
    position: 'absolute',
    width: CENTER_BTN,
    height: CENTER_BTN,
    borderRadius: CENTER_BTN / 2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  centerImg: {
    width: 28,
    height: 28,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(0,0,0,0.85)',
    padding: 16,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
  },
  modalBody: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    marginBottom: 14,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  mBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  mCancel: { backgroundColor: 'rgba(255,255,255,0.06)' },
  mAccept: {
    backgroundColor: 'rgba(158,0,0,0.35)',
    borderColor: 'rgba(255,0,0,0.5)',
  },
  mText: { color: '#fff', fontSize: 14 },
  mTextStrong: { fontWeight: '700' },
});
