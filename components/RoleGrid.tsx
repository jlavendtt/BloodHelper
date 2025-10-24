
// components/RoleGrid.tsx — shows all roles at once, selectable, indicates who has each role
import { ThemedText } from '@/components/themed-text';
import { RoleName } from '@/models/role';
import { rolesList } from '@/models/rolesList';
import { useRoleStore } from '@/stores/roleStore';
import { Image } from 'expo-image';
import React from 'react';
import { FlatList, Pressable, StyleSheet } from 'react-native';

interface RoleGridProps {
  selectedRole?: RoleName;
  onSelect: (role?: RoleName) => void;
}

export default function RoleGrid({ selectedRole, onSelect }: RoleGridProps) {
  const assigned = useRoleStore(s => s.assigned);

  const renderItem = ({ item }: any) => {
    const roleName: RoleName = item.title;
    // Find if someone already has this role
    const holder = Object.entries(assigned).find(([, rn]) => rn === roleName)?.[0];
    const isSelected = selectedRole === roleName;

    return (
      <Pressable
        onPress={() => onSelect(isSelected ? undefined : roleName)}
        style={({ pressed }) => [
          styles.card,
          holder && styles.cardTaken,
          isSelected && styles.cardSelected,
          pressed && { opacity: 0.9 },
        ]}
      >
        <Image source={item.picture} style={styles.avatar} contentFit="cover" />
        <ThemedText type="defaultSemiBold" style={styles.roleTitle}>{roleName}</ThemedText>
        {holder && (
          <ThemedText style={styles.takenBadge}>Assigned</ThemedText>
        )}
      </Pressable>
    );
  };

  return (
    <FlatList
      data={rolesList}
      keyExtractor={(r) => String(r.title)}
      renderItem={renderItem}
      numColumns={3}
      columnWrapperStyle={{ gap: 10 }}
      contentContainerStyle={{ gap: 10 }}
      scrollEnabled={false}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 118,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  cardTaken: {
    opacity: 0.6,
  },
  cardSelected: {
    borderColor: 'rgba(255,0,0,0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  roleTitle: {
    textAlign: 'center',
  },
  takenBadge: {
    fontSize: 12,
    opacity: 0.7,
  }
});


