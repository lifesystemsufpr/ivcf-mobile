import { useMutation } from "@tanstack/react-query";
import { createHealthProfessionalService } from "../services/CreateHealthProfessionalService";

export const useCreateHealthProfessional = () => {
    const mutation = useMutation({ mutationFn: createHealthProfessionalService });

    return {
        create: mutation.mutate,
        isLoading: mutation.isPending,
        error: mutation.error,
        data: mutation.data
    }
};
