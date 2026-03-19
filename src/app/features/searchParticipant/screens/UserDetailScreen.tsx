import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    TouchableOpacity,
    ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../auth/store/useAuthStore";
import { fetchParticipantHistory } from "../services/SearchParticipantService";

export const UserDetailScreen = ({ navigation, route }: any) => {
    const { participant } = route.params;
    const user = useAuthStore((state) => state.user);
    const [activeTab, setActiveTab] = useState<"dados" | "historico">("dados");
    const [historyList, setHistoryList] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    useEffect(() => {
        if (activeTab === "historico") {
            setLoadingHistory(true);
            fetchParticipantHistory(participant.id)
                .then(data => setHistoryList(data))
                .catch(err => console.error("Error fetching history", err))
                .finally(() => setLoadingHistory(false));
        }
    }, [activeTab, participant.id]);

    // Helper para formatar data vinda do backend (ex: YYYY-MM-DDT00:00:00Z -> DD/MM/YYYY)
    const formatBirthday = (dateString?: string) => {
        if (!dateString) return "--/--/----";
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString; // fallback se já for dd/mm/aaaa ou inválido
            return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' }); 
            // O UTC evita perder o dia na conversão caso não tenha time (00:00)
        } catch {
            return dateString;
        }
    };

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

            {/* Participant Name Title */}
            <View style={styles.titleContainer}>
                <Text style={styles.titleName}>{participant.fullName}</Text>
            </View>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === "dados" && styles.activeTab]}
                    onPress={() => setActiveTab("dados")}
                    activeOpacity={0.8}
                >
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === "dados" && styles.activeTabText,
                        ]}
                    >
                        Dados do Paciente
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === "historico" && styles.activeTab]}
                    onPress={() => setActiveTab("historico")}
                    activeOpacity={0.8}
                >
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === "historico" && styles.activeTabText,
                        ]}
                    >
                        Histórico de Questionários
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Content Area */}
            <ScrollView
                style={styles.contentScroll}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                {activeTab === "dados" ? (
                    <View style={styles.card}>
                        {/* Row 1 */}
                        <View style={styles.row}>
                            <View style={styles.col}>
                                <Text style={styles.label}>Data de nascimento</Text>
                                <Text style={styles.value}>{formatBirthday(participant.birthday)}</Text>
                            </View>
                            <View style={styles.col}>
                                <Text style={styles.label}>Altura</Text>
                                <Text style={styles.value}>{participant.height ? `${participant.height} cm` : "--"}</Text>
                            </View>
                        </View>

                        {/* Row 2 */}
                        <View style={styles.row}>
                            <View style={styles.col}>
                                <Text style={styles.label}>Peso (kg)</Text>
                                <Text style={styles.value}>{participant.weight || "--"}</Text>
                            </View>
                            <View style={styles.col}>
                                <Text style={styles.label}>IMC (Kg/m²)</Text>
                                <Text style={styles.value}>
                                    {/* Mock calculation or display existing */}
                                    {participant.weight && participant.height
                                        ? (
                                            participant.weight /
                                            Math.pow(participant.height / 100, 2)
                                        )
                                            .toFixed(1)
                                            .replace(".", ",")
                                        : "--"}
                                </Text>
                            </View>
                        </View>

                        {/* Row 3 */}
                        <View style={[styles.row, { borderBottomWidth: 0, paddingBottom: 0 }]}>
                            <View style={[styles.col, { flex: 2 }]}>
                                <Text style={styles.label}>Endereço</Text>
                                <Text style={styles.value} numberOfLines={1}>
                                    {participant.street ? `${participant.street}, ${participant.number || "S/N"}` : "Não informado"}
                                </Text>
                                <Text style={styles.addressSub} numberOfLines={1}>
                                    {participant.neighborhood ? `${participant.neighborhood} - ${participant.city} - ${participant.state}` : ""}
                                </Text>
                            </View>
                            <View style={styles.col}>
                                <Text style={styles.label}>CEP</Text>
                                <Text style={styles.value}>{participant.zipCode || "00000-000"}</Text>
                            </View>
                        </View>
                    </View>
                ) : (
                    <View style={styles.historyContainer}>
                        {loadingHistory ? (
                            <Text style={styles.placeholderText}>Carregando histórico...</Text>
                        ) : historyList.length === 0 ? (
                            <Text style={styles.placeholderText}>Nenhum questionário encontrado.</Text>
                        ) : (
                            historyList.map((item) => {
                                const color = item.classification === "Robusto" ? "#8BC34A" : item.classification === "Pré-Frágil" ? "#FFA726" : "#FF4B4B";
                                return (
                                    <TouchableOpacity
                                        key={item.id}
                                        style={styles.historyCard}
                                        activeOpacity={0.7}
                                        onPress={() => navigation.navigate("HistoryDetail", { participant: participant, history: item })}
                                    >
                                        <View style={[styles.historyBorder, { backgroundColor: color }]} />
                                        <View style={styles.historyContent}>
                                            <View>
                                                <Text style={styles.historyScore}>Pontuação: {item.totalScore}</Text>
                                                <Text style={styles.historyDate}>Realização: {formatBirthday(item.date)}</Text>
                                            </View>
                                            <View style={[styles.historyBadge, { borderColor: color }]}>
                                                <Text style={[styles.historyBadgeText, { color }]}>
                                                    {item.classification}
                                                </Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })
                        )}
                    </View>
                )}
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

    // Title Section
    titleContainer: {
        paddingHorizontal: 24,
        paddingTop: 40,
        paddingBottom: 24,
    },
    titleName: {
        fontSize: 26,
        fontWeight: "bold",
        color: "#1F4273",
    },

    // Tabs
    tabsContainer: {
        flexDirection: "row",
        paddingHorizontal: 24,
        borderBottomWidth: 1,
        borderBottomColor: "#E0E0E0",
        marginBottom: 24,
    },
    tab: {
        paddingVertical: 12,
        marginRight: 24,
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: "#1F4273",
    },
    tabText: {
        fontSize: 13,
        color: "#8FA0B3",
        fontWeight: "500",
    },
    activeTabText: {
        color: "#1F4273",
        fontWeight: "bold",
    },

    // Content Scroll
    contentScroll: {
        flex: 1,
    },
    contentContainer: {
        paddingHorizontal: 24,
        paddingBottom: 40,
    },

    // Info Card
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    row: {
        flexDirection: "row",
        marginBottom: 24,
    },
    col: {
        flex: 1,
        paddingRight: 8,
    },
    label: {
        fontSize: 12,
        color: "#A0AAB5",
        marginBottom: 4,
        fontWeight: "500",
    },
    value: {
        fontSize: 14,
        color: "#1A1A1A",
        fontWeight: "bold",
        lineHeight: 20,
    },
    addressSub: {
        fontSize: 12,
        color: "#A0AAB5",
        marginTop: 2,
    },

    // Empty Placeholder
    placeholderContainer: {
        padding: 40,
        alignItems: "center",
    },
    placeholderText: {
        color: "#A0AAB5",
        fontSize: 14,
        textAlign: "center",
    },

    // History Card
    historyContainer: {
        paddingTop: 8,
    },
    historyCard: {
        flexDirection: "row",
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        marginBottom: 16,
        overflow: "hidden",
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    historyBorder: {
        width: 8,
    },
    historyContent: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 16,
        paddingHorizontal: 16,
    },
    historyScore: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#1A1A1A",
        marginBottom: 4,
    },
    historyDate: {
        fontSize: 11,
        color: "#8FA0B3",
        fontWeight: "600",
    },
    historyBadge: {
        paddingHorizontal: 16,
        paddingVertical: 4,
        borderRadius: 20,
        borderWidth: 1,
        justifyContent: "center",
    },
    historyBadgeText: {
        fontSize: 10,
        fontWeight: "bold",
    },

    // Footer
    footer: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 32,
        backgroundColor: "#F5F6FA",
    },
    navButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    secondaryButton: {
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#8BC34A",
        marginRight: 12,
    },
    secondaryText: {
        color: "#8BC34A",
        fontSize: 16,
        fontWeight: "bold",
    },
    primaryButton: {
        backgroundColor: "#8BC34A",
        marginLeft: 12,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    primaryText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "bold",
    },
});
