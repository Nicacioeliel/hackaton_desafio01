import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileSearch,
} from "lucide-react";
import { AnalysisStatusChart } from "@/components/dashboard/AnalysisStatusChart";
import { DistributionStripChart } from "@/components/dashboard/DistributionStripChart";
import { InconsistencyChart } from "@/components/dashboard/InconsistencyChart";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { RecentAnalysesTable } from "@/components/dashboard/RecentAnalysesTable";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingState } from "@/components/common/LoadingState";
import { PageHeader } from "@/components/layout/PageHeader";
import { criticalityLabel, statusLabel } from "@/lib/format";
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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
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
        <MetricCard
          label="Média de risco"
          value={
            m.media_risco != null ? m.media_risco.toFixed(1) : "—"
          }
          tone="warning"
          hint="Índice documental agregado"
          icon={Activity}
        />
      </div>

      <div className="mt-4 flex flex-col gap-1 text-sm text-muted-fg sm:flex-row sm:flex-wrap sm:gap-x-6">
        {m.tempo_medio_ms != null && (
          <p>
            Tempo médio de processamento:{" "}
            <span className="font-mono font-medium text-foreground">
              {(m.tempo_medio_ms / 1000).toFixed(2)}s
            </span>
          </p>
        )}
        <p>
          Taxa de análises em divergência (status vermelho):{" "}
          <span className="font-medium text-foreground">
            {m.taxa_divergencias_pct}%
          </span>
        </p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <AnalysisStatusChart
          verde={m.conformidade_verde}
          amarelo={m.atencao_amarelo}
          vermelho={m.divergencia_vermelho}
        />
        <InconsistencyChart items={m.top_inconsistencies} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <DistributionStripChart
          title="Divergências por criticidade (campos)"
          rows={(m.distribuicao_criticidade ?? []).map((x) => ({
            key: x.criticality,
            count: x.count,
          }))}
          formatLabel={(k) => criticalityLabel(k)}
        />
        <DistributionStripChart
          title="Volume por status de campo (todas as análises)"
          rows={(m.distribuicao_status_campos ?? []).map((x) => ({
            key: x.status,
            count: x.count,
          }))}
          formatLabel={(k) => statusLabel(k)}
        />
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
