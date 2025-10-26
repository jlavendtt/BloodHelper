// components/RoleGrid.tsx
import { Affiliation, RoleName } from '@/models/role';
import { rolesList } from '@/models/rolesList';
import { useRoleStore } from '@/stores/roleStore';
import { Image } from 'expo-image';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

export type RoleGridProps = {
  selectedRole?: RoleName;
  onSelect: (role?: RoleName) => void;
  affiliations?: Affiliation[];
};

export default function RoleGrid({ selectedRole, onSelect, affiliations }: RoleGridProps) {
  const assigned = useRoleStore((s) => s.assigned);

  const filtered = affiliations?.length
    ? rolesList.filter(r => affiliations.includes(r.affiliation))
    : rolesList;

  return (
    <View style={styles.grid}>
      {filtered.map((item) => {
        const roleName = item.title;
        const isSelected = selectedRole === roleName;

        return (
          <Pressable
            key={String(roleName)}
            onPress={() => onSelect(isSelected ? undefined : roleName)}
            style={({ pressed }) => [
              styles.card,
              isSelected && styles.cardSelected,
              pressed && { opacity: 0.9 },
            ]}
          >
            <Image source={item.picture} style={styles.avatar} contentFit="cover" />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    paddingHorizontal: 0,
     rowGap: 4,          // reduced vertical spacing
    columnGap: 4, 
    flexShrink: 0,
    height: 222,
  },
  card: {
    width: '18.5%',     // fits 5 icons per row with minimal spacing
    minHeight: 60,      // a bit tighter vertically
    paddingVertical: 2, // less padding inside
    paddingHorizontal: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardSelected: {
    borderColor: 'rgba(255,0,0,0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  avatar: {
    width: 40,                      // 👈 bigger PFP
    height: 40,
    borderRadius: 8,
  },
});
