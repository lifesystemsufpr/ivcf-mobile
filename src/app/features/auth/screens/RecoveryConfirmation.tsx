import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    Dimensions,
    Platform,
    Linking,
    Alert,
    SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");

export const RecoveryConfirmationScreen = () => {
    const navigation = useNavigation<any>();

    const handleOpenEmail = () => {
        Linking.openURL("mailto:").catch(() => {
            Alert.alert(
                "Erro",
                "Não foi possível abrir o aplicativo de email."
            );
        });
    };

    const handleResendLink = () => {
        navigation.goBack();
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            <View style={styles.content}>
                {/* Ícone de email */}
                <View style={styles.iconContainer}>
                    <View style={styles.iconCircle}>
                        <Ionicons
                            name="mail-open-outline"
                            size={48}
                            color="#72AB24"
                        />
                    </View>
                </View>

                {/* Título */}
                <Text style={styles.title}>Cheque o seu email</Text>

                {/* Descrição */}
                <Text style={styles.description}>
                    Enviamos o link de recuperação{"\n"}de senha para o seu email
                </Text>

                {/* Botão Abrir email */}
                <TouchableOpacity
                    style={styles.button}
                    activeOpacity={0.8}
                    onPress={handleOpenEmail}
                >
                    <Text style={styles.buttonText}>Abrir email</Text>
                </TouchableOpacity>
            </View>

            {/* Texto inferior */}
            <View style={styles.bottomContainer}>
                <Text style={styles.bottomText}>
                    Não recebeu o email ? Verifique a{"\n"}caixa de spam ou{" "}
                    <Text style={styles.resendLink} onPress={handleResendLink}>
                        reenvie o link
                    </Text>
                </Text>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    },
    content: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 32,
        paddingBottom: 60,
    },
    iconContainer: {
        marginBottom: 24,
    },
    iconCircle: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: "#F0F5E8",
        alignItems: "center",
        justifyContent: "center",
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#1F4273",
        marginBottom: 16,
        textAlign: "center",
    },
    description: {
        fontSize: 15,
        color: "#5A6B7E",
        textAlign: "center",
        lineHeight: 22,
        marginBottom: 32,
    },
    button: {
        backgroundColor: "#72AB24",
        paddingVertical: 14,
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
    bottomContainer: {
        paddingBottom: 40,
        alignItems: "center",
    },
    bottomText: {
        fontSize: 13,
        color: "#5A6B7E",
        textAlign: "center",
        lineHeight: 20,
    },
    resendLink: {
        color: "#1F4273",
        fontWeight: "bold",
        textDecorationLine: "underline",
    },
});