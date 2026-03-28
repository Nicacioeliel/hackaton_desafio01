import { Focus, PanelLeftClose } from "lucide-react";
import { useParams } from "react-router-dom";
import { AnalysisResultSidebar } from "@/components/analysis/AnalysisResultSidebar";
import { AnalysisResultWorkspace } from "@/components/analysis/AnalysisResultWorkspace";
import { AnalysisStatusBadge } from "@/components/analysis/AnalysisStatusBadge";
import { AnalysisStepper } from "@/components/layout/AnalysisStepper";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingState } from "@/components/common/LoadingState";
import { Button } from "@/components/ui/button";
import { useAnalysis } from "@/hooks/useAnalysis";
import { formatDate } from "@/lib/format";
import { uploadFileUrl } from "@/services/uploads.service";
import { useAppStore } from "@/store/app.store";
import { cn } from "@/lib/utils";

export function AnalysisResultPage() {
  const { id } = useParams<{ id: string }>();
  const numId = Number(id);
  const q = useAnalysis(Number.isFinite(numId) ? numId : undefined);
  const analystFocusMode = useAppStore((s) => s.analystFocusMode);
  const setAnalystFocusMode = useAppStore((s) => s.setAnalystFocusMode);

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
    <div className="space-y-5 pb-8">
      <AnalysisStepper
        mode={{
          kind: "resultado",
          reviewStatus: data.review_status,
        }}
        className="mb-1"
      />

      <header className="flex flex-col gap-4 border-b border-border/80 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <AnalysisStatusBadge status={data.overall_status} />
            <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs text-muted-fg">
              #{data.id}
            </span>
          </div>
          <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
            Ambiente analítico — triagem ACT × ART
          </h1>
          <p className="max-w-3xl text-sm text-muted-fg">
            <span className="font-medium text-foreground">
              {data.upload_original_name ?? "Documento"}
            </span>
            {data.created_at && (
              <>
                {" "}
                · {formatDate(data.created_at)}
              </>
            )}
            {data.processing_time_ms != null && (
              <>
                {" "}
                · processado em{" "}
                <span className="font-mono">
                  {(data.processing_time_ms / 1000).toFixed(2)}s
                </span>
              </>
            )}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button
            type="button"
            variant={analystFocusMode ? "secondary" : "outline"}
            size="sm"
            className="gap-2"
            onClick={() => setAnalystFocusMode(!analystFocusMode)}
          >
            {analystFocusMode ? (
              <>
                <PanelLeftClose className="h-4 w-4" />
                Sair do modo análise
              </>
            ) : (
              <>
                <Focus className="h-4 w-4" />
                Modo análise
              </>
            )}
          </Button>
        </div>
      </header>

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1 lg:max-w-[70%] lg:flex-[0_0_70%]">
          <AnalysisResultWorkspace data={data} fileUrl={fileUrl} />
        </div>

        <aside
          className={cn(
            "w-full shrink-0 lg:sticky lg:max-h-[calc(100vh-5.5rem)] lg:w-[30%] lg:max-w-[30%] lg:flex-[0_0_30%] lg:overflow-y-auto lg:pl-2",
            analystFocusMode && "lg:top-14 lg:max-h-[calc(100vh-4rem)]",
            !analystFocusMode && "lg:top-20",
          )}
        >
          <div className="rounded-xl border border-border/60 bg-muted/10 p-4 dark:bg-muted/5">
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-fg">
              Centro de decisão
            </p>
            <AnalysisResultSidebar data={data} fileUrl={fileUrl} />
          </div>
        </aside>
      </div>
    </div>
  );
}
