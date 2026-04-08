import React from "react";
import { View, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DashboardNavigator } from "../features/dashboard";
import { SearchParticipantNavigator } from "../features/searchParticipant";
import { CreateParticipantNavigator } from "../features/createParticipant";

const Tab = createBottomTabNavigator();

// ─── Custom Tab Bar ──────────────────────────────────────────────────
function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  const onTabPress = (route: any, index: number) => {
    const isFocused = state.index === index;
    const event = navigation.emit({
      type: "tabPress",
      target: route.key,
      canPreventDefault: true,
    });
    if (!event.defaultPrevented) {
      if (route.name === "Add") {
        navigation.navigate("Add", {
          screen: "SearchParticipant",
          params: { fromMenu: false },
        });
      } else if (!isFocused) {
        navigation.navigate(route.name);
      }
    }
  };

  const homeRoute = state.routes[0];
  const addRoute = state.routes[1];
  const participantsRoute = state.routes[2];

  const shouldHideTabBar = () => {
    const currentTab = state.routes[state.index] as any;

    if (currentTab.name === "Add" && currentTab.state) {
      const nestedState = currentTab.state as any;
      const nestedRoute =
        nestedState.routes?.[nestedState.index ?? 0] ?? undefined;

      if (
        nestedRoute?.name === "Instructions" ||
        nestedRoute?.name === "Questionnaire" ||
        nestedRoute?.name === "Result" ||
        nestedRoute?.name === "Success"
      ) {
        return true;
      }
    }

    if (currentTab.name === "Participants") {
      return true;
    }

    return false;
  };

  if (shouldHideTabBar()) {
    return null;
  }

  return (
    <View style={[tabStyles.wrapper, { bottom: insets.bottom + 5 }]}>
      <View style={tabStyles.bar}>
        {/* Left icon - Home */}
        <TouchableOpacity
          onPress={() => onTabPress(homeRoute, 0)}
          activeOpacity={0.7}
          style={tabStyles.tabButton}
        >
          <Ionicons
            name="home"
            size={24}
            color={state.index === 0 ? "#FFFFFF" : "rgba(255,255,255,0.55)"}
          />
        </TouchableOpacity>

        {/* Spacer for center button */}
        <View style={tabStyles.centerSpacer} />

        {/* Right icon - New User */}
        <TouchableOpacity
          onPress={() => onTabPress(participantsRoute, 2)}
          activeOpacity={0.7}
          style={tabStyles.tabButton}
        >
          <Ionicons
            name="person-add"
            size={24}
            color={state.index === 2 ? "#FFFFFF" : "rgba(255,255,255,0.55)"}
          />
        </TouchableOpacity>
      </View>

      {/* Center "+" button - absolutely positioned */}
      <TouchableOpacity
        onPress={() => onTabPress(addRoute, 1)}
        activeOpacity={0.8}
        style={tabStyles.centerButtonWrapper}
      >
        <View style={tabStyles.centerButton}>
          <Ionicons name="add" size={36} color="#FFFFFF" />
        </View>
      </TouchableOpacity>
    </View>
  );
}

// ─── Main Navigator ──────────────────────────────────────────────────
export function MainNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={DashboardNavigator} />
      <Tab.Screen name="Add" component={SearchParticipantNavigator} />
      <Tab.Screen name="Participants" component={CreateParticipantNavigator} options={{ unmountOnBlur: true } as any} />
    </Tab.Navigator>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────
const tabStyles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 20,
    right: 20,
    alignItems: "center",
  },
  bar: {
    flexDirection: "row",
    backgroundColor: "#1F4273",
    borderRadius: 40,
    height: 64,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 32,
    width: "100%",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  tabButton: {
    alignItems: "center",
    justifyContent: "center",
    height: 64,
    width: 48,
  },
  centerSpacer: {
    width: 72,
  },
  centerButtonWrapper: {
    position: "absolute",
    alignSelf: "center",
    left: "50%",
    marginLeft: -32,
    bottom: 0,
  },
  centerButton: {
    width: 77,
    height: 77,
    top: 3,
    borderRadius: 37,

    backgroundColor: "#72AB24",
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
      },
      android: {
        elevation: 9,
      },
    }),
  },
});
