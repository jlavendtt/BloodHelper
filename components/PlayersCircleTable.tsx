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
  order: Player[];
  selectedIdx: number | null;
  highlighted: Set<string>;
};

type Props = {
  players: Player[];
  onCenterPressHighlight?: () => void;
  mode?: 'table' | 'highlight';
  focusPlayerId?: string;
  onPlayerPress?: (ctx: PlayerPressCtx) => boolean | void;
  selectedRole?: RoleName;
  onAssignRole?: (playerId: string) => void;
  initialHighlightedIds?: string[];
  onHighlightsChange?: (ids: string[]) => void;
  radius?: number;
  style?: ViewStyle;
  showRing?: boolean;
  onOrderChange?: (nextPlayers: Player[]) => void;

  // ✅ NEW: death overlay / skull display
  deadPlayerIds?: string[];
};

export default function PlayersCircleTable({
  players,
  mode = 'table',
  focusPlayerId,
  onPlayerPress,
  selectedRole,
  onAssignRole,
  initialHighlightedIds = [],
  onHighlightsChange,
  radius,
  style,
  showRing = true,
  onOrderChange,
  onCenterPressHighlight,
  deadPlayerIds = [],
}: Props) {
  const [container, setContainer] = useState({ width: 0, height: 0 });
  const [showConfirm, setShowConfirm] = useState(false);

  const deadSet = useMemo(() => new Set(deadPlayerIds), [deadPlayerIds]);
  const isDead = (id: string) => deadSet.has(id);

  const [order, setOrder] = useState<Player[]>(players);
  useEffect(() => {
    const curIds = order.map((p) => p.id).join('|');
    const nextIds = players.map((p) => p.id).join('|');
    if (curIds !== nextIds) setOrder(players);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [players]);

  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [lastTapAt, setLastTapAt] = useState(0);
  const [lastTapId, setLastTapId] = useState<string | null>(null);
  const DOUBLE_TAP_MS = 300;

  const assigned = useRoleStore((s) => s.assigned);
  const resetAssignments = useRoleStore((s) => s.resetAssignments);
  const assignRole = useRoleStore((s) => s.assignRole);
  const unassignRole = useRoleStore((s) => s.unassignRole);

  const rolePicMap = useMemo(() => {
    const m = new Map<RoleName, any>();
    rolesList.forEach((r) => m.set(r.title, r.picture));
    return m;
  }, []);

  const [highlighted, setHighlighted] = useState<Set<string>>(
    () => new Set(initialHighlightedIds)
  );

  useEffect(() => {
    // keep highlighted set synced when initialHighlightedIds changes (ex: role changed)
    setHighlighted(new Set(initialHighlightedIds));
  }, [initialHighlightedIds]);

  const emitHighlights = (set: Set<string>) => {
    onHighlightsChange?.(order.map((p) => p.id).filter((id) => set.has(id)));
  };

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setContainer({ width, height });
  };

  /* ---------- rotation ---------- */

  const n = order.length;
  const angleStep = n ? (2 * Math.PI) / n : 0;
  const bottomSlotIndex = n ? Math.floor(n / 2) : 0;

  const rotateBy = useMemo(() => {
    if (!focusPlayerId || !n) return 0;
    const focusIndex = order.findIndex((p) => p.id === focusPlayerId);
    if (focusIndex < 0) return 0;
    return (bottomSlotIndex - focusIndex + n) % n;
  }, [focusPlayerId, order, n, bottomSlotIndex]);

  const r = useMemo(() => {
    if (radius) return radius;
    const minSide = Math.min(container.width, container.height);
    return Math.max(80, Math.floor(minSide / 2) - 30);
  }, [radius, container]);

  const centerX = container.width / 2;
  const centerY = container.height / 2;

  /* ---------- interactions ---------- */

  const toggleHighlight = (playerId: string) => {
    const next = new Set(highlighted);
    next.has(playerId) ? next.delete(playerId) : next.add(playerId);
    setHighlighted(next);
    emitHighlights(next);
  };

  const handlePressPlayer = (idx: number) => {
    const player = order[idx];

    const stop = onPlayerPress?.({
      player,
      index: idx,
      mode,
      selectedRole,
      order,
      selectedIdx,
      highlighted,
    });
    if (stop === true) return;

    if (mode === 'highlight') {
      toggleHighlight(player.id);
      return;
    }

    const now = Date.now();

    if (lastTapId === player.id && now - lastTapAt < DOUBLE_TAP_MS) {
      unassignRole ? unassignRole(player.id) : assignRole(player.id, undefined as any);
      setLastTapId(null);
      setSelectedIdx(null);
      return;
    }

    setLastTapAt(now);
    setLastTapId(player.id);

    if (selectedRole) {
      onAssignRole?.(player.id);
      setSelectedIdx(null);
      return;
    }

    if (selectedIdx === null) {
      setSelectedIdx(idx);
      return;
    }

    if (selectedIdx === idx) {
      setSelectedIdx(null);
      return;
    }

    const next = order.slice();
    [next[selectedIdx], next[idx]] = [next[idx], next[selectedIdx]];
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
            { width: r * 2, height: r * 2, left: centerX - r, top: centerY - r },
          ]}
        />
      )}

      {order.map((_, slotIndex) => {
        const rotatedIndex = n ? (slotIndex - rotateBy + n) % n : slotIndex;
        const p = order[rotatedIndex];

        const angle = slotIndex * angleStep - Math.PI / 2;
        const x = r * Math.cos(angle);
        const y = r * Math.sin(angle);

        const roleName =
          mode === 'table' ? (assigned[p.id] as RoleName | undefined) : undefined;
        const rolePic = roleName ? rolePicMap.get(roleName) : undefined;

        const hasIcon = !!rolePic && mode === 'table';
        const isSwapSelected = mode === 'table' && selectedIdx === rotatedIndex;
        const isHighlighted = mode === 'highlight' && highlighted.has(p.id);
        const isFocus = p.id === focusPlayerId;

        const borderColor =
          isSwapSelected || isHighlighted ? 'rgba(255,0,0,0.9)' : 'rgba(255,255,255,0.15)';

        const baseDisplayName = isFocus ? 'You' : p.name;
        const displayName = isDead(p.id) ? `${baseDisplayName} 💀` : baseDisplayName;

        return (
          <Pressable
            key={p.id}
            onPress={() => handlePressPlayer(rotatedIndex)}
            style={[
              styles.item,
              {
                left: centerX + x - ITEM_W / 2,
                top: centerY + y - ITEM_H / 2,
                borderColor,
                justifyContent: hasIcon ? 'flex-start' : 'center',
              },
            ]}
          >
            <Text
              style={[
                styles.name,
                !hasIcon && styles.nameCentered,
                isFocus && styles.nameFocus,
              ]}
              numberOfLines={1}
            >
              {displayName}
            </Text>

            {hasIcon && (
              <View style={styles.iconWrap}>
                <Image source={rolePic} style={styles.icon} contentFit="cover" />

                {/* ✅ NEW: if dead, show a red X over the role icon */}
                {isDead(p.id) ? (
                  <View pointerEvents="none" style={styles.deadXWrap}>
                    <View style={[styles.deadXLine, { transform: [{ rotate: '45deg' }] }]} />
                    <View style={[styles.deadXLine, { transform: [{ rotate: '-45deg' }] }]} />
                  </View>
                ) : null}
              </View>
            )}
          </Pressable>
        );
      })}

      <Pressable
        onPress={() => {
          if (mode === 'highlight') {
            onCenterPressHighlight?.();
            return;
          }
          setShowConfirm(true);
        }}
        style={[
          styles.centerBtn,
          { left: centerX - CENTER_BTN / 2, top: centerY - CENTER_BTN / 2 },
        ]}
      >
        <Image source={require('@/assets/meta/undo.png')} style={styles.centerImg} />
      </Pressable>

      <Modal visible={showConfirm} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Reset all roles?</Text>
            <Text style={styles.modalBody}>This will unassign every player's role.</Text>

            <View style={styles.modalActions}>
              <Pressable style={styles.mBtn} onPress={() => setShowConfirm(false)}>
                <Text style={styles.mText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.mBtn, styles.mAccept]}
                onPress={() => {
                  setShowConfirm(false);
                  resetAssignments();
                }}
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

