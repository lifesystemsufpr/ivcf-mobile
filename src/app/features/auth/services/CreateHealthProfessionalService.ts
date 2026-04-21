import { healthProfessionalApi } from "../api/healthProfessionalApi";
import { CreateHealthProfessionalPayloadDTO} from "../dto/CreateHealthProfessionalDTO";

export async function createHealthProfessionalService(data: CreateHealthProfessionalPayloadDTO) {
    const response = await healthProfessionalApi.create(data);
    return response.data;
}
