import { httpClient } from "@/shared/api/httpClient";
import { RecoveryPasswordDTO} from "../dto/RecoveryPasswordDTO";

export const recoveryPasswordApi = {
    create: (data: RecoveryPasswordDTO) => 
        httpClient.post<RecoveryPasswordDTO>("/auth/forgot-password", data),
};
