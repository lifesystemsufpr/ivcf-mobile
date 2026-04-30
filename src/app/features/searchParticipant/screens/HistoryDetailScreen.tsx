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

const getDomainAndSubdomainForQuestion = (statement?: string) => {
    if (!statement) return { domain: "Outros", subdomain: "Outros", order: 99 };
    const s = statement.toLowerCase().trim();

    const match = s.match(/^(\d+)[\.\-\)]?\s*/);
    const qNum = match ? parseInt(match[1], 10) : null;

    if (qNum === 1 || (s.match(/\bidade\b/) && !s.includes("comparando")))
        return { domain: "Idade", subdomain: "Idade", order: 1 };

    if (qNum === 2 || s.includes("avalia") || (s.match(/\bsaúde\b/) && s.includes("comparando")))
        return { domain: "Auto-percepção da Saúde", subdomain: "Auto-percepção da Saúde", order: 2 };

    if (qNum === 3 || s.includes("compras"))
        return { domain: "Atividade de Vida Diária (AVD)", subdomain: "AVD INSTRUMENTAL", order: 3 };
    if (qNum === 4 || s.includes("dinheiro") || s.includes("pagar as contas"))
        return { domain: "Atividade de Vida Diária (AVD)", subdomain: "AVD INSTRUMENTAL", order: 3 };
    if (qNum === 5 || s.includes("trabalhos domésticos") || s.includes("louça"))
        return { domain: "Atividade de Vida Diária (AVD)", subdomain: "AVD INSTRUMENTAL", order: 3 };
    if (qNum === 6 || s.includes("banho sozinho"))
        return { domain: "Atividade de Vida Diária (AVD)", subdomain: "AVD BÁSICA", order: 3 };

    if (qNum === 7 || (s.includes("esquecido") && !s.includes("piorando") && !s.includes("impedindo")))
        return { domain: "Cognição", subdomain: "Cognição", order: 4 };
    if (qNum === 8 || s.includes("piorando"))
        return { domain: "Cognição", subdomain: "Cognição", order: 4 };
    if (qNum === 9 || (s.includes("esquecimento") && s.includes("impedindo")))
        return { domain: "Cognição", subdomain: "Cognição", order: 4 };

    if (qNum === 10 || s.includes("desânimo") || s.includes("tristeza"))
        return { domain: "Humor", subdomain: "Humor", order: 5 };
    if (qNum === 11 || s.includes("perdeu o interesse") || s.includes("prazer"))
        return { domain: "Humor", subdomain: "Humor", order: 5 };

    if (qNum === 12 || s.includes("elevar os braços"))
        return { domain: "Mobilidade", subdomain: "ALCANCE, PREENSÃO E PINÇA", order: 6 };
    if (qNum === 13 || s.includes("pequenos objetos") || s.includes("manusear"))
        return { domain: "Mobilidade", subdomain: "ALCANCE, PREENSÃO E PINÇA", order: 6 };
    if (qNum === 14 || (s.includes("quatro condições") && !s.includes("três condições")))
        return { domain: "Mobilidade", subdomain: "CAPACIDADE AERÓBICA E/OU MUSCULAR", order: 6 };
    if (qNum === 15 || s.includes("dificuldade para caminhar"))
        return { domain: "Mobilidade", subdomain: "MARCHA", order: 6 };
    if (qNum === 16 || s.includes("quedas"))
        return { domain: "Mobilidade", subdomain: "MARCHA", order: 6 };
    if (qNum === 17 || s.includes("urina ou fezes"))
        return { domain: "Mobilidade", subdomain: "CONTINÊNCIA ESFINCTERIANA", order: 6 };

    if (qNum === 18 || s.includes("visão"))
        return { domain: "Comunicação", subdomain: "VISÃO", order: 7 };
    if (qNum === 19 || s.includes("audição"))
        return { domain: "Comunicação", subdomain: "AUDIÇÃO", order: 7 };

    if (qNum === 20 || s.includes("três condições"))
        return { domain: "Comorbidades Múltiplas", subdomain: "Comorbidades Múltiplas", order: 8 };

    // Fallbacks genéricos
    if (s.match(/\bidade\b/)) return { domain: "Idade", subdomain: "Idade", order: 1 };
    if (s.match(/\bsaúde\b/)) return { domain: "Auto-percepção da Saúde", subdomain: "Auto-percepção da Saúde", order: 2 };

    return { domain: "Outros", subdomain: "Outros", order: 99 };
};

