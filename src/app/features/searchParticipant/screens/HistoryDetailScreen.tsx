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

// Helper to group domains based on question content
const getDomainForQuestion = (statement: string) => {
    const s = statement.toLowerCase();
    if (s.includes("idade")) return "Idade";
    if (s.includes("saúde é")) return "Autopercepção da Saúde";
    if (s.includes("compras") || s.includes("dinheiro") || s.includes("trabalhos domésticos") || s.includes("banho sozinho")) return "AVD (Atividades de Vida Diária)";
    if (s.includes("esquecido") || s.includes("esquecimento")) return "Cognição";
    if (s.includes("desânimo") || s.includes("perdeu o interesse")) return "Humor";
    if (s.includes("braços") || s.includes("pequenos objetos") || s.includes("quatro condições") || s.includes("caminhar") || s.includes("quedas") || s.includes("urina ou fezes")) return "Mobilidade";
    if (s.includes("visão") || s.includes("audição")) return "Comunicação";
    if (s.includes("três condições")) return "Comorbidades Múltiplas";
    return "Outros";
};

const processHistoryToDomains = (answers: any[]) => {
    if (!answers) return [];

    const domainsMap: Record<string, { id: string; name: string; points: number; questions: any[] }> = {};

    answers.forEach((ans) => {
        const domainName = getDomainForQuestion(ans.question.statement);
        if (!domainsMap[domainName]) {
            domainsMap[domainName] = {
                id: domainName,
                name: domainName,
                points: 0,
                questions: [],
            };
        }

        domainsMap[domainName].points += ans.selectedOption.score;
        domainsMap[domainName].questions.push({
            q: ans.question.statement,
            a: ans.selectedOption.label,
            score: ans.selectedOption.score,
        });
    });

    return Object.values(domainsMap);
};

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

    const domains = React.useMemo(() => {
        if (!history || !history.answers) return [];
        return processHistoryToDomains(history.answers);
    }, [history]);

    const formatBirthday = (dateString?: string) => {
        if (!dateString) return "--/--/----";
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString; 
            return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' }); 
        } catch {
            return dateString;
        }
    };
    
    const formatTime = (dateString?: string) => {
        if (!dateString) return "--:--";
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return "--:--"; 
            return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute:'2-digit' }); 
        } catch {
            return "--:--";
        }
    };

    const color = history?.classification === "Robusto" ? "#8BC34A" : history?.classification === "Pré-Frágil" ? "#FFA726" : "#FF4B4B";

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
                        <Text style={styles.dateText}>Data: {formatBirthday(history?.date)}</Text>
                        <Text style={styles.dateText}>Hora: {formatTime(history?.date)}</Text>
                    </View>
                </View>

                {/* Total Score Card */}
                <View style={[styles.scoreCard, { borderColor: color }]}>
                    <View style={styles.scoreHeader}>
                        <Text style={[styles.scoreTitle, { color }]}>
                            Pontuação Total: {history?.totalScore ?? 0}
                        </Text>
                        <View style={[styles.badge, { backgroundColor: color }]}>
                            <Ionicons name="checkmark-circle" size={12} color="#FFF" style={{ marginRight: 4 }} />
                            <Text style={styles.badgeText}>{history?.classification ?? "N/A"}</Text>
                        </View>
                    </View>
                    <Text style={styles.scoreDesc}>
                        Acompanhamento recomendado de acordo com a classificação clínico-funcional.
                    </Text>
                </View>

                <Text style={styles.sectionTitle}>Detalhamento por Domínio</Text>

                {/* Accordions */}
                {domains.map((domain) => (
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
