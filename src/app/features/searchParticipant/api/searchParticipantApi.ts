import { httpClient } from "@/shared/api/httpClient";
import { ParticipantPageDTO } from "../dto/ParticipantDTO";

export const searchParticipantApi = {
    getAll: (page: number = 1, pageSize: number = 20) =>
        httpClient.get<ParticipantPageDTO>("/participant", {
            params: { page, pageSize },
        }),
    getParticipantHistory: (participantId: string) => 
        httpClient.get<any[]>("/questionnaires/participant/" + participantId),
};
