import { useQuery } from "@tanstack/react-query";
import { fetchDashboardMetrics } from "@/services/dashboard.service";

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard", "metrics"],
    queryFn: fetchDashboardMetrics,
  });
}
