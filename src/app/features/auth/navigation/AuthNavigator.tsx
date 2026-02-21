import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { LoginScreen } from "../screens/LoginScreen"
import { SplashScreen } from "../screens/SplashScreen"
import { CreateUserScreen } from "../screens/CreateUserScreen"
import { AuthStackParamList } from "../types/AuthStackParamList"


const Stack = createNativeStackNavigator<AuthStackParamList>()

export const AuthNavigator = () => {
    return (

      <Stack.Navigator screenOptions={{ headerShown: false }}>

        <Stack.Screen name="SplashScreen" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="CreateUser" component={CreateUserScreen} />
        
      </Stack.Navigator>
        
    )
}