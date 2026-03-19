import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    StatusBar,
    Dimensions,
    TouchableOpacity,
    Modal,
    Pressable,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useAuthStore } from "../../auth/store/useAuthStore";
import { useNavigation, CommonActions } from "@react-navigation/native";
import { fetchDashboardData } from "../services/DashboardService";

const { width } = Dimensions.get("window");

// The data arrays are replaced by local state
// ─── Data ────────────────────────────────────────────────────────────

// ─── Bar Chart Component ─────────────────────────────────────────────
interface BarData {
    label: string;
    value: number;
    color: string;
}

const BarChart = ({
    title,
    subtitle,
    data,
    maxValue,
    legendItems,
}: {
    title: string;
    subtitle?: string;
    data: BarData[];
    maxValue: number;
    legendItems?: { label: string; color: string }[];
}) => {
    const CHART_HEIGHT = 180;
    const steps = 4;
    const stepValue = Math.ceil(maxValue / steps);
    const adjustedMax = stepValue * steps;

    return (
        <View style={chartStyles.container}>
            <Text style={chartStyles.title}>{title}</Text>
            {subtitle && <Text style={chartStyles.subtitle}>{subtitle}</Text>}

            <View style={chartStyles.chartArea}>
                {/* Y-axis labels */}
                <View style={chartStyles.yAxis}>
                    {Array.from({ length: steps + 1 }, (_, i) => {
                        const val = adjustedMax - i * stepValue;
                        return (
                            <Text key={i} style={chartStyles.yLabel}>
                                {val}
                            </Text>
                        );
                    })}
                </View>

                {/* Chart body */}
                <View style={chartStyles.chartBody}>
                    {/* Grid lines */}
                    {Array.from({ length: steps + 1 }, (_, i) => (
                        <View
                            key={i}
                            style={[
                                chartStyles.gridLine,
                                { top: (i / steps) * CHART_HEIGHT },
                            ]}
                        />
                    ))}

                    {/* Bars */}
                    <View style={[chartStyles.barsRow, { height: CHART_HEIGHT }]}>
                        {data.map((item, index) => {
                            const barHeight = (item.value / adjustedMax) * CHART_HEIGHT;
                            return (
                                <View key={index} style={chartStyles.barWrapper}>
                                    <View style={chartStyles.barContainer}>
                                        <Text style={chartStyles.barValue}>{item.value}</Text>
                                        <View
                                            style={[
                                                chartStyles.bar,
                                                {
                                                    height: barHeight,
                                                    backgroundColor: item.color,
                                                },
                                            ]}
                                        />
                                    </View>
                                    <Text style={chartStyles.barLabel}>{item.label}</Text>
                                </View>
                            );
                        })}
                    </View>
                </View>
            </View>

            {/* Legend */}
            {legendItems && (
                <View style={chartStyles.legend}>
                    {legendItems.map((item, i) => (
                        <View key={i} style={chartStyles.legendItem}>
                            <View
                                style={[
                                    chartStyles.legendDot,
                                    { backgroundColor: item.color },
                                ]}
                            />
                            <Text style={chartStyles.legendText}>{item.label}</Text>
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
};

// ─── Dashboard Screen ────────────────────────────────────────────────
export const DashboardScreen = () => {
    const [menuVisible, setMenuVisible] = useState(false);
    const [totalParticipants, setTotalParticipants] = useState(0);
    const [averageScore, setAverageScore] = useState(0);
    const [riskData, setRiskData] = useState<BarData[]>([]);
    const [ageData, setAgeData] = useState<BarData[]>([]);
    const [loading, setLoading] = useState(true);

    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const navigation = useNavigation<any>();

    useEffect(() => {
        let mounted = true;
        fetchDashboardData()
            .then(data => {
                if (!mounted) return;
                const rawTotal = data.totalParticipants;
                const total = typeof rawTotal === 'number' ? rawTotal : rawTotal?.totalParticipants ?? 0;
                setTotalParticipants(total);
                
                // Formata o avg score
                const rawAvg = data.averageScore;
                const avgScoreValue = typeof rawAvg === 'number' ? rawAvg : rawAvg?.averageScore ?? 0;
                setAverageScore(typeof avgScoreValue === "number" ? parseFloat(avgScoreValue.toFixed(1)) : 0);
                
                if (Array.isArray(data.ageDistribution)) {
                    const colors = ["#4CAF50", "#FFC107", "#F44336", "#2196F3", "#9C27B0"];
                    setAgeData(data.ageDistribution.map((item, idx) => ({
                        label: item.range || "N/A",
                        value: item.total || 0,
                        color: colors[idx % colors.length]
                    })));
                }

                if (Array.isArray(data.riskDistribution)) {
                    setRiskData(data.riskDistribution.map(item => {
                        let color = "#4CAF50";
                        const label = item.classification || item.risk || "N/A";
                        if (label.toLowerCase().includes("pré")) color = "#FFC107";
                        else if (label.toLowerCase().includes("frágil")) color = "#F44336";
                        return {
                            label,
                            value: item.total || item.count || 0,
                            color
                        };
                    }));
                }
            })
            .catch(err => console.error(err))
            .finally(() => mounted && setLoading(false));

        return () => { mounted = false; };
    }, []);

    // Calcula dinamicamente o maxValue do gráfico
    const riskMax = Math.max(...riskData.map(d => d.value), 4);
    const ageMax = Math.max(...ageData.map(d => d.value), 4);

    const handleLogout = () => {
        setMenuVisible(false);
        logout();
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
                <TouchableOpacity
                    style={styles.menuButton}
                    onPress={() => setMenuVisible(true)}
                >
                    <Ionicons name="menu" size={28} color="#FFFFFF" />
                </TouchableOpacity>
            </View>

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
                                    params: { fromMenu: true }
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

            {/* Content */}
            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                {/* Stats Cards */}
                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Total na coorte</Text>
                        <Text style={styles.statValue}>{loading ? "..." : totalParticipants}</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Score médio</Text>
                        <Text style={styles.statValue}>{loading ? "..." : averageScore}</Text>
                    </View>
                </View>

                {/* Risk Distribution Chart */}
                <BarChart
                    title="Distribuição de Risco"
                    subtitle={`(Total na coorte: ${totalParticipants})`}
                    data={riskData}
                    maxValue={riskMax}
                    legendItems={riskData.map(d => ({ label: d.label, color: d.color }))}
                />

                {/* Age Groups Chart */}
                <BarChart
                    title="Faixas Etárias Predominantes"
                    subtitle={`(Total: ${totalParticipants})`}
                    data={ageData}
                    maxValue={ageMax}
                    legendItems={ageData.map(d => ({ label: d.label, color: d.color }))}
                />

                <View style={{ height: 24 }} />
            </ScrollView>
        </View>
    );
};

// ─── Main Styles ─────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F5F5",
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
    menuOverlay: {
        flex: 1,
    },
    menuDropdown: {
        position: "absolute",
        top: 90,
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

    // Content
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
    },

    // Stats
    statsRow: {
        flexDirection: "row",
        gap: 16,
        marginBottom: 20,
    },
    statCard: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 20,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    statLabel: {
        fontSize: 14,
        color: "#666666",
        marginBottom: 8,
    },
    statValue: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#1F4273",
    },
});

// ─── Chart Styles ────────────────────────────────────────────────────
const chartStyles = StyleSheet.create({
    container: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    title: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#333333",
    },
    subtitle: {
        fontSize: 12,
        color: "#999999",
        marginTop: 2,
        marginBottom: 16,
    },
    chartArea: {
        flexDirection: "row",
        marginTop: 8,
    },
    yAxis: {
        width: 30,
        justifyContent: "space-between",
        alignItems: "flex-end",
        paddingRight: 6,
        height: 180,
    },
    yLabel: {
        fontSize: 11,
        color: "#999999",
    },
    chartBody: {
        flex: 1,
        height: 180,
        position: "relative",
    },
    gridLine: {
        position: "absolute",
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: "#EEEEEE",
    },
    barsRow: {
        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: "space-evenly",
    },
    barWrapper: {
        alignItems: "center",
    },
    barContainer: {
        alignItems: "center",
    },
    barValue: {
        fontSize: 13,
        fontWeight: "bold",
        color: "#333333",
        marginBottom: 4,
    },
    bar: {
        width: 40,
        borderRadius: 4,
    },
    barLabel: {
        fontSize: 11,
        color: "#666666",
        marginTop: 6,
        textAlign: "center",
    },

    // Legend
    legend: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: 16,
        gap: 12,
    },
    legendItem: {
        flexDirection: "row",
        alignItems: "center",
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 4,
    },
    legendText: {
        fontSize: 11,
        color: "#666666",
    },
});
