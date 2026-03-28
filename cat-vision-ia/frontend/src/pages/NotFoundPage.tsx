import { Home } from "lucide-react";
import { Link } from "react-router-dom";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center">
      <EmptyState
        icon={Home}
        title="Página não encontrada"
        description="O endereço pode ter sido alterado ou a análise removida."
      />
      <Button asChild className="mt-4">
        <Link to="/dashboard">Ir ao painel</Link>
      </Button>
    </div>
  );
}
