
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: {
          backgroundColor: '#1a0000',
        },
        tabBarActiveTintColor: '#ff6666',
        tabBarInactiveTintColor: '#aaaaaa',
        tabBarStyle: {
          backgroundColor: '#1a0000',
          borderTopColor: '#400000',
          borderTopWidth: 1,
          height: 85,
          paddingBottom: 25,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />

      <Tabs.Screen
        name="assign"
        options={{
          title: 'Assign',
        }}
      />

      <Tabs.Screen
        name="players"
        options={{
          title: 'Players',
        }}
      />

      <Tabs.Screen
        name="HighLighterTab"
        options={{
          title: 'Highlighter',
        }}
      />

      <Tabs.Screen
        name="table"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
