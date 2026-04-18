import { User } from "../types/User"

export interface LoginResponseDTO {
    token: string
    user: User
    access_token: string
}