import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { DashboardNavigator } from "../features/dashboard"
import { QuestionnaireNavigator } from "../features/questionnaire"
import { CreateParticipantNavigator } from "../features/createParticipant"

const Tab = createBottomTabNavigator()

export function MainNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={DashboardNavigator} />
      <Tab.Screen name="Profile" component={QuestionnaireNavigator} />
      <Tab.Screen name="Settings" component={CreateParticipantNavigator} />
    </Tab.Navigator>
  )
}
