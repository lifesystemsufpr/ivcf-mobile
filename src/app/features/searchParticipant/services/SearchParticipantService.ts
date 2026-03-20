import { searchParticipantApi } from "../api/searchParticipantApi";
import { ParticipantDTO } from "../dto/ParticipantDTO";

export async function fetchAllParticipants(): Promise<ParticipantDTO[]> {
    const response = await searchParticipantApi.getAll();
    return response.data.data;
}

export async function fetchParticipantHistory(participantId: string): Promise<any[]> {
    const response = await searchParticipantApi.getParticipantHistory(participantId);
    return response.data;
}
