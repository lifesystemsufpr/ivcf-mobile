import { useQuery } from "@tanstack/react-query";
import { fetchQuestionnaire } from "../services/QuestionnaireService";
import { QuestionDTO } from "../dto/QuestionnaireDTO";

const IVCF_SLUG = "ivcf-20";

/**
 * Flattens all questions from groups and subgroups, preserving their global order.
 */
function flattenQuestions(groups: import("../dto/QuestionnaireDTO").GroupDTO[]): QuestionDTO[] {
    const sorted = [...groups].sort((a, b) => a.order - b.order);

    return sorted.flatMap((group) => {
        const directQuestions = group.questions
            .filter((q) => q.subGroupId === null)
            .sort((a, b) => a.order - b.order);

        const subGroupQuestions = [...group.subGroups]
            .sort((a, b) => a.order - b.order)
            .flatMap((sub) =>
                [...sub.questions].sort((a, b) => a.order - b.order)
            );

        return [...directQuestions, ...subGroupQuestions];
    });
}

export const useQuestionnaire = () => {
    const query = useQuery({
        queryKey: ["questionnaire", IVCF_SLUG],
        queryFn: () => fetchQuestionnaire(IVCF_SLUG),
    });

    const questions: QuestionDTO[] = query.data
        ? flattenQuestions(query.data.groups)
        : [];

    return {
        questionnaire: query.data ?? null,
        questions,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        refetch: query.refetch,
    };
};
