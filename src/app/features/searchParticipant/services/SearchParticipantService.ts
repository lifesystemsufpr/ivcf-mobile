import { searchParticipantApi } from "../api/searchParticipantApi";
import { ParticipantDTO } from "../dto/ParticipantDTO";

export async function fetchAllParticipants(): Promise<ParticipantDTO[]> {
    const response = await searchParticipantApi.getAll();
    return response.data.data;
}
