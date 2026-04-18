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
    Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../types/AuthStackParamList";
import { useCreateHealthProfessional } from "../hooks/useCreateHealthProfessional";

type CreateUserNavigationProp = NativeStackNavigationProp<AuthStackParamList, "CreateUser">;

export const CreateUserScreen = () => {
    const navigation = useNavigation<CreateUserNavigationProp>();

    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [speciality, setSpeciality] = useState("");
    const [confirmSenha, setConfirmSenha] = useState("");
    const [termsAccepted, setTermsAccepted] = useState(false);

    const createHealthProfessional = useCreateHealthProfessional();

 
    const handleCadastrar = async () => {
        if (!nome || !email || !senha || !confirmSenha || !termsAccepted) {
            Alert.alert("Atenção", "Por favor, preencha todos os campos e aceite os termos.");
            return;
        }

        if (senha !== confirmSenha) {
            Alert.alert("Atenção", "As senhas não coincidem.");
            return;
        }

        try {
            await createHealthProfessional.mutateAsync({
                speciality: speciality,
                user: {
                    fullName: nome,
                    email,
                    password: senha,
                    active: true,
                }
            });

            Alert.alert("Sucesso", "Cadastro realizado com sucesso!");
            navigation.goBack();

        } catch (error: Error | any) {
            console.error(error);

            if (error.response.status === 409 )

                Alert.alert("Erro", "E-mail já cadastrado. Tente outro e-mail.");
            Alert.alert("Erro", "Não foi possível realizar o cadastro.");
        }
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

                        

                        {/* Especialidade */}
                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>Especialidade</Text>
                            <TextInput
                                style={styles.input}
                                value={speciality}
                                onChangeText={setSpeciality}
                                placeholder="Especialidade"
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
        marginTop: "auto",
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