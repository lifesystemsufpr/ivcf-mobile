import { httpClient } from "@/shared/api/httpClient";
import { QuestionnaireDTO } from "../dto/QuestionnaireDTO";

export const questionnaireApi = {
    getBySlug: (slug: string) =>
        httpClient.get<QuestionnaireDTO>(`/questionnaires/${slug}`),
};
