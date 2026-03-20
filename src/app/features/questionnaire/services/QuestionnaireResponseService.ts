import { questionnaireResponseApi } from "../api/questionnaireResponseApi";
import { QuestionnaireResponseDTO } from "../dto/QuestionnaireResponseDTO";

export const questionnaireResponseService = {
    submitResponse: async (responseData: QuestionnaireResponseDTO) => {
        try {
            console.debug("Submitting questionnaire response:", responseData);

            return await questionnaireResponseApi.submit(responseData);
} catch (error: any) {
            // Log detailed axios error info to help debugging 400 responses
            if (error && error.response) {
                console.error("Error submitting questionnaire response:", error.response.data);
                
            } else {
                console.error("Unknown error submitting questionnaire response:", error);
            }
            throw error;
        }
    }
};

