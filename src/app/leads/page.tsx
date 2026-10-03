import { PageHeader } from "@/components/page-header";
import { LeadsTable } from "@/components/leads-table";

export default function LeadsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Gestão"
        title="Leads"
        subtitle="Pesquise, filtre por status e clique em qualquer lead da lista para editar todos os detalhes."
      />
      <LeadsTable />
    </div>
  );
}
