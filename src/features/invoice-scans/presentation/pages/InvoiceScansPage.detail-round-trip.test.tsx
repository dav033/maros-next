import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useSyncExternalStore, type ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/link", () => ({
  default: ({ href, onClick, ...props }: ComponentProps<"a"> & { href: string }) => (
    <a {...props} href={href} onClick={(event) => {
      onClick?.(event);
      if (event.defaultPrevented) return;
      event.preventDefault();
      window.history.pushState(null, "", href);
      window.dispatchEvent(new PopStateEvent("popstate"));
    }} />
  ),
}));
vi.mock("../components/AttachDocumentPanel", () => ({ AttachDocumentPanel: () => null }));
vi.mock("../components/DeleteInvoiceScanButton", () => ({
  DeleteInvoiceScanButton: ({ onDeleted }: { onDeleted: () => void }) => <button onClick={onDeleted}>Confirm lab deletion</button>,
}));
vi.mock("../components/InvoiceDetailsForm", () => ({ InvoiceDetailsForm: () => null }));
vi.mock("../components/InvoiceDocumentPreview", () => ({ InvoiceDocumentPreview: () => null }));
vi.mock("../components/InvoiceScanWarnings", () => ({ InvoiceScanWarnings: () => null }));
vi.mock("../components/ProjectNumberSelect", () => ({ ProjectNumberSelect: () => null }));
vi.mock("../components/TransactionDetailsForm", () => ({ TransactionDetailsForm: () => null }));

import { filterFixtureScans, renderPage } from "./InvoiceScansPage.filters.test-support";
import { InvoiceScanDetailPage } from "./InvoiceScanDetailPage";
import { InvoiceScansPage } from "./InvoiceScansPage";

const criteria = {
  q: "CAFE", type: "invoice", direction: "in", status: "needs_review", classification: "customer_service",
  from: "2026-09-10", to: "2026-09-10", min: "100.5", max: "100.5", campaign: "lab",
};

function Journey() {
  const path = useSyncExternalStore(
    (onChange) => {
      window.addEventListener("popstate", onChange);
      return () => window.removeEventListener("popstate", onChange);
    },
    () => window.location.pathname,
  );
  return path === "/finance/invoices"
    ? <InvoiceScansPage />
    : <InvoiceScanDetailPage id={path.split("/").at(-1) ?? ""} />;
}

describe("InvoiceScansPage detail round trip", () => {
  it.each(["desktop", "mobile"])("carries all filters through the %s detail link and explicit return", async (viewport) => {
    const matchMedia = window.matchMedia;
    vi.spyOn(window, "matchMedia").mockImplementation((query) => ({
      ...matchMedia(query), matches: viewport === "mobile" && query === "(max-width: 767px)",
    }));
    renderPage(filterFixtureScans(), `?${new URLSearchParams(criteria)}`, undefined, <Journey />);
    await screen.findByText("2 of 10");
    const link = screen.getAllByRole("link", { name: /^Invoice INV-1042/ }).find((candidate) => candidate.closest(viewport === "desktop" ? "tr" : "li"));
    expect(link).toBeDefined();
    if (!link) throw new Error(`Missing ${viewport} detail link`);
    const detailUrl = new URL(link?.getAttribute("href") ?? "", window.location.origin);
    expect(detailUrl.pathname).toBe("/finance/invoices/customer");
    expect(Object.fromEntries(detailUrl.searchParams)).toEqual(criteria);
    const user = userEvent.setup();
    await user.click(link);
    expect(await screen.findByRole("heading", { level: 1, name: "Invoice INV-1042" })).toBeInTheDocument();
    expect(window.location.pathname).toBe("/finance/invoices/customer");
    const backLink = screen.getByRole("link", { name: "All document scans" });
    const returnUrl = new URL(backLink.getAttribute("href") ?? "", window.location.origin);
    expect(returnUrl.pathname).toBe("/finance/invoices");
    expect(Object.fromEntries(returnUrl.searchParams)).toEqual(criteria);
    await user.click(backLink);
    expect(await screen.findByText("2 of 10")).toBeInTheDocument();
    expect(window.location.pathname).toBe("/finance/invoices");
    expect(Object.fromEntries(new URLSearchParams(window.location.search))).toEqual(criteria);
    expect(screen.getAllByRole("button", { name: /^Remove filter / })).toHaveLength(9);
    for (const [label, value] of [
      ["Search documents", "CAFE"], ["Record type", "invoice"], ["Money direction", "in"],
      ["Status", "needs_review"], ["Category", "customer_service"], ["Invoice date from", "2026-09-10"],
      ["Invoice date to", "2026-09-10"], ["Minimum amount", "100.5"], ["Maximum amount", "100.5"],
    ]) expect(screen.getByLabelText(label)).toHaveValue(value);
    expect(screen.getAllByRole("link", { name: /^Invoice INV-1042/ })).toHaveLength(4);
    expect(screen.queryByRole("link", { name: /^Invoice BILL-2002/ })).not.toBeInTheDocument();
  });
});
