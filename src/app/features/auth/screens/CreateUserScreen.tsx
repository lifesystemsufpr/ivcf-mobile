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
    Modal,
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
    const [termsModalVisible, setTermsModalVisible] = useState(false);

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

        createHealthProfessional.create(
            { user: { fullName: nome, email, password: senha, active: true }, speciality },
            {
                onSuccess: () => {
                    Alert.alert("Sucesso", "Responsável criado com sucesso!", [{
                        text: "OK",
                        onPress: () => navigation.goBack()
                    }]);
                },

                onError: (error: any) => {
                    console.log("Erro ao criar responsável:", error);

                    if (error.response?.status === 409) {
                        Alert.alert("Erro", "Usuário já cadastrado.");
                    } else {
                        Alert.alert("Erro", "Ocorreu um erro ao criar o profissional de saúde. Tente novamente.");
                    }
                }
            }
        );
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
                            <Text style={styles.label}>Nome Completo</Text>
                            <TextInput
                                style={styles.input}
                                value={nome}
                                onChangeText={(text) => setNome(text.trim())}
                                placeholder="Seu nome completo"
                                placeholderTextColor="#B0BEC5"
                            />
                        </View>



                        {/* Email */}
                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>E-mail Profissional/Pessoal</Text>
                            <TextInput
                                style={styles.input}
                                value={email}
                                onChangeText={(text) => setEmail(text.trim())}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                placeholder="email@exemplo.com"
                                placeholderTextColor="#B0BEC5"
                            />
                        </View>


                      


                        {/* Especialidade */}
                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>Ocupação / Vínculo</Text>
                            <TextInput
                                style={styles.input}
                                value={speciality}
                                onChangeText={(text) => setSpeciality(text.trim())}
                                placeholder="Ex: Médico, Filho(a), Cuidador, etc."
                                placeholderTextColor="#B0BEC5"
                            />
                        </View>



                        {/* Senha */}
                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>Senha de Acesso</Text>
                            <TextInput
                                style={styles.input}
                                value={senha}
                                onChangeText={(text) => setSenha(text)}
                                secureTextEntry

                                placeholder="Minimo 6 caracteres
                                "
                                placeholderTextColor="#B0BEC5"
                            />
                        </View>

                        {/* Confirmação de Senha */}
                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>Confirmação de Senha</Text>
                            <TextInput
                                style={styles.input}
                                value={confirmSenha}
                                onChangeText={(text) => setConfirmSenha(text)}
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
                        onPress={() => setTermsModalVisible(true)}
                    >
                        <Text style={styles.termsText}>
                            Li e concordo com os{" "}
                            <Text style={styles.termsLink}>Termos de Uso e a Política de Privacidade</Text>
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

                    {/* Modal de Termos de Uso */}
                    <Modal
                        visible={termsModalVisible}
                        transparent
                        animationType="fade"
                        onRequestClose={() => setTermsModalVisible(false)}
                    >
                        <View style={styles.termsModalBackdrop}>
                            <View style={styles.termsModalCard}>
                                <Text style={styles.termsModalTitle}>Termos de Uso</Text>

                                <ScrollView
                                    style={styles.termsModalScroll}
                                    showsVerticalScrollIndicator={true}
                                >
                                    <Text style={styles.termsModalBody}>
                                        Ao utilizar este aplicativo, você concorda com os seguintes termos:{"\n\n"}
                                        1. <Text style={{ fontWeight: "bold" }}>Coleta de Dados:</Text> O aplicativo coleta dados pessoais e de saúde dos participantes exclusivamente para fins de avaliação clínica e funcional.{"\n\n"}
                                        2. <Text style={{ fontWeight: "bold" }}>Privacidade:</Text> Todos os dados coletados são tratados com confidencialidade e em conformidade com a Lei Geral de Proteção de Dados (LGPD).{"\n\n"}
                                        3. <Text style={{ fontWeight: "bold" }}>Uso Profissional:</Text> Este aplicativo é destinado ao uso exclusivo de profissionais de saúde devidamente habilitados.{"\n\n"}
                                        4. <Text style={{ fontWeight: "bold" }}>Responsabilidade:</Text> O profissional é responsável pela veracidade das informações inseridas e pela correta aplicação dos instrumentos de avaliação.{"\n\n"}
                                        5. <Text style={{ fontWeight: "bold" }}>Armazenamento:</Text> Os dados são armazenados de forma segura em servidores protegidos e podem ser excluídos mediante solicitação.{"\n\n"}
                                        Ao aceitar estes termos, você declara estar ciente e de acordo com todas as condições acima descritas.
                                    </Text>
                                </ScrollView>

                                <View style={styles.termsModalButtons}>
                                    <TouchableOpacity
                                        style={styles.termsModalDeclineButton}
                                        activeOpacity={0.8}
                                        onPress={() => {
                                            setTermsAccepted(false);
                                            setTermsModalVisible(false);
                                        }}
                                    >
                                        <Text style={styles.termsModalDeclineText}>Recusar</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.termsModalAcceptButton}
                                        activeOpacity={0.8}
                                        onPress={() => {
                                            setTermsAccepted(true);
                                            setTermsModalVisible(false);
                                        }}
                                    >
                                        <Text style={styles.termsModalAcceptText}>Aceitar</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>

                    {/* Botão Cadastrar */}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={styles.button}
                            activeOpacity={0.8}
                            onPress={handleCadastrar}
                        >
                            <Text style={styles.buttonText}>Finalizar Cadastro</Text>
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
    termsLink: {
        color: "#72AB24",
        fontWeight: "bold",
        textDecorationLine: "underline" as const,
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
    termsModalBackdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        paddingHorizontal: 24,
    },
    termsModalCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 20,
        paddingTop: 24,
        paddingHorizontal: 20,
        paddingBottom: 20,
        maxHeight: "75%",
    },
    termsModalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#1F4273",
        textAlign: "center",
        marginBottom: 16,
    },
    termsModalScroll: {
        marginBottom: 20,
    },
    termsModalBody: {
        fontSize: 14,
        color: "#4A5568",
        lineHeight: 22,
    },
    termsModalButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 12,
    },
    termsModalDeclineButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: "#C5CED8",
        alignItems: "center",
    },
    termsModalDeclineText: {
        color: "#6B7B8D",
        fontSize: 14,
        fontWeight: "600",
    },
    termsModalAcceptButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 25,
        backgroundColor: "#72AB24",
        alignItems: "center",
        elevation: 2,
    },
    termsModalAcceptText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "bold",
    },
});