import { httpClient } from "@/shared/api/httpClient";

export const dashboardApi = {
    getTotalParticipants: () => httpClient.get("/dashboard/total-participants"),
    getAverageScore: () => httpClient.get("/dashboard/average-score"),
    getRiskDistribution: () => httpClient.get("/dashboard/risk-distribution"),
    getAgeDistribution: () => httpClient.get("/dashboard/age-distribution"),
};
