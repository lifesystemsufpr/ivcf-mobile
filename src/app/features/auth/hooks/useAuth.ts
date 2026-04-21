import { useMutation } from "@tanstack/react-query"
import { authService } from "../services/AuthService"

export const useAuth = () => {

    const mutation = useMutation({ mutationFn: authService })

    return {
        login: mutation.mutate,
        isLoading: mutation.isPending,
        error: mutation.error,
        data: mutation.data
    }
}