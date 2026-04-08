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
    Modal,
    Pressable,
    SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../auth/store/useAuthStore";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Helper to group domains based on question content
const getDomainForQuestion = (statement?: string) => {
    if (!statement) return "Outros";
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
        const domainName = getDomainForQuestion(ans?.question?.statement);
        if (!domainsMap[domainName]) {
            domainsMap[domainName] = {
                id: domainName,
                name: domainName,
                points: 0,
                questions: [],
            };
        }

        const score = ans?.selectedOption?.score ?? 0;
        const label = ans?.selectedOption?.label ?? "Não respondido";

        domainsMap[domainName].points += score;
        domainsMap[domainName].questions.push({
            q: ans?.question?.statement ?? "Pergunta não especificada",
            a: label,
            score: score,
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
    const logout = useAuthStore((state) => state.logout);
    const { participant, history } = route.params || {};

    const [menuVisible, setMenuVisible] = useState(false);

    const handleLogout = () => {
        setMenuVisible(false);
        logout();
    };

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

    const color = history?.classification === "Robusto" ? "#72AB24" : history?.classification === "Pré-Frágil" ? "#FFA726" : "#FF4B4B";

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1F4273" />

            {/* Header */}
            <SafeAreaView style={{ backgroundColor: "#1F4273", zIndex: 10 }}>
                <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity
                        style={{ marginRight: 16 }}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
                    </TouchableOpacity>
                    <View style={styles.avatar}>
                        <Ionicons name="person-outline" size={28} color="#1F4273" />
                    </View>
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.headerRole}>Responsável</Text>
                        <Text style={styles.headerName}>{user?.name ?? "Usuário"}</Text>
                    </View>
                </View>
                <TouchableOpacity
                    style={styles.menuButton}
                    onPress={() => setMenuVisible(true)}
                >
                    <Ionicons name="menu" size={28} color="#FFFFFF" />
                </TouchableOpacity>
                </View>
            </SafeAreaView>

            {/* Dropdown Menu */}
            <Modal
                visible={menuVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setMenuVisible(false)}
            >
                <Pressable
                    style={styles.menuOverlay}
                    onPress={() => setMenuVisible(false)}
                >
                    <View style={styles.menuDropdown}>
                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => {
                                setMenuVisible(false);
                                navigation.navigate("Add", {
                                    screen: "SearchParticipant",
                                    params: { fromMenu: true },
                                });
                            }}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="search" size={20} color="#1F4273" />
                            <Text style={[styles.menuItemText, { color: "#1F4273" }]}>Pesquisar participante</Text>
                        </TouchableOpacity>

                        <View style={{ height: 1, backgroundColor: "#E0E0E0", width: "100%" }} />

                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={handleLogout}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="log-out-outline" size={20} color="#F44336" />
                            <Text style={styles.menuItemText}>Sair</Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Modal>

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
        paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 24) + 16 : 16,
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
    menuOverlay: {
        flex: 1,
    },
    menuDropdown: {
        position: "absolute",
        top: Platform.OS === "android" ? (StatusBar.currentHeight || 24) + 60 : 60,
        right: 20,
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        paddingVertical: 8,
        paddingHorizontal: 4,
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        minWidth: 150,
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 16,
        gap: 10,
    },
    menuItemText: {
        fontSize: 15,
        fontWeight: "500",
        color: "#F44336",
    },

    scrollArea: {
        flex: 1,
    },
    scrollContent: {
        padding: 24,
        paddingBottom: 120, // increased padding to clear any floating tab bar
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
        flexWrap: "wrap",
        rowGap: 4,
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
        borderColor: "#72AB24",
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
        flex: 1,
        marginRight: 8,
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
});
