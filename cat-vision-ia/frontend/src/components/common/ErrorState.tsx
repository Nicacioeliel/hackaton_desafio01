import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-danger/30 bg-danger/5 px-6 py-12 text-center">
      <AlertTriangle className="h-10 w-10 text-danger" />
      <div>
        <p className="font-semibold text-danger">Algo saiu do esperado</p>
        <p className="mt-1 text-sm text-muted-fg">{message}</p>
      </div>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          Tentar novamente
        </Button>
      )}
    </div>
  );
}
