import { create } from "zustand";
import { QuestionnaireDTO } from "../dto/QuestionnaireDTO";

interface QuestionnaireState {
    questionnaire: QuestionnaireDTO | null;
    setQuestionnaire: (questionnaire: QuestionnaireDTO) => void;
    clearQuestionnaire: () => void;
}

export const useQuestionnaireStore = create<QuestionnaireState>((set) => ({
    questionnaire: null,

    setQuestionnaire: (questionnaire) => {
        set({ questionnaire });
    },

    clearQuestionnaire: () => {
        set({ questionnaire: null });
    },
}));
