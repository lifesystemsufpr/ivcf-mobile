import { NavigationContainer } from "@react-navigation/native"
import {RootNavigator} from "./src/app/navigation/RootNavigator"
import { navigationRef } from "./src/app/navigation/NavigationRef"

export default function App() {
  return (
    <NavigationContainer ref={navigationRef}>
      <RootNavigator />
    </NavigationContainer>
  )
}
