import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileWarning,
  Loader2,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExecutiveSummaryCard } from "@/components/analysis/ExecutiveSummaryCard";
import { RiskScoreCard } from "@/components/analysis/RiskScoreCard";
import { ScoreExplanationCard } from "@/components/analysis/ScoreExplanationCard";
import { SuggestedFeedbackCard } from "@/components/analysis/SuggestedFeedbackCard";
import { TechnicalDetailAccordion } from "@/components/analysis/TechnicalDetailAccordion";
import { TechOpinionCard } from "@/components/analysis/TechOpinionCard";
import { usePatchAnalysisReview, useRegenerateParecer } from "@/hooks/useAnalysisMutations";
import { statusLabel } from "@/lib/format";
import type { AnalysisDetail } from "@/types/analysis";
import {
  exportCsvUrl,
  exportJsonUrl,
  exportPdfUrl,
  exportTxtUrl,
} from "@/services/analyses.service";

function countByStatus(fields: AnalysisDetail["field_results"]) {
  let compat = 0;
  let ausente = 0;
  let naoIdent = 0;
  let div = 0;
  let naoVer = 0;
  for (const f of fields) {
    if (f.status === "COMPATIVEL") compat += 1;
    else if (f.status === "DIVERGENTE") div += 1;
    else if (f.status === "AUSENTE") ausente += 1;
    else if (f.status === "NAO_IDENTIFICADO") naoIdent += 1;
    else if (f.status === "NAO_VERIFICADO") naoVer += 1;
  }
  return { compat, ausente, naoIdent, div, naoVer };
}

function reviewBadgeVariant(s: string | null | undefined) {
  const u = (s || "PENDENTE").toUpperCase();
  if (u === "REVISADO") return "success" as const;
  if (u === "CORRECAO_SOLICITADA") return "warning" as const;
  return "outline" as const;
}

export function AnalysisResultSidebar({
  data,
  fileUrl,
}: {
  data: AnalysisDetail;
  fileUrl: string;
}) {
  const { compat, ausente, naoIdent, div, naoVer } = countByStatus(
    data.field_results,
  );
  const cardStyle =
    "border-border/80 bg-card/80 shadow-none backdrop-blur-sm dark:bg-card/60";

  const patchReview = usePatchAnalysisReview(data.id);
  const regenParecer = useRegenerateParecer(data.id);

  const review = (data.review_status || "PENDENTE").toUpperCase();
  const reviewLabel =
    review === "REVISADO"
      ? "Revisado pelo analista"
      : review === "CORRECAO_SOLICITADA"
        ? "Correção solicitada"
        : "Pendente de revisão";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={reviewBadgeVariant(data.review_status)}>
          Revisão: {reviewLabel}
        </Badge>
      </div>

      <RiskScoreCard score={data.risk_score} className={cardStyle} />

      <ScoreExplanationCard
        breakdown={data.score_breakdown}
        score={data.risk_score}
        className={cardStyle}
      />

      <Card className={cardStyle}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">
            Contadores por status
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <div className="rounded-lg border border-success/25 bg-success/10 px-2 py-3 text-center">
            <CheckCircle2 className="mx-auto mb-1 h-4 w-4 text-success" />
            <p className="text-lg font-bold tabular-nums text-success">{compat}</p>
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-fg">
              Compatíveis
            </p>
          </div>
          <div className="rounded-lg border border-warning/30 bg-warning/10 px-2 py-3 text-center">
            <FileWarning className="mx-auto mb-1 h-4 w-4 text-warning" />
            <p className="text-lg font-bold tabular-nums text-warning">{ausente}</p>
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-fg">
              Ausentes
            </p>
          </div>
          <div className="rounded-lg border border-warning/25 bg-warning/5 px-2 py-3 text-center">
            <FileWarning className="mx-auto mb-1 h-4 w-4 text-warning" />
            <p className="text-lg font-bold tabular-nums text-warning">{naoIdent}</p>
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-fg">
              Não identif. (OCR)
            </p>
          </div>
          <div className="rounded-lg border border-danger/25 bg-danger/10 px-2 py-3 text-center">
            <XCircle className="mx-auto mb-1 h-4 w-4 text-danger" />
            <p className="text-lg font-bold tabular-nums text-danger">{div}</p>
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-fg">
              Divergentes
            </p>
          </div>
          <div className="rounded-lg border border-border/80 bg-muted/20 px-2 py-3 text-center sm:col-span-2">
            <ShieldCheck className="mx-auto mb-1 h-4 w-4 text-muted-fg" />
            <p className="text-lg font-bold tabular-nums text-foreground">{naoVer}</p>
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-fg">
              Não verificados
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

      <TechOpinionCard
        text={data.technical_opinion}
        className={cardStyle}
        contentClassName="max-h-52 overflow-y-auto pr-1 text-xs"
      />

      <SuggestedFeedbackCard
        text={data.suggested_feedback}
        className={cardStyle}
        contentClassName="max-h-56 overflow-y-auto pr-1"
      />

      <Card className={cardStyle}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Ações rápidas</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Button
            type="button"
            variant="default"
            size="sm"
            className="w-full justify-start"
            disabled={regenParecer.isPending}
            onClick={() => regenParecer.mutate()}
          >
            {regenParecer.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Gerar parecer técnico
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="w-full justify-start"
            disabled={patchReview.isPending || review === "REVISADO"}
            onClick={() => patchReview.mutate("REVISADO")}
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Marcar como revisado
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full justify-start"
            disabled={patchReview.isPending}
            onClick={() => patchReview.mutate("CORRECAO_SOLICITADA")}
          >
            <AlertTriangle className="mr-2 h-4 w-4" />
            Solicitar correção ao profissional
          </Button>
        </CardContent>
      </Card>

      <Card className={cardStyle}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Exportar</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Button variant="outline" size="sm" className="w-full justify-start" asChild>
            <a href={exportJsonUrl(data.id)} download>
              <Download className="mr-2 h-4 w-4" />
              JSON (relatório completo)
            </a>
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start" asChild>
            <a href={exportCsvUrl(data.id)} download>
              <Download className="mr-2 h-4 w-4" />
              CSV (campos)
            </a>
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start" asChild>
            <a href={exportPdfUrl(data.id)} download target="_blank" rel="noreferrer">
              <Download className="mr-2 h-4 w-4" />
              PDF (parecer resumido)
            </a>
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start" asChild>
            <a href={exportTxtUrl(data.id)} download>
              <Download className="mr-2 h-4 w-4" />
              Texto (.txt)
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
        Triagem explicável e rastreável para apoio à decisão. Não substitui o
        julgamento profissional do analista do CREA-MA.
      </p>
    </div>
  );
}
