import { dashboardApi } from "../api/dashboardApi";

export async function fetchDashboardData() {
    const [totalRes, avgRes, riskRes, ageRes] = await Promise.all([
        dashboardApi.getTotalParticipants(),
        dashboardApi.getAverageScore(),
        dashboardApi.getRiskDistribution(),
        dashboardApi.getAgeDistribution(),
    ]);

    return {
        totalParticipants: totalRes.data,
        averageScore: avgRes.data,
        riskDistribution: riskRes.data,
        ageDistribution: ageRes.data,
    };
}
