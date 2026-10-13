import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import {
  deferFilterNavigation,
  filterFixtureScans,
  flushFilterNavigation,
  renderPage,
} from "./InvoiceScansPage.filters.test-support";

describe("InvoiceScansPage filter URL navigation", () => {
  it("writes all criteria through controls and restores them after remounting the URL", async () => {
    const page = renderPage(filterFixtureScans(), "?campaign=lab#results");
    await screen.findByText("10 of 10");
    const user = userEvent.setup();
    await user.type(screen.getByRole("searchbox", { name: "Search documents" }), "CAFE");
    await user.selectOptions(screen.getByRole("combobox", { name: "Record type" }), "invoice");
    await user.selectOptions(screen.getByRole("combobox", { name: "Money direction" }), "in");
    await user.selectOptions(screen.getByRole("combobox", { name: "Status" }), "needs_review");
    await user.selectOptions(screen.getByRole("combobox", { name: "Category" }), "customer_service");
    fireEvent.change(screen.getByLabelText("Invoice date from"), { target: { value: "2026-09-10" } });
    fireEvent.change(screen.getByLabelText("Invoice date to"), { target: { value: "2026-09-10" } });
    await user.type(screen.getByLabelText("Minimum amount"), "100.5");
    await user.type(screen.getByLabelText("Maximum amount"), "100.5");
    expect(await screen.findByText("2 of 10")).toBeInTheDocument();
    const query = `${window.location.search}${window.location.hash}`;
    expect(Object.fromEntries(new URLSearchParams(window.location.search))).toEqual({
      campaign: "lab", q: "CAFE", type: "invoice", direction: "in", status: "needs_review",
      classification: "customer_service", from: "2026-09-10", to: "2026-09-10", min: "100.5", max: "100.5",
    });
    page.unmount();
    renderPage(filterFixtureScans(), query);
    expect(await screen.findByText("2 of 10")).toBeInTheDocument();
    for (const [label, value] of [
      ["Search documents", "CAFE"], ["Record type", "invoice"], ["Money direction", "in"],
      ["Status", "needs_review"], ["Category", "customer_service"], ["Invoice date from", "2026-09-10"],
      ["Invoice date to", "2026-09-10"], ["Minimum amount", "100.5"], ["Maximum amount", "100.5"],
    ]) expect(screen.getByLabelText(label)).toHaveValue(value);
    expect(screen.getAllByRole("button", { name: /^Remove filter / })).toHaveLength(9);
    expect(screen.getAllByRole("link", { name: "Invoice INV-1042" })).toHaveLength(2);
    expect(window.location.hash).toBe("#results");
  });

  it("ignores malformed URL criteria and removes them on the next valid edit", async () => {
    renderPage(filterFixtureScans(), "?q=%20&type=cheque&direction=sideways&status=done&classification=invalid&from=2026-02-30&to=not-a-date&min=Infinity&max=NaN&campaign=lab");
    expect(await screen.findByText("10 of 10")).toBeInTheDocument();
    for (const label of ["Search documents", "Record type", "Money direction", "Status", "Category", "Invoice date from", "Invoice date to", "Minimum amount", "Maximum amount"]) {
      expect(screen.getByLabelText(label)).toHaveValue("");
    }
    expect(screen.queryByRole("button", { name: /^Remove filter / })).not.toBeInTheDocument();
    await userEvent.setup().selectOptions(screen.getByRole("combobox", { name: "Status" }), "failed");
    expect(await screen.findByText("2 of 10")).toBeInTheDocument();
    expect(Object.fromEntries(new URLSearchParams(window.location.search))).toEqual({ campaign: "lab", status: "failed" });
  });

  it("restores controls, chips and results on browser Back and Forward popstate events", async () => {
    renderPage(filterFixtureScans(), "?q=CAFE&type=invoice&min=100.5&campaign=lab");
    expect(await screen.findByText("2 of 10")).toBeInTheDocument();
    act(() => {
      window.history.pushState(null, "", "/finance/invoices?type=transaction&max=0&campaign=next");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
    await waitFor(() => expect(screen.getByLabelText("Record type")).toHaveValue("transaction"));
    expect(screen.getByLabelText("Search documents")).toHaveValue("");
    expect(screen.getByLabelText("Minimum amount")).toHaveValue("");
    expect(screen.getByLabelText("Maximum amount")).toHaveValue("0");
    expect(screen.getByRole("button", { name: "Remove filter Maximum amount: 0" })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Customer deposit" })).toHaveLength(2);
    expect(screen.getAllByRole("link", { name: "Roof crew refund" })).toHaveLength(2);
    expect(screen.getByText("4 of 10")).toBeInTheDocument();

    act(() => window.history.back());
    await waitFor(() => expect(screen.getByLabelText("Record type")).toHaveValue("invoice"));
    expect(screen.getByLabelText("Search documents")).toHaveValue("CAFE");
    expect(screen.getByLabelText("Minimum amount")).toHaveValue("100.5");
    expect(screen.getByLabelText("Maximum amount")).toHaveValue("");
    expect(screen.getByRole("button", { name: "Remove filter Search: CAFE" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Remove filter Maximum amount: 0" })).not.toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Invoice INV-1042" })).toHaveLength(2);
    expect(screen.getByText("2 of 10")).toBeInTheDocument();

    act(() => window.history.forward());
    await waitFor(() => expect(screen.getByLabelText("Record type")).toHaveValue("transaction"));
    expect(screen.getByLabelText("Search documents")).toHaveValue("");
    expect(screen.getByLabelText("Maximum amount")).toHaveValue("0");
    expect(screen.getByText("4 of 10")).toBeInTheDocument();
    expect(new URLSearchParams(window.location.search).get("campaign")).toBe("next");
  });

  it("retains consecutive edits while Next has not propagated the URL to its hooks", async () => {
    renderPage(filterFixtureScans(), "?campaign=lab#results");
    await screen.findByText("10 of 10");
    deferFilterNavigation();
    act(() => {
      fireEvent.change(screen.getByRole("combobox", { name: "Record type" }), { target: { value: "invoice" } });
      fireEvent.change(screen.getByRole("combobox", { name: "Money direction" }), { target: { value: "in" } });
      fireEvent.change(screen.getByRole("combobox", { name: "Status" }), { target: { value: "needs_review" } });
      fireEvent.change(screen.getByRole("searchbox", { name: "Search documents" }), { target: { value: "Cafe " } });
      fireEvent.change(screen.getByRole("searchbox", { name: "Search documents" }), { target: { value: "Cafe Anderson" } });
    });
    expect(screen.getByText("10 of 10")).toBeInTheDocument();
    expect(screen.getByLabelText("Search documents")).toHaveValue("Cafe Anderson");
    expect(Object.fromEntries(new URLSearchParams(window.location.search))).toEqual({
      campaign: "lab", q: "Cafe Anderson", type: "invoice", direction: "in", status: "needs_review",
    });
    act(flushFilterNavigation);
    expect(await screen.findByText("2 of 10")).toBeInTheDocument();
    expect(screen.getByLabelText("Record type")).toHaveValue("invoice");
    expect(screen.getByLabelText("Money direction")).toHaveValue("in");
    expect(screen.getByLabelText("Status")).toHaveValue("needs_review");
    expect(screen.getByLabelText("Search documents")).toHaveValue("Cafe Anderson");
    expect(screen.getAllByRole("button", { name: /^Remove filter / })).toHaveLength(4);
    expect(window.location.hash).toBe("#results");
  });
});
