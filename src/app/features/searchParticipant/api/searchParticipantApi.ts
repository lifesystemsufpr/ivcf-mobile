import { httpClient } from "@/shared/api/httpClient";
import { ParticipantPageDTO } from "../dto/ParticipantDTO";

export const searchParticipantApi = {
    getAll: () => httpClient.get<ParticipantPageDTO>("/participant"),
    getParticipantHistory: (participantId: string) => 
        httpClient.get<any[]>("/questionnaires/participant/" + participantId),
};
