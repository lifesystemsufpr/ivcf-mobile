import { authApi } from "../api/authApi"
import { mapUserDTO } from "../mappers/authMapper"
import { useAuthStore } from "../store/useAuthStore"

export async function login(email: string, password: string) {

    const response = await authApi.login({
        email,
        password
    })

    const { token, user } = response.data

    const authUser = mapUserDTO(user)

    useAuthStore.getState().setAuth(token, authUser)
}