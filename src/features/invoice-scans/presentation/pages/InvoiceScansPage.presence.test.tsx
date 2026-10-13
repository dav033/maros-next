import { act, fireEvent, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// The support module installs the API mocks and must be evaluated before anything imports the real API.
import { filterFixtureScans, renderPage, scan } from "./InvoiceScansPage.filters.test-support";
import { invoiceScanKeys } from "../hooks/useInvoiceScans";

// These tests keep the real Motion presence machinery (the contract tests probe props instead).
function recordSurfaces(): Element[] {
  return screen
    .getAllByRole("link", { name: /^Lion plumbing\.pdf/ })
    .map((link) => link.closest("tr, li"))
    .filter((surface): surface is Element => surface !== null);
}

function search(value: string) {
  fireEvent.change(screen.getByRole("searchbox", { name: "Search documents" }), { target: { value } });
}

describe("InvoiceScansPage record presence", () => {
  it("keeps every checkbox label associated with its own responsive and exiting instance", async () => {
    const page = renderPage([scan({ id: "checkbox-mover" })]);
    await screen.findByText("1 of 1");
    act(() => {
      page.client.setQueryData(invoiceScanKeys.list(), [scan({ id: "checkbox-mover", enteredAt: "2026-09-03T12:00:00Z" })]);
    });
    await screen.findByRole("region", { name: /entered in quickbooks/i });
    const checkboxes = document.querySelectorAll<HTMLElement>('[role="checkbox"]');
    expect(checkboxes).toHaveLength(4);
    expect(new Set(Array.from(checkboxes, (checkbox) => checkbox.id)).size).toBe(4);
    for (const checkbox of checkboxes) {
      const label = checkbox.closest("label");
      expect(label).not.toBeNull();
      expect(label?.htmlFor).toBe(checkbox.id);
      expect(document.getElementById(label!.htmlFor)).toBe(checkbox);
    }
    await waitFor(() => expect(document.querySelectorAll("tr[inert], li[inert]")).toHaveLength(0));
  });

  it.each([false, true])("restores both responsive titles after reversing a section move (initial entered: %s)", async (initialEntered) => {
    const initial = scan({ id: "reversal", enteredAt: initialEntered ? "2026-09-03T12:00:00Z" : null });
    // Active filters keep both sections mounted, including when the last entered record moves back.
    const page = renderPage([initial], "?q=Lion");
    await screen.findByText("1 of 1");
    const original = recordSurfaces();
    act(() => {
      page.client.setQueryData(invoiceScanKeys.list(), [
        { ...initial, enteredAt: initialEntered ? null : "2026-09-03T12:00:00Z" },
      ]);
    });
    expect(original).toHaveLength(2);
    await waitFor(() => {
      for (const surface of original) expect(surface).toHaveAttribute("inert");
    });
    act(() => page.client.setQueryData(invoiceScanKeys.list(), [initial]));
    await waitFor(() => expect(document.querySelectorAll("tr[inert], li[inert]")).toHaveLength(0));
    // Zero-size jsdom boxes reproduce the projection of the hidden responsive variant.
    await act(async () => { await new Promise((resolve) => setTimeout(resolve, 800)); });
    const returned = recordSurfaces();
    expect(returned).toHaveLength(2);
    for (const surface of returned) {
      expect(surface).not.toHaveAttribute("inert");
      const title = within(surface as HTMLElement).getByText("Lion plumbing.pdf");
      expect(title).not.toHaveStyle({ visibility: "hidden" });
    }
  });

  it("does not fade records in or hide them on the first render", async () => {
    renderPage([scan({ id: "first-pending" }), scan({ id: "first-entered", enteredAt: "2026-09-03T12:00:00Z" })]);
    await screen.findByText("2 of 2");
    const surfaces = recordSurfaces();
    expect(surfaces).toHaveLength(4);
    for (const surface of surfaces) {
      expect(surface).not.toHaveAttribute("aria-hidden");
      expect(surface).not.toHaveAttribute("inert");
      expect(surface).not.toHaveStyle({ opacity: "0" });
    }
  });

  it("removes filtered-out rows and cards at once with reduced motion", async () => {
    const matchMedia = window.matchMedia;
    vi.spyOn(window, "matchMedia").mockImplementation((query) => ({
      ...matchMedia(query), matches: query === "(prefers-reduced-motion: reduce)",
    }));
    renderPage([scan({ id: "reduced-pending" }), scan({ id: "reduced-entered", enteredAt: "2026-09-03T12:00:00Z" })]);
    await screen.findByText("2 of 2");
    const surfaces = recordSurfaces();
    expect(surfaces).toHaveLength(4);
    search("unmatched");
    expect(screen.getByText("0 of 2")).toBeInTheDocument();
    await waitFor(() => surfaces.forEach((surface) => expect(surface).not.toBeInTheDocument()));
    expect(screen.queryAllByRole("link", { name: /^Lion plumbing\.pdf/ })).toHaveLength(0);
    expect(screen.getAllByText("No documents match these filters")).toHaveLength(2);
  });

  it("makes records interactive again when the filter is cleared while they are leaving", async () => {
    renderPage([scan({ id: "leaving-pending" }), scan({ id: "leaving-entered", enteredAt: "2026-09-03T12:00:00Z" })]);
    await screen.findByText("2 of 2");
    const surfaces = recordSurfaces();
    search("unmatched");
    for (const surface of surfaces) expect(surface).toHaveAttribute("inert");
    search("");
    expect(screen.getByText("2 of 2")).toBeInTheDocument();
    await waitFor(() => {
      const returned = recordSurfaces();
      expect(returned).toHaveLength(4);
      for (const surface of returned) {
        expect(surface).not.toHaveAttribute("aria-hidden");
        expect(surface).not.toHaveAttribute("inert");
      }
    });
    // Leaving long enough must not drop records that came back.
    await new Promise((resolve) => setTimeout(resolve, 600));
    expect(recordSurfaces()).toHaveLength(4);
  });

  it("removes the leaving rows and cards when the same record enters the other section", async () => {
    const page = renderPage([scan({ id: "mover" })]);
    await screen.findByText("1 of 1");
    const toEnter = screen.getByRole("region", { name: /to enter/i });
    const leaving = within(toEnter).getAllByRole("link", { name: /^Lion plumbing\.pdf/ }).map((link) => link.closest("tr, li"));
    expect(leaving).toHaveLength(2);
    act(() => {
      page.client.setQueryData(invoiceScanKeys.list(), [scan({ id: "mover", enteredAt: "2026-09-03T12:00:00Z" })]);
    });
    const entered = await screen.findByRole("region", { name: /entered in quickbooks/i });
    expect(within(entered).getAllByRole("link", { name: /^Lion plumbing\.pdf/ })).toHaveLength(2);
    // Both surfaces share the title layout id; jsdom measures zero boxes, like a hidden responsive variant.
    await waitFor(() => leaving.forEach((item) => expect(item).not.toBeInTheDocument()));
    expect(within(toEnter).queryAllByRole("link", { name: /^Lion plumbing\.pdf/ })).toHaveLength(0);
    expect(document.querySelectorAll("tr[inert], li[inert]")).toHaveLength(0);
  });

  it("keeps only the matching records interactive while a changed filter animates", async () => {
    renderPage(filterFixtureScans());
    await screen.findByText("10 of 10");
    search("CAFE");
    const links = screen.getAllByRole("link", { name: /^Invoice INV-1042/ });
    expect(links).toHaveLength(4);
    for (const link of links) {
      const surface = link.closest("tr, li");
      expect(surface).not.toHaveAttribute("inert");
      expect(surface).not.toHaveAttribute("aria-hidden");
    }
    await waitFor(() => {
      const inert = document.querySelectorAll("tr[inert], li[inert]");
      expect(inert).toHaveLength(0);
    });
  });
});
