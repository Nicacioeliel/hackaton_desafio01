import type { DashboardMetrics } from "@/types/dashboard";
import { api } from "./api";

export function fetchDashboardMetrics() {
  return api.get<DashboardMetrics>("/api/v1/dashboard/metrics");
}
