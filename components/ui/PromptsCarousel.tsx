import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';

type Props = {
  prompts: string[];
  initialIndex?: number;
  style?: ViewStyle;
  onIndexChange?: (index: number) => void;
};

export default function PromptsCarousel({
  prompts,
  initialIndex = 0,
  style,
  onIndexChange,
}: Props) {
  const [index, setIndex] = useState(initialIndex);
  const max = prompts.length - 1;

  const isFirst = index === 0;
  const isLast = index === max;
  const current = useMemo(() => prompts[index] ?? '', [prompts, index]);

  const goPrev = () => {
    if (isFirst) return;
    const next = index - 1;
    setIndex(next);
    onIndexChange?.(next);
  };
  const goNext = () => {
    if (isLast) return;
    const next = index + 1;
    setIndex(next);
    onIndexChange?.(next);
  };

  return (
    <View style={[styles.wrap, style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Previous prompt"
        onPress={goPrev}
        disabled={isFirst}
        style={[styles.navBtn, isFirst && styles.navBtnDisabled]}
      >
        <Text style={styles.navText}>‹</Text>
      </Pressable>

      <View style={styles.card}>
        <Text style={styles.promptText} numberOfLines={2}>
          {current}
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Next prompt"
        onPress={goNext}
        disabled={isLast}
        style={[styles.navBtn, isLast && styles.navBtnDisabled]}
      >
        <Text style={styles.navText}>›</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  navBtnDisabled: {
    opacity: 0.4,
  },
  navText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  card: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    justifyContent: 'center',
    minHeight: 48,
  },
  promptText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
