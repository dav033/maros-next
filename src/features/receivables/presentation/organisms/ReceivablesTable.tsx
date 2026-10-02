import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ReceivableProject } from "../../domain/types";
import { AgingBucketBadge } from "../atoms/AgingBucketBadge";
import { money } from "../atoms/money";

/** Rows arrive sorted by the backend (oldest debt first, undated last) and stay that way. */
export function ReceivablesTable({ projects }: { projects: ReceivableProject[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-elev-1">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Lead</TableHead>
            <TableHead>Project</TableHead>
            <TableHead className="text-right">Billed</TableHead>
            <TableHead className="text-right">Collected</TableHead>
            <TableHead className="text-right">Outstanding</TableHead>
            <TableHead className="text-right">Days</TableHead>
            <TableHead>Aging</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <TableRow key={project.id}>
              <TableCell className="font-mono text-xs text-muted-foreground">
                {project.leadNumber ?? "—"}
              </TableCell>
              <TableCell className="max-w-[18rem]">
                <Link href={`/project/${project.id}`} className="truncate font-medium hover:underline">
                  {project.name ?? "Untitled project"}
                </Link>
              </TableCell>
              <TableCell className="text-right font-mono tabular-nums">
                {money(project.billedAmount)}
              </TableCell>
              <TableCell className="text-right font-mono tabular-nums">
                {money(project.collectedAmount)}
              </TableCell>
              <TableCell className="text-right font-mono font-semibold tabular-nums">
                {money(project.outstandingAmount)}
              </TableCell>
              <TableCell className="text-right font-mono tabular-nums">
                {project.daysOutstanding ?? "—"}
              </TableCell>
              <TableCell>
                <AgingBucketBadge bucket={project.agingBucket} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
