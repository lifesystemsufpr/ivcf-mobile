import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchParticipantsPage } from "../services/SearchParticipantService";
import { ParticipantDTO } from "../dto/ParticipantDTO";

const PAGE_SIZE = 20;

export const useSearchParticipant = () => {
    const query = useInfiniteQuery({
        queryKey: ["participants"],
        queryFn: ({ pageParam }) => fetchParticipantsPage(pageParam, PAGE_SIZE),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            const { page, lastPage: totalPages } = lastPage.meta;
            return page < totalPages ? page + 1 : undefined;
        },
    });

    const participants: ParticipantDTO[] =
        query.data?.pages.flatMap((page) => page.data) ?? [];

    return {
        participants,
        isLoading: query.isLoading,
        isRefetching: query.isRefetching,
        error: query.error,
        refetch: query.refetch,
        fetchNextPage: query.fetchNextPage,
        hasNextPage: query.hasNextPage,
        isFetchingNextPage: query.isFetchingNextPage,
    };
};
