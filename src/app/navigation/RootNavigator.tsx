import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuthStore } from "../features/auth";
import { AuthNavigator } from "../features/auth";
import { MainNavigator } from "./MainNavigator";

const Stack = createNativeStackNavigator();

export function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Auth" component={AuthNavigator} />
      <Stack.Screen name="Main" component={MainNavigator} />
    </Stack.Navigator>
  );
}
