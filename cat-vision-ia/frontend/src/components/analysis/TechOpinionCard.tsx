import { ScrollText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function TechOpinionCard({
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
          <ScrollText className="h-4 w-4 text-primary" />
          Parecer técnico (detalhado)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {text?.trim() ? (
          <pre
            className={cn(
              "whitespace-pre-wrap font-sans text-xs leading-relaxed text-muted-fg",
              contentClassName,
            )}
          >
            {text}
          </pre>
        ) : (
          <p className="text-xs text-muted-fg">
            Parecer ainda não gerado. Use a ação &quot;Gerar parecer técnico&quot; para
            produzir o texto formal a partir dos resultados da triagem.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
