import { useMutation } from "@tanstack/react-query";
import { healthProfessionalApi } from "../api/healthProfessionalApi";

export const useCreateHealthProfessional = () => {
    return useMutation({
        mutationFn: healthProfessionalApi.create
    });
};
