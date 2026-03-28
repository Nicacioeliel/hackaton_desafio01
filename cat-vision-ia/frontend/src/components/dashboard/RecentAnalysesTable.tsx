import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, statusLabel } from "@/lib/format";
import type { AnalysisListItem } from "@/types/analysis";

function statusVariant(s: string) {
  if (s === "VERDE") return "success";
  if (s === "AMARELO") return "warning";
  if (s === "VERMELHO") return "danger";
  return "outline";
}

export function RecentAnalysesTable({ rows }: { rows: AnalysisListItem[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Análises recentes</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/historico">Ver tudo</Link>
        </Button>
      </CardHeader>
      <CardContent className="overflow-x-auto p-0">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-fg">
              <th className="px-5 py-3 font-medium">ART</th>
              <th className="px-3 py-3 font-medium">Documento</th>
              <th className="px-3 py-3 font-medium">Status</th>
              <th className="px-3 py-3 font-medium">Risco</th>
              <th className="px-3 py-3 font-medium">Quando</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.id}
                className="border-b border-border/80 hover:bg-muted/40 transition-colors"
              >
                <td className="px-5 py-3 font-mono text-xs font-medium">
                  {r.art_numero ?? "—"}
                </td>
                <td className="max-w-[200px] truncate px-3 py-3 text-muted-fg">
                  {r.upload_original_name ?? "—"}
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
                <td className="px-5 py-3 text-right">
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/analise/${r.id}`}>
                      Abrir
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
