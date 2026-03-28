import { MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SuggestedFeedbackCard({
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
          <MessageSquare className="h-4 w-4 text-primary" />
          Devolutiva sugerida
        </CardTitle>
      </CardHeader>
      <CardContent className={contentClassName}>
        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-muted-fg">
          {text ?? "—"}
        </pre>
      </CardContent>
    </Card>
  );
}
