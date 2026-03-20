import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuthStore } from "../features/auth";
import { AuthNavigator } from "../features/auth";
import { MainNavigator } from "./MainNavigator";

const Stack = createNativeStackNavigator();

export function RootNavigator() {

  const { isAuthenticated } = useAuthStore();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {
        isAuthenticated ? (
          <Stack.Screen name="Main" component={MainNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )
      }
    </Stack.Navigator>
  );
}
