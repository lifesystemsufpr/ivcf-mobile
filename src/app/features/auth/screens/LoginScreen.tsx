import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
    Alert,
    SafeAreaView,
    Keyboard,
    TouchableWithoutFeedback,
    useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../hooks/useAuth";

import { useNavigation } from "@react-navigation/native";


export const LoginScreen = () => {
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const { login, isLoading } = useAuth();
    const navigation = useNavigation<any>();
    const { width, height } = useWindowDimensions();

    const isSmallScreen = height < 680;

    const handleLogin = () => {
        if (!email || !senha) {
            Alert.alert("Atenção", "Preencha todos os campos.");
            return;
        }


        login(
            { email, password: senha },

            {
                onSuccess: () => {
                },
                onError: (error: any) => {
                    console.log("Login erro:", error);
                    Alert.alert("Erro", "E-mail ou senha inválidos. Tente novamente.");
                },
            }
        );
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor="#1F4273" />

                {/* Header com logo */}
                <SafeAreaView style={{ backgroundColor: "#1F4273", zIndex: 10 }}>
                    <View style={[styles.header, isSmallScreen && styles.headerSmall]}>
                        <Image
                            source={require("../../../../../assets/logo.png")}
                            style={[
                                styles.logo,
                                {
                                    width: width * 0.45,
                                    height: width * (isSmallScreen ? 0.20 : 0.28),
                                },
                            ]}
                            resizeMode="contain"
                        />
                        <Text style={styles.headerSubtitle}>
                            Avaliação Clínica e Funcional Simplificada
                        </Text>
                    </View>
                </SafeAreaView>

                {/* Card de Login */}
                <KeyboardAvoidingView
                    style={styles.cardWrapper}
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                    keyboardVerticalOffset={0}
                >
                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={styles.scrollContent}
                        keyboardShouldPersistTaps="handled"
                        bounces={false}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={[styles.card, isSmallScreen && styles.cardSmall]}>
                            {/* Seção dos campos */}
                            <View>
                                <Text style={[styles.loginTitle, isSmallScreen && styles.loginTitleSmall]}>
                                    Login
                                </Text>

                                {/* Email */}
                                <View style={styles.fieldGroup}>
                                    <Text style={styles.label}>E-mail</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="seu@email.com"
                                        placeholderTextColor="#A0A0A0"
                                        value={email}
                                        onChangeText={setEmail}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        returnKeyType="next"
                                    />
                                </View>

                                {/* Senha */}
                                <View style={styles.fieldGroup}>
                                    <Text style={styles.label}>Senha</Text>
                                    <View style={styles.passwordContainer}>
                                        <TextInput
                                            style={styles.passwordInput}
                                            placeholder="Digite sua senha"
                                            placeholderTextColor="#A0A0A0"
                                            value={senha}
                                            onChangeText={setSenha}
                                            secureTextEntry={!showPassword}
                                            returnKeyType="done"
                                            onSubmitEditing={handleLogin}
                                        />
                                        <TouchableOpacity
                                            style={styles.eyeIcon}
                                            onPress={() => setShowPassword(!showPassword)}
                                            activeOpacity={0.7}
                                        >
                                            <Ionicons
                                                name={showPassword ? "eye" : "eye-off"}
                                                size={22}
                                                color="#A0A0A0"
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Esqueceu senha */}
                                <TouchableOpacity style={styles.forgotPassword}>
                                    <Text style={styles.forgotPasswordText} onPress={() => navigation.navigate("RecoveryPassword")}>
                                        Esqueceu sua senha?
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {/* Botão Entrar */}
                            <TouchableOpacity
                                style={[
                                    styles.button,
                                    { width: Math.min(width * 0.50, 280) },
                                    isLoading && styles.buttonDisabled,
                                ]}
                                activeOpacity={0.8}
                                onPress={handleLogin}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#FFFFFF" />
                                ) : (
                                    <Text style={styles.buttonText}>Entrar</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </View>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    header: {
        backgroundColor: "#1F4273",
        alignItems: "center",
        justifyContent: "center",
        paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 24) + 16 : 16,
        paddingBottom: 30,
    },
    headerSmall: {
        paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 24) + 8 : 8,
        paddingBottom: 16,
    },
    logo: {
        marginBottom: 8,
    },
    headerSubtitle: {
        color: "#FFFFFF",
        fontSize: 13,
        fontStyle: "italic",
        textAlign: "center",
        opacity: 0.9,
        paddingHorizontal: 40,
    },
    cardWrapper: {
        flex: 1,
    },
    scrollView: {
        backgroundColor: "#1F4273",
    },
    scrollContent: {
        flexGrow: 1,
    },
    card: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingHorizontal: 30,
        paddingTop: 40,
        paddingBottom: 40,
        justifyContent: "center",
    },
    cardSmall: {
        paddingTop: 24,
        paddingBottom: 24,
    },
    loginTitle: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#1F4273",
        marginBottom: 30,
    },
    loginTitleSmall: {
        fontSize: 24,
        marginBottom: 20,
    },
    fieldGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        color: "#333333",
        marginBottom: 6,
        fontWeight: "500",
    },
    input: {
        borderWidth: 1,
        borderColor: "#D0D0D0",
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15,
        color: "#333333",
        backgroundColor: "#FFFFFF",
    },
    passwordContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#D0D0D0",
        borderRadius: 8,
        backgroundColor: "#FFFFFF",
    },
    passwordInput: {
        flex: 1,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15,
        color: "#333333",
    },
    eyeIcon: {
        paddingHorizontal: 14,
    },
    forgotPassword: {
        alignSelf: "flex-end",
        marginTop: 3,
        marginBottom: 30,
    },
    forgotPasswordText: {
        color: "#1F4273",
        fontSize: 13,
        fontWeight: "500",
    },
    button: {
        backgroundColor: "#72AB24",
        paddingVertical: 14,
        borderRadius: 25,
        alignSelf: "center",
        alignItems: "center",
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "bold",
    },
});