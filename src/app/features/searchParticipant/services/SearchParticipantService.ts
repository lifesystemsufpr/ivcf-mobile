import { searchParticipantApi } from "../api/searchParticipantApi";
import { ParticipantPageDTO } from "../dto/ParticipantDTO";

export async function fetchParticipantsPage(
    page: number = 1,
    pageSize: number = 20
): Promise<ParticipantPageDTO> {
    const response = await searchParticipantApi.getAll(page, pageSize);
    return response.data;
}

export async function fetchParticipantHistory(participantId: string): Promise<any[]> {
    const response = await searchParticipantApi.getParticipantHistory(participantId);
    return response.data;
}
