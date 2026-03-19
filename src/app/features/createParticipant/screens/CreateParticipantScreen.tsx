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
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { CreateParticipantStackParamList } from "../navigation/types";

type NavigationProp = NativeStackNavigationProp<CreateParticipantStackParamList, "CreateParticipant">;

export const CreateParticipantScreen = () => {
    const navigation = useNavigation<NavigationProp>();

    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [dataNasc, setDataNasc] = useState("");
    const [sexo, setSexo] = useState("");
    const [sexoModalOpen, setSexoModalOpen] = useState(false);
    const [altura, setAltura] = useState("");
    const [peso, setPeso] = useState("");

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

    const handleContinuar = () => {
        if (!nome || !email || !phone || !dataNasc || !sexo || !altura || !peso) {
            Alert.alert("Atenção", "Por favor, preencha todos os campos.");
            return;
        }
        navigation.navigate("CreateParticipantAddress", {
            nome,
            email,
            phone,
            dataNasc,
            sexo,
            altura,
            peso,
        });
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#1F4273" />

            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
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
                                onChangeText={handleEmailChange}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                placeholder="email@exemplo.com"
                                placeholderTextColor="#B0BEC5"
                            />
                        </View>

                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>Telefone</Text>
                            <TextInput
                                style={styles.input}
                                value={phone}
                                onChangeText={handlePhoneChange}
                                keyboardType="numeric"
                                maxLength={15}
                                placeholder="(41) 99999-8888"
                                placeholderTextColor="#B0BEC5"
                            />
                        </View>

                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>Data de Nascimento</Text>
                            <TextInput
                                style={styles.input}
                                value={dataNasc}
                                onChangeText={handleDateChange}
                                keyboardType="numeric"
                                maxLength={10}
                                placeholder="dd/mm/aaaa"
                                placeholderTextColor="#B0BEC5"
                            />
                        </View>

                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>Sexo</Text>
                            <TouchableOpacity
                                style={styles.selectInput}
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
                                style={styles.input}
                                value={altura}
                                onChangeText={handleAlturaChange}
                                keyboardType="numeric"
                                maxLength={3}
                                placeholder="170 (em cm)"
                                placeholderTextColor="#B0BEC5"
                            />
                        </View>

                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>Peso</Text>
                            <TextInput
                                style={styles.input}
                                value={peso}
                                onChangeText={setPeso}
                                placeholder="70kg"
                                placeholderTextColor="#B0BEC5"
                            />
                        </View>

                    </View>

                    {/* Botão Cadastrar */}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={styles.button}
                            activeOpacity={0.8}
                            onPress={handleContinuar}
                        >
                            <Text style={styles.buttonText}>Continuar</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <Modal
                visible={sexoModalOpen}
                transparent
                animationType="fade"
                onRequestClose={() => setSexoModalOpen(false)}
            >
                <Pressable
                    style={styles.modalBackdrop}
                    onPress={() => setSexoModalOpen(false)}
                >
                    <Pressable style={styles.modalCard} onPress={() => null}>
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
        marginTop: 75,
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
        width: 200,
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