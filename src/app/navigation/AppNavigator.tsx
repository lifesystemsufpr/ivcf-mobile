import { NavigationContainer } from "@react-navigation/native"
import { useAuthStore } from "../features/auth"
import { RootNavigator } from "./RootNavigator"

export function AppNavigator() {
  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  )
}
