import { httpClient } from "@/shared/api/httpClient";
import { CreateHealthProfessionalPayloadDTO, CreateHealthProfessionalResponseDTO } from "../dto/CreateHealthProfessionalDTO";

export const healthProfessionalApi = {
    create: (data: CreateHealthProfessionalPayloadDTO) => 
        httpClient.post<CreateHealthProfessionalResponseDTO>("/health-professional", data),
};
