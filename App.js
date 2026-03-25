// Root navigator. Three bottom tabs: Dashboard, Pets, Logs.
// Safe area is handled via react-native-safe-area-context (bundled with Expo).

import { Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { SafeAreaView } from "react-native-safe-area-context";

import DashboardScreen from "./src/screens/DashboardScreen";
import PetsScreen from "./src/screens/PetsScreen";
import LogsScreen from "./src/screens/LogsScreen";
import { Colors, Radius } from "./src/theme";

const Tab = createBottomTabNavigator();

function TabIcon({ emoji, label, focused }) {
  return (
    <View style={{ alignItems: "center", gap: 2 }}>
      <View
        style={{
          backgroundColor: focused ? Colors.primary + "18" : "transparent",
          borderRadius: Radius.md,
          paddingHorizontal: 4,
          paddingVertical: 4,
        }}
      >
        <Text style={{ fontSize: 16 }}>{emoji}</Text>
      </View>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarShowLabel: true,
            tabBarActiveTintColor: Colors.tabActive,
            tabBarInactiveTintColor: Colors.tabInactive,
            tabBarStyle: {
              backgroundColor: Colors.tabBar,
              borderTopColor: Colors.border,
              borderTopWidth: 1,
              height: 62,
              paddingBottom: 10,
              paddingTop: 4,
            },
            tabBarLabelStyle: {
              fontSize: 11,
              fontWeight: "700",
            },
          }}
        >
          <Tab.Screen
            name="Dashboard"
            component={DashboardScreen}
            options={{
              tabBarLabel: "Dashboard",
              tabBarIcon: ({ focused }) => (
                <TabIcon emoji="🏠" label="Dashboard" focused={focused} />
              ),
            }}
          />
          <Tab.Screen
            name="Pets"
            component={PetsScreen}
            options={{
              tabBarLabel: "Pets",
              tabBarIcon: ({ focused }) => (
                <TabIcon emoji="🐾" label="Pets" focused={focused} />
              ),
            }}
          />
          <Tab.Screen
            name="Logs"
            component={LogsScreen}
            options={{
              tabBarLabel: "Logs",
              tabBarIcon: ({ focused }) => (
                <TabIcon emoji="📋" label="Logs" focused={focused} />
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
}
