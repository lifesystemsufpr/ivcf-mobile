import { dashboardApi } from "../api/dashboardApi";

export async function fetchDashboardData() {
    const response = await dashboardApi.getDashboardData();
    return response.data;
}
