import React, { useState, useMemo } from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    StatusBar,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Modal,
    Pressable,
    SafeAreaView,
    Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSearchParticipant } from "../hooks/useSearchParticipant";
import { useAuthStore } from "../../auth/store/useAuthStore";
import { ParticipantDTO } from "../dto/ParticipantDTO";


export const SearchParticipantScreen = ({ route }: any) => {
    const [searchName, setSearchName] = useState("");
    const [menuVisible, setMenuVisible] = useState(false);
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const navigation = useNavigation<any>();
    const { participants, isLoading } = useSearchParticipant();

    const fromMenu = route?.params?.fromMenu === true;

    const handleLogout = () => {
        setMenuVisible(false);
        logout();
    };

    const filteredParticipants = useMemo(() => {
        if (!searchName.trim()) return participants;
        const search = searchName.toLowerCase().trim();
        return participants.filter((p) =>
            p.fullName?.toLowerCase().includes(search)
        );
    }, [searchName, participants]);

    const renderParticipant = ({ item }: { item: ParticipantDTO }) => (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.7}
            onPress={() => {
                if (fromMenu) {
                    navigation.navigate("UserDetail", { participant: item });
                } else {
                    navigation.navigate("Instructions", { participant: item });
                }
            }}
        >
            <View style={styles.cardLeft}>
                <View style={styles.cardAvatar}>
                    <Ionicons name="person-outline" size={24} color="#1F4273" />
                </View>
                <View style={styles.cardInfo}>
                    <Text style={styles.cardName} numberOfLines={2}>{item.fullName}</Text>
                    <Text style={styles.cardEmail} numberOfLines={1}>{item.email}</Text>
                </View>
            </View>
            <Ionicons name="chevron-forward" size={22} color="#AAAAAA" />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1F4273" />

            {/* Header */}
            <SafeAreaView style={{ backgroundColor: "#1F4273", zIndex: 10 }}>
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

            {/* Content */}
            <View style={styles.content}>
                <Text style={styles.title}>Buscar participante</Text>

                {/* Search Input */}
                <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Buscar por nome..."
                        placeholderTextColor="#A0A0A0"
                        value={searchName}
                        onChangeText={setSearchName}
                        autoCapitalize="words"
                    />
                    {searchName.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchName("")} style={{ padding: 4 }}>
                            <Ionicons name="close-circle" size={20} color="#A0A0A0" />
                        </TouchableOpacity>
                    )}
                    <Ionicons name="search" size={22} color="#1F4273" style={styles.searchIcon} />
                </View>

                {/* Results */}
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#1F4273" />
                    </View>
                ) : (
                    <FlatList
                        data={filteredParticipants}
                        keyExtractor={(item) => item.id}
                        renderItem={renderParticipant}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        ListEmptyComponent={
                            <Text style={styles.emptyText}>
                                {searchName
                                    ? "Nenhum participante encontrado."
                                    : "Nenhum participante cadastrado."}
                            </Text>
                        }
                    />
                )}
            </View>
        </View>
    );
};

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

    // Content
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#1F4273",
        marginBottom: 20,
    },

    // Search
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#D0D0D0",
        paddingHorizontal: 14,
        marginBottom: 20,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 14,
        fontSize: 15,
        color: "#333333",
    },
    searchIcon: {
        marginLeft: 8,
    },

    // List
    listContent: {
        paddingBottom: 120, // increased padding to uniformly clear floating tab bar
    },

    // Card
    card: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    cardLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    cardAvatar: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: "#E8EDF3",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    cardInfo: {
        flex: 1,
    },
    cardName: {
        fontSize: 15,
        fontWeight: "600",
        color: "#1F4273",
    },
    cardEmail: {
        fontSize: 12,
        color: "#888888",
        marginTop: 2,
    },

    // States
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    emptyText: {
        textAlign: "center",
        color: "#999999",
        fontSize: 14,
        marginTop: 40,
    },
});
