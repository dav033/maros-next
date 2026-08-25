"use client";

import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatCurrency } from "@/shared/utils";
import type { Project, ProjectPaymentsResponse } from "@/project/domain";
import { ProjectHttpRepository } from "../../infra/http/ProjectHttpRepository";

const repository = new ProjectHttpRepository();

export function ProjectPaymentsDialog({ project, onClose }: { project: Project | null; onClose: () => void }) {
  const query = useQuery({
    queryKey: ["project-payments", project?.id],
    queryFn: () => repository.getPaymentDetails(project!.id),
    enabled: project != null,
  });

  return (
    <Dialog open={project != null} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-3xl">
        <DialogHeader><DialogTitle>Payments · {project?.lead.leadNumber ?? `Project #${project?.id}`}</DialogTitle></DialogHeader>
        {query.isLoading ? <p className="text-sm text-muted-foreground">Loading payment receipts…</p> : null}
        {query.error ? <p className="text-sm text-destructive">Could not load QuickBooks payments.</p> : null}
        {query.data ? <PaymentContent data={query.data} /> : null}
      </DialogContent>
    </Dialog>
  );
}

function PaymentContent({ data }: { data: ProjectPaymentsResponse }) {
  if (data.count === 0) return <p className="text-sm text-muted-foreground">No payments.</p>;
  return <div className="space-y-3"><div className="flex gap-4 text-sm"><span>{data.count} receipts</span><span className="font-mono">{formatCurrency(data.totalAmount)}</span></div><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-left text-muted-foreground"><th className="p-2">Date</th><th className="p-2">Amount</th><th className="p-2">Method</th><th className="p-2">Invoices</th><th className="p-2">Warnings</th></tr></thead><tbody>{data.items.map((item) => <tr key={item.id} className="border-b border-border/60"><td className="p-2">{item.date ?? "—"}</td><td className="p-2 font-mono">{formatCurrency(item.amount)}</td><td className="p-2">{item.method ?? "—"}</td><td className="p-2">{item.linkedInvoices.length || "—"}</td><td className="p-2">{item.warnings.length ? item.warnings.join(", ") : "—"}</td></tr>)}</tbody></table></div></div>;
}
