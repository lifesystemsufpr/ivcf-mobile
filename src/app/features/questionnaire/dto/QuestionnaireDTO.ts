export interface QuestionOptionDTO {
    id: string;
    label: string;
    score: number;
    order: number;
    questionId: string;
}

export interface QuestionDTO {
    id: string;
    statement: string;
    order: number;
    type: string;
    required: boolean;
    groupId: string;
    subGroupId: string | null;
    options: QuestionOptionDTO[];
}

export interface SubGroupDTO {
    id: string;
    title: string;
    order: number;
    description: string;
    groupId: string;
    questions: QuestionDTO[];
}

export interface GroupDTO {
    id: string;
    title: string;
    order: number;
    description: string;
    questionnaireId: string;
    questions: QuestionDTO[];
    subGroups: SubGroupDTO[];
}

export interface QuestionnaireDTO {
    id: string;
    title: string;
    slug: string;
    description: string;
    active: boolean;
    version: string;
    createdAt: string;
    updatedAt: string;
    groups: GroupDTO[];
}
