import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SearchParticipantScreen } from "../screens/SearchParticipantScreen";
import { InstructionsScreen } from "../../questionnaire/screens/InstructionsScreen";

const Stack = createNativeStackNavigator();

export const SearchParticipantNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="SearchParticipant" component={SearchParticipantScreen} />
            <Stack.Screen name="Instructions" component={InstructionsScreen} />
        </Stack.Navigator>
    );
};
