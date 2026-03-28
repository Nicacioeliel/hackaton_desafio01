import { Columns2, FileText, PanelLeft } from "lucide-react";
import { DocumentPanel } from "@/components/analysis/DocumentPanel";
import { FieldComparisonTable } from "@/components/analysis/FieldComparisonTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AnalysisDetail } from "@/types/analysis";

export function AnalysisResultWorkspace({
  data,
  fileUrl,
}: {
  data: AnalysisDetail;
  fileUrl: string;
}) {
  return (
    <Tabs defaultValue="documento" className="w-full">
      <TabsList className="grid h-auto min-h-14 w-full grid-cols-1 gap-1.5 rounded-xl border border-border bg-muted/50 p-1.5 sm:grid-cols-3">
        <TabsTrigger value="documento" className="gap-2 py-3">
          <FileText className="h-4 w-4 shrink-0 opacity-80" />
          <span>Documento</span>
        </TabsTrigger>
        <TabsTrigger value="comparacao" className="gap-2 py-3">
          <Columns2 className="h-4 w-4 shrink-0 opacity-80" />
          <span>Comparação</span>
        </TabsTrigger>
        <TabsTrigger value="dividido" className="gap-2 py-3">
          <PanelLeft className="h-4 w-4 shrink-0 opacity-80" />
          <span>Visão dividida</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="documento" className="mt-5 focus-visible:outline-none">
        <DocumentPanel
          fileUrl={fileUrl}
          mimeType={data.upload_mime_type}
          openFileHref={fileUrl}
          minHeightClass="min-h-[min(80vh,960px)]"
        />
      </TabsContent>

      <TabsContent value="comparacao" className="mt-5 focus-visible:outline-none">
        <FieldComparisonTable fields={data.field_results} density="comfortable" />
      </TabsContent>

      <TabsContent value="dividido" className="mt-5 focus-visible:outline-none">
        <div className="grid min-h-0 grid-cols-1 gap-5 lg:grid-cols-[minmax(0,47%)_minmax(0,53%)] lg:items-stretch">
          <div className="min-h-0 min-w-0">
            <DocumentPanel
              fileUrl={fileUrl}
              mimeType={data.upload_mime_type}
              openFileHref={fileUrl}
              minHeightClass="min-h-[min(62vh,720px)] lg:min-h-[min(70vh,820px)]"
            />
          </div>
          <div className="min-h-0 min-w-0">
            <FieldComparisonTable
              fields={data.field_results}
              density="compact"
            />
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
