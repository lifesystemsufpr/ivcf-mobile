import { createParticipantApi } from "../api/createParticipantApi";

export const createParticipantService = {
  createParticipant: async (participantData: any) => {
    try {
      console.debug("CreateParticipant payload:", participantData);
      return await createParticipantApi.create(participantData);
    } catch (error: any) {
      // Log detailed axios error info to help debugging 400 responses
      if (error && error.response) {
        console.error("CreateParticipant API error:", {
          status: error.response.status,
          data: error.response.data,
        });
      } else {
        console.error("CreateParticipant unknown error:", error);
      }
      throw error;
    }
  }
};