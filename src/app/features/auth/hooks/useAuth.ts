
import { useMutation } from "@tanstack/react-query"
import { authApi } from "../api/authApi"



export const useAuth = () => {

    const mutation = useMutation({ mutationFn: authApi.login })

    return {

        login: mutation.mutate,
        isLoading: mutation.isPending,
        error: mutation.error,
        data: mutation.data
    }
}