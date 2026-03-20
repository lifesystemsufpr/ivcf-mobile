import React, { useEffect } from "react";
import { View, StyleSheet, StatusBar } from "react-native";
import LottieView from "lottie-react-native";
import { StackActions } from "@react-navigation/native";

type Props = {
    navigation: any;
};

export const SuccessScreen: React.FC<Props> = ({ navigation }) => {
    useEffect(() => {
        // Automatically pop to top (go back to home dashboard) after animation finishes (approx 2.5 seconds)
        const timer = setTimeout(() => {
            navigation.dispatch(StackActions.popToTop());
        }, 2500);

        return () => clearTimeout(timer);
    }, [navigation]);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1F385C" />
            
            <LottieView
                source={require("../../../../../assets/success-check.json")}
                autoPlay
                loop={false}
                style={styles.lottie}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#1F385C", // Deep blue background to match prototype
        justifyContent: "center",
        alignItems: "center",
    },
    lottie: {
        width: 250,
        height: 250,
    },
});
