import React from "react";
import { View, Text, StyleSheet, StatusBar, TouchableOpacity, DimensionValue } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { CommonActions } from "@react-navigation/native";
import { Alert, ActivityIndicator } from "react-native";
import axios from "axios";
import { useQuestionnaire } from "../hooks/useQuestionnaire";
import { QuestionnaireResponseDTO } from "../dto/QuestionnaireResponseDTO";
import { questionnaireResponseService } from "../services/QuestionnaireResponseService";
import { useAuthStore } from "../../auth/store/useAuthStore";

type Props = {
    navigation: any;
    route: { params?: { score?: number } };
};

const MAX_SCORE = 40;

const classifyScore = (score: number) => {
    if (score <= 6) {
        return {
            label: "Baixo risco de fragilidade",
            description:
                "Este resultado indica baixa vulnerabilidade clínico-funcional.",
            outerColor: "#7EB62A", // Green border
            innerColor: "#1F385C", // Dark Blue inner (or use green if prefered, but following prototype: #1f385c inner, green outer)
        };
    }

    if (score <= 14) {
        return {
            label: "Risco de Fragilização",
            description:
                "Este resultado indica um risco moderado de fragilidade clínico-funcional. Recomenda-se o acompanhamento com um profissional de saúde para uma avaliação mais detalhada e orientações preventivas.",
            outerColor: "#F2A104", // Orange/Yellow border
            innerColor: "#C34A17", // Brownish/Orange inner
        };
    }

    return {
        label: "Alta vulnerabilidade",
        description:
            "Este resultado indica alta vulnerabilidade clínico-funcional. Recomenda-se avaliação especializada e plano de cuidado individualizado.",
        outerColor: "#A3242A", // Red border
        innerColor: "#4B0F11", // Dark Red inner
    };
};


