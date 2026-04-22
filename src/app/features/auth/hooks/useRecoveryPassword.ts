import { useMutation } from "@tanstack/react-query";

import { recoveryPasswordApi } from "../api/recoveryPasswordApi";
import { recoverPassword } from "../services/RecoveryPasswordService";

export const useRecoveryPassword = () => {

    const mutation = useMutation({ mutationFn: recoveryPasswordApi.create });
    

    return {
        recoverPassword: mutation.mutate,
        isLoading: mutation.isPending,
        error: mutation.error,
        data: mutation.data
    }
}