import { useState } from "react";
import { Columns2, FileText, Table2 } from "lucide-react";
import { DocumentPanel } from "@/components/analysis/DocumentPanel";
import { EvidenceDrawer } from "@/components/analysis/EvidenceDrawer";
import { FieldComparisonTable } from "@/components/analysis/FieldComparisonTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AnalysisDetail, FieldResult } from "@/types/analysis";
import { cn } from "@/lib/utils";

export function AnalysisResultWorkspace({
  data,
  fileUrl,
}: {
  data: AnalysisDetail;
  fileUrl: string;
}) {
  const [evidenceField, setEvidenceField] = useState<FieldResult | null>(null);

  const openEvidence = (f: FieldResult) => setEvidenceField(f);

  return (
    <>
      <Tabs defaultValue="documento" className="w-full">
        <TabsList className="grid h-auto min-h-[3.25rem] w-full grid-cols-1 gap-2 rounded-xl border border-border/80 bg-gradient-to-b from-muted/60 to-muted/30 p-2 shadow-inner sm:grid-cols-3">
          <TabsTrigger
            value="documento"
            className={cn(
              "gap-2 rounded-lg py-3 text-sm font-semibold data-[state=active]:bg-card data-[state=active]:shadow-md",
              "data-[state=active]:ring-1 data-[state=active]:ring-primary/30",
            )}
          >
            <FileText className="h-4 w-4 shrink-0 opacity-80" />
            Documento
          </TabsTrigger>
          <TabsTrigger
            value="comparacao"
            className={cn(
              "gap-2 rounded-lg py-3 text-sm font-semibold data-[state=active]:bg-card data-[state=active]:shadow-md",
              "data-[state=active]:ring-1 data-[state=active]:ring-primary/30",
            )}
          >
            <Table2 className="h-4 w-4 shrink-0 opacity-80" />
            Validação por campos
          </TabsTrigger>
          <TabsTrigger
            value="dividido"
            className={cn(
              "gap-2 rounded-lg py-3 text-sm font-semibold data-[state=active]:bg-card data-[state=active]:shadow-md",
              "data-[state=active]:ring-1 data-[state=active]:ring-primary/30",
            )}
          >
            <Columns2 className="h-4 w-4 shrink-0 opacity-80" />
            Comparação lado a lado
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="documento"
          className="mt-5 outline-none transition-opacity duration-200 data-[state=inactive]:hidden"
        >
          <DocumentPanel
            fileUrl={fileUrl}
            mimeType={data.upload_mime_type}
            openFileHref={fileUrl}
            minHeightClass="min-h-[min(82vh,980px)]"
          />
        </TabsContent>

        <TabsContent
          value="comparacao"
          className="mt-5 outline-none transition-opacity duration-200 data-[state=inactive]:hidden"
        >
          <FieldComparisonTable
            fields={data.field_results}
            density="comfortable"
            onOpenEvidence={openEvidence}
          />
        </TabsContent>

        <TabsContent
          value="dividido"
          className="mt-5 outline-none transition-opacity duration-200 data-[state=inactive]:hidden"
        >
          <div className="grid min-h-0 grid-cols-1 gap-5 lg:grid-cols-2 lg:items-stretch">
            <div className="min-h-0 min-w-0">
              <DocumentPanel
                fileUrl={fileUrl}
                mimeType={data.upload_mime_type}
                openFileHref={fileUrl}
                minHeightClass="min-h-[min(62vh,720px)] lg:min-h-[min(72vh,840px)]"
              />
            </div>
            <div className="min-h-0 min-w-0">
              <FieldComparisonTable
                fields={data.field_results}
                density="compact"
                onOpenEvidence={openEvidence}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <EvidenceDrawer
        field={evidenceField}
        open={!!evidenceField}
        onClose={() => setEvidenceField(null)}
      />
    </>
  );
}
