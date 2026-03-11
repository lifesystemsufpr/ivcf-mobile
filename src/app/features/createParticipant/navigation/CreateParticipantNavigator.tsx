import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { CreateParticipantScreen } from "../screens/CreateParticipantScreen";

const Stack = createNativeStackNavigator();

export const CreateParticipantNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="CreateParticipant" component={CreateParticipantScreen} />
        </Stack.Navigator>
    );
};

