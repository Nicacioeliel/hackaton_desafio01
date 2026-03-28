import { Navigate, Route, Routes } from "react-router-dom";
import { AnalysisHistoryPage } from "@/pages/AnalysisHistoryPage";
import { AnalysisResultPage } from "@/pages/AnalysisResultPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { NewAnalysisPage } from "@/pages/NewAnalysisPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/analise/nova" element={<NewAnalysisPage />} />
      <Route path="/analise/:id" element={<AnalysisResultPage />} />
      <Route path="/historico" element={<AnalysisHistoryPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