export const ResultScreen: React.FC<Props> = ({ navigation, route }) => {
    const score = route.params?.score ?? 0;
    const classification = classifyScore(score);

    const indicatorPosition = `${(score / MAX_SCORE) * 100}%`;
    const { questionnaire } = useQuestionnaire();

    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const handleSubmit = async () => {
        if (isSubmitting) return;

        const routeParams: any = route.params ?? {};

        const routeAnswers: Record<string, string | string[] | undefined> =
            routeParams.answers ?? {};

        const questionnaireId: string =
            routeParams.questionnaireId ?? questionnaire?.id ?? "";

        const participantId: string = routeParams.participantId ?? "";
        const authUser = useAuthStore.getState().user;
        const healthProfessionalId: string = routeParams.healthProfessionalId ?? authUser?.id ?? "";

        if (!participantId) {
            Alert.alert("Erro", "Participante não selecionado. Volte e selecione um participante antes de enviar.");
            return;
        }

        if (!healthProfessionalId) {
            Alert.alert("Erro", "Usuário autenticado não encontrado. Faça login novamente.");
            return;
        }

        const answersPayload: QuestionnaireResponseDTO["answers"] = [];

        for (const [questionId, answerValue] of Object.entries(routeAnswers)) {
            if (answerValue == null) continue;

            if (Array.isArray(answerValue)) {
                for (const optionId of answerValue) {
                    answersPayload.push({ questionId, selectedOptionId: optionId });
                }
            } else {
                answersPayload.push({ questionId, selectedOptionId: answerValue });
            }
        }

        const payload: QuestionnaireResponseDTO = {
            participantId,
            healthProfessionalId,
            questionnaireId,
            answers: answersPayload,
        };

        try {
            setIsSubmitting(true);
            const resp = await questionnaireResponseService.submitResponse(payload);
            console.log("Questionnaire response status:", resp?.status);
            console.log("Questionnaire response data:", resp?.data);
            navigation.dispatch(CommonActions.navigate({ name: "Success" }));
        } catch (err: any) {
            console.error("Failed to submit questionnaire response", err);

            let message = "Não foi possível enviar as respostas. Tente novamente.";

            if (axios.isAxiosError(err) && err.response) {
                const respData = err.response.data;

                if (respData) {
                    if (typeof respData === "string") {
                        message = respData;
                    } else if (respData.message) {
                        message = respData.message;
                    } else {
                        try {
                            message = JSON.stringify(respData);

                        } catch (e) {
                            message = `Erro ${err.response.status}`;
                        }
                    }
                } 
            } 

            Alert.alert("Erro", message);
        } finally {
            setIsSubmitting(false);
        }
    };

    
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1F385C" />

            {/* Header portion */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>IVCF-20</Text>
                <Text style={styles.headerSubtitle}>Resultado</Text>
            </View>

            {/* Content background area */}
            <View style={styles.content}>

                {/* Card enclosing circle, points, and info */}
                <View style={styles.card}>

                    {/* Floating Score Circle */}
                    <View style={styles.scoreWrapper}>
                        <View style={[styles.scoreCircleOuter, { backgroundColor: classification.outerColor }]}>
                            <View style={[styles.scoreCircleInner, { backgroundColor: classification.innerColor }]}>
                                <Text style={styles.scoreText}>{score}</Text>
                            </View>
                        </View>
                    </View>

                    <Text style={styles.pointsLabel}>PONTOS</Text>

                    {/* Gradient Bar */}
                    <View style={styles.scaleContainer}>
                        <LinearGradient
                            colors={["#4CAF50", "#FFC107", "#F44336"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.scaleBar}
                        />

                        {/* Indicator */}
                        <View style={[styles.indicatorWrapper, { left: indicatorPosition as DimensionValue }]}>
                            <View style={styles.indicator} />
                        </View>
                    </View>

                    <Text style={styles.riskLabel}>{classification.label}</Text>

                    <Text style={styles.description}>{classification.description}</Text>
                </View>

                {/* Ensure buttons stay at bottom of screen if possible */}
                <View style={{ flex: 1 }} />

                {/* Footer Buttons */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.navButton, styles.secondaryButton]}
                        onPress={() => navigation.goBack()}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.secondaryText}>Anterior</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.navButton, styles.primaryButton]}
                        onPress={handleSubmit}
                        activeOpacity={0.8}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text style={styles.primaryText}>Enviar</Text>
                        )}
                    </TouchableOpacity>
                </View>

            </View>
        </View>
    );
};

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: "#1F385C", // matches prototype header color
    },

    header: {
        paddingTop: 60,
        paddingBottom: 40,
        alignItems: "center",
        backgroundColor: "#1F385C",
    },

    headerTitle: {
        color: "#FFF",
        fontSize: 24,
        fontWeight: "700",
    },

    headerSubtitle: {
        color: "#FFF",
        fontSize: 20,
        fontWeight: "700",
        marginTop: 4,
    },

    content: {
        flex: 1,
        backgroundColor: "#F4F6F8", // light gray exactly like prototype
        paddingHorizontal: 24,
    },

    card: {
        width: "100%",
        backgroundColor: "#FFF",
        borderRadius: 12, // softer radius to match prototype
        padding: 24,
        paddingTop: 80, // plenty of space for circle
        alignItems: "center",
        marginTop: 100, // push card down so it leaves room for the circle sticking out
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
    },

    scoreWrapper: {
        position: "absolute",
        top: -65, // exactly half the outer circle's height (which is 130)
        alignSelf: "center",
        zIndex: 10,
    },

    scoreCircleOuter: {
        width: 130, // matches prototype size roughly
        height: 130,
        borderRadius: 65,
        backgroundColor: "#7EB62A", // slightly deeper green to match prototype border
        alignItems: "center",
        justifyContent: "center",
    },

    scoreCircleInner: {
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: "#1F385C",
        alignItems: "center",
        justifyContent: "center",
    },

    scoreText: {
        color: "#FFF",
        fontSize: 40,
        fontWeight: "bold",
    },

    pointsLabel: {
        fontSize: 22,
        fontWeight: "800",
        color: "#1F385C",
        marginBottom: 20,
    },

    scaleContainer: {
        width: "100%",
        marginBottom: 8,
        position: 'relative',
        paddingBottom: 14, // padding equal to the triangle height to avoid cutting
    },

    scaleBar: {
        height: 14, // slightly thicker to match screenshot
        borderRadius: 7,
        width: '100%',
    },

    indicatorWrapper: {
        position: "absolute",
        top: 14, // sits exactly below the 14px bar
        transform: [{ translateX: -7 }], // center the 14px wide indicator
    },

    indicator: {
        width: 0,
        height: 0,
        borderLeftWidth: 7,
        borderRightWidth: 7,
        borderBottomWidth: 10, // triangle points UP
        borderLeftColor: "transparent",
        borderRightColor: "transparent",
        borderBottomColor: "#1F385C", // matches dark blue font and header
    },

    riskLabel: {
        marginTop: 8,
        fontWeight: "800", // extra bold
        color: "#1F385C",
        fontSize: 14,
        textAlign: 'center',
    },

    description: {
        marginTop: 12,
        textAlign: "center",
        color: "#9EA9B8", // lighter grey text
        fontSize: 13,
        lineHeight: 22,
        fontWeight: '500',
    },

    footer: {
        flexDirection: "row",
        width: "100%",
        marginBottom: 206, // float above bottom edge like prototype
        marginTop: 24,
    },

    navButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 8, // slight pill corner from prototype
        alignItems: "center",
        justifyContent: "center",
    },

    secondaryButton: {
        borderWidth: 1,
        borderColor: "#7EB62A",
        backgroundColor: "#FFF",
        marginRight: 8,
    },

    primaryButton: {
        backgroundColor: "#7EB62A",
        marginLeft: 8,
    },

    secondaryText: {
        color: "#7EB62A",
        fontWeight: "700",
        fontSize: 15,
    },

    primaryText: {
        color: "#FFF",
        fontWeight: "700",
        fontSize: 15,
    },
});
