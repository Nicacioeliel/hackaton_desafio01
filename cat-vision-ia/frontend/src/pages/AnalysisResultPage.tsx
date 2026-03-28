import { Download, ExternalLink } from "lucide-react";
import { useParams } from "react-router-dom";
import { AnalysisStatusBadge } from "@/components/analysis/AnalysisStatusBadge";
import { AnalystDecisionSupport } from "@/components/analysis/AnalystDecisionSupport";
import { DocumentPanel } from "@/components/analysis/DocumentPanel";
import { ExecutiveSummaryCard } from "@/components/analysis/ExecutiveSummaryCard";
import { FieldComparisonTable } from "@/components/analysis/FieldComparisonTable";
import { RiskScoreCard } from "@/components/analysis/RiskScoreCard";
import { SuggestedFeedbackCard } from "@/components/analysis/SuggestedFeedbackCard";
import { TechnicalDetailAccordion } from "@/components/analysis/TechnicalDetailAccordion";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingState } from "@/components/common/LoadingState";
import { Button } from "@/components/ui/button";
import { useAnalysis } from "@/hooks/useAnalysis";
import { exportCsvUrl, exportJsonUrl } from "@/services/analyses.service";
import { uploadFileUrl } from "@/services/uploads.service";

export function AnalysisResultPage() {
  const { id } = useParams();
  const numId = Number(id);
  const q = useAnalysis(Number.isFinite(numId) ? numId : undefined);

  if (!Number.isFinite(numId))
    return <ErrorState message="ID de análise inválido." />;
  if (q.isLoading) return <LoadingState className="py-24" />;
  if (q.isError)
    return (
      <ErrorState
        message={q.error instanceof Error ? q.error.message : "Erro ao carregar"}
        onRetry={() => q.refetch()}
      />
    );

  const data = q.data!;
  const fileUrl = uploadFileUrl(data.upload_id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <AnalysisStatusBadge status={data.overall_status} />
          <span className="text-sm text-muted-fg">
            Análise #{data.id} · {data.upload_original_name}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href={exportJsonUrl(data.id)} download>
              <Download className="mr-2 h-4 w-4" />
              JSON
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href={exportCsvUrl(data.id)} download>
              <Download className="mr-2 h-4 w-4" />
              CSV
            </a>
          </Button>
          <Button variant="secondary" size="sm" asChild>
            <a href={fileUrl} target="_blank" rel="noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Abrir arquivo
            </a>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-12">
        <section className="space-y-4 xl:col-span-4">
          <DocumentPanel fileUrl={fileUrl} mimeType={data.upload_mime_type} />
        </section>
        <section className="space-y-4 xl:col-span-5">
          <FieldComparisonTable fields={data.field_results} />
        </section>
        <section className="space-y-4 xl:col-span-3">
          <RiskScoreCard score={data.risk_score} />
          <ExecutiveSummaryCard text={data.executive_summary} />
          <SuggestedFeedbackCard text={data.suggested_feedback} />
          <AnalystDecisionSupport />
          <TechnicalDetailAccordion data={data} />
        </section>
      </div>
    </div>
  );
}
