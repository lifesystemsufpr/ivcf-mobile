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
    ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute, RouteProp, CommonActions } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CreateParticipantStackParamList } from "../navigation/types";
import { useCreateParticipant } from "../hooks/useCreateParticipant";
import type { CreateParticipantPayloadDTO } from "../dto/CreateParticipantDTO";

type AddressScreenRouteProp = RouteProp<CreateParticipantStackParamList, "CreateParticipantAddressForm">;
type NavigationProp = NativeStackNavigationProp<CreateParticipantStackParamList, "CreateParticipantAddressForm">;

export const CreateParticipantAddressScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<AddressScreenRouteProp>();

    const { nome, email, dataNasc, sexo, altura, peso } = route.params || {};
    const createParticipant = useCreateParticipant();
    const insets = useSafeAreaInsets();

    const [cep, setCep] = useState("");
    const [rua, setRua] = useState("");
    const [numero, setNumero] = useState("");
    const [complemento, setComplemento] = useState("");
    const [bairro, setBairro] = useState("");
    const [cidade, setCidade] = useState("");
    const [estado, setEstado] = useState("");

    const [isCepLoading, setIsCepLoading] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [cepDisabledFields, setCepDisabledFields] = useState({
        rua: false,
        bairro: false,
        cidade: false,
        estado: false,
    });

    const getBorderColor = (field: string) => focusedField === field ? "#1F4273" : "#C5CED8";

    const formatCEP = (text: string) => {
        const digits = text.replace(/\D/g, "").slice(0, 8);
        if (digits.length > 5) {
            return digits.slice(0, 5) + "-" + digits.slice(5);
        }
        return digits;
    };

    const handleCepChange = async (text: string) => {
        const formatted = formatCEP(text);
        setCep(formatted);

        const rawCep = formatted.replace(/\D/g, "");
        if (rawCep.length < 8) {
            setCepDisabledFields({ rua: false, bairro: false, cidade: false, estado: false });
        }

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
                    
                    setCepDisabledFields({
                        rua: !!data.logradouro,
                        bairro: !!data.bairro,
                        cidade: !!data.localidade,
                        estado: !!data.uf,
                    });
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

    const parseHeight = (value: string) => {
        const normalized = value.replace(",", ".").trim();
        const parsed = Number(normalized);
        return Number.isFinite(parsed) ? parsed : undefined;
    };

    const parseWeight = (value: string) => {
        const normalized = value.replace(",", ".").replace(/kg/gi, "").trim();
        const parsed = Number(normalized);
        return Number.isFinite(parsed) ? parsed : undefined;
    };

    const parseBirthday = (value: string) => {
        const trimmed = value.trim();
        const ddmmyyyy = /^(\d{2})\/(\d{2})\/(\d{4})$/;
        const yyyymmdd = /^(\d{4})-(\d{2})-(\d{2})$/;

        const m1 = trimmed.match(ddmmyyyy);
        if (m1) {
            const [, dd, mm, yyyy] = m1;
            return `${yyyy}-${mm}-${dd}`;
        }

        const m2 = trimmed.match(yyyymmdd);
        if (m2) {
            return trimmed;
        }

        return undefined;
    };

    const toGenderEnum = (value: string) => {
        const v = value.trim().toLowerCase();
        if (v.startsWith("f")) return "FEMALE";
        if (v.startsWith("m")) return "MALE";
        return undefined;
    };

    const handleEnviar = async () => {
        if (createParticipant.isPending) {
            return;
        }

        if (!cep || !rua || !numero || !bairro || !cidade || !estado) {
            Alert.alert("Atenção", "Por favor, preencha os campos obrigatórios do endereço.");
            return;
        }

        const birthday = parseBirthday(dataNasc);
        const height = parseHeight(altura);
        const weight = parseWeight(peso);
        const gender = toGenderEnum(sexo);
        const socialLevel = "C"; // Placeholder, ajustar conforme necessário
        const scholarship = "HIGHER_EDUCATION_COMPLETE"; // Placeholder, ajustar conforme necessário

        if (!birthday) {
            Alert.alert("Atenção", "Data de nascimento inválida. Use dd/mm/aaaa.");
            return;
        }
        if (!height) {
            Alert.alert("Atenção", "Altura inválida. Ex.: 1,75");
            return;
        }
        if (!weight) {
            Alert.alert("Atenção", "Peso inválido. Ex.: 70");
            return;
        }
        if (!gender) {
            Alert.alert("Atenção", "Sexo inválido. Use Masculino, Feminino ou Outro.");
            return;
        }

        const payload: CreateParticipantPayloadDTO = {
            birthday,
            weight,
            height,
            zipCode: cep,
            street: rua,
            number: numero,
            complement: complemento || "",
            neighborhood: bairro,
            city: cidade,
            state: estado,
            scholarship: scholarship,
            socio_economic_level: socialLevel,
            gender: gender,
            user: {
                fullName: nome,
                email,
                gender,
                active: true,
            },
        };

        try {
            await createParticipant.mutateAsync(payload);
            Alert.alert("Sucesso", "Participante cadastrado com sucesso!");

            // Forcefully clear the input fields locally by resetting the internal stack
            navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [{ name: "CreateParticipantForm" }],
                })
            );

            // Navigate back to the Dashboard
            (navigation as any).navigate("Home");
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error("Erro ao cadastrar participante:", errorMessage);
            Alert.alert("Erro", "Não foi possível cadastrar o participante.");
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <ScrollView
                    automaticallyAdjustKeyboardInsets={true}
                    contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20, paddingBottom: Math.max(insets.bottom + 80, 100) }]}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Títulos */}
                    <Text style={styles.stepTitle}>Etapa 2 de 2</Text>
                    <Text style={styles.title}>Endereço</Text>

                    {/* Campos */}
                    <View style={styles.fieldsContainer}>
                        {/* CEP */}
                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>CEP</Text>
                            <View>
                                <TextInput
                                    style={[styles.input, { borderBottomColor: getBorderColor("cep"), paddingRight: isCepLoading ? 40 : 14 }]}
                                    value={cep}
                                    onChangeText={handleCepChange}
                                    onFocus={() => setFocusedField("cep")}
                                    onBlur={() => setFocusedField(null)}
                                    keyboardType="numeric"
                                    placeholder="00000-000"
                                    placeholderTextColor="#000000"
                                    maxLength={9}
                                />
                                {isCepLoading && (
                                    <View style={{ position: "absolute", right: 14, top: 0, bottom: 0, justifyContent: "center" }}>
                                        <ActivityIndicator size="small" color="#1F4273" />
                                    </View>
                                )}
                            </View>
                        </View>

                        {/* Rua */}
                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>Rua</Text>
                            <TextInput
                                style={[styles.input, cepDisabledFields.rua && styles.disabledInput, { borderBottomColor: getBorderColor("rua") }]}
                                value={rua}
                                onChangeText={setRua}
                                onFocus={() => setFocusedField("rua")}
                                onBlur={() => setFocusedField(null)}
                                placeholder="Nome da rua"
                                placeholderTextColor="#000000"
                                editable={!cepDisabledFields.rua}
                            />
                        </View>

                        {/* Número */}
                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>Número</Text>
                            <TextInput
                                style={[styles.input, { borderBottomColor: getBorderColor("numero") }]}
                                value={numero}
                                onChangeText={setNumero}
                                onFocus={() => setFocusedField("numero")}
                                onBlur={() => setFocusedField(null)}
                                keyboardType="numeric"
                                placeholder="Número"
                                placeholderTextColor="#000000"
                            />
                        </View>

                        {/* Complemento */}
                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>Complemento</Text>
                            <TextInput
                                style={[styles.input, { borderBottomColor: getBorderColor("complemento") }]}
                                value={complemento}
                                onChangeText={setComplemento}
                                onFocus={() => setFocusedField("complemento")}
                                onBlur={() => setFocusedField(null)}
                                placeholder="Complemento (opcional)"
                                placeholderTextColor="#000000"
                            />
                        </View>

                        {/* Bairro e Cidade */}
                        <View style={[styles.row, { flexWrap: "wrap" }]}>
                            <View style={[styles.fieldGroup, { flex: 1, minWidth: 140 }]}>
                                <Text style={styles.label}>Bairro</Text>
                                <TextInput
                                    style={[styles.input, cepDisabledFields.bairro && styles.disabledInput, { borderBottomColor: getBorderColor("bairro") }]}
                                    value={bairro}
                                    onChangeText={setBairro}
                                    onFocus={() => setFocusedField("bairro")}
                                    onBlur={() => setFocusedField(null)}
                                    placeholder="Bairro"
                                    placeholderTextColor="#000000"
                                    editable={!cepDisabledFields.bairro}
                                />
                            </View>
                            <View style={[styles.fieldGroup, { flex: 1, minWidth: 140 }]}>
                                <Text style={styles.label}>Cidade</Text>
                                <TextInput
                                    style={[styles.input, cepDisabledFields.cidade && styles.disabledInput, { borderBottomColor: getBorderColor("cidade") }]}
                                    value={cidade}
                                    onChangeText={setCidade}
                                    onFocus={() => setFocusedField("cidade")}
                                    onBlur={() => setFocusedField(null)}
                                    placeholder="Cidade"
                                    placeholderTextColor="#000000"
                                    editable={!cepDisabledFields.cidade}
                                />
                            </View>
                        </View>

                        {/* Estado */}
                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>Estado</Text>
                            <TextInput
                                style={[styles.input, cepDisabledFields.estado && styles.disabledInput, { borderBottomColor: getBorderColor("estado") }]}
                                value={estado}
                                onChangeText={setEstado}
                                onFocus={() => setFocusedField("estado")}
                                onBlur={() => setFocusedField(null)}
                                placeholder="Estado (UF)"
                                placeholderTextColor="#000000"
                                maxLength={2}
                                autoCapitalize="characters"
                                editable={!cepDisabledFields.estado}
                            />
                        </View>
                    </View>

                    <View style={{ flex: 1, minHeight: 40 }} />

                    {/* Botão Enviar */}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.button, createParticipant.isPending && styles.buttonDisabled]}
                            activeOpacity={0.8}
                            onPress={handleEnviar}
                            disabled={createParticipant.isPending}
                        >
                            {createParticipant.isPending ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text style={styles.buttonText}>Enviar</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
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
        paddingBottom: 40,
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
    row: {
        flexDirection: "row",
        gap: 12,
    },
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
    disabledInput: {
        backgroundColor: "#E0E6ED",
        color: "#888888",
    },
    buttonContainer: {
        alignItems: "center",
        paddingTop: 20,
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
    buttonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "bold",
    },
    buttonDisabled: {
        opacity: 0.7,
    },
});
