import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    TouchableOpacity,
    ScrollView,
} from "react-native";
import { IVCF20_QUESTIONS, Question } from "../questions";

type Props = {
    navigation: any;
};

const TOTAL_QUESTIONS = IVCF20_QUESTIONS.length;

type Answers = Record<number, string | string[] | undefined>;

const isMultiSelectQuestion = (questionId: number) => {
    return questionId === 14 || questionId === 20;
};

const getQuestionScore = (
    question: Question,
    answerValue: string | string[] | undefined,
): number => {
    if (!answerValue) {
        return 0;
    }

    const selectedIds = Array.isArray(answerValue)
        ? answerValue
        : [answerValue];

    const sum = selectedIds.reduce((acc, optionId) => {
        const option = question.options.find((opt) => opt.id === optionId);
        return option ? acc + option.score : acc;
    }, 0);

    if (question.id === 14) {
        return Math.min(sum, 2);
    }

    if (question.id === 20) {
        return Math.min(sum, 4);
    }

    return sum;
};

const calculateTotalScore = (answers: Answers): number => {
    let score = 0;
    
    // Dependent domains
    let aivdScore = 0; // Atividades Instrumentais (Q3, Q4, Q5) - max 4
    let humorScore = 0; // Humor (Q10, Q11) - max 2

    IVCF20_QUESTIONS.forEach((question) => {
        const value = answers[question.id];
        const qScore = getQuestionScore(question, value);

        if (question.id >= 3 && question.id <= 5) {
            aivdScore = Math.max(aivdScore, qScore);
        } else if (question.id === 10 || question.id === 11) {
            humorScore = Math.max(humorScore, qScore);
        } else {
            score += qScore;
        }
    });

    score += aivdScore;
    score += humorScore;

    return Math.min(score, 40);
};

export const QuestionnaireScreen: React.FC<Props> = ({ navigation }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Answers>({});

    const currentQuestion: Question = IVCF20_QUESTIONS[currentIndex];

    const handleSelectOption = (questionId: number, optionId: string) => {
        if (isMultiSelectQuestion(questionId)) {
            setAnswers((prev) => {
                const currentValue = prev[questionId];
                const currentArray = Array.isArray(currentValue)
                    ? currentValue
                    : currentValue
                    ? [currentValue]
                    : [];

                const isSelected = currentArray.includes(optionId);
                
                // For question 14, id "5" is "Nenhuma das condições"
                // For question 20, id "4" is "Nenhuma condição"
                const noneOfTheAboveId = questionId === 14 ? "5" : questionId === 20 ? "4" : null;

                let nextArray: string[];

                if (isSelected) {
                    // Unselect the current option
                    nextArray = currentArray.filter((id) => id !== optionId);
                } else {
                    if (optionId === noneOfTheAboveId) {
                        // If selecting "Nenhuma", unselect everything else
                        nextArray = [optionId];
                    } else {
                        // If selecting a regular option, remove "Nenhuma" if it was selected, and add the new one
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
        if (currentIndex === 0) {
            return;
        }
        setCurrentIndex((index) => index - 1);
    };

    const handleNext = () => {
        const isLast = currentIndex === TOTAL_QUESTIONS - 1;

        if (isLast) {
            const totalScore = calculateTotalScore(answers);
            navigation.navigate("Result", { score: totalScore });
            return;
        }

        setCurrentIndex((index) => index + 1);
    };

    const progress = (currentIndex + 1) / TOTAL_QUESTIONS;

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1F4273" />

            {/* Header */}
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

            <View style={styles.contentWrapper}>
                <ScrollView
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                >
                    <Text style={styles.questionText}>{currentQuestion.title}</Text>

                    <View style={styles.optionsCard}>
                        {currentQuestion.options.map((option) => {
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
    header: {
        backgroundColor: "#1F4273",
        alignItems: "center",
        justifyContent: "center",
        paddingTop: 48,
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
        backgroundColor: "#8BC34A",
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
        paddingBottom: 200,
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
        backgroundColor: "#8BC34A",
        borderColor: "#8BC34A",
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
        borderColor: "#8BC34A",
        backgroundColor: "#FFFFFF",
    },
    navButtonPrimary: {
        marginLeft: 8,
        backgroundColor: "#8BC34A",
    },
    navButtonDisabled: {
        borderColor: "#C5CED8",
    },
    navButtonTextSecondary: {
        color: "#8BC34A",
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

