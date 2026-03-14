import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    TouchableOpacity,
    ScrollView,
    Animated,
    LayoutAnimation,
    Platform,
    UIManager,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../auth/store/useAuthStore";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Temporary Mock Data for Domain Details
const MOCK_DOMAINS = [
    {
        id: "1",
        name: "Cognição",
        points: 10,
        questions: [
            { q: "1. Pergunta sobre memória recente?", a: "Sim", score: 5 },
            { q: "2. Pergunta sobre memória recente?", a: "Não", score: 0 },
        ],
    },
    { id: "2", name: "Humor", points: 5, questions: [] },
    { id: "3", name: "Mobilidade", points: 15, questions: [] },
    { id: "4", name: "Comunicação", points: 5, questions: [] },
    { id: "5", name: "Comorbidades", points: 5, questions: [] },
];

const AccordionItem = ({ domain }: { domain: any }) => {
    const [expanded, setExpanded] = useState(false);

    const toggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded(!expanded);
    };

    return (
        <View style={styles.accordionContainer}>
            <TouchableOpacity
                style={styles.accordionHeader}
                onPress={toggleExpand}
                activeOpacity={0.7}
            >
                <Text style={styles.accordionTitle}>
                    {domain.name} ({domain.points} pontos)
                </Text>
                <Ionicons
                    name={expanded ? "caret-up" : "caret-down"}
                    size={16}
                    color="#1F4273"
                />
            </TouchableOpacity>
            {expanded && (
                <View style={styles.accordionContent}>
                    {domain.questions.length > 0 ? (
                        domain.questions.map((q: any, idx: number) => (
                            <View key={idx} style={styles.questionBlock}>
                                <Text style={styles.questionText}>{q.q}</Text>
                                <Text style={styles.answerText}>
                                    Resposta: {q.a} ({q.score} pontos)
                                </Text>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.questionText}>Sem detalhes registrados.</Text>
                    )}
                </View>
            )}
        </View>
    );
};

export const HistoryDetailScreen = ({ navigation, route }: any) => {
    const user = useAuthStore((state) => state.user);
    const { participant, history } = route.params || {};

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1F4273" />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <View style={styles.avatar}>
                        <Ionicons name="person-outline" size={28} color="#1F4273" />
                    </View>
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.headerRole}>Responsável</Text>
                        <Text style={styles.headerName}>{user?.name ?? "Usuário"}</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.menuButton}>
                    <Ionicons name="menu" size={28} color="#FFFFFF" />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollArea}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Patient Summary Card */}
                <View style={styles.infoCard}>
                    <Text style={styles.patientName}>{participant?.fullName ?? "Nome completo"}</Text>
                    <View style={styles.dateRow}>
                        <Text style={styles.dateText}>Data: {history?.date ?? "20/01/2026"}</Text>
                        <Text style={styles.dateText}>Hora: 10:15</Text>
                    </View>
                </View>

                {/* Total Score Card */}
                <View style={styles.scoreCard}>
                    <View style={styles.scoreHeader}>
                        <Text style={[styles.scoreTitle, { color: history?.color ?? "#8BC34A" }]}>
                            Pontuação Total: {history?.score ?? 40}
                        </Text>
                        <View style={[styles.badge, { backgroundColor: history?.color ?? "#8BC34A" }]}>
                            <Ionicons name="checkmark-circle" size={12} color="#FFF" style={{ marginRight: 4 }} />
                            <Text style={styles.badgeText}>{history?.category ?? "Robusto"}</Text>
                        </View>
                    </View>
                    <Text style={styles.scoreDesc}>
                        Indica baixa vulnerabilidade clínico-funcional.
                        Acompanhamento anual recomendado.
                    </Text>
                </View>

                <Text style={styles.sectionTitle}>Detalhamento por Domínio</Text>

                {/* Accordions */}
                {MOCK_DOMAINS.map((domain) => (
                    <AccordionItem key={domain.id} domain={domain} />
                ))}
            </ScrollView>


        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F6FA",
    },
    // Header
    header: {
        backgroundColor: "#1F4273",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingTop: 48,
        paddingBottom: 16,
        paddingHorizontal: 20,
    },
    headerLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#E0E0E0",
        alignItems: "center",
        justifyContent: "center",
    },
    headerTextContainer: {
        marginLeft: 12,
        flex: 1,
    },
    headerRole: {
        color: "#FFFFFF",
        fontSize: 12,
        opacity: 0.85,
    },
    headerName: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "bold",
    },
    menuButton: {
        padding: 4,
    },

    scrollArea: {
        flex: 1,
    },
    scrollContent: {
        padding: 24,
        paddingBottom: 40,
    },

    // Patient Info 
    infoCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    patientName: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#1F4273",
        marginBottom: 8,
    },
    dateRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    dateText: {
        fontSize: 14,
        color: "#1F4273",
        fontWeight: "bold",
        marginRight: 16,
    },

    // Score Card
    scoreCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#8BC34A",
        padding: 16,
        marginBottom: 24,
    },
    scoreHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
        flexWrap: "wrap",
    },
    scoreTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginRight: 8,
    },
    badge: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        color: "#FFFFFF",
        fontSize: 12,
        fontWeight: "bold",
    },
    scoreDesc: {
        fontSize: 12,
        color: "#4A4A4A",
        lineHeight: 18,
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#1F4273",
        marginBottom: 16,
    },

    // Accordion
    accordionContainer: {
        backgroundColor: "#FFFFFF",
        borderRadius: 8,
        marginBottom: 12,
        elevation: 1,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        overflow: "hidden",
    },
    accordionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
    },
    accordionTitle: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#1F4273",
    },
    accordionContent: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    questionBlock: {
        marginTop: 8,
    },
    questionText: {
        fontSize: 13,
        color: "#1F4273",
        marginBottom: 4,
    },
    answerText: {
        fontSize: 13,
        fontWeight: "bold",
        color: "#1F4273",
    },

    // Footer
    footer: {
        paddingHorizontal: 24,
        paddingBottom: 32,
        paddingTop: 16,
        backgroundColor: "#F5F6FA",
        alignItems: "center",
    },
    printButton: {
        backgroundColor: "#8BC34A",
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 8,
        width: "100%",
        alignItems: "center",
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    printButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "bold",
    },
});
