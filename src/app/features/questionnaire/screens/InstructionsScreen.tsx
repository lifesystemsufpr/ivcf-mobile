import React from "react";
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    ScrollView,
    TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

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
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1F4273" />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>IVCF-20</Text>
                <Text style={styles.headerSubtitle}>Instruções</Text>
            </View>

            {/* Content */}
            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
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
                <TouchableOpacity
                    style={styles.button}
                    activeOpacity={0.8}
                    onPress={() => navigation.navigate("Questionnaire")}
                >
                    <Text style={styles.buttonText}>Iniciar</Text>
                </TouchableOpacity>
            </ScrollView>
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
        alignItems: "center",
        justifyContent: "center",
        paddingTop: 48,
        paddingBottom: 24,
        paddingHorizontal: 20,
    },
    headerTitle: {
        color: "#FFFFFF",
        fontSize: 22,
        fontWeight: "bold",
    },
    headerSubtitle: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "600",
        marginTop: 2,
        textDecorationLine: "underline",
    },

    // Content
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: 24,
        paddingBottom: 40,
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
        color: "#666666",
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
    button: {
        backgroundColor: "#8BC34A",
        paddingVertical: 14,
        borderRadius: 25,
        width: 160,
        alignSelf: "center",
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