const ITEM_W = 80;
const ITEM_H = 44;
const CENTER_BTN = 56;

const styles = StyleSheet.create({
  container: { width: '100%', height: 600, top: -100, position: 'relative' },
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  name: { color: '#fff', fontSize: 14, flex: 1, textAlignVertical: 'center' },
  nameCentered: { textAlign: 'center' },
  nameFocus: { color: 'rgba(0,255,0,0.95)', fontWeight: '700' },

  iconWrap: { width: 24, height: 24, borderRadius: 6 },
  icon: { width: 24, height: 24, borderRadius: 6 },

  // ✅ red X overlay (same vibe as HighlighterTab)
  deadXWrap: {
    position: 'absolute',
    left: -4,
    top: -4,
    right: -4,
    bottom: -4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deadXLine: {
    position: 'absolute',
    width: 30,
    height: 3,
    borderRadius: 999,
    backgroundColor: 'rgba(255,0,0,0.85)',
  },

  centerBtn: {
    position: 'absolute',
    width: CENTER_BTN,
    height: CENTER_BTN,
    borderRadius: CENTER_BTN / 2,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerImg: { width: 28, height: 28 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: { width: '90%', borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.85)', padding: 16 },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: '600' },
  modalBody: { color: 'rgba(255,255,255,0.85)', marginVertical: 12 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  mBtn: { padding: 10 },
  mAccept: { backgroundColor: 'rgba(158,0,0,0.35)' },
  mText: { color: '#fff' },
  mTextStrong: { fontWeight: '700' },
});
