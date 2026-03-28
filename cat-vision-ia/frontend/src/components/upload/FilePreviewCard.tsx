import { FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UploadRecord } from "@/types/upload";

export function FilePreviewCard({ upload }: { upload: UploadRecord }) {
  const isPdf = upload.mime_type.includes("pdf");
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <FileText className="h-5 w-5 text-primary" />
          Arquivo recebido
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p>
          <span className="text-muted-fg">Nome:</span>{" "}
          <span className="font-medium">{upload.original_name}</span>
        </p>
        <p>
          <span className="text-muted-fg">Tipo:</span>{" "}
          {isPdf ? "PDF" : upload.mime_type}
        </p>
        {isPdf && (
          <p className="text-xs text-muted-fg">
            O preview completo aparece após a análise na tela de resultado.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
