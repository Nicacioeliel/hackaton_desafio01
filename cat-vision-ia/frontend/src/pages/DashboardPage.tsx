import { AlertTriangle, CheckCircle2, Clock, FileSearch } from "lucide-react";
import { AnalysisStatusChart } from "@/components/dashboard/AnalysisStatusChart";
import { InconsistencyChart } from "@/components/dashboard/InconsistencyChart";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { RecentAnalysesTable } from "@/components/dashboard/RecentAnalysesTable";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingState } from "@/components/common/LoadingState";
import { PageHeader } from "@/components/layout/PageHeader";
import { useDashboard } from "@/hooks/useDashboard";
import { fetchAnalyses } from "@/services/analyses.service";
import { useQuery } from "@tanstack/react-query";

export function DashboardPage() {
  const d = useDashboard();
  const recent = useQuery({
    queryKey: ["analyses", "recent"],
    queryFn: () => fetchAnalyses(),
    select: (rows) => rows.slice(0, 8),
  });

  if (d.isLoading) return <LoadingState className="py-24" />;
  if (d.isError)
    return (
      <ErrorState
        message={d.error instanceof Error ? d.error.message : "Erro ao carregar painel"}
        onRetry={() => d.refetch()}
      />
    );

  const m = d.data!;

  return (
    <div>
      <PageHeader
        eyebrow="CAT Vision IA"
        title="Visão operacional da triagem"
        description="Indicadores para apoiar o analista na fila de documentos da CAT — sem substituir o julgamento humano."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total de análises"
          value={m.total_analyses}
          icon={FileSearch}
        />
        <MetricCard
          label="Compatível (verde)"
          value={m.conformidade_verde}
          tone="success"
          icon={CheckCircle2}
        />
        <MetricCard
          label="Atenção (amarelo)"
          value={m.atencao_amarelo}
          tone="warning"
          icon={Clock}
        />
        <MetricCard
          label="Divergência (vermelho)"
          value={m.divergencia_vermelho}
          tone="danger"
          hint={`${m.taxa_divergencias_pct}% do total`}
          icon={AlertTriangle}
        />
      </div>

      {m.tempo_medio_ms != null && (
        <p className="mt-4 text-sm text-muted-fg">
          Tempo médio de processamento:{" "}
          <span className="font-mono font-medium text-foreground">
            {(m.tempo_medio_ms / 1000).toFixed(2)}s
          </span>
        </p>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <AnalysisStatusChart
          verde={m.conformidade_verde}
          amarelo={m.atencao_amarelo}
          vermelho={m.divergencia_vermelho}
        />
        <InconsistencyChart items={m.top_inconsistencies} />
      </div>

      <div className="mt-8">
        {recent.isLoading ? (
          <LoadingState label="Carregando análises recentes…" />
        ) : recent.data && recent.data.length > 0 ? (
          <RecentAnalysesTable rows={recent.data} />
        ) : (
          <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-fg">
            Nenhuma análise registrada. Inicie pela tela{" "}
            <strong className="text-foreground">Nova análise</strong>.
          </p>
        )}
      </div>
    </div>
  );
}
