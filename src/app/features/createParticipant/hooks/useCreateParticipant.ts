import { useMutation } from "@tanstack/react-query";
import { CreateParticipantPayloadDTO } from "../dto/CreateParticipantDTO";
import { createParticipantService } from "../services/CreateParticipantService";
export const useCreateParticipant = () => {
    return useMutation({
        mutationFn: (payload: CreateParticipantPayloadDTO) =>
            createParticipantService.createParticipant
        (payload),
    });
};

