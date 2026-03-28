import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { ArtSelector } from "@/components/analysis/ArtSelector";
import { FilePreviewCard } from "@/components/upload/FilePreviewCard";
import { UploadDropzone } from "@/components/upload/UploadDropzone";
import { UploadMetadataCard } from "@/components/upload/UploadMetadataCard";
import { AnalystDecisionSupport } from "@/components/analysis/AnalystDecisionSupport";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/common/ErrorState";
import { useAnalysisDraft } from "@/store/analysis.store";
import { uploadFile } from "@/services/uploads.service";
import { useCreateAnalysis } from "@/hooks/useCreateAnalysis";

export function NewAnalysisPage() {
  const { upload, selectedArt, setUpload, setSelectedArt } = useAnalysisDraft();
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const mutation = useCreateAnalysis();

  async function onFile(f: File) {
    setErr(null);
    setUploading(true);
    try {
      const u = await uploadFile(f);
      setUpload(u);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Falha no upload");
    } finally {
      setUploading(false);
    }
  }

  function run() {
    if (!upload || !selectedArt) return;
    setErr(null);
    mutation.mutate(
      { uploadId: upload.id, artId: selectedArt.id },
      {
        onError: (e) =>
          setErr(e instanceof Error ? e.message : "Falha ao analisar"),
      },
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow="Fluxo principal"
        title="Nova triagem ACT × ART"
        description="Envie o Atestado de Capacidade Técnica (PDF ou imagem), confira hash e metadados, escolha a ART simulada e execute a análise automatizada de apoio."
      />

      <div className="grid gap-8 xl:grid-cols-2">
        <div className="space-y-6">
          <UploadDropzone onFile={onFile} disabled={uploading || mutation.isPending} />
          {err && <ErrorState message={err} />}
          {upload && (
            <>
              <FilePreviewCard upload={upload} />
              <UploadMetadataCard upload={upload} />
            </>
          )}
        </div>
        <div className="space-y-6">
          <ArtSelector selected={selectedArt} onSelect={setSelectedArt} />
          <AnalystDecisionSupport />
          <Button
            size="lg"
            className="w-full"
            disabled={!upload || !selectedArt || mutation.isPending}
            onClick={run}
          >
            {mutation.isPending ? "Processando análise…" : "Iniciar análise automatizada"}
          </Button>
          <p className="text-center text-xs text-muted-fg">
            Prazo-alvo de processamento: under 2 minutos (RNF01), dependendo de OCR e páginas.
          </p>
        </div>
      </div>
    </div>
  );
}
