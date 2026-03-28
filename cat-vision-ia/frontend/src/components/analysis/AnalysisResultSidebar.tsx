import { AlertTriangle, CheckCircle2, Download, FileWarning, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExecutiveSummaryCard } from "@/components/analysis/ExecutiveSummaryCard";
import { RiskScoreCard } from "@/components/analysis/RiskScoreCard";
import { SuggestedFeedbackCard } from "@/components/analysis/SuggestedFeedbackCard";
import { TechnicalDetailAccordion } from "@/components/analysis/TechnicalDetailAccordion";
import { statusLabel } from "@/lib/format";
import type { AnalysisDetail } from "@/types/analysis";
import { exportCsvUrl, exportJsonUrl } from "@/services/analyses.service";

function countByStatus(fields: AnalysisDetail["field_results"]) {
  let compat = 0;
  let ausente = 0;
  let div = 0;
  for (const f of fields) {
    if (f.status === "COMPATIVEL") compat += 1;
    else if (f.status === "DIVERGENTE") div += 1;
    else if (f.status === "AUSENTE" || f.status === "NAO_VERIFICADO") ausente += 1;
  }
  return { compat, ausente, div };
}

export function AnalysisResultSidebar({
  data,
  fileUrl,
}: {
  data: AnalysisDetail;
  fileUrl: string;
}) {
  const { compat, ausente, div } = countByStatus(data.field_results);
  const cardStyle =
    "border-border/80 bg-card/80 shadow-none backdrop-blur-sm dark:bg-card/60";

  return (
    <div className="flex flex-col gap-4">
      <RiskScoreCard score={data.risk_score} className={cardStyle} />

      <Card className={cardStyle}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Contadores</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-2">
          <div className="rounded-lg border border-success/25 bg-success/10 px-2 py-3 text-center">
            <CheckCircle2 className="mx-auto mb-1 h-4 w-4 text-success" />
            <p className="text-xl font-bold tabular-nums text-success">{compat}</p>
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-fg">
              Compatíveis
            </p>
          </div>
          <div className="rounded-lg border border-warning/30 bg-warning/10 px-2 py-3 text-center">
            <FileWarning className="mx-auto mb-1 h-4 w-4 text-warning" />
            <p className="text-xl font-bold tabular-nums text-warning">{ausente}</p>
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-fg">
              Ausentes
            </p>
          </div>
          <div className="rounded-lg border border-danger/25 bg-danger/10 px-2 py-3 text-center">
            <XCircle className="mx-auto mb-1 h-4 w-4 text-danger" />
            <p className="text-xl font-bold tabular-nums text-danger">{div}</p>
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-fg">
              Divergentes
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className={cardStyle}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">
            Validação CNPJ (BrasilAPI)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant={
                data.cnpj_status === "OK"
                  ? "success"
                  : data.cnpj_status === "DIVERGENTE"
                    ? "danger"
                    : "warning"
              }
            >
              {data.cnpj_status
                ? statusLabel(data.cnpj_status)
                : "Não verificado"}
            </Badge>
          </div>
          {data.cnpj_validation?.razao_social_api && (
            <p className="text-xs leading-snug text-muted-fg">
              <span className="font-medium text-foreground">Razão social:</span>{" "}
              {data.cnpj_validation.razao_social_api}
            </p>
          )}
          {data.cnpj_validation?.situacao_cadastral && (
            <p className="text-xs text-muted-fg">
              Situação: {data.cnpj_validation.situacao_cadastral}
            </p>
          )}
        </CardContent>
      </Card>

      <Card
        className={
          data.upload_suspicious_metadata
            ? `${cardStyle} border-warning/40`
            : cardStyle
        }
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Metadados do PDF</CardTitle>
        </CardHeader>
        <CardContent>
          {data.upload_suspicious_metadata ? (
            <div className="flex gap-2 rounded-lg border border-warning/35 bg-warning/10 p-3 text-warning">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <p className="text-xs leading-relaxed">
                Indícios de criação ou edição em software gráfico. Recomenda-se
                verificação humana da autenticidade do arquivo.
              </p>
            </div>
          ) : (
            <p className="text-xs text-muted-fg">
              Nenhum alerta automático de metadados para este upload.
            </p>
          )}
        </CardContent>
      </Card>

      <ExecutiveSummaryCard
        text={data.executive_summary}
        className={cardStyle}
        contentClassName="max-h-44 overflow-y-auto pr-1"
      />

      <SuggestedFeedbackCard
        text={data.suggested_feedback}
        className={cardStyle}
        contentClassName="max-h-56 overflow-y-auto pr-1"
      />

      <Card className={cardStyle}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Exportar relatório</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Button variant="outline" size="sm" className="w-full justify-start" asChild>
            <a href={exportJsonUrl(data.id)} download>
              <Download className="mr-2 h-4 w-4" />
              Baixar JSON
            </a>
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start" asChild>
            <a href={exportCsvUrl(data.id)} download>
              <Download className="mr-2 h-4 w-4" />
              Baixar CSV
            </a>
          </Button>
          <Button variant="secondary" size="sm" className="w-full justify-start" asChild>
            <a href={fileUrl} target="_blank" rel="noreferrer">
              Abrir documento original
            </a>
          </Button>
        </CardContent>
      </Card>

      <TechnicalDetailAccordion data={data} className={cardStyle} />

      <p className="rounded-lg border border-dashed border-border/80 bg-muted/20 px-3 py-2 text-[11px] leading-relaxed text-muted-fg">
        Triagem automatizada para apoio à decisão. O analista do CREA-MA mantém a
        responsabilidade pela conclusão registrada no processo.
      </p>
    </div>
  );
}
