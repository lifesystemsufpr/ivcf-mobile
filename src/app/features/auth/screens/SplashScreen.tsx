import React from "react";
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../types/AuthStackParamList";

type SplashNavigationProp = NativeStackNavigationProp<AuthStackParamList, "SplashScreen">;

export const SplashScreen = () => {
    const navigation = useNavigation<SplashNavigationProp>();

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#2B4C7E" />

            {/* Logo Section */}
            <View style={styles.logoSection}>
                <Image
                    source={require("../../../../../assets/logo.png")}
                    style={styles.logo}
                    resizeMode="contain"
                />
                <Text style={styles.subtitle}>
                    Avaliação Clínica e Funcional Simplificada
                </Text>
            </View>

            {/* Buttons Section */}
            <View style={styles.buttonsSection}>
                <TouchableOpacity
                    style={styles.button}
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate("Login")}
                >
                    <Text style={styles.buttonText}>Entrar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.button}
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate("CreateUser")}
                >
                    <Text style={styles.buttonText}>Novo Responsável</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#1F4273",
        justifyContent: "center",
        alignItems: "center",
    },
    logoSection: {
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 60,
    },
    logo: {
        width: width * 0.55,
        height: width * 0.35,
        marginBottom: 16,
    },
    subtitle: {
        color: "#FFFFFF",
        fontSize: 16,
        fontStyle: "italic",
        textAlign: "center",
        opacity: 0.9,
        paddingHorizontal: 40,
    },
    buttonsSection: {
        width: "100%",
        alignItems: "center",
        gap: 16,
    },
    button: {
        backgroundColor: "#8BC34A",
        paddingVertical: 14,
        paddingHorizontal: 40,
        borderRadius: 25,
        width: width * 0.55,
        alignItems: "center",
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    buttonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "bold",
    },
});