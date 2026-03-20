import { AuthUser } from "../types/AuthUser"
import { UserDTO } from "../dto/UserDTO"

export function mapUserDTO(dto: UserDTO): AuthUser {
    return {
        id: dto.id,
        name: dto.name,
        email: dto.email
    }
}

export function mapJwtToUser(token: string): AuthUser {
    const payload = JSON.parse(atob(token.split(".")[1]))
    return {
        id: payload.sub,
        name: payload.username,
        email: payload.email,
    }
}