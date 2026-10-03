import { PageHeader } from "@/components/page-header";
import { KanbanBoard } from "@/components/kanban-board";

export default function KanbanPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Pipeline"
        title="Funil de Vendas"
        subtitle="Arraste os cards entre as colunas para mover um lead entre pendente, comprou e recusado."
      />
      <KanbanBoard />
    </div>
  );
}
