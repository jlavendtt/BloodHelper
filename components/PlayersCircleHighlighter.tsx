// components/PlayersCircleHighlighter.tsx
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

export type Player = { id: string; name: string };

type Props = {
  players: Player[];
  initialHighlightedIds?: string[];
  onHighlightsChange?: (ids: string[]) => void;
  radius?: number;
  style?: ViewStyle;
  showRing?: boolean;
};

export default function PlayersCircleHighlighter({
  players,
  initialHighlightedIds = [],
  onHighlightsChange,
  radius,
  style,
  showRing = true,
}: Props) {
  const [container, setContainer] = useState({ width: 0, height: 0 });

  const [order, setOrder] = useState<Player[]>(players);
  useEffect(() => {
    const curIds = order.map(p => p.id).join('|');
    const nextIds = players.map(p => p.id).join('|');
    if (curIds !== nextIds) setOrder(players);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [players]);

  const [highlighted, setHighlighted] = useState<Set<string>>(
    () => new Set(initialHighlightedIds),
  );

  useEffect(() => {
    setHighlighted(new Set(initialHighlightedIds));
  }, [initialHighlightedIds.join('|')]);

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
    return Math.max(60, Math.floor(minSide / 2) - 50);
  }, [radius, container]);

  const centerX = container.width / 2;
  const centerY = container.height / 2;

  const toggleHighlight = (id: string) => {
    const next = new Set(highlighted);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setHighlighted(next);
    onHighlightsChange?.(
      order.map(p => p.id).filter(id0 => next.has(id0))
    );
  };

  const [showConfirm, setShowConfirm] = useState(false);
  const clearAll = () => {
    setShowConfirm(false);
    const next = new Set<string>();
    setHighlighted(next);
    onHighlightsChange?.([]);
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
        const angle = index * angleStep - Math.PI / 2;
        const x = r * Math.cos(angle);
        const y = r * Math.sin(angle);

        const isOn = highlighted.has(p.id);

        return (
          <Pressable
            key={p.id}
            onPress={() => toggleHighlight(p.id)}
            style={({ pressed }) => [
              styles.item,
              {
                left: centerX + x - ITEM_W / 2,
                top: centerY + y - ITEM_H / 2,
                opacity: pressed ? 0.85 : 1,
              },
              isOn ? styles.itemOn : styles.itemOff,
            ]}
          >
            <Text style={styles.name} numberOfLines={1}>
              {p.name}
            </Text>
          </Pressable>
        );
      })}

      {/* Center clear button */}
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
        accessibilityLabel="Clear all highlighted players"
      >
        <Image
          source={require('@/assets/meta/undo.png')}
          style={styles.centerImg}
          contentFit="contain"
        />
      </Pressable>

      {/* Confirm clear modal */}
      <Modal
        visible={showConfirm}
        animationType="fade"
        transparent
        onRequestClose={() => setShowConfirm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Clear all highlights?</Text>
            <Text style={styles.modalBody}>
              This will unhighlight every player.
            </Text>

            <View style={styles.modalActions}>
              <Pressable style={[styles.mBtn, styles.mCancel]} onPress={() => setShowConfirm(false)}>
                <Text style={styles.mText}>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.mBtn, styles.mAccept]} onPress={clearAll}>
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
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  itemOff: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderColor: 'rgba(255,255,255,0.15)',
  },
  itemOn: {
    backgroundColor: 'rgba(158,0,0,0.25)',
    borderColor: 'rgba(255,0,0,0.9)',
    shadowOpacity: 0.45,
  },
  name: {
    color: '#fff',
    fontSize: 14,
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
  mAccept: { backgroundColor: 'rgba(158,0,0,0.35)', borderColor: 'rgba(255,0,0,0.5)' },
  mText: { color: '#fff', fontSize: 14 },
  mTextStrong: { fontWeight: '700' },
});
