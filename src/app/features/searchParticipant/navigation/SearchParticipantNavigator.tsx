import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SearchParticipantScreen } from "../screens/SearchParticipantScreen";
import { InstructionsScreen } from "../../questionnaire/screens/InstructionsScreen";
import { QuestionnaireScreen } from "../../questionnaire/screens/QuestionnaireScreen";
import { ResultScreen } from "../../questionnaire/screens/ResultScreen";
import { SuccessScreen } from "../../questionnaire/screens/SuccessScreen";

const Stack = createNativeStackNavigator();

export const SearchParticipantNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="SearchParticipant" component={SearchParticipantScreen} />
            <Stack.Screen name="Instructions" component={InstructionsScreen} />
            <Stack.Screen name="Questionnaire" component={QuestionnaireScreen} />
            <Stack.Screen name="Result" component={ResultScreen} />
            <Stack.Screen name="Success" component={SuccessScreen} />
        </Stack.Navigator>
    );
};
