export interface AnswerResponseDTO {
    questionId: string;
    selectedOptionId?: string | null;
    valueText?: string | null;
}

export interface QuestionnaireResponseDTO {
    participantId: string;
    healthProfessionalId: string;
    questionnaireId: string;
    answers: AnswerResponseDTO[];
}
