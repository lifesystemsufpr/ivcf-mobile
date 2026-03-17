import { questionnaireApi } from "../api/questionnaireApi";
import { QuestionnaireDTO } from "../dto/QuestionnaireDTO";

export async function fetchQuestionnaire(slug: string): Promise<QuestionnaireDTO> {
    const response = await questionnaireApi.getBySlug(slug);
    return response.data;
}
