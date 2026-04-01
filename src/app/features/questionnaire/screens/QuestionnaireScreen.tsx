import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    SafeAreaView,
    Platform,
} from "react-native";
import { useQuestionnaire } from "../hooks/useQuestionnaire";
import { useRoute } from "@react-navigation/native";
import { QuestionDTO } from "../dto/QuestionnaireDTO";

type Props = {
    navigation: any;
};

type Answers = Record<string, string | string[] | undefined>;

// Questions where multiple options can be selected simultaneously
const MULTI_SELECT_QUESTION_IDS_FALLBACK = new Set<string>();

function isMultiSelect(question: QuestionDTO): boolean {
    if (question.type === "MULTI_ENUM") return true;
    // Fallback: detect by statement pattern (questions 14 and 20 in IVCF-20)
    const stmt = question.statement.toLowerCase();
    return (
        stmt.includes("alguma das quatro") ||
        stmt.includes("alguma das três")
    );
}

function getNoneOfTheAboveId(question: QuestionDTO): string | null {
    const noneOption = question.options.find((opt) =>
        opt.label.toLowerCase().startsWith("nenhum")
    );
    return noneOption?.id ?? null;
}

function getQuestionScore(
    question: QuestionDTO,
    answerValue: string | string[] | undefined,
): number {
    if (!answerValue) return 0;

    const selectedIds = Array.isArray(answerValue) ? answerValue : [answerValue];

    const sum = selectedIds.reduce((acc, optionId) => {
        const option = question.options.find((opt) => opt.id === optionId);
        return option ? acc + option.score : acc;
    }, 0);

    // Cap multi-select scores based on max score of the options present
    if (isMultiSelect(question)) {
        const maxScore = Math.max(...question.options.map((o) => o.score === 0 ? 0 : o.score));
        return Math.min(sum, maxScore);
    }

    return sum;
}

function calculateTotalScore(
    questions: QuestionDTO[],
    answers: Answers,
): number {
    let score = 0;
    let aivdScore = 0; // AIVD domain questions (3, 4, 5) — max contribution is 4
    let humorScore = 0; // Humor domain questions (10, 11) — max contribution is 2

    questions.forEach((question, index) => {
        const questionNumber = index + 1;
        const value = answers[question.id];
        const qScore = getQuestionScore(question, value);

        if (questionNumber >= 3 && questionNumber <= 5) {
            aivdScore = Math.max(aivdScore, qScore);
        } else if (questionNumber === 10 || questionNumber === 11) {
            humorScore = Math.max(humorScore, qScore);
        } else {
            score += qScore;
        }
    });

    score += aivdScore;
    score += humorScore;

    return Math.min(score, 40);
}

