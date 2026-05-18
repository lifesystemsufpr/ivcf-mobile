import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Modal,
    Pressable,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { createParticipantApi } from "../api/createParticipantApi";
import { useCreateParticipant } from "../hooks/useCreateParticipant";
import type { CreateParticipantPayloadDTO } from "../dto/CreateParticipantDTO";

interface CreateParticipantModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const CreateParticipantModal = ({ visible, onClose, onSuccess }: CreateParticipantModalProps) => {
    const insets = useSafeAreaInsets();
    const createParticipant = useCreateParticipant();

    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [participantExistsModal, setParticipantExistsModal] = useState(false);
    const [existingParticipantId, setExistingParticipantId] = useState<string | null>(null);
    const [isLinking, setIsLinking] = useState(false);

    // Step 1 Data
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [dataNasc, setDataNasc] = useState("");
    const [sexo, setSexo] = useState("");
    const [sexoModalOpen, setSexoModalOpen] = useState(false);
    const [altura, setAltura] = useState("");
    const [peso, setPeso] = useState("");

    // Step 2 Data
    const [cep, setCep] = useState("");
    const [rua, setRua] = useState("");
    const [numero, setNumero] = useState("");
    const [complemento, setComplemento] = useState("");
    const [bairro, setBairro] = useState("");
    const [cidade, setCidade] = useState("");
    const [estado, setEstado] = useState("");
    const [isCepLoading, setIsCepLoading] = useState(false);
    const [cepDisabledFields, setCepDisabledFields] = useState({
        rua: false,
        bairro: false,
        cidade: false,
        estado: false,
    });

    useEffect(() => {
        if (!visible) {
            // Reset state when modal closes
            setStep(1);
            setNome("");
            setEmail("");
            setDataNasc("");
            setSexo("");
            setAltura("");
            setPeso("");
            setCep("");
            setRua("");
            setNumero("");
            setComplemento("");
            setBairro("");
            setCidade("");
            setEstado("");
            setFocusedField(null);
        }
    }, [visible]);

    const getBorderColor = (field: string) => focusedField === field ? "#1F4273" : "#C5CED8";

    // Step 1 Handlers
    const handleEmailChange = (text: string) => setEmail(text.trim().toLowerCase());
    const handleDateChange = (text: string) => {
        let raw = text.replace(/\D/g, "");
        if (raw.length > 8) raw = raw.slice(0, 8);
        let formatted = raw;
        if (raw.length > 2) formatted = `${raw.slice(0, 2)}/${raw.slice(2)}`;
        if (raw.length > 4) formatted = `${raw.slice(0, 2)}/${raw.slice(2, 4)}/${raw.slice(4)}`;
        setDataNasc(formatted);
    };
    const handleAlturaChange = (text: string) => {
        let raw = text.replace(/\D/g, "");
        if (raw.length > 3) raw = raw.slice(0, 3);
        setAltura(raw);
    };

