import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { useInlineEdit } from "@/common/hooks";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

vi.mock("@/features/users/presentation/hooks/data/useUserDirectory", () => ({
  useUserDirectory: () => ({
    users: [{ id: 7, name: "Ana Perez", email: "ana@example.com", picture: null }],
    isLoading: false,
  }),
}));

import { LeadInfoSection, type LeadInfoSectionProps } from "./LeadInfoSection";

type LeadProp = LeadInfoSectionProps["lead"];

beforeAll(() => {
  // Radix y cmdk miden, observan y capturan el puntero; jsdom no implementa nada de
  // eso y sin estos stubs los menús del select y del picker no llegan a abrirse.
  Element.prototype.scrollIntoView = vi.fn();
  Element.prototype.hasPointerCapture = () => false;
  Element.prototype.releasePointerCapture = vi.fn();
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;
});

afterEach(cleanup);

function Harness({
  lead,
  onSave,
}: {
  lead: LeadProp;
  onSave: (patch: Record<string, unknown>) => Promise<void>;
}) {
  const inlineEdit = useInlineEdit({
    initialData: {
      name: lead.name ?? "",
      location: lead.location ?? "",
      addressLink: lead.addressLink ?? "",
      startDate: lead.startDate ?? "",
      status: lead.status ?? "",
      projectTypeId: undefined as number | undefined,
      contactId: undefined as number | undefined,
      estimate: undefined as number | undefined,
      ownerId: lead.ownerId ?? null,
      source: lead.source ?? null,
      lostReason: lead.lostReason ?? null,
      nextFollowUpAt: lead.nextFollowUpAt ?? null,
    },
    onSave: (patch) => onSave(patch as Record<string, unknown>),
  });

  return (
    <LeadInfoSection
      lead={lead}
      projectTypes={[]}
      inlineEdit={inlineEdit}
      onOpenNotesModal={vi.fn()}
    />
  );
}

function renderSection(lead: Partial<LeadProp> = {}) {
  const onSave = vi.fn().mockResolvedValue(undefined);
  render(
    <Harness
      lead={{ leadNumber: "050P-0826", name: "Lyon Plumbing", status: "CONTACTED", ...lead }}
      onSave={onSave}
    />,
  );
  return { onSave, user: userEvent.setup({ pointerEventsCheck: 0 }) };
}

/** El rol combobox no toma nombre de su contenido, así que se busca por el texto. */
function triggerWithText(text: string): HTMLElement {
  const node = screen.getByText(text).closest("button");
  if (!node) throw new Error(`No trigger for "${text}"`);
  return node;
}

describe("LeadInfoSection sales fields", () => {
  it("asks for the lost reason in the same gesture and saves nothing when it is dismissed", async () => {
    const { onSave, user } = renderSection();

    await user.click(screen.getByRole("button", { name: /Edit/ }));
    await user.click(triggerWithText("Contacted"));
    await user.click(screen.getByRole("option", { name: "Lost" }));

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText("Why was this lead lost?")).toBeInTheDocument();
    await user.click(within(dialog).getByRole("button", { name: "Cancel" }));

    // Sin motivo el estado no se mueve, así que no queda nada que guardar: la
    // petición que el backend rechazaría con 422 no sale.
    expect(triggerWithText("Contacted")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Save/ }));
    expect(onSave).not.toHaveBeenCalled();
  });

  it("sends status and lostReason together once a reason is picked", async () => {
    const { onSave, user } = renderSection();

    await user.click(screen.getByRole("button", { name: /Edit/ }));
    await user.click(triggerWithText("Contacted"));
    await user.click(screen.getByRole("option", { name: "Lost" }));

    const dialog = screen.getByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: "Price" }));
    await user.click(within(dialog).getByRole("button", { name: "Mark as lost" }));

    await user.click(screen.getByRole("button", { name: /Save/ }));
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave.mock.calls[0][0]).toEqual({ status: "LOST", lostReason: "price" });
  });

  it("clears the owner with null, not undefined", async () => {
    const { onSave, user } = renderSection({ ownerId: 7 });

    await user.click(screen.getByRole("button", { name: /Edit/ }));
    await user.click(screen.getByRole("button", { name: "Ana Perez" }));
    await user.click(screen.getByText("Unassigned"));
    await user.click(screen.getByRole("button", { name: /Save/ }));

    const patch = onSave.mock.calls[0][0] as Record<string, unknown>;
    expect(Object.keys(patch)).toEqual(["ownerId"]);
    expect(patch.ownerId).toBeNull();
  });

  it("does not invent a stage age when statusChangedAt is null", () => {
    renderSection({ statusChangedAt: null, nextFollowUpAt: null });

    const field = screen.getByText("In this stage since").closest("div");
    expect(field).not.toBeNull();
    expect(within(field as HTMLElement).getByText("Not available")).toBeInTheDocument();
    expect(field?.textContent).not.toMatch(/\d{4}/);
  });

  it("reads the sales fields the backend now returns", () => {
    renderSection({
      status: "LOST",
      ownerId: 7,
      source: "repeat_client",
      lostReason: "competitor",
      nextFollowUpAt: "2026-10-15",
      statusChangedAt: "2026-09-18T10:30:00Z",
    });

    expect(screen.getByText("Ana Perez")).toBeInTheDocument();
    expect(screen.getByText("Repeat client")).toBeInTheDocument();
    expect(screen.getByText("Competitor")).toBeInTheDocument();
    expect(screen.getByText("Oct 15, 2026")).toBeInTheDocument();
    expect(screen.getByText("Sep 18, 2026")).toBeInTheDocument();
  });
});
