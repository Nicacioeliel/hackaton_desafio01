import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, X } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingState } from "@/components/common/LoadingState";
import { NormativeStatusBadge } from "@/components/analysis/NormativeStatusBadge";
import { formatDate, normativeGlobalLabel, statusLabel } from "@/lib/format";
import {
  exportCsvUrl,
  exportJsonUrl,
  exportPdfUrl,
  fetchAnalyses,
} from "@/services/analyses.service";
import { cn } from "@/lib/utils";

function statusVariant(s: string) {
  if (s === "VERDE") return "success";
  if (s === "AMARELO") return "warning";
  if (s === "VERMELHO") return "danger";
  return "outline";
}

type SortKey = "date_desc" | "risk_desc" | "risk_asc";

export function AnalysisHistoryPage() {
  const [status, setStatus] = useState<string | undefined>();
  const [artQ, setArtQ] = useState("");
  const [searchQ, setSearchQ] = useState("");
  const [riskMin, setRiskMin] = useState("");
  const [riskMax, setRiskMax] = useState("");
  const [sort, setSort] = useState<SortKey>("date_desc");
  const [normativeStatus, setNormativeStatus] = useState<
    "CONFORME" | "PARCIAL" | "NAO_CONFORME" | undefined
  >();

  const params = useMemo(
    () => ({
      status,
      art_q: artQ.trim() || undefined,
      q: searchQ.trim() || undefined,
      risk_min: riskMin.trim() !== "" ? Number(riskMin) : undefined,
      risk_max: riskMax.trim() !== "" ? Number(riskMax) : undefined,
      sort,
      normative_status: normativeStatus,
    }),
    [status, artQ, searchQ, riskMin, riskMax, sort, normativeStatus],
  );

  const q = useQuery({
    queryKey: ["analyses", "list", params],
    queryFn: () => fetchAnalyses(params),
  });

  const activeChips: { key: string; label: string; onClear: () => void }[] = [];
  if (status)
    activeChips.push({
      key: "status",
      label: `Status: ${statusLabel(status)}`,
      onClear: () => setStatus(undefined),
    });
  if (artQ.trim())
    activeChips.push({
      key: "art",
      label: `ART: ${artQ.trim()}`,
      onClear: () => setArtQ(""),
    });
  if (searchQ.trim())
    activeChips.push({
      key: "q",
      label: `Busca: ${searchQ.trim()}`,
      onClear: () => setSearchQ(""),
    });
  if (riskMin.trim())
    activeChips.push({
      key: "rmin",
      label: `Risco ≥ ${riskMin}`,
      onClear: () => setRiskMin(""),
    });
  if (riskMax.trim())
    activeChips.push({
      key: "rmax",
      label: `Risco ≤ ${riskMax}`,
      onClear: () => setRiskMax(""),
    });
  if (sort !== "date_desc")
    activeChips.push({
      key: "sort",
      label:
        sort === "risk_desc"
          ? "Ordenação: maior risco"
          : "Ordenação: menor risco",
      onClear: () => setSort("date_desc"),
    });
  if (normativeStatus)
    activeChips.push({
      key: "norm",
      label: `Normativo: ${normativeGlobalLabel(normativeStatus)}`,
      onClear: () => setNormativeStatus(undefined),
    });

  return (
    <div>
      <PageHeader
        eyebrow="Gestão"
        title="Histórico de análises"
        description="Filtros por ART, status, faixa de risco e texto livre (profissional, contratante, arquivo). Reabra o painel analítico ou exporte evidências."
      />

      <Card className="mb-6">
        <CardContent className="flex flex-col gap-4 p-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-fg">
                Número da ART
              </label>
              <Input
                placeholder="Ex.: MA20250929762"
                value={artQ}
                onChange={(e) => setArtQ(e.target.value)}
              />
            </div>
            <div className="space-y-2 md:col-span-2 lg:col-span-2">
              <label className="text-xs font-medium text-muted-fg">
                Busca (profissional, contratante, arquivo)
              </label>
              <Input
                placeholder="Trecho do nome ou do arquivo…"
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-fg">
                Risco mínimo
              </label>
              <Input
                type="number"
                min={0}
                max={100}
                step={0.1}
                placeholder="0"
                value={riskMin}
                onChange={(e) => setRiskMin(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-fg">
                Risco máximo
              </label>
              <Input
                type="number"
                min={0}
                max={100}
                step={0.1}
                placeholder="100"
                value={riskMax}
                onChange={(e) => setRiskMax(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-fg">Ordenar por</label>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    { v: "date_desc" as const, l: "Data (recentes)" },
                    { v: "risk_desc" as const, l: "Maior risco" },
                    { v: "risk_asc" as const, l: "Menor risco" },
                  ] as const
                ).map((f) => (
                  <Button
                    key={f.v}
                    type="button"
                    size="sm"
                    variant={sort === f.v ? "default" : "outline"}
                    onClick={() => setSort(f.v)}
                  >
                    {f.l}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium text-muted-fg">Status do semáforo</p>
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
          </div>

          <div>
            <p className="mb-2 text-xs font-medium text-muted-fg">
              Conformidade normativa (Res. 1.137)
            </p>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { v: undefined, l: "Todos" },
                  { v: "CONFORME" as const, l: "Conforme" },
                  { v: "PARCIAL" as const, l: "Parcial" },
                  { v: "NAO_CONFORME" as const, l: "Não conforme" },
                ] as const
              ).map((f) => (
                <Button
                  key={f.l}
                  type="button"
                  size="sm"
                  variant={normativeStatus === f.v ? "default" : "outline"}
                  onClick={() => setNormativeStatus(f.v)}
                >
                  {f.l}
                </Button>
              ))}
            </div>
          </div>

          {activeChips.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 border-t border-border/60 pt-3">
              <span className="text-xs font-medium text-muted-fg">Filtros ativos:</span>
              {activeChips.map((c) => (
                <Badge
                  key={c.key}
                  variant="secondary"
                  className="gap-1 pr-1 font-normal"
                >
                  {c.label}
                  <button
                    type="button"
                    className={cn(
                      "ml-1 rounded-full p-0.5 hover:bg-muted",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    )}
                    aria-label={`Remover ${c.label}`}
                    onClick={c.onClear}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
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
          <table className="w-full min-w-[960px] text-sm">
            <thead className="sticky top-0 z-10 bg-muted/90 text-left text-muted-fg backdrop-blur-sm">
              <tr>
                <th className="px-4 py-3 font-medium">ART</th>
                <th className="px-3 py-3 font-medium">Arquivo</th>
                <th className="px-3 py-3 font-medium">Resumo</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-3 py-3 font-medium">Normativo</th>
                <th className="px-3 py-3 font-medium">Risco</th>
                <th className="px-3 py-3 font-medium">Data</th>
                <th className="px-4 py-3 text-right font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {q.data.map((r) => (
                <tr key={r.id} className="border-t border-border/80 hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono text-xs">{r.art_numero}</td>
                  <td className="max-w-[180px] truncate px-3 py-3 text-muted-fg">
                    {r.upload_original_name}
                  </td>
                  <td className="max-w-[220px] px-3 py-3 text-xs leading-snug text-muted-fg">
                    <span className="line-clamp-2" title={r.summary_hint ?? undefined}>
                      {r.summary_hint ?? "—"}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <Badge variant={statusVariant(r.overall_status)}>
                      {statusLabel(r.overall_status)}
                    </Badge>
                  </td>
                  <td className="px-3 py-2">
                    {r.normative_status ? (
                      <div className="flex flex-col gap-0.5">
                        <NormativeStatusBadge status={r.normative_status} />
                        {r.normative_score != null && (
                          <span className="font-mono text-[10px] text-muted-fg">
                            {r.normative_score.toFixed(0)}%
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-fg">—</span>
                    )}
                  </td>
                  <td className="px-3 py-3 tabular-nums">{r.risk_score.toFixed(1)}</td>
                  <td className="px-3 py-3 text-muted-fg">
                    {formatDate(r.created_at ?? undefined)}
                  </td>
                  <td className="flex flex-wrap justify-end gap-1 px-3 py-2">
                    <Button variant="ghost" size="sm" className="h-8" asChild>
                      <Link to={`/analise/${r.id}`}>
                        Reabrir
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 px-2" asChild>
                      <a href={exportJsonUrl(r.id)} download>
                        JSON
                      </a>
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 px-2" asChild>
                      <a href={exportCsvUrl(r.id)} download>
                        CSV
                      </a>
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 px-2" asChild>
                      <a href={exportPdfUrl(r.id)} download target="_blank" rel="noreferrer">
                        PDF
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
