import { Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ExecutiveSummaryCard({
  text,
  className,
  contentClassName,
}: {
  text: string | null | undefined;
  className?: string;
  contentClassName?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Sparkles className="h-4 w-4 text-primary" />
          Resumo executivo
        </CardTitle>
      </CardHeader>
      <CardContent className={contentClassName}>
        <p className="text-sm leading-relaxed text-muted-fg">{text ?? "—"}</p>
      </CardContent>
    </Card>
  );
}
