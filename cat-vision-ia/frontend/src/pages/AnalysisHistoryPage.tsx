import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingState } from "@/components/common/LoadingState";
import { formatDate, statusLabel } from "@/lib/format";
import {
  exportCsvUrl,
  exportJsonUrl,
  fetchAnalyses,
} from "@/services/analyses.service";

function statusVariant(s: string) {
  if (s === "VERDE") return "success";
  if (s === "AMARELO") return "warning";
  if (s === "VERMELHO") return "danger";
  return "outline";
}

export function AnalysisHistoryPage() {
  const [status, setStatus] = useState<string | undefined>();
  const [artQ, setArtQ] = useState("");
  const q = useQuery({
    queryKey: ["analyses", "list", status, artQ],
    queryFn: () => fetchAnalyses({ status, art_q: artQ || undefined }),
  });

  return (
    <div>
      <PageHeader
        eyebrow="Gestão"
        title="Histórico de análises"
        description="Filtre por status ou número da ART, reabra o painel lado a lado e exporte relatórios estruturados."
      />

      <Card className="mb-6">
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-2">
            <label className="text-xs font-medium text-muted-fg">ART (número)</label>
            <Input
              placeholder="Ex.: MA20250929762"
              value={artQ}
              onChange={(e) => setArtQ(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {(
              [
                { v: undefined as string | undefined, l: "Todos" },
                { v: "VERDE", l: statusLabel("VERDE") },
                { v: "AMARELO", l: statusLabel("AMARELO") },
                { v: "VERMELHO", l: statusLabel("VERMELHO") },
              ] as const
            ).map((f) => (
              <Button
                key={f.l}
                type="button"
                size="sm"
                variant={status === f.v ? "default" : "outline"}
                onClick={() => setStatus(f.v)}
              >
                {f.l}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {q.isLoading && <LoadingState />}
      {q.isError && (
        <ErrorState
          message={q.error instanceof Error ? q.error.message : "Erro"}
          onRetry={() => q.refetch()}
        />
      )}
      {q.data && q.data.length === 0 && (
        <p className="text-sm text-muted-fg">Nenhum registro com os filtros atuais.</p>
      )}
      {q.data && q.data.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-muted/80 text-left text-muted-fg">
              <tr>
                <th className="px-4 py-3 font-medium">ART</th>
                <th className="px-3 py-3 font-medium">Arquivo</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-3 py-3 font-medium">Risco</th>
                <th className="px-3 py-3 font-medium">Data</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {q.data.map((r) => (
                <tr key={r.id} className="border-t border-border/80 hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono text-xs">{r.art_numero}</td>
                  <td className="max-w-[200px] truncate px-3 py-3 text-muted-fg">
                    {r.upload_original_name}
                  </td>
                  <td className="px-3 py-3">
                    <Badge variant={statusVariant(r.overall_status)}>
                      {statusLabel(r.overall_status)}
                    </Badge>
                  </td>
                  <td className="px-3 py-3 tabular-nums">{r.risk_score.toFixed(1)}</td>
                  <td className="px-3 py-3 text-muted-fg">
                    {formatDate(r.created_at ?? undefined)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/analise/${r.id}`}>
                        Reabrir
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <a href={exportJsonUrl(r.id)} download>
                        JSON
                      </a>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <a href={exportCsvUrl(r.id)} download>
                        CSV
                      </a>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
