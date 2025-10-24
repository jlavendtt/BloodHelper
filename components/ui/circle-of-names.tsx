import React, { useEffect, useMemo, useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';

interface CircleOfNamesProps {
  names: string[];
  radius?: number;
  style?: ViewStyle;
  onChange?: (nextNames: string[]) => void;
}

export default function CircleOfNames({ names, radius, style, onChange }: CircleOfNamesProps) {
  const [container, setContainer] = useState({ width: 0, height: 0 });
  const [items, setItems] = useState<string[]>(names);
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    if (names.join('\u0001') !== items.join('\u0001')) {
      setItems(names);
      setSelected(null);
    }
  }, [names]);

  const angleStep = items.length > 0 ? (2 * Math.PI) / items.length : 0;
  const r = useMemo(() => {
    if (radius) return radius;
    const minSide = Math.min(container.width, container.height);
    return Math.max(60, Math.floor(minSide / 2) - 50);
  }, [radius, container]);

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width !== container.width || height !== container.height) {
      setContainer({ width, height });
    }
  };

  const handlePress = (index: number) => {
    if (selected === null) {
      setSelected(index);
      return;
    }
    if (selected === index) {
      setSelected(null);
      return;
    }
    const next = items.slice();
    const tmp = next[selected];
    next[selected] = next[index];
    next[index] = tmp;
    setItems(next);
    setSelected(null);
    onChange?.(next);
  };

  const centerX = container.width / 2;
  const centerY = container.height / 2;

  return (
    <View style={[styles.container, style]} onLayout={onLayout}>
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

      {items.map((name, index) => {
        const angle = index * angleStep - Math.PI / 2;
        const x = r * Math.cos(angle);
        const y = r * Math.sin(angle);

        const isSelected = selected === index;

        return (
          <Pressable
            key={`${name}-${index}`}
            onPress={() => handlePress(index)}
            style={({ pressed }) => [
              styles.nameContainer,
              {
                left: centerX + x - 46,
                top: centerY + y - 22,
                opacity: pressed ? 0.8 : 1,
                borderColor: isSelected ? 'rgba(255,0,0,0.9)' : 'rgba(255,255,255,0.3)',
                shadowOpacity: isSelected ? 0.55 : 0.25,
              },
            ]}
          >
            <Text style={styles.nameText} numberOfLines={1}>
              {name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ring: {
    position: 'absolute',
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  nameContainer: {
    position: 'absolute',
    width: 92,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 22,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  nameText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
});

