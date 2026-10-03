import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import type { QuickbooksImportJob } from "@/project/domain";

const hooks = vi.hoisted(() => ({
  refetch: vi.fn(),
  importMutate: vi.fn(),
  unlinkMutate: vi.fn(),
  deactivateMutate: vi.fn(),
  jobs: [] as QuickbooksImportJob[],
}));

vi.mock("../hooks/data/useQuickbooksImportJobs", () => ({
  useQuickbooksImportJobs: () => ({
    data: hooks.jobs,
    isPending: false,
    isFetching: false,
    error: null,
    refetch: hooks.refetch,
  }),
}));
vi.mock("../hooks/mutations/useQuickbooksImportBatch", () => ({
  useQuickbooksImportBatch: () => ({ mutate: hooks.importMutate, isPending: false, error: null }),
}));
vi.mock("../hooks/mutations/useQuickbooksJobDeactivation", () => ({
  useQuickbooksJobDeactivation: () => ({ mutate: hooks.deactivateMutate }),
}));
vi.mock("@/features/quickbooks/presentation/hooks/useUnlinkProjectQboLink", () => ({
  useUnlinkProjectQboLink: () => ({ mutate: hooks.unlinkMutate }),
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { QuickbooksJobActionDialog } from "../molecules/QuickbooksJobActionDialog";
import { useQuickbooksImportPageLogic } from "../pages/useQuickbooksImportPageLogic";
import { QuickbooksImportTable } from "./QuickbooksImportTable";

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn();
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
});

afterEach(cleanup);

function job(overrides: Partial<QuickbooksImportJob> = {}): QuickbooksImportJob {
  return {
    qboCustomerId: "387",
    displayName: "001R-0625, 3324 NW 14th St, Miami, FL",
    fullyQualifiedName: "001R-0625",
    active: true,
    balance: 24272.1,
    parentName: null,
    projectNumber: "001R-0625",
    importedProjectId: 70,
    matchingLeads: [],
    status: "ya_importado",
    statusDetail: "Already imported",
    role: "contrato_base",
    changeOrderNumber: null,
    suggestedProjectNumber: null,
    collidesWith: [],
    conflictProjectId: null,
    ...overrides,
  };
}

/** Misma conexión que hace la pantalla: la tabla pide, el diálogo confirma. */
function Harness() {
  const logic = useQuickbooksImportPageLogic();
  return (
    <>
      <QuickbooksImportTable
        rows={logic.rows}
        selectedIds={logic.selectedIds}
        onToggleRow={logic.toggleRow}
        onToggleAll={logic.toggleVisibleImportable}
        allSelected={false}
        someSelected={false}
        onProjectNumberChange={logic.setProjectNumber}
        onResetProjectNumber={logic.resetProjectNumber}
        onLeadChoiceChange={logic.setLeadChoice}
        resultsByJob={logic.resultsByJob}
        showResults={false}
        isLoading={false}
        emptyMessage="sin jobs"
        canWrite
        canDeactivate
        onRequestAction={logic.requestAction}
        actingJobId={logic.actingJobId}
      />
      <QuickbooksJobActionDialog
        pending={logic.pendingAction}
        onCancel={logic.cancelAction}
        onConfirm={logic.confirmAction}
      />
    </>
  );
}

describe("QuickbooksImportTable actions", () => {
  beforeEach(() => {
    hooks.jobs = [job()];
    hooks.refetch.mockClear();
    hooks.unlinkMutate.mockClear();
    hooks.deactivateMutate.mockClear();
  });

  it("never deactivates on the button alone: the confirmation is mandatory", async () => {
    render(<Harness />);

    await userEvent.click(screen.getByRole("button", { name: /Desactivar en QuickBooks/ }));

    expect(hooks.deactivateMutate).not.toHaveBeenCalled();
    expect(await screen.findByRole("alertdialog")).toHaveTextContent(
      /sus transacciones y su histórico se conservan/,
    );
  });

  it("calls nothing when the deactivation is cancelled", async () => {
    render(<Harness />);

    await userEvent.click(screen.getByRole("button", { name: /Desactivar en QuickBooks/ }));
    const dialog = await screen.findByRole("alertdialog");
    await userEvent.click(within(dialog).getByRole("button", { name: "Cancelar" }));

    expect(hooks.deactivateMutate).not.toHaveBeenCalled();
    expect(hooks.unlinkMutate).not.toHaveBeenCalled();
  });

  it("deactivates by job id once the confirmation is accepted", async () => {
    render(<Harness />);

    await userEvent.click(screen.getByRole("button", { name: /Desactivar en QuickBooks/ }));
    const dialog = await screen.findByRole("alertdialog");
    await userEvent.click(
      within(dialog).getByRole("button", { name: "Desactivar en QuickBooks" }),
    );

    expect(hooks.deactivateMutate).toHaveBeenCalledTimes(1);
    expect(hooks.deactivateMutate.mock.calls[0][0]).toBe("387");
  });

  it("unlinks by project id, and says the project and its lead are kept", async () => {
    render(<Harness />);

    await userEvent.click(screen.getByRole("button", { name: /Desvincular/ }));
    const dialog = await screen.findByRole("alertdialog");
    expect(dialog).toHaveTextContent(/El proyecto y su lead se conservan/);
    expect(hooks.unlinkMutate).not.toHaveBeenCalled();

    await userEvent.click(within(dialog).getByRole("button", { name: "Desvincular" }));

    expect(hooks.unlinkMutate).toHaveBeenCalledTimes(1);
    expect(hooks.unlinkMutate.mock.calls[0][0]).toBe(70);
  });

  it("offers no deactivation for a job QuickBooks already has inactive", () => {
    hooks.jobs = [job({ active: false })];
    render(<Harness />);

    expect(
      screen.queryByRole("button", { name: /Desactivar en QuickBooks/ }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Inactivo en QuickBooks")).toBeInTheDocument();
  });

  it("offers no unlink for a job that is not imported yet", () => {
    hooks.jobs = [job({ importedProjectId: null, status: "ok" })];
    render(<Harness />);

    expect(screen.queryByRole("button", { name: /Desvincular/ })).not.toBeInTheDocument();
  });
});
