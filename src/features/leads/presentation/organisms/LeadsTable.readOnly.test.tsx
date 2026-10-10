import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ push: vi.fn(), tableProps: undefined as Record<string, unknown> | undefined }));

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }));
vi.mock("@/components/shared", () => ({
  EntityTable: (props: Record<string, unknown>) => {
    mocks.tableProps = props;
    return <button type="button" onClick={() => (props.onRowClick as (row: unknown) => void)(
      (props.data as unknown[])[0],
    )}>Open row</button>;
  },
}));

import { LeadsTable } from "./LeadsTable";

afterEach(() => {
  cleanup();
  mocks.push.mockReset();
  mocks.tableProps = undefined;
});

describe("LeadsTable read-only mode", () => {
  it("hides selection and row actions and opens the associated project", () => {
    render(
      <LeadsTable
        leads={[{ id: 71, project: { id: 148 } } as never]}
        getContextMenuItems={() => [{ label: "Delete", onClick: vi.fn() }]}
        readOnly
      />,
    );

    expect(mocks.tableProps?.selection).toBeUndefined();
    expect(mocks.tableProps?.getContextMenuItems).toBeUndefined();
    fireEvent.click(screen.getByRole("button", { name: "Open row" }));
    expect(mocks.push).toHaveBeenCalledWith("/project/148");
  });

  it("does not route to a lead when a converted row has no project", () => {
    render(
      <LeadsTable
        leads={[{ id: 71, project: null } as never]}
        getContextMenuItems={() => []}
        readOnly
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Open row" }));
    expect(mocks.push).not.toHaveBeenCalled();
  });
});