export const QuestionnaireScreen: React.FC<Props> = ({ navigation }) => {
    const route = useRoute();
    const participant = (route.params as any)?.participant;
    const { questionnaire, questions, isLoading, isError, refetch } = useQuestionnaire();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Answers>({});

    if (isLoading) {
        return (
            <View style={[styles.container, styles.centered]}>
                <StatusBar barStyle="light-content" backgroundColor="#1F4273" />
                <ActivityIndicator size="large" color="#FFFFFF" />
                <Text style={styles.loadingText}>Carregando questionário...</Text>
            </View>
        );
    }

    if (isError || questions.length === 0) {
        return (
            <View style={[styles.container, styles.centered]}>
                <StatusBar barStyle="light-content" backgroundColor="#1F4273" />
                <Text style={styles.errorText}>
                    Não foi possível carregar o questionário.
                </Text>
                <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
                    <Text style={styles.retryButtonText}>Tentar novamente</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const TOTAL_QUESTIONS = questions.length;
    const currentQuestion: QuestionDTO = questions[currentIndex];
    const multiSelect = isMultiSelect(currentQuestion);
    const noneOfTheAboveId = getNoneOfTheAboveId(currentQuestion);

    const handleSelectOption = (questionId: string, optionId: string) => {
        if (multiSelect) {
            setAnswers((prev) => {
                const currentValue = prev[questionId];
                const currentArray = Array.isArray(currentValue)
                    ? currentValue
                    : currentValue
                    ? [currentValue]
                    : [];

                const isSelected = currentArray.includes(optionId);

                let nextArray: string[];

                if (isSelected) {
                    nextArray = currentArray.filter((id) => id !== optionId);
                } else {
                    if (optionId === noneOfTheAboveId) {
                        nextArray = [optionId];
                    } else {
                        nextArray = [
                            ...currentArray.filter((id) => id !== noneOfTheAboveId),
                            optionId,
                        ];
                    }
                }

                return {
                    ...prev,
                    [questionId]: nextArray.length ? nextArray : undefined,
                };
            });
        } else {
            setAnswers((prev) => ({
                ...prev,
                [questionId]: optionId,
            }));
        }
    };

    const handlePrevious = () => {
        if (currentIndex === 0) return;
        setCurrentIndex((index) => index - 1);
    };

    const handleNext = () => {
        const isLast = currentIndex === TOTAL_QUESTIONS - 1;

        if (isLast) {
            const totalScore = calculateTotalScore(questions, answers);
            navigation.navigate("Result", {
                score: totalScore,
                questionnaireId: questionnaire?.id,
                answers,
                participantId: participant?.id,
            });
            return;
        }

        setCurrentIndex((index) => index + 1);
    };

    const progress = (currentIndex + 1) / TOTAL_QUESTIONS;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1F4273" />

            {/* Header */}
            <SafeAreaView style={{ backgroundColor: "#1F4273", zIndex: 10 }}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>IVCF-20</Text>
                <View style={styles.progressContainer}>
                    <View style={styles.progressBackground} />
                    <View
                        style={[
                            styles.progressBar,
                            { width: `${progress * 100}%` },
                        ]}
                    />
                </View>
                <Text style={styles.headerSubtitle}>
                    QUESTÃO {currentIndex + 1} de {TOTAL_QUESTIONS}
                </Text>
                </View>
            </SafeAreaView>

            <View style={styles.contentWrapper}>
                <ScrollView
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                >
                    <Text style={styles.questionText}>
                        {currentQuestion.statement}
                    </Text>

                    <View style={styles.optionsCard}>
                        {[...currentQuestion.options]
                            .sort((a, b) => a.order - b.order)
                            .map((option) => {
                                const answerValue = answers[currentQuestion.id];
                                const selected = Array.isArray(answerValue)
                                    ? answerValue.includes(option.id)
                                    : answerValue === option.id;

                                return (
                                    <TouchableOpacity
                                        key={option.id}
                                        style={[
                                            styles.optionButton,
                                            selected && styles.optionButtonSelected,
                                        ]}
                                        activeOpacity={0.8}
                                        onPress={() =>
                                            handleSelectOption(
                                                currentQuestion.id,
                                                option.id,
                                            )
                                        }
                                    >
                                        <Text
                                            style={[
                                                styles.optionText,
                                                selected && styles.optionTextSelected,
                                            ]}
                                        >
                                            {option.label}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                    </View>
                </ScrollView>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[
                            styles.navButton,
                            styles.navButtonSecondary,
                            currentIndex === 0 && styles.navButtonDisabled,
                        ]}
                        disabled={currentIndex === 0}
                        activeOpacity={0.8}
                        onPress={handlePrevious}
                    >
                        <Text
                            style={[
                                styles.navButtonTextSecondary,
                                currentIndex === 0 && styles.navButtonTextDisabled,
                            ]}
                        >
                            Anterior
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.navButton, styles.navButtonPrimary]}
                        activeOpacity={0.8}
                        onPress={handleNext}
                    >
                        <Text style={styles.navButtonTextPrimary}>
                            {currentIndex === TOTAL_QUESTIONS - 1
                                ? "Concluir"
                                : "Próximo"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#1F4273",
    },
    centered: {
        justifyContent: "center",
        alignItems: "center",
        gap: 16,
    },
    loadingText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "500",
    },
    errorText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "500",
        textAlign: "center",
        paddingHorizontal: 32,
    },
    retryButton: {
        backgroundColor: "#72AB24",
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 24,
    },
    retryButtonText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "600",
    },
    header: {
        backgroundColor: "#1F4273",
        alignItems: "center",
        justifyContent: "center",
        paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 24) + 16 : 16,
        paddingBottom: 20,
        paddingHorizontal: 20,
    },
    headerTitle: {
        color: "#FFFFFF",
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 8,
    },
    progressContainer: {
        width: "70%",
        height: 4,
        borderRadius: 2,
        marginBottom: 8,
        justifyContent: "center",
    },
    progressBackground: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(255,255,255,0.25)",
        borderRadius: 2,
    },
    progressBar: {
        height: 4,
        borderRadius: 2,
        backgroundColor: "#72AB24",
    },
    headerSubtitle: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "600",
        marginTop: 2,
    },
    contentWrapper: {
        flex: 1,
        backgroundColor: "#F5F5F5",
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 40,
    },
    content: {
        paddingBottom: 24,
    },
    questionText: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1F4273",
        textAlign: "center",
        marginBottom: 24,
        lineHeight: 26,
    },
    optionsCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        paddingVertical: 20,
        paddingHorizontal: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
        elevation: 3,
    },
    optionButton: {
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#1F4273",
        paddingVertical: 10,
        paddingHorizontal: 12,
        marginBottom: 12,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FFFFFF",
    },
    optionButtonSelected: {
        backgroundColor: "#72AB24",
        borderColor: "#72AB24",
    },
    optionText: {
        color: "#1F4273",
        fontSize: 14,
        fontWeight: "600",
    },
    optionTextSelected: {
        color: "#FFFFFF",
    },
    footer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    navButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 24,
        alignItems: "center",
        justifyContent: "center",
    },
    navButtonSecondary: {
        marginRight: 8,
        borderWidth: 1,
        borderColor: "#72AB24",
        backgroundColor: "#FFFFFF",
    },
    navButtonPrimary: {
        marginLeft: 8,
        backgroundColor: "#72AB24",
    },
    navButtonDisabled: {
        borderColor: "#C5CED8",
    },
    navButtonTextSecondary: {
        color: "#72AB24",
        fontSize: 14,
        fontWeight: "600",
    },
    navButtonTextPrimary: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "600",
    },
    navButtonTextDisabled: {
        color: "#C5CED8",
    },
});
