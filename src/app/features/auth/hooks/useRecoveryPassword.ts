import { useMutation } from "@tanstack/react-query";

import { recoveryPasswordApi } from "../api/recoveryPasswordApi";

export const useRecoveryPassword = () => {
    return useMutation({
        mutationFn: recoveryPasswordApi.create
    });
}