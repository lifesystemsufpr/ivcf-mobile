import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
    Modal,
    Pressable,
    ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CreateParticipantStackParamList } from "../navigation/types";
import { createParticipantApi } from "../api/createParticipantApi";

type NavigationProp = NativeStackNavigationProp<CreateParticipantStackParamList, "CreateParticipant">;

export const CreateParticipantScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const insets = useSafeAreaInsets();

    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [dataNasc, setDataNasc] = useState("");
    const [sexo, setSexo] = useState("");
    const [sexoModalOpen, setSexoModalOpen] = useState(false);
    const [altura, setAltura] = useState("");
    const [peso, setPeso] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);

    const getBorderColor = (field: string) => focusedField === field ? "#1F4273" : "#C5CED8";

    const handleEmailChange = (text: string) => {
        setEmail(text.trim().toLowerCase());
    };

    const handlePhoneChange = (text: string) => {
        let raw = text.replace(/\D/g, "");
        if (raw.length > 11) raw = raw.slice(0, 11);
        let formatted = raw;
        if (raw.length > 2) {
            formatted = `(${raw.slice(0, 2)}) ${raw.slice(2)}`;
        }
        if (raw.length > 6 && raw.length < 11) {
            formatted = `(${raw.slice(0, 2)}) ${raw.slice(2, 6)}-${raw.slice(6)}`;
        } else if (raw.length === 11) {
            formatted = `(${raw.slice(0, 2)}) ${raw.slice(2, 7)}-${raw.slice(7)}`;
        }
        setPhone(formatted);
    };

    const handleDateChange = (text: string) => {
        let raw = text.replace(/\D/g, "");
        if (raw.length > 8) raw = raw.slice(0, 8);
        let formatted = raw;
        if (raw.length > 2) {
            formatted = `${raw.slice(0, 2)}/${raw.slice(2)}`;
        }
        if (raw.length > 4) {
            formatted = `${raw.slice(0, 2)}/${raw.slice(2, 4)}/${raw.slice(4)}`;
        }
        setDataNasc(formatted);
    };

    const handleAlturaChange = (text: string) => {
        let raw = text.replace(/\D/g, "");
        if (raw.length > 3) raw = raw.slice(0, 3);
        setAltura(raw);
    };

    const handleContinuar = async () => {
        if (!nome || !email || !phone || !dataNasc || !sexo || !altura || !peso) {
            Alert.alert("Atenção", "Por favor, preencha todos os campos.");
            return;
        }

        // Validação da Data de Nascimento
        const ddmmyyyy = /^(\d{2})\/(\d{2})\/(\d{4})$/;
        const match = dataNasc.match(ddmmyyyy);

        if (!match) {
            Alert.alert("Atenção", "Data de nascimento inválida. Use dd/mm/aaaa.");
            return;
        }

        const day = parseInt(match[1], 10);
        const month = parseInt(match[2], 10);
        const year = parseInt(match[3], 10);

        const currentYear = new Date().getFullYear();
        if (year < 1900 || year > currentYear) {
            Alert.alert("Atenção", "Ano de nascimento inválido ou muito distante.");
            return;
        }

        const dateObj = new Date(year, month - 1, day);
        if (
            dateObj.getFullYear() !== year ||
            dateObj.getMonth() !== month - 1 ||
            dateObj.getDate() !== day
        ) {
            Alert.alert("Atenção", "Data de nascimento inválida (dia ou mês incorretos).");
            return;
        }

        if (dateObj > new Date()) {
            Alert.alert("Atenção", "A data de nascimento não pode ser no futuro.");
            return;
        }

        setIsLoading(true);
        try {
            await createParticipantApi.checkEmail(email);
            Alert.alert("Atenção", "Participante já cadastrado.");
        } catch (error: any) {
            if (error?.response?.status === 404) {
                navigation.navigate("CreateParticipantAddress", {
                    nome,
                    email,
                    phone,
                    dataNasc,
                    sexo,
                    altura,
                    peso,
                });
            } else {
                console.error("Erro ao verificar email:", error);
                Alert.alert("Erro", "Não foi possível verificar o e-mail. Tente novamente.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#1F4273" />

            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <ScrollView
                    contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20, paddingBottom: Math.max(insets.bottom + 80, 100) }]}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >

                    {/* Título */}
                    <Text style={styles.stepTitle}>Etapa 1 de 2</Text>
                    <Text style={styles.title}>Dados Pessoais</Text>

                    {/* Campos */}
                    <View style={styles.fieldsContainer}>

                        {/* Nome */}
                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>Nome</Text>
                            <TextInput
                                style={[styles.input, { borderBottomColor: getBorderColor("nome") }]}
                                value={nome}
                                onChangeText={setNome}
                                onFocus={() => setFocusedField("nome")}
                                onBlur={() => setFocusedField(null)}
                                placeholder="Nome completo"
                                placeholderTextColor="#B0BEC5"
                            />
                        </View>

                        {/* Email */}
                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>Email</Text>
                            <TextInput
                                style={[styles.input, { borderBottomColor: getBorderColor("email") }]}
                                value={email}
                                onChangeText={handleEmailChange}
                                onFocus={() => setFocusedField("email")}
                                onBlur={() => setFocusedField(null)}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                placeholder="email@exemplo.com"
                                placeholderTextColor="#B0BEC5"
                            />
                        </View>

                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>Telefone</Text>
                            <TextInput
                                style={[styles.input, { borderBottomColor: getBorderColor("phone") }]}
                                value={phone}
                                onChangeText={handlePhoneChange}
                                onFocus={() => setFocusedField("phone")}
                                onBlur={() => setFocusedField(null)}
                                keyboardType="numeric"
                                maxLength={15}
                                placeholder="(41) 99999-8888"
                                placeholderTextColor="#B0BEC5"
                            />
                        </View>

                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>Data de Nascimento</Text>
                            <TextInput
                                style={[styles.input, { borderBottomColor: getBorderColor("dataNasc") }]}
                                value={dataNasc}
                                onChangeText={handleDateChange}
                                onFocus={() => setFocusedField("dataNasc")}
                                onBlur={() => setFocusedField(null)}
                                keyboardType="numeric"
                                maxLength={10}
                                placeholder="dd/mm/aaaa"
                                placeholderTextColor="#B0BEC5"
                            />
                        </View>

                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>Sexo</Text>
                            <TouchableOpacity
                                style={[styles.selectInput, { borderBottomColor: sexoModalOpen ? "#1F4273" : "#C5CED8" }]}
                                activeOpacity={0.8}
                                onPress={() => setSexoModalOpen(true)}
                            >
                                <Text
                                    style={[
                                        styles.selectText,
                                        !sexo && styles.selectPlaceholder,
                                    ]}
                                >
                                    {sexo || "Selecione"}
                                </Text>
                                <Text style={styles.selectChevron}>▾</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>Altura</Text>
                            <TextInput
                                style={[styles.input, { borderBottomColor: getBorderColor("altura") }]}
                                value={altura}
                                onChangeText={handleAlturaChange}
                                onFocus={() => setFocusedField("altura")}
                                onBlur={() => setFocusedField(null)}
                                keyboardType="numeric"
                                maxLength={3}
                                placeholder="170 (em cm)"
                                placeholderTextColor="#B0BEC5"
                            />
                        </View>

                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>Peso</Text>
                            <TextInput
                                style={[styles.input, { borderBottomColor: getBorderColor("peso") }]}
                                value={peso}
                                onChangeText={setPeso}
                                onFocus={() => setFocusedField("peso")}
                                onBlur={() => setFocusedField(null)}
                                placeholder="70kg"
                                placeholderTextColor="#B0BEC5"
                            />
                        </View>

                    </View>

                    {/* Botão Cadastrar */}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.button, isLoading && styles.buttonDisabled]}
                            activeOpacity={0.8}
                            onPress={handleContinuar}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text style={styles.buttonText}>Continuar</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <Modal
                visible={sexoModalOpen}
                transparent
                animationType="slide"
                onRequestClose={() => setSexoModalOpen(false)}
            >
                <Pressable
                    style={styles.modalBackdrop}
                    onPress={() => setSexoModalOpen(false)}
                >
                    <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
                        <Text style={styles.modalTitle}>Sexo</Text>

                        <TouchableOpacity
                            style={styles.modalOption}
                            activeOpacity={0.8}
                            onPress={() => {
                                setSexo("Feminino");
                                setSexoModalOpen(false);
                            }}
                        >
                            <Text style={styles.modalOptionText}>Feminino</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.modalOption}
                            activeOpacity={0.8}
                            onPress={() => {
                                setSexo("Masculino");
                                setSexoModalOpen(false);
                            }}
                        >
                            <Text style={styles.modalOptionText}>Masculino</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.modalCancel}
                            activeOpacity={0.8}
                            onPress={() => setSexoModalOpen(false)}
                        >
                            <Text style={styles.modalCancelText}>Cancelar</Text>
                        </TouchableOpacity>
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    );
};



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
        paddingBottom: 30,
    },

    stepTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#1F4273",
        marginBottom: 20,
        textAlign: "center",
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
        justifyContent: "flex-end",
    },
    modalCard: {
        backgroundColor: "#FFFFFF",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 24,
        paddingBottom: 40,
        paddingHorizontal: 24,
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1F4273",
        marginBottom: 16,
        textAlign: "center",
    },
    modalOption: {
        paddingVertical: 14,
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
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#C5CED8",
        alignItems: "center",
        marginTop: 8,
    },
    modalCancelText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#6B7B8D",
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
        width: 200,
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