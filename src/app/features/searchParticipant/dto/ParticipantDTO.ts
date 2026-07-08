export interface ParticipantDTO {
    id: string;
    fullName: string;
    email: string;
    gender: string;
    birthday: string;
    phone: string | null;
    active: boolean;
    // Optional details
    weight?: number;
    height?: number; // cm
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    zipCode?: string;
}

export interface ParticipantPageDTO {
    data: ParticipantDTO[];
    meta: {
        total: number;
        page: number;
        pageSize: number;
        lastPage: number;
    };
}

export interface QuestionDTO {
    statement: string;
}

export interface SelectedOptionDTO {
    label: string;
    score: number;
}

export interface AnswerDTO {
    id: string;
    questionId: string;
    selectedOptionId: string;
    question: QuestionDTO;
    selectedOption: SelectedOptionDTO;
}

export interface QuestionnaireResponseDTO {
    id: string;
    totalScore: number;
    classification: string;
    date: string;
    participantId: string;
    questionnaireId: string;
    createdAt: string;
    updatedAt: string;
    answers: AnswerDTO[];
}
