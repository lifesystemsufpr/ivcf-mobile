import React from "react";
import { View, Text, StyleSheet } from "react-native";

export const CreateParticipantNavigator = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Criar Participante</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#F5F5F5",
    },
    text: {
        fontSize: 16,
        color: "#666",
    },
});
