// Root of the app. Sets up bottom-tab navigation between Pets and Logs.

import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text } from "react-native";

import PetsScreen from "./src/screens/PetsScreen";
import LogsScreen from "./src/screens/LogsScreen";

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false, // We draw our own headers per screen
          tabBarActiveTintColor: "#2563EB",
          tabBarInactiveTintColor: "#94A3B8",
          tabBarStyle: {
            backgroundColor: "#fff",
            borderTopColor: "#E2E8F0",
            borderTopWidth: 1,
            height: 60,
            paddingBottom: 8,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600",
          },
        }}
      >
        <Tab.Screen
          name="Pets"
          component={PetsScreen}
          options={{
            tabBarIcon: ({ color }) => (
              <Text style={{ fontSize: 22, color }}>🐾</Text>
            ),
            tabBarLabel: "Pets",
          }}
        />
        <Tab.Screen
          name="Logs"
          component={LogsScreen}
          options={{
            tabBarIcon: ({ color }) => (
              <Text style={{ fontSize: 22, color }}>📋</Text>
            ),
            tabBarLabel: "Logs",
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
