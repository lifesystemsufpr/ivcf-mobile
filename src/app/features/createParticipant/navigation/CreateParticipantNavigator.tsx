import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { CreateParticipantScreen } from "../screens/CreateParticipantScreen";
import { CreateParticipantAddressScreen } from "../screens/CreateParticipantAddressScreen";
import { CreateParticipantStackParamList } from "./types";

const Stack = createNativeStackNavigator<CreateParticipantStackParamList>();

export const CreateParticipantNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="CreateParticipant" component={CreateParticipantScreen} />
            <Stack.Screen name="CreateParticipantAddress" component={CreateParticipantAddressScreen} />
        </Stack.Navigator>
    );
};
