import { AlertTriangle, Fingerprint } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UploadRecord } from "@/types/upload";

export function UploadMetadataCard({ upload }: { upload: UploadRecord }) {
  return (
    <Card className={upload.suspicious_metadata_flag ? "border-warning/40" : ""}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Fingerprint className="h-5 w-5 text-primary" />
          Integridade e metadados
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div>
          <p className="text-xs uppercase text-muted-fg">SHA-256</p>
          <p className="mt-1 break-all font-mono text-xs">{upload.sha256}</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase text-muted-fg">Creator</p>
            <p className="mt-0.5">{upload.creator ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-muted-fg">Producer</p>
            <p className="mt-0.5">{upload.producer ?? "—"}</p>
          </div>
        </div>
        {upload.suspicious_metadata_flag && (
          <div className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 p-3 text-warning">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-semibold text-sm">Alerta de metadados</p>
              <p className="text-xs opacity-90">
                Indícios de criação/edição em software gráfico. Verificar autenticidade
                na análise humana.
              </p>
            </div>
          </div>
        )}
        {!upload.suspicious_metadata_flag && (
          <Badge variant="success">Metadados sem alertas automáticos</Badge>
        )}
      </CardContent>
    </Card>
  );
}