const processHistoryToDomains = (answers: any[]) => {
    if (!answers) return [];

    const domainsMap: Record<string, {
        id: string; name: string; points: number; order: number; subdomains: Record<string, {
            points: any; name: string; questions: any[]
        }>
    }> = {};

    answers.forEach((ans) => {
        const { domain, subdomain, order } = getDomainAndSubdomainForQuestion(ans?.question?.statement);

        if (!domainsMap[domain]) {
            domainsMap[domain] = {
                id: domain,
                name: domain,
                points: 0,
                order: order,
                subdomains: {},
            };
        }

        if (!domainsMap[domain].subdomains[subdomain]) {
            domainsMap[domain].subdomains[subdomain] = {
                name: subdomain,
                points: 0,
                questions: [],
            };
        }

        const score = ans?.selectedOption?.score ?? 0;
        const label = ans?.selectedOption?.label ?? "Não respondido";
        const statementStr = ans?.question?.statement ?? "Pergunta não especificada";

        const existingQuestion = domainsMap[domain].subdomains[subdomain].questions.find((q: any) => q.q === statementStr);

        if (existingQuestion) {
            existingQuestion.answers.push(label);
            if (score > existingQuestion.score) {
                const diff = score - existingQuestion.score;
                existingQuestion.score = score;
                domainsMap[domain].points += diff;
                domainsMap[domain].subdomains[subdomain].points += diff;
            }
        } else {
            domainsMap[domain].points += score;
            domainsMap[domain].subdomains[subdomain].points += score;
            domainsMap[domain].subdomains[subdomain].questions.push({
                q: statementStr,
                answers: [label],
                score: score,
                isMultiple: subdomain === "CAPACIDADE AERÓBICA E/OU MUSCULAR" || subdomain === "Comorbidades Múltiplas"
            });
        }
    });

    Object.values(domainsMap).forEach((domain) => {
        let newDomainPoints = 0;
        Object.values(domain.subdomains).forEach((sub: any) => {
            if (sub.name === "AVD INSTRUMENTAL" && sub.points > 4) sub.points = 4;
            if (sub.name === "Comorbidades Múltiplas" && sub.points > 4) sub.points = 4;
            if (sub.name === "CAPACIDADE AERÓBICA E/OU MUSCULAR" && sub.points > 2) sub.points = 2;
            newDomainPoints += sub.points;
        });
        domain.points = newDomainPoints;
    });

    return Object.values(domainsMap).sort((a, b) => a.order - b.order);
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
                    {domain.name}
                </Text>
                <View style={styles.accordionHeaderRight}>
                    <View style={styles.pointsBadge}>
                        <Text style={styles.pointsBadgeText}>{domain.points} pts</Text>
                    </View>
                    <Ionicons
                        name={expanded ? "chevron-up" : "chevron-down"}
                        size={18}
                        color="#94A3B8"
                    />
                </View>
            </TouchableOpacity>
            {expanded && (
                <View style={styles.accordionContent}>
                    {Object.values(domain.subdomains).map((sub: any, idxSub: number) => {
                        const isUniqueSub = Object.keys(domain.subdomains).length === 1 && sub.name === domain.name;

                        // Function to render questions
                        const renderQuestions = () => (
                            sub.questions.length > 0 ? (
                                sub.questions.map((q: any, idxQ: number) => {
                                    if (q.isMultiple || q.answers.length > 1) {
                                        return (
                                            <View key={idxQ} style={styles.multipleQuestionBlock}>
                                                <Text style={styles.multipleQuestionText}>{q.q}</Text>
                                                {q.answers.map((ansText: string, aIdx: number) => (
                                                    <View key={aIdx} style={styles.multipleAnswerRow}>
                                                        <Text style={styles.multipleAnswerLabel}>{ansText}</Text>
                                                    </View>
                                                ))}
                                            </View>
                                        );
                                    } else {
                                        return (
                                            <View key={idxQ} style={[
                                                styles.questionBlock,
                                                { backgroundColor: idxQ % 2 === 0 ? '#F8FAFC' : '#FFFFFF' }
                                            ]}>
                                                <Text style={styles.questionText}>{q.q}</Text>
                                                <View style={styles.answerRow}>
                                                    <Text style={styles.answerLabel}>{q.answers[0]}</Text>
                                                    <Text style={styles.answerPoints}>{q.score} pts</Text>
                                                </View>
                                            </View>
                                        );
                                    }
                                })
                            ) : (
                                <Text style={styles.questionText}>Sem detalhes registrados.</Text>
                            )
                        );

                        if (isUniqueSub) {
                            return (
                                <View key={idxSub} style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
                                    {renderQuestions()}
                                </View>
                            );
                        }

                        let displaySubName = sub.name;
                        if (sub.name === "CAPACIDADE AERÓBICA E/OU MUSCULAR") {
                            displaySubName += " (MÁX: 2 PTS)";
                        } else if (sub.name === "Comorbidades Múltiplas") {
                            displaySubName += " (MÁX: 4 PTS)";
                        } else if (sub.name === "AVD INSTRUMENTAL") {
                            displaySubName += " (MÁX: 4 PTS)";
                        }

                        return (
                            <View key={idxSub} style={styles.subdomainCard}>
                                <View style={styles.subdomainHeader}>
                                    <Text style={styles.subdomainTitle}>{displaySubName}</Text>
                                    <Text style={styles.subdomainPoints}>{sub.points} pts</Text>
                                </View>
                                <View style={styles.subdomainQuestionsContainer}>
                                    {renderQuestions()}
                                </View>
                            </View>
                        );
                    })}
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
            return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
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
        borderWidth: 1,
        borderColor: "#E2E8F0",
        marginBottom: 12,
        overflow: "hidden",
    },
    accordionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
    },
    accordionTitle: {
        fontSize: 15,
        fontWeight: "bold",
        color: "#1E293B",
        flex: 1,
        marginRight: 8,
    },
    accordionHeaderRight: {
        flexDirection: "row",
        alignItems: "center",
    },
    pointsBadge: {
        backgroundColor: "#F1F5F9",
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 4,
        marginRight: 8,
    },
    pointsBadgeText: {
        color: "#1E293B",
        fontSize: 12,
        fontWeight: "bold",
    },
    accordionContent: {
        paddingTop: 0,
        paddingBottom: 8,
    },
    subdomainCard: {
        borderWidth: 1,
        borderColor: "#1E293B",
        borderRadius: 8,
        marginHorizontal: 16,
        marginBottom: 16,
        overflow: "hidden",
    },
    subdomainHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#E2E8F0",
    },
    subdomainTitle: {
        fontSize: 12,
        fontWeight: "bold",
        color: "#64748B",
        textTransform: "uppercase",
    },
    subdomainPoints: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#1E293B",
    },
    subdomainQuestionsContainer: {
        padding: 12,
    },
    questionBlock: {
        borderRadius: 6,
        padding: 16,
        marginBottom: 8,
    },
    questionText: {
        fontSize: 14,
        fontWeight: "500",
        color: "#1E293B",
        marginBottom: 16,
        lineHeight: 20,
    },
    answerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    answerLabel: {
        fontSize: 14,
        color: "#64748B",
    },
    answerPoints: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#1E293B",
    },
    multipleQuestionBlock: {
        backgroundColor: '#FFFFFF',
        borderRadius: 6,
        padding: 16,
        marginBottom: 8,
    },
    multipleQuestionText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#1F4273",
        marginBottom: 16,
        lineHeight: 20,
    },
    multipleAnswerRow: {
        backgroundColor: '#F8FAFC',
        borderRadius: 6,
        padding: 12,
        marginBottom: 8,
    },
    multipleAnswerLabel: {
        fontSize: 13,
        color: "#64748B",
    },
});
