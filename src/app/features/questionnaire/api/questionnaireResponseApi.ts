import { httpClient } from "@/shared/api/httpClient";
import { QuestionnaireResponseDTO } from "../dto/QuestionnaireResponseDTO";

export const questionnaireResponseApi = {
    submit: (payload: QuestionnaireResponseDTO) =>
        httpClient.post("/questionnaires/response", payload),
};
