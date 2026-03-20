import { useQuery } from "@tanstack/react-query";
import { fetchAllParticipants } from "../services/SearchParticipantService";

export const useSearchParticipant = () => {
    const query = useQuery({
        queryKey: ["participants"],
        queryFn: fetchAllParticipants,
    });

    return {
        participants: query.data ?? [],
        isLoading: query.isLoading,
        error: query.error,
        refetch: query.refetch,
    };
};
