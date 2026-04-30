import React from "react";
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    Platform,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const instructions = [
    {
        icon: "chatbubble-ellipses-outline" as const,
        text: "Realize em local calmo e sem interrupções",
    },
    {
        icon: "reader-outline" as const,
        text: "Leia cada pergunta de forma pausada",
    },
    {
        icon: "close-circle-outline" as const,
        text: "Não tente explicar ou interpretar as perguntas para o paciente",
    },
    {
        icon: "time-outline" as const,
        text: "Tempo estimado: 5 a 10 minutos",
    },
];

export const InstructionsScreen = ({ navigation }: { navigation: any }) => {
    const route = useRoute();
    const participant = (route.params as any)?.participant;
    const insets = useSafeAreaInsets();
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1F4273" />

            {/* Header */}
            <SafeAreaView style={{ backgroundColor: "#1F4273", zIndex: 10 }}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>IVCF-20</Text>
                    <Text style={styles.headerSubtitle}>Instruções</Text>
                </View>
            </SafeAreaView>

            {/* Content */}
            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                <View style={[styles.card, { paddingBottom: Math.max(insets.bottom + 20, 40) }]}>
                    <Text style={styles.title}>
                        Antes de iniciar a{"\n"}avaliação
                    </Text>

                    <Text style={styles.description}>
                        O IVCF-20 é um instrumento de triagem para identificar
                        vulnerabilidades clínico-funcionais do idoso. Leia as
                        perguntas com clareza sem induzir respostas
                    </Text>

                    {/* Instructions List */}
                    <View style={styles.instructionsList}>
                        {instructions.map((item, index) => ( 
                            <View key={index} style={styles.instructionItem}>
                                <View style={styles.iconContainer}>
                                    <Ionicons
                                        name={item.icon}
                                        size={22}
                                        color="#1F4273"
                                    />
                                </View>
                                <Text style={styles.instructionText}>
                                    {item.text}
                                </Text>
                            </View>
                        ))}
                    </View>

                    {/* Iniciar Button */}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={styles.button}
                            activeOpacity={0.8}
                            onPress={() => navigation.navigate("SearchParticipant", { fromMenu: false })}
                        >
                            <Text style={styles.buttonText}>Continuar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

         
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#1F4273",
    },

    // Header
    header: {
        backgroundColor: "#1F4273",
        alignItems: "center",
        justifyContent: "center",
        paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 24) + 24 : 16,
        paddingBottom: 40,
        paddingHorizontal: 20,
    },
    headerTitle: {
        color: "#FFFFFF",
        fontSize: 40,
        fontWeight: "bold",
    },
    headerSubtitle: {
        color: "#FFFFFF",
        fontSize: 28, // Reduced slightly for better scaling
        fontWeight: "bold",
        marginTop: 6,
    },

    // Content
    content: {
        flex: 1,
        width: "100%",
        marginTop: 20, // Replaced hardcoded marginTop: 50 with a softer gap
    },
    contentContainer: {
        flexGrow: 1,
    },
    card: {
        flex: 1,
        backgroundColor: "#FFFFFF",
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingHorizontal: 24,
        paddingTop: 32,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 4,
    },
    title: {
        fontSize: 26,
        fontWeight: "bold",
        color: "#1F4273",
        marginBottom: 16,
        lineHeight: 34,
    },
    description: {
        fontSize: 14,
        color: "#8A96A8",
        lineHeight: 22,
        marginBottom: 28,
    },

    // Instructions
    instructionsList: {
        gap: 20,
        marginBottom: 36,
    },
    instructionItem: {
        flexDirection: "row",
        alignItems: "center",
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#E8EDF3",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 14,
    },
    instructionText: {
        flex: 1,
        fontSize: 14,
        color: "#333333",
        lineHeight: 20,
    },

    // Button
    buttonContainer: {
        marginTop: "auto",
        alignItems: "center",
        paddingTop: 20,
    },
    button: {
        backgroundColor: "#72AB24",
        paddingVertical: 14,
        borderRadius: 25,
        width: 160,
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
   
});
