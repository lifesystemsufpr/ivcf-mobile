import React, { useState } from "react";
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
import { useAuth } from "../hooks/useAuth";
import { useAuthStore } from "../store/useAuthStore";
import { mapJwtToUser } from "../mappers/authMapper";

export const LoginScreen = () => {
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");

    const { login, isLoading } = useAuth();
    const setAuth = useAuthStore((state) => state.setAuth);

    const handleLogin = () => {
        if (!email || !senha) {
            Alert.alert("Atenção", "Preencha todos os campos.");
            return;
        }

        console.log("handleLogin chamado", { email, senha });

        login(
            { email, password: senha },
            {
                onSuccess: (response) => {
                    const token = response.data.access_token;
                    const user = mapJwtToUser(token);
                    console.log("Login sucesso:", { token, user });
                    setAuth(token, user);
                },
                onError: (error) => {
                    console.log("Login erro:", error);
                    Alert.alert("Erro", "E-mail ou senha inválidos. Tente novamente.");
                },
            }
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1F4273" />

            {/* Header com logo */}
            <SafeAreaView style={{ backgroundColor: "#1F4273", zIndex: 10 }}>
                <View style={styles.header}>
                    <Image
                        source={require("../../../../../assets/logo.png")}
                        style={styles.logo}
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
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    bounces={false}
                >
                    <View style={styles.card}>
                        {/* Seção dos campos */}
                        <View>
                            <Text style={styles.loginTitle}>Login</Text>

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
                                />
                            </View>

                            {/* Senha */}
                            <View style={styles.fieldGroup}>
                                <Text style={styles.label}>Senha</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Digite sua senha"
                                    placeholderTextColor="#A0A0A0"
                                    value={senha}
                                    onChangeText={setSenha}
                                    secureTextEntry
                                />
                            </View>

                            {/* Esqueceu senha */}
                            <TouchableOpacity style={styles.forgotPassword}>
                                <Text style={styles.forgotPasswordText}>
                                    Esqueceu sua senha?
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Botão Entrar */}
                        <TouchableOpacity
                            style={[styles.button, isLoading && styles.buttonDisabled]}
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
    );
};

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#1F4273",
    },
    header: {
        backgroundColor: "#1F4273",
        alignItems: "center",
        justifyContent: "center",
        paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 24) + 16 : 16,
        paddingBottom: 30,
    },
    logo: {
        width: width * 0.45,
        height: width * 0.28,
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
    loginTitle: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#1F4273",
        marginBottom: 30,
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
        width: width * 0.50,
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