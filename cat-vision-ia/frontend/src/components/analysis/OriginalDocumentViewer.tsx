import { useState } from "react";
import { Document, Page } from "react-pdf";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function OriginalDocumentViewer({
  fileUrl,
  title = "Documento original",
}: {
  fileUrl: string;
  title?: string;
}) {
  const [pages, setPages] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [err, setErr] = useState<string | null>(null);

  return (
    <Card className="flex h-full min-h-[480px] flex-col">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
        <CardTitle className="text-base">{title}</CardTitle>
        {pages && pages > 1 && (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Anterior
            </Button>
            <span className="text-xs text-muted-fg tabular-nums">
              {page} / {pages}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= pages}
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
            >
              Próxima
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="flex flex-1 flex-col overflow-hidden">
        {err && (
          <p className="text-sm text-danger">
            Não foi possível renderizar o PDF: {err}
          </p>
        )}
        <div className="flex flex-1 justify-center overflow-auto rounded-lg border border-border bg-muted/30 p-2">
          <Document
            file={fileUrl}
            onLoadSuccess={(d) => {
              setPages(d.numPages);
              setErr(null);
            }}
            onLoadError={(e) => setErr(String(e.message))}
            loading={
              <p className="p-8 text-sm text-muted-fg">Carregando documento…</p>
            }
          >
            <Page
              pageNumber={page}
              width={Math.min(520, typeof window !== "undefined" ? window.innerWidth - 80 : 520)}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </Document>
        </div>
      </CardContent>
    </Card>
  );
}
