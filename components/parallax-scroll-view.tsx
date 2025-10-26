import React from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // make sure you have this installed

type Props = {
  children: React.ReactNode;
};

export default function ParallaxScrollView({ children }: Props) {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16 }}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
