import { NormativeRulesTable } from "@/components/analysis/NormativeRulesTable";
import { NormativeScoreCard } from "@/components/analysis/NormativeScoreCard";
import { NormativeSummaryCard } from "@/components/analysis/NormativeSummaryCard";
import type { AnalysisDetail, NormativeRuleRow } from "@/types/analysis";

export function NormativeValidationPanel({ data }: { data: AnalysisDetail }) {
  const rules = (data.normative_rules || []) as NormativeRuleRow[];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-2">
        <NormativeScoreCard
          score={data.normative_score}
          status={data.normative_status}
          breakdown={data.normative_breakdown}
        />
        <NormativeSummaryCard breakdown={data.normative_breakdown} />
      </div>
      <NormativeRulesTable rules={rules} />
      <p className="rounded-lg border border-dashed border-border/80 bg-muted/15 px-3 py-2 text-[11px] leading-relaxed text-muted-fg">
        Impacto na validação da CAT: itens em &quot;Não conformidade normativa&quot;
        indicam possível obstáculo à homologação documental, sujeito à análise humana.
      </p>
    </div>
  );
}