    const handleNextStep = async () => {
        if (!nome || !email || !dataNasc || !sexo || !altura || !peso) {
            Alert.alert("Atenção", "Por favor, preencha todos os campos.");
            return;
        }

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
        if (dateObj.getFullYear() !== year || dateObj.getMonth() !== month - 1 || dateObj.getDate() !== day) {
            Alert.alert("Atenção", "Data de nascimento inválida (dia ou mês incorretos).");
            return;
        }

        if (dateObj > new Date()) {
            Alert.alert("Atenção", "A data de nascimento não pode ser no futuro.");
            return;
        }

        const today = new Date();
        let age = today.getFullYear() - dateObj.getFullYear();
        const m = today.getMonth() - dateObj.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dateObj.getDate())) age--;

        if (age < 60) {
            Alert.alert("Atenção", "O participante deve ter 60 anos ou mais.");
            return;
        }

        setIsLoading(true);
        try {
            const response = await createParticipantApi.checkEmail(email);
            // 200 — participante já existe
            const data = response?.data;
            console.log("[checkEmail] 200 response data:", JSON.stringify(data));
            const participantId = data?.id ?? data?.participantId ?? data?.participant?.id ?? null;
            setExistingParticipantId(participantId);
            setParticipantExistsModal(true);
        } catch (error: any) {
            if (error?.response?.status === 404) {
                setStep(2);
            } else if (error?.response?.status === 409) {
                const data = error.response?.data;
                console.log("[checkEmail] 409 response data:", JSON.stringify(data));
                const participantId = data?.id ?? data?.participantId ?? data?.participant?.id ?? null;
                setExistingParticipantId(participantId);
                setParticipantExistsModal(true);
            } else {
                console.error("Erro ao verificar email:", error);
                Alert.alert("Erro", "Não foi possível verificar o e-mail. Tente novamente.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleLinkParticipant = async () => {
        setIsLinking(true);
        try {
            await createParticipantApi.linkParticipant(existingParticipantId ?? "");
            setParticipantExistsModal(false);
            Alert.alert("Sucesso", "Participante vinculado com sucesso!", [
                { text: "OK", onPress: onSuccess },
            ]);
        } catch (error: any) {
            console.error("Erro ao vincular participante:", error);
            Alert.alert("Erro", "Não foi possível vincular o participante. Tente novamente.");
        } finally {
            setIsLinking(false);
        }
    };

    // Step 2 Handlers
    const formatCEP = (text: string) => {
        const digits = text.replace(/\D/g, "").slice(0, 8);
        if (digits.length > 5) return digits.slice(0, 5) + "-" + digits.slice(5);
        return digits;
    };

    const handleCepChange = async (text: string) => {
        const formatted = formatCEP(text);
        setCep(formatted);
        const rawCep = formatted.replace(/\D/g, "");
        if (rawCep.length < 8) setCepDisabledFields({ rua: false, bairro: false, cidade: false, estado: false });
        if (rawCep.length === 8) {
            setIsCepLoading(true);
            try {
                const response = await fetch(`https://viacep.com.br/ws/${rawCep}/json/`);
                const data = await response.json();
                if (!data.erro) {
                    setRua(data.logradouro || "");
                    setBairro(data.bairro || "");
                    setCidade(data.localidade || "");
                    setEstado(data.uf || "");
                    setCepDisabledFields({ rua: !!data.logradouro, bairro: !!data.bairro, cidade: !!data.localidade, estado: !!data.uf });
                } else {
                    Alert.alert("Atenção", "CEP não encontrado.");
                    setCepDisabledFields({ rua: false, bairro: false, cidade: false, estado: false });
                }
            } catch (error) {
                console.error("Erro ao buscar CEP:", error);
                Alert.alert("Erro", "Falha ao buscar endereço.");
                setCepDisabledFields({ rua: false, bairro: false, cidade: false, estado: false });
            } finally {
                setIsCepLoading(false);
            }
        }
    };

    const handleFinish = async () => {
        if (createParticipant.isPending) return;
        if (!cep || !rua || !numero || !bairro || !cidade || !estado) {
            Alert.alert("Atenção", "Por favor, preencha os campos obrigatórios do endereço.");
            return;
        }

        const parseBirthday = (value: string) => {
            const trimmed = value.trim();
            const ddmmyyyy = /^(\d{2})\/(\d{2})\/(\d{4})$/;
            const match = trimmed.match(ddmmyyyy);
            if (match) return `${match[3]}-${match[2]}-${match[1]}`;
            return undefined;
        };
        const toGenderEnum = (value: string) => {
            const v = value.trim().toLowerCase();
            if (v.startsWith("f")) return "FEMALE";
            if (v.startsWith("m")) return "MALE";
            return undefined;
        };

        const birthday = parseBirthday(dataNasc);
        const gender = toGenderEnum(sexo);
        const heightNum = Number(altura);
        const weightNum = Number(peso);

        if (!birthday || !gender || isNaN(heightNum) || isNaN(weightNum)) {
            Alert.alert("Erro", "Dados inválidos.");
            return;
        }

        const payload: CreateParticipantPayloadDTO = {
            birthday,
            weight: weightNum,
            height: heightNum,
            zipCode: cep,
            street: rua,
            number: numero,
            complement: complemento || "",
            neighborhood: bairro,
            city: cidade,
            state: estado,
            scholarship: "HIGHER_EDUCATION_COMPLETE",
            socio_economic_level: "C",
            gender: gender,
            user: { fullName: nome, email, gender, active: true },
        };

        try {
            await createParticipant.mutateAsync(payload);
            Alert.alert("Sucesso", "Participante cadastrado com sucesso!");
            onSuccess();
        } catch (error) {
            console.error("Erro ao cadastrar participante:", error);
            Alert.alert("Erro", "Não foi possível cadastrar o participante.");
        }
    };

    const renderStep1 = () => (
        <View style={styles.fieldsContainer}>
            <View style={styles.fieldGroup}>
                <Text style={styles.label}>Nome</Text>
                <TextInput
                    style={[styles.input, { borderBottomColor: getBorderColor("nome") }]}
                    value={nome}
                    onChangeText={setNome}
                    onFocus={() => setFocusedField("nome")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Nome completo"
                    placeholderTextColor="#000000"
                />
            </View>
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
                    placeholderTextColor="#000000"
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
                    placeholderTextColor="#000000"
                />
            </View>
            <View style={styles.fieldGroup}>
                <Text style={styles.label}>Gênero</Text>
                <TouchableOpacity
                    style={[styles.selectInput, { borderBottomColor: sexoModalOpen ? "#1F4273" : "#C5CED8" }]}
                    onPress={() => setSexoModalOpen(true)}
                >
                    <Text style={[styles.selectText, !sexo && styles.selectPlaceholder]}>{sexo || "Selecione"}</Text>
                    <Text style={styles.selectChevron}>▾</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.row}>
                <View style={[styles.fieldGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Altura (cm)</Text>
                    <TextInput
                        style={[styles.input, { borderBottomColor: getBorderColor("altura") }]}
                        value={altura}
                        onChangeText={handleAlturaChange}
                        onFocus={() => setFocusedField("altura")}
                        onBlur={() => setFocusedField(null)}
                        keyboardType="numeric"
                        maxLength={3}
                        placeholder="170"
                        placeholderTextColor="#000000"
                    />
                </View>
                <View style={[styles.fieldGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Peso (kg)</Text>
                    <TextInput
                        style={[styles.input, { borderBottomColor: getBorderColor("peso") }]}
                        value={peso}
                        onChangeText={setPeso}
                        onFocus={() => setFocusedField("peso")}
                        onBlur={() => setFocusedField(null)}
                        keyboardType="numeric"
                        maxLength={3}
                        placeholder="70"
                        placeholderTextColor="#000000"
                    />
                </View>
            </View>
            <TouchableOpacity style={styles.primaryButton} onPress={handleNextStep} disabled={isLoading}>
                {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Próximo</Text>}
            </TouchableOpacity>
        </View>
    );

    const renderStep2 = () => (
        <View style={styles.fieldsContainer}>
            <View style={styles.fieldGroup}>
                <Text style={styles.label}>CEP</Text>
                <View>
                    <TextInput
                        style={[styles.input, { borderBottomColor: getBorderColor("cep") }]}
                        value={cep}
                        onChangeText={handleCepChange}
                        onFocus={() => setFocusedField("cep")}
                        onBlur={() => setFocusedField(null)}
                        keyboardType="numeric"
                        maxLength={9}
                        placeholder="00000-000"
                        placeholderTextColor="#000000"
                    />
                    {isCepLoading && <ActivityIndicator style={styles.innerLoader} size="small" color="#1F4273" />}
                </View>
            </View>
            <View style={styles.fieldGroup}>
                <Text style={styles.label}>Rua</Text>
                <TextInput
                    style={[styles.input, cepDisabledFields.rua && styles.disabledInput, { borderBottomColor: getBorderColor("rua") }]}
                    value={rua}
                    onChangeText={setRua}
                    editable={!cepDisabledFields.rua}
                    placeholder="Nome da rua"
                    placeholderTextColor="#000000"
                />
            </View>
            <View style={styles.row}>
                <View style={[styles.fieldGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Número</Text>
                    <TextInput
                        style={[styles.input, { borderBottomColor: getBorderColor("numero") }]}
                        value={numero}
                        onChangeText={setNumero}
                        keyboardType="numeric"
                        placeholder="123"
                        placeholderTextColor="#000000"
                    />
                </View>
                <View style={[styles.fieldGroup, { flex: 2 }]}>
                    <Text style={styles.label}>Complemento</Text>
                    <TextInput
                        style={[styles.input, { borderBottomColor: getBorderColor("complemento") }]}
                        value={complemento}
                        onChangeText={setComplemento}
                        placeholder="Opcional"
                        placeholderTextColor="#000000"
                    />
                </View>
            </View>
            <View style={styles.row}>
                <View style={[styles.fieldGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Bairro</Text>
                    <TextInput
                        style={[styles.input, cepDisabledFields.bairro && styles.disabledInput, { borderBottomColor: getBorderColor("bairro") }]}
                        value={bairro}
                        onChangeText={setBairro}
                        editable={!cepDisabledFields.bairro}
                        placeholder="Bairro"
                        placeholderTextColor="#000000"
                    />
                </View>
                <View style={[styles.fieldGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Cidade</Text>
                    <TextInput
                        style={[styles.input, cepDisabledFields.cidade && styles.disabledInput, { borderBottomColor: getBorderColor("cidade") }]}
                        value={cidade}
                        onChangeText={setCidade}
                        editable={!cepDisabledFields.cidade}
                        placeholder="Cidade"
                        placeholderTextColor="#000000"
                    />
                </View>
            </View>
            <View style={styles.fieldGroup}>
                <Text style={styles.label}>Estado (UF)</Text>
                <TextInput
                    style={[styles.input, cepDisabledFields.estado && styles.disabledInput, { borderBottomColor: getBorderColor("estado") }]}
                    value={estado}
                    onChangeText={setEstado}
                    editable={!cepDisabledFields.estado}
                    maxLength={2}
                    autoCapitalize="characters"
                    placeholder="PR"
                    placeholderTextColor="#000000"
                />
            </View>
            <View style={styles.row}>
                <TouchableOpacity style={[styles.secondaryButton, { flex: 1 }]} onPress={() => setStep(1)}>
                    <Text style={styles.secondaryButtonText}>Voltar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.primaryButton, { flex: 2 }]} onPress={handleFinish} disabled={createParticipant.isPending}>
                    {createParticipant.isPending ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Finalizar</Text>}
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
                <View style={[styles.modalContent, { paddingBottom: insets.bottom + 20 }]}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Novo Participante</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color="#1F4273" />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.progressContainer}>
                        <View style={[styles.progressBar, { width: step === 1 ? "50%" : "100%" }]} />
                    </View>
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                        <Text style={styles.stepIndicator}>Passo {step} de 2</Text>
                        {step === 1 ? renderStep1() : renderStep2()}
                    </ScrollView>
                </View>

                {/* Modal — Participante já cadastrado */}
                <Modal
                    visible={participantExistsModal}
                    transparent
                    animationType="slide"
                    onRequestClose={() => setParticipantExistsModal(false)}
                >
                    <Pressable
                        style={styles.linkModalBackdrop}
                        onPress={() => setParticipantExistsModal(false)}
                    >
                        <Pressable style={styles.linkModalCard} onPress={(e) => e.stopPropagation()}>
                            <Text style={styles.linkModalTitle}>Participante já cadastrado</Text>
                            <Text style={styles.linkModalDescription}>
                                Já existe um participante cadastrado com este e-mail. Deseja vinculá-lo ao seu perfil?
                            </Text>

                            <TouchableOpacity
                                style={[styles.linkButton, isLinking && styles.linkButtonDisabled]}
                                activeOpacity={0.8}
                                onPress={handleLinkParticipant}
                                disabled={isLinking}
                            >
                                {isLinking ? (
                                    <ActivityIndicator color="#FFFFFF" />
                                ) : (
                                    <Text style={styles.linkButtonText}>Vincular participante</Text>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.linkModalCancel}
                                activeOpacity={0.8}
                                onPress={() => setParticipantExistsModal(false)}
                            >
                                <Text style={styles.linkModalCancelText}>Usar outro e-mail</Text>
                            </TouchableOpacity>
                        </Pressable>
                    </Pressable>
                </Modal>

                {/* Gender Picker Modal */}
                <Modal visible={sexoModalOpen} transparent animationType="fade">
                    <Pressable style={styles.pickerOverlay} onPress={() => setSexoModalOpen(false)}>
                        <View style={styles.pickerContent}>
                            <Text style={styles.pickerTitle}>Selecione o Gênero</Text>
                            <TouchableOpacity style={styles.pickerOption} onPress={() => { setSexo("Feminino"); setSexoModalOpen(false); }}>
                                <Text style={styles.pickerOptionText}>Feminino</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.pickerOption} onPress={() => { setSexo("Masculino"); setSexoModalOpen(false); }}>
                                <Text style={styles.pickerOptionText}>Masculino</Text>
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                </Modal>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    modalContent: {
        backgroundColor: "#FFF",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: "90%",
    },
    modalHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#1F4273",
    },
    closeButton: {
        padding: 4,
    },
    progressContainer: {
        height: 4,
        backgroundColor: "#E0E0E0",
        width: "100%",
    },
    progressBar: {
        height: "100%",
        backgroundColor: "#72AB24",
    },
    scrollContent: {
        padding: 24,
    },
    stepIndicator: {
        fontSize: 14,
        color: "#6B7B8D",
        marginBottom: 16,
        textAlign: "center",
    },
    fieldsContainer: {
        gap: 16,
    },
    fieldGroup: {
        marginBottom: 8,
    },
    label: {
        fontSize: 12,
        color: "#6B7B8D",
        marginBottom: 4,
        fontWeight: "600",
    },
    input: {
        backgroundColor: "#EDF1F7",
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 15,
        color: "#333",
        borderBottomWidth: 2,
        borderBottomColor: "#C5CED8",
    },
    disabledInput: {
        backgroundColor: "#E0E6ED",
        color: "#888",
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
        color: "#333",
    },
    selectPlaceholder: {
        color: "#000000",
    },
    selectChevron: {
        fontSize: 16,
        color: "#6B7B8D",
    },
    row: {
        flexDirection: "row",
        gap: 12,
    },
    primaryButton: {
        backgroundColor: "#72AB24",
        borderRadius: 24,
        paddingVertical: 14,
        alignItems: "center",
        marginTop: 16,
    },
    secondaryButton: {
        backgroundColor: "#FFF",
        borderRadius: 24,
        paddingVertical: 14,
        alignItems: "center",
        marginTop: 16,
        borderWidth: 1,
        borderColor: "#C5CED8",
    },
    buttonText: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "bold",
    },
    secondaryButtonText: {
        color: "#6B7B8D",
        fontSize: 16,
        fontWeight: "bold",
    },
    innerLoader: {
        position: "absolute",
        right: 14,
        top: 12,
    },
    pickerOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.3)",
        justifyContent: "center",
        alignItems: "center",
    },
    pickerContent: {
        backgroundColor: "#FFF",
        borderRadius: 16,
        width: "80%",
        padding: 20,
    },
    pickerTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#1F4273",
        marginBottom: 16,
        textAlign: "center",
    },
    pickerOption: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#EEE",
    },
    pickerOptionText: {
        fontSize: 16,
        color: "#333",
        textAlign: "center",
    },
    // Modal — vincular participante
    linkModalBackdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.35)",
        justifyContent: "flex-end",
    },
    linkModalCard: {
        backgroundColor: "#FFFFFF",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 24,
        paddingBottom: 40,
        paddingHorizontal: 24,
    },
    linkModalTitle: {
        fontSize: 17,
        fontWeight: "700",
        color: "#1F4273",
        marginBottom: 10,
        textAlign: "center",
    },
    linkModalDescription: {
        fontSize: 14,
        color: "#6B7B8D",
        textAlign: "center",
        marginBottom: 24,
        lineHeight: 20,
    },
    linkButton: {
        backgroundColor: "#72AB24",
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
        marginBottom: 10,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    linkButtonDisabled: {
        opacity: 0.7,
    },
    linkButtonText: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "700",
    },
    linkModalCancel: {
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#C5CED8",
        alignItems: "center",
        marginTop: 4,
    },
    linkModalCancelText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#6B7B8D",
    },
});
