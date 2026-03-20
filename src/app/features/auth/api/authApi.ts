import { httpClient } from "@/shared/api/httpClient";

import { LoginRequestDTO } from "../dto/LoginRequestDTO";
import { LoginResponseDTO } from "../dto/LoginResponseDTO";

export const authApi = {
    login: (data: LoginRequestDTO) => httpClient.post<LoginResponseDTO>("/auth/login", data),
}
