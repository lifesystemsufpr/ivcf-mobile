import { authApi } from "../api/authApi"
import { LoginRequestDTO } from "../dto/LoginRequestDTO"
import { mapJwtToUser } from "../mappers/authMapper"
import { useAuthStore } from "../store/useAuthStore"

export async function authService(loginRequest: LoginRequestDTO) {

    const response = await authApi.login({
        email: loginRequest.email,
        password: loginRequest.password
    })

    const token = response.data.access_token || response.data.token;
    const authUser = mapJwtToUser(token)

    useAuthStore.getState().setAuth(token, authUser)

    return response.data;
}