import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { CreateParticipantScreen } from "../screens/CreateParticipantScreen";
import { CreateParticipantAddressScreen } from "../screens/CreateParticipantAddressScreen";
import { CreateParticipantStackParamList } from "./types";

const Stack = createNativeStackNavigator<CreateParticipantStackParamList>();

export const CreateParticipantStackNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="CreateParticipantForm" component={CreateParticipantScreen} />
            <Stack.Screen name="CreateParticipantAddressForm" component={CreateParticipantAddressScreen} />
        </Stack.Navigator>
    );
};
