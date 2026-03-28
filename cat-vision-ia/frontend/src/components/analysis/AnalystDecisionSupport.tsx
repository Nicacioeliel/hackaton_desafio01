import { Scale } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AnalystDecisionSupport() {
  return (
    <Card className="border-primary/25 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Scale className="h-5 w-5 text-primary" />
          Apoio à decisão humana
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-fg leading-relaxed">
        <p>
          Esta triagem é <strong className="text-foreground">explicável e rastreável</strong>,
          mas <strong className="text-foreground">não substitui</strong> a análise do
          profissional do CREA-MA. Use o semáforo e o score como priorização, não como
          decisão final.
        </p>
      </CardContent>
    </Card>
  );
}
