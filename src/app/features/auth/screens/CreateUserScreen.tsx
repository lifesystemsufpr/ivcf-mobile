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
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../types/AuthStackParamList";

type CreateUserNavigationProp = NativeStackNavigationProp<AuthStackParamList, "CreateUser">;

export const CreateUserScreen = () => {

    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [celular, setCelular] = useState("");
    const [senha, setSenha] = useState("");
    const [confirmSenha, setConfirmSenha] = useState("");
    const [termsAccepted, setTermsAccepted] = useState(false);


    const formatCelular = (text: string) => {
        const digits = text.replace(/\D/g, "").slice(0, 11);
        let formatted = digits;
        if (digits.length > 0) formatted = "(" + digits;
        if (digits.length > 2) formatted = "(" + digits.slice(0, 2) + ") " + digits.slice(2);
        if (digits.length > 7) formatted = "(" + digits.slice(0, 2) + ") " + digits.slice(2, 7) + "-" + digits.slice(7);

        return formatted;
    };

    const handleCelularChange = (text: string) => {
        setCelular(formatCelular(text));
    };

    const handleCadastrar = () => {
        console.log("Cadastrar:", { nome, email, celular, termsAccepted });
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <ScrollView
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
                    <Text style={styles.title}>Dados Pessoais</Text>

                    {/* Campos */}
                    <View style={styles.fieldsContainer}>

                        {/* Nome */}
                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>Nome</Text>
                            <TextInput
                                style={styles.input}
                                value={nome}
                                onChangeText={setNome}
                                placeholder="Nome completo"
                                placeholderTextColor="#B0BEC5"
                            />
                        </View>

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
                                placeholderTextColor="#B0BEC5"
                            />
                        </View>

                        {/* Celular */}
                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>Celular</Text>
                            <TextInput
                                style={styles.input}
                                value={celular}
                                onChangeText={handleCelularChange}
                                keyboardType="numeric"
                                placeholder="(00) 00000-0000"
                                placeholderTextColor="#B0BEC5"
                            />
                        </View>

                        {/* Senha */}
                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>Senha</Text>
                            <TextInput
                                style={styles.input}
                                value={senha}
                                onChangeText={setSenha}
                                secureTextEntry
                                placeholder="Digite sua senha"
                                placeholderTextColor="#B0BEC5"
                            />
                        </View>

                        {/* Confirmação de Senha */}
                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>Confirmação de Senha</Text>
                            <TextInput
                                style={styles.input}
                                value={confirmSenha}
                                onChangeText={setConfirmSenha}
                                secureTextEntry
                                placeholder="Confirme sua senha"
                                placeholderTextColor="#B0BEC5"
                            />
                        </View>
                    </View>

                    {/* Termos */}
                    <TouchableOpacity
                        style={styles.termsRow}
                        activeOpacity={0.7}
                        onPress={() => setTermsAccepted(!termsAccepted)}
                    >
                        <Text style={styles.termsText}>
                            Li e concordo com os termos de uso
                        </Text>
                        <View style={[
                            styles.checkbox,
                            termsAccepted && styles.checkboxChecked,
                        ]}>
                            {termsAccepted && (
                                <Text style={styles.checkmark}>✓</Text>
                            )}
                        </View>
                    </TouchableOpacity>

                    {/* Botão Cadastrar */}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={styles.button}
                            activeOpacity={0.8}
                            onPress={handleCadastrar}
                        >
                            <Text style={styles.buttonText}>Cadastrar</Text>
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
        paddingTop: 50,
        marginBottom: 10,
    },
    logo: {
        width: width * 0.30,
        height: width * 0.18,
    },
    title: {
        fontSize: 26,
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
        backgroundColor: "#8BC34A",
        borderColor: "#8BC34A",
    },
    checkmark: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "bold",
    },
    buttonContainer: {
        alignItems: "center",
        marginTop: "auto",
        paddingBottom: 10,
    },
    button: {
        backgroundColor: "#8BC34A",
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