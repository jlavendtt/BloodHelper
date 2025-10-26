// components/RoleGrid.tsx
import { ThemedText } from '@/components/themed-text';
import { Affiliation, RoleName } from '@/models/role';
import { rolesList } from '@/models/rolesList';
import { useRoleStore } from '@/stores/roleStore';
import { Image } from 'expo-image';
import React from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

export type RoleGridProps = {
  selectedRole?: RoleName;
  onSelect: (role?: RoleName) => void;
  containerHeight?: number;
  affiliations?: Affiliation[]; // ⬅️ NEW: filter roles by affiliation(s)
};

export default function RoleGrid({
  selectedRole,
  onSelect,
  containerHeight = 240,
  affiliations,
}: RoleGridProps) {
  const assigned = useRoleStore((s) => s.assigned);

  const filtered = affiliations?.length
    ? rolesList.filter(r => affiliations.includes(r.affiliation))
    : rolesList;

  return (
    <ScrollView style={{ maxHeight: containerHeight }} contentContainerStyle={styles.grid}>
      {filtered.map((item) => {
        const roleName = item.title;
        const holder = Object.entries(assigned).find(([, rn]) => rn === roleName)?.[0];
        const isSelected = selectedRole === roleName;

        return (
          <Pressable
            key={String(roleName)}
            onPress={() => onSelect(isSelected ? undefined : roleName)}
            style={({ pressed }) => [
              styles.card,
              holder && styles.cardTaken,
              isSelected && styles.cardSelected,
              pressed && { opacity: 0.9 },
            ]}
          >
            <Image source={item.picture} style={styles.avatar} contentFit="cover" />
            <ThemedText type="defaultSemiBold" style={styles.roleTitle}>
              {roleName}
            </ThemedText>
            {holder && <ThemedText style={styles.takenBadge}>Assigned</ThemedText>}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  card: {
    width: '20%',            // ⬅️ 5 per row
    padding: 8,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  cardTaken: { opacity: 0.6 },
  cardSelected: {
    borderColor: 'rgba(255,0,0,0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  avatar: { width: 40, height: 40, borderRadius: 8, marginBottom: 6 },
  roleTitle: { textAlign: 'center', fontSize: 12 },
  takenBadge: { fontSize: 11, opacity: 0.7, marginTop: 2 },
});
