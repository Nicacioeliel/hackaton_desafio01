import { OriginalDocumentViewer } from "./OriginalDocumentViewer";

export function DocumentPanel({
  fileUrl,
  mimeType,
}: {
  fileUrl: string;
  mimeType?: string | null;
}) {
  const isPdf = (mimeType || "").includes("pdf") || fileUrl.toLowerCase().endsWith(".pdf");
  if (isPdf) {
    return <OriginalDocumentViewer fileUrl={fileUrl} />;
  }
  return (
    <div className="rounded-xl border border-border bg-muted/20 p-4">
      <p className="mb-3 text-sm font-medium">Pré-visualização (imagem)</p>
      <div className="flex justify-center overflow-auto rounded-lg bg-card p-2">
        <img
          src={fileUrl}
          alt="Documento enviado"
          className="max-h-[min(70vh,720px)] w-auto object-contain"
        />
      </div>
    </div>
  );
}
