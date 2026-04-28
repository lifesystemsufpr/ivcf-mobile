import { useQuery } from "@tanstack/react-query";
import { fetchDashboardData } from "../services/DashboardService";

export const useDashboard = () => {
    const query = useQuery({
        queryKey: ["dashboard"],
        queryFn: fetchDashboardData,
    });

    const data = query.data;

    let totalParticipants = 0;
    let averageScore = 0;
    let ageData: { label: string; value: number; color: string }[] = [];
    let riskData: { label: string; value: number; color: string }[] = [];

    if (data) {
        const rawTotal = data.summary?.totalParticipants;
        
        totalParticipants = typeof rawTotal === 'number' ? rawTotal : 0;

        const rawAvg = data.summary?.avgScore;
        const avgScoreValue = typeof rawAvg === 'number' ? rawAvg : 0;
        averageScore = typeof avgScoreValue === "number" ? parseFloat(avgScoreValue.toFixed(1)) : 0;

        if (Array.isArray(data.summary?.topAgeGroups)) {
            const colors = ["#4CAF50", "#FFC107", "#F44336", "#2196F3", "#9C27B0"];
            ageData = data.summary.topAgeGroups.map((item: any, idx: number) => ({
                label: item.label || "N/A",
                value: item.value || 0,
                color: colors[idx % colors.length]
            }));
        }

        if (Array.isArray(data.charts?.riskBar)) {
            riskData = data.charts.riskBar.map((item: any) => {
                let color = "#4CAF50";
                const label = item.category || "N/A";
                if (label.toLowerCase().includes("pré")) color = "#FFC107";
                else if (label.toLowerCase().includes("frágil")) color = "#F44336";
                return {
                    label,
                    value: item.count || 0,
                    color
                };
            });
        }
    }

    return {
        totalParticipants,
        totalEvaluated: data?.summary?.totalEvaluated || 0,
        averageScore,
        ageData,
        riskData,
        isLoading: query.isLoading,
        error: query.error,
        refetch: query.refetch,
    };
};
