// components/PlayersCircleTable.tsx
import { Image } from 'expo-image';
import React, { useMemo, useState } from 'react';
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

type Props = {
  players: Player[];
  onPressPlayer: (playerId: string) => void;
  radius?: number;
  style?: ViewStyle;
  showRing?: boolean;
};

export default function PlayersCircleTable({
  players,
  onPressPlayer,
  radius,
  style,
  showRing = true,
}: Props) {
  const [container, setContainer] = useState({ width: 0, height: 0 });
  const [showConfirm, setShowConfirm] = useState(false);

  const assigned = useRoleStore((s) => s.assigned);
  const resetAssignments = useRoleStore((s) => s.resetAssignments);

  const rolePicMap = useMemo(() => {
    const m = new Map<RoleName, any>();
    rolesList.forEach((r) => m.set(r.title, r.picture));
    return m;
  }, []);

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width !== container.width || height !== container.height) {
      setContainer({ width, height });
    }
  };

  const angleStep = players.length > 0 ? (2 * Math.PI) / players.length : 0;

  const r = useMemo(() => {
    if (radius) return radius;
    const minSide = Math.min(container.width, container.height);
    return Math.max(60, Math.floor(minSide / 2) - 50);
  }, [radius, container]);

  const centerX = container.width / 2;
  const centerY = container.height / 2;

  const handleConfirmReset = () => {
    setShowConfirm(false);
    resetAssignments(); // unassign all roles
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
      {players.map((p, index) => {
        const angle = index * angleStep - Math.PI / 2; // start at top
        const x = r * Math.cos(angle);
        const y = r * Math.sin(angle);

        const roleName = assigned[p.id] as RoleName | undefined;
        const rolePic = roleName ? rolePicMap.get(roleName) : undefined;

        return (
          <Pressable
            key={p.id}
            onPress={() => onPressPlayer(p.id)}
            style={({ pressed }) => [
              styles.item,
              {
                left: centerX + x - ITEM_W / 2,
                top: centerY + y - ITEM_H / 2,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <Text style={styles.name} numberOfLines={1}>
              {p.name}
            </Text>
            {rolePic ? (
              <Image source={rolePic} style={styles.icon} contentFit="cover" />
            ) : (
              <View style={styles.placeholder} />
            )}
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
        accessibilityLabel="Reset all roles"
      >
        <Image source={require('@/assets/meta/undo.png')} style={styles.centerImg} />
      </Pressable>

      {/* Confirm reset modal */}
      <Modal
        visible={showConfirm}
        animationType="fade"
        transparent
        onRequestClose={() => setShowConfirm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Reset all roles?</Text>
            <Text style={styles.modalBody}>
              This will unassign every player's role. You can’t undo this action.
            </Text>

            <View style={styles.modalActions}>
              <Pressable style={[styles.mBtn, styles.mCancel]} onPress={() => setShowConfirm(false)}>
                <Text style={styles.mText}>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.mBtn, styles.mAccept]} onPress={handleConfirmReset}>
                <Text style={[styles.mText, styles.mTextStrong]}>Accept</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const ITEM_W = 132;
const ITEM_H = 44;
const CENTER_BTN = 56;

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
    height: 320,
    justifyContent: 'center',
    alignItems: 'center',
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
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(0,0,0,0.25)',
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  name: {
    color: '#fff',
    fontSize: 14,
    flex: 1,
    paddingRight: 8,
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

  // Center undo button
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
    width: 26,
    height: 26,
    tintColor: '#fff',
  },

  // Modal styles
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
  mCancel: {
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  mAccept: {
    backgroundColor: 'rgba(158,0,0,0.35)',
    borderColor: 'rgba(255,0,0,0.5)',
  },
  mText: { color: '#fff', fontSize: 14 },
  mTextStrong: { fontWeight: '700' },
});
