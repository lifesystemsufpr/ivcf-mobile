import { httpClient } from "@/shared/api/httpClient";

export const dashboardApi = {
    getDashboardData: () => httpClient.get("/questionnaires/dashboard"),
};
