import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalysisDetail } from "@/types/analysis";

export function TechnicalDetailAccordion({
  data,
  className,
}: {
  data: AnalysisDetail;
  className?: string;
}) {
  const ocrPreview = ""; // opcional: endpoint futuro com texto OCR completo
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Detalhe técnico</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="w-full">
          <AccordionItem value="cnpj">
            <AccordionTrigger>Validação CNPJ (BrasilAPI)</AccordionTrigger>
            <AccordionContent>
              {data.cnpj_validation ? (
                <ul className="space-y-1 text-sm">
                  <li>
                    <span className="text-muted-fg">CNPJ:</span>{" "}
                    {data.cnpj_validation.cnpj_consultado}
                  </li>
                  <li>
                    <span className="text-muted-fg">Razão social:</span>{" "}
                    {data.cnpj_validation.razao_social_api ?? "—"}
                  </li>
                  <li>
                    <span className="text-muted-fg">Situação:</span>{" "}
                    {data.cnpj_validation.situacao_cadastral ?? "—"}
                  </li>
                  <li>
                    <span className="text-muted-fg">Status:</span>{" "}
                    {data.cnpj_validation.status}
                  </li>
                </ul>
              ) : (
                <p className="text-sm text-muted-fg">
                  Não verificado ou CNPJ não extraído do documento.
                </p>
              )}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="tables">
            <AccordionTrigger>Tabelas extraídas</AccordionTrigger>
            <AccordionContent>
              {data.tables.length === 0 ? (
                <p className="text-sm text-muted-fg">Nenhuma tabela estruturada.</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {data.tables.map((t) => (
                    <li key={t.id}>
                      <span className="font-medium">{t.table_name}</span>
                      <pre className="mt-1 max-h-40 overflow-auto rounded bg-muted p-2 text-xs">
                        {t.csv_content?.slice(0, 2000)}
                      </pre>
                    </li>
                  ))}
                </ul>
              )}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="proc">
            <AccordionTrigger>Processamento</AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-muted-fg">
                Tempo: {data.processing_time_ms ?? "—"} ms · Status CNPJ na análise:{" "}
                {data.cnpj_status ?? "—"}
              </p>
              {ocrPreview && <pre className="mt-2 text-xs">{ocrPreview}</pre>}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
