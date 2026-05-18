import React, { use, useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    Image,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
    Alert,
    SafeAreaView,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import { useNavigation } from "@react-navigation/native";
import { useRecoveryPassword } from "../hooks/useRecoveryPassword";


export const RecoveryPasswordScreen = () => {

    const navigation = useNavigation<any>();

    const [email, setEmail] = useState("");

    const { recoverPassword } = useRecoveryPassword();


    const handleRecovery = () => {

        if (!email) {
            Alert.alert("Atenção", "Preencha o campo de email.");
            return;
        }

        recoverPassword (
            { email },

            { onSuccess: () => {
                navigation.navigate("RecoveryConfirmation");
            }
            , onError: (error: any) => {
                Alert.alert("Erro", "Não foi possível enviar as instruções de recuperação de senha.");
            }

        }
    )

    }


     return (
         <View style={styles.container}>
                    <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        
                    <KeyboardAvoidingView
                        style={styles.keyboardView}
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                    >
                        <ScrollView
                            automaticallyAdjustKeyboardInsets={true}
                            contentContainerStyle={styles.scrollContent}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                        >
                            {/* Logo */}
                            <View style={styles.logoContainer}>
                                <Image
                                    source={require("../../../../../assets/logo-2.png")}
                                    style={styles.logo}
                                    resizeMode="contain"
                                />
                            </View>
        
                            {/* Título */}
                            <Text style={styles.title}>Recuperação de senha</Text>
                            <Text style={styles.titleDescription}>Por favor, digite o email vinculado à sua conta. </Text>
        
                            {/* Campos */}
                            <View style={styles.fieldsContainer}>
        
        
                                {/* Email */}
                                <View style={styles.fieldGroup}>
                                    <Text style={styles.label}>Email</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={email}
                                        onChangeText={setEmail}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        placeholder="email@exemplo.com"
                                        placeholderTextColor="#888888"
                                    />
                                </View>
         
                            </View>
                            {/* Botão Cadastrar */}
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity
                                    style={styles.button}
                                    activeOpacity={0.8}
                                    onPress={handleRecovery}
                                >
                                    <Text style={styles.buttonText}>Recuperar Senha</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </KeyboardAvoidingView>
                </View>
    );
};

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 28,
        paddingBottom: 40,
    },
    logoContainer: {
        alignItems: "center",
        paddingTop: 90,
        marginBottom: 10,
    },
    logo: {
        width: width * 0.40,
        height: width * 0.28,
    },
    title: {
        fontSize: 36,
        fontWeight: "bold",
        color: "#1F4273",
        marginBottom: 28,
        textAlign: "center",
    },

     titleDescription: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#1F4273",
        marginBottom: 28,
        textAlign: "center",
    },
    fieldsContainer: {
        gap: 18,
        marginBottom: 24,
    },
    fieldGroup: {},
    label: {
        fontSize: 12,
        color: "#6B7B8D",
        marginBottom: 4,
        fontWeight: "500",
    },
    input: {
        backgroundColor: "#EDF1F7",
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15,
        color: "#333333",
        borderBottomWidth: 2,
        borderBottomColor: "#C5CED8",
    },
    selectInput: {
        backgroundColor: "#EDF1F7",
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderBottomWidth: 2,
        borderBottomColor: "#C5CED8",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    selectText: {
        fontSize: 15,
        color: "#333333",
        flex: 1,
    },
    selectPlaceholder: {
        color: "#B0BEC5",
    },
    selectChevron: {
        marginLeft: 12,
        fontSize: 16,
        color: "#6B7B8D",
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.35)",
        paddingHorizontal: 24,
        justifyContent: "center",
    },
    modalCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 16,
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1F4273",
        marginBottom: 12,
        textAlign: "center",
    },
    modalOption: {
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: "#EDF1F7",
        marginBottom: 10,
        alignItems: "center",
    },
    modalOptionText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#1F4273",
    },
    modalCancel: {
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#C5CED8",
        alignItems: "center",
        marginTop: 4,
    },
    modalCancelText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#6B7B8D",
    },
    termsRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 40,
    },
    termsText: {
        fontSize: 13,
        color: "#1F4273",
        fontWeight: "500",
        flex: 1,
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: "#C5CED8",
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 12,
    },
    checkboxChecked: {
        backgroundColor: "#72AB24",
        borderColor: "#72AB24",
    },
    checkmark: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "bold",
    },
    buttonContainer: {
        alignItems: "center",
        paddingBottom: 10,
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
});