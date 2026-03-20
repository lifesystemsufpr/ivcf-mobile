import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { InstructionsScreen } from "../screens/InstructionsScreen";
import { QuestionnaireScreen } from "../screens/QuestionnaireScreen";
import { ResultScreen } from "../screens/ResultScreen";
import { SuccessScreen } from "../screens/SuccessScreen";

const Stack = createNativeStackNavigator();

export const QuestionnaireNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Instructions" component={InstructionsScreen} />
            <Stack.Screen name="Questionnaire" component={QuestionnaireScreen} />
            <Stack.Screen name="Result" component={ResultScreen} />
            <Stack.Screen name="Success" component={SuccessScreen} />
        </Stack.Navigator>
    );
};
