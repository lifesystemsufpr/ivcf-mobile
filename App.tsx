import { NavigationContainer } from "@react-navigation/native"
import { RootNavigator } from "./src/app/navigation/RootNavigator"
import { navigationRef } from "./src/app/navigation/NavigationRef"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer ref={navigationRef}>
        <RootNavigator />
      </NavigationContainer>
    </QueryClientProvider>
  )
}
