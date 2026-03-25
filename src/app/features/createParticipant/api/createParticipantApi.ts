import { httpClient } from "@/shared/api/httpClient";
import { CreateParticipantPayloadDTO } from "../dto/CreateParticipantDTO";

export const createParticipantApi = {
    create: (payload: CreateParticipantPayloadDTO) =>
        httpClient.post("/participant", payload),
    checkEmail: (email: string) =>
        httpClient.get(`/participant/check-email/${email}`),
};

