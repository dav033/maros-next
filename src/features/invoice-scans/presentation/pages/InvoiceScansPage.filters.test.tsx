import { act, fireEvent, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { chooseFilterOption, FILTER_RECORD_TITLES, filterFixtureScans, rejectNextListRequest, renderPage, scan } from "./InvoiceScansPage.filters.test-support";

function expectSectionTitles(
  sectionName: "To enter" | "Entered in QuickBooks",
  titles: string[],
  recordTitles: readonly string[] = FILTER_RECORD_TITLES,
) {
  const section = screen.getByRole("region", { name: new RegExp(sectionName, "i") });
  expect(within(section).getByRole("heading", { level: 2 })).toHaveTextContent(
    new RegExp(`^${sectionName}\\s*${titles.length}$`),
  );
  for (const title of recordTitles) {
    expect(within(section).queryAllByRole("link", { name: title })).toHaveLength(titles.includes(title) ? 1 : 0);
  }
  return section;
}

async function expectVisibleTitles(titles: string[]) {
  expect(await screen.findByText(`${titles.length * 2} of 10`)).toHaveAttribute("aria-live", "polite");
  for (const title of FILTER_RECORD_TITLES) {
    expect(screen.queryAllByRole("link", { name: title })).toHaveLength(titles.includes(title) ? 2 : 0);
  }
  expectSectionTitles("To enter", titles);
  expectSectionTitles("Entered in QuickBooks", titles);
}

describe("InvoiceScansPage filters", () => {
  it("keeps the last desktop and mobile records mounted for exit when both sections become empty", async () => {
    renderPage([scan({ id: "last-pending" }), scan({ id: "last-entered", enteredAt: "2026-09-03T12:00:00Z" })]);
    await screen.findByText("2 of 2");
    const items = screen.getAllByRole("link", { name: /^Lion plumbing\.pdf/ }).map((link) => link.closest("tr, li"));
    expect(items).toHaveLength(4);
    fireEvent.change(screen.getByRole("searchbox", { name: "Search documents" }), { target: { value: "unmatched" } });
    expect(screen.getByText("0 of 2")).toBeInTheDocument();
    for (const item of items) {
      expect(item).toBeInTheDocument();
      expect(item).toHaveAttribute("aria-hidden", "true");
      expect(item).toHaveAttribute("inert");
      expect(item).not.toHaveStyle({ position: "absolute" });
    }
    expect(screen.getAllByText("No documents match these filters")).toHaveLength(2);
    await waitFor(() => items.forEach((item) => expect(item).not.toBeInTheDocument()));
  });

  it("announces a failed cached refetch without claiming the filtered sections are valid empty results", async () => {
    const page = renderPage(filterFixtureScans(), "?q=unmatched");
    await screen.findByText("0 of 10");
    expect(screen.getAllByText("No documents match these filters")).toHaveLength(2);
    rejectNextListRequest();
    await act(async () => { await page.client.invalidateQueries({ queryKey: ["invoice-scans", "list"] }); });
    expect(await screen.findByText("Results unavailable")).toBeInTheDocument();
    expect(screen.queryByText("No documents match these filters")).not.toBeInTheDocument();
  });

  it("filters both sections from the URL and clears only filter parameters", async () => {
    renderPage([
      scan({ id: "pending-lion" }),
      scan({ id: "done-lion", enteredAt: "2026-09-03T12:00:00Z" }),
      scan({ id: "pending-other", fileName: "Other.pdf" }),
      scan({ id: "done-other", fileName: "Other.pdf", enteredAt: "2026-09-03T12:00:00Z" }),
    ], "?q=lion&campaign=lab&campaign=invoice#pending");

    expect(await screen.findByText("2 of 4")).toHaveAttribute("aria-live", "polite");
    const pending = screen.getByRole("region", { name: /to enter/i });
    const completed = screen.getByRole("region", { name: /entered in quickbooks/i });
    expect(within(pending).getByRole("heading", { level: 2 })).toHaveTextContent(/^To enter\s*1$/);
    expect(within(completed).getByRole("heading", { level: 2 })).toHaveTextContent(/^Entered in QuickBooks\s*1$/);
    expect(screen.queryByRole("link", { name: "Other.pdf" })).not.toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Remove filter Search: lion" }));
    expect(await screen.findByText("4 of 4")).toBeInTheDocument();
    expect(window.location.search).toBe("?campaign=lab&campaign=invoice");
    expect(window.location.hash).toBe("#pending");
  });

  it("keeps spaces while typing and offers a clear action in both filtered empty sections", async () => {
    renderPage([scan({}), scan({ id: "done", enteredAt: "2026-09-03T12:00:00Z" })]);
    await screen.findByText("2 of 2");
    const user = userEvent.setup();
    const search = screen.getByRole("searchbox", { name: "Search documents" });
    await user.type(search, "Lion plumbing");
    expect(search).toHaveValue("Lion plumbing");
    expect(new URLSearchParams(window.location.search).get("q")).toBe("Lion plumbing");
    expect(screen.getByText("2 of 2")).toBeInTheDocument();

    await chooseFilterOption(user, "Record type", "Manual transaction");
    expect(await screen.findByText("0 of 2")).toBeInTheDocument();
    const pending = screen.getByRole("region", { name: /to enter/i });
    const completed = screen.getByRole("region", { name: /entered in quickbooks/i });
    expect(within(pending).getByText("No documents match these filters")).toBeInTheDocument();
    expect(within(completed).getByText("No documents match these filters")).toBeInTheDocument();
    await user.click(within(completed).getByRole("button", { name: "Clear filters" }));
    expect(await screen.findByText("2 of 2")).toBeInTheDocument();
    expect(screen.getByRole("searchbox", { name: "Search documents" })).toHaveValue("");
    expect(window.location.search).toBe("");
  });

  it("explains the invoice date and announces reversed range errors", async () => {
    renderPage([scan({})], "?from=2026-09-03&to=2026-09-01&min=20&max=10");
    await screen.findByText("0 of 1");
    expect(screen.getByLabelText("Invoice date from")).toHaveAccessibleDescription(/issue date.*creation date.*local/i);
    expect(screen.getByLabelText("Invoice date from")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText("Invoice date to")).toHaveAccessibleDescription(/on or after/i);
    expect(screen.getByLabelText("Minimum amount")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText("Maximum amount")).toHaveAccessibleDescription(/at least/i);
    expect(screen.getAllByRole("alert")).toHaveLength(2);

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Remove filter Invoice date from: 2026-09-03" }));
    await user.click(screen.getByRole("button", { name: "Remove filter Minimum amount: 20" }));
    await waitFor(() => expect(screen.queryByRole("alert")).not.toBeInTheDocument());
  });

  it("accepts decimal and negative amount drafts without dropping existing criteria", async () => {
    renderPage([scan({})], "?status=needs_review&campaign=lab");
    await screen.findByText("1 of 1");
    const user = userEvent.setup();
    const minimum = screen.getByLabelText("Minimum amount");
    await user.type(minimum, "10.50");
    expect(minimum).toHaveValue("10.50");
    expect(new URLSearchParams(window.location.search).get("min")).toBe("10.5");
    await user.clear(minimum);
    await user.type(minimum, "-1.05");
    expect(minimum).toHaveValue("-1.05");
    expect(new URLSearchParams(window.location.search).get("min")).toBe("-1.05");
    expect(new URLSearchParams(window.location.search).get("status")).toBe("needs_review");
    expect(new URLSearchParams(window.location.search).get("campaign")).toBe("lab");

    await user.clear(minimum);
    await user.type(minimum, "-");
    expect(minimum).toHaveValue("-");
    await user.tab();
    expect(minimum).toHaveValue("");
    expect(new URLSearchParams(window.location.search).has("min")).toBe(false);
  });

  it("announces unavailable results without claiming filters matched an empty dataset", async () => {
    renderPage([], "?status=needs_review", new Error("unreachable"));
    expect(await screen.findByText("Results unavailable")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
    expect(screen.queryByText("No documents match these filters")).not.toBeInTheDocument();
    expect(screen.queryByText("0 of 0")).not.toBeInTheDocument();
  });

  it.each([
    ["document title", "INVOICE INV", "Invoice INV-1042"],
    ["file name", "Anderson-contract", "Invoice INV-1042"],
    ["counterparty ignoring case and accents", "CAFE", "Invoice INV-1042"],
    ["invoice number", "1042", "Invoice INV-1042"],
    ["project number", "050P-0826", "Invoice INV-1042"],
    ["comments", "PERMIT approved", "Invoice INV-1042"],
    ["manual transaction title", "Customer deposit", "Customer deposit"],
  ])("searches %s in both sections", async (_field, query, title) => {
    renderPage(filterFixtureScans());
    await screen.findByText("10 of 10");
    await userEvent.setup().type(screen.getByRole("searchbox", { name: "Search documents" }), query);
    await expectVisibleTitles([title]);
    expect(new URLSearchParams(window.location.search).get("q")).toBe(query);
    expect(screen.getByRole("button", { name: `Remove filter Search: ${query}` })).toBeInTheDocument();
  });

  it.each([
    { label: "Record type", value: "invoice", param: "type", option: "Invoice file", titles: ["Invoice INV-1042", "Invoice BILL-2002", "Unclassified.pdf"] },
    { label: "Record type", value: "transaction", param: "type", option: "Manual transaction", titles: ["Customer deposit", "Roof crew refund"] },
    { label: "Money direction", value: "in", param: "direction", option: "Money in", titles: ["Invoice INV-1042", "Customer deposit"] },
    { label: "Money direction", value: "out", param: "direction", option: "Money out", titles: ["Invoice BILL-2002", "Roof crew refund"] },
    { label: "Status", value: "uploaded", param: "status", option: "Awaiting scan", titles: ["Customer deposit"] },
    { label: "Status", value: "processing", param: "status", option: "Scanning", titles: ["Roof crew refund"] },
    { label: "Status", value: "needs_review", param: "status", option: "Ready to enter", titles: ["Invoice INV-1042", "Unclassified.pdf"] },
    { label: "Status", value: "failed", param: "status", option: "Scan failed", titles: ["Invoice BILL-2002"] },
    { label: "Category", value: "customer_service", param: "classification", option: "Customer service", titles: ["Invoice INV-1042"] },
    { label: "Category", value: "materials_expense", param: "classification", option: "Materials", titles: ["Invoice BILL-2002"] },
    { label: "Category", value: "subcontractor_expense", param: "classification", option: "Subcontractor", titles: ["Roof crew refund"] },
    { label: "Category", value: "other", param: "classification", option: "Other", titles: ["Customer deposit"] },
    { label: "Category", value: "unknown", param: "classification", option: "Unclassified", titles: ["Unclassified.pdf"] },
  ])("filters $label=$value through its labeled control", async ({ label, value, param, option, titles }) => {
    renderPage(filterFixtureScans());
    await screen.findByText("10 of 10");
    const control = screen.getByRole("combobox", { name: label });
    await chooseFilterOption(userEvent.setup(), label, option);
    await expectVisibleTitles(titles);
    expect(control).toHaveValue(value);
    expect(new URLSearchParams(window.location.search).get(param)).toBe(value);
    expect(screen.getByRole("button", { name: `Remove filter ${label}: ${option}` })).toBeInTheDocument();
  });

  it("uses issue dates before creation dates and falls back when the issue date is missing", async () => {
    renderPage(filterFixtureScans());
    await screen.findByText("10 of 10");
    fireEvent.change(screen.getByLabelText("Invoice date from"), { target: { value: "2026-09-10" } });
    fireEvent.change(screen.getByLabelText("Invoice date to"), { target: { value: "2026-09-12" } });
    await expectVisibleTitles(["Invoice INV-1042", "Invoice BILL-2002"]);
    expect(new URLSearchParams(window.location.search).get("from")).toBe("2026-09-10");
    expect(new URLSearchParams(window.location.search).get("to")).toBe("2026-09-12");
    const previousTimeZone = process.env.TZ;
    process.env.TZ = "America/Bogota";
    try {
      fireEvent.change(screen.getByLabelText("Invoice date from"), { target: { value: "2026-09-02" } });
      fireEvent.change(screen.getByLabelText("Invoice date to"), { target: { value: "2026-09-02" } });
      await expectVisibleTitles(["Unclassified.pdf"]);
    } finally {
      if (previousTimeZone === undefined) delete process.env.TZ;
      else process.env.TZ = previousTimeZone;
    }
  });

  it.each([
    ["100.5", "100.5", "Invoice INV-1042"],
    ["0", "0", "Customer deposit"],
    ["-25", "-25", "Roof crew refund"],
  ])("filters inclusive amount range %s to %s", async (minimum, maximum, title) => {
    renderPage(filterFixtureScans());
    await screen.findByText("10 of 10");
    const user = userEvent.setup();
    await user.type(screen.getByLabelText("Minimum amount"), minimum);
    await user.type(screen.getByLabelText("Maximum amount"), maximum);
    await expectVisibleTitles([title]);
    expect(new URLSearchParams(window.location.search).get("min")).toBe(minimum);
    expect(new URLSearchParams(window.location.search).get("max")).toBe(maximum);
    expect(screen.getByRole("button", { name: `Remove filter Minimum amount: ${minimum}` })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: `Remove filter Maximum amount: ${maximum}` })).toBeInTheDocument();
  });

  it("AND-combines criteria and removes one chip while retaining the others", async () => {
    renderPage(filterFixtureScans());
    await screen.findByText("10 of 10");
    const user = userEvent.setup();
    await user.type(screen.getByRole("searchbox", { name: "Search documents" }), "CAFE");
    await chooseFilterOption(user, "Record type", "Invoice file");
    await chooseFilterOption(user, "Money direction", "Money in");
    await chooseFilterOption(user, "Status", "Ready to enter");
    await chooseFilterOption(user, "Category", "Materials");
    await user.type(screen.getByLabelText("Minimum amount"), "80");
    await user.type(screen.getByLabelText("Maximum amount"), "150");
    await expectVisibleTitles([]);
    await user.click(screen.getByRole("button", { name: "Remove filter Category: Materials" }));
    await user.keyboard("{Escape}");
    await expectVisibleTitles(["Invoice INV-1042"]);
    expect(Object.fromEntries(new URLSearchParams(window.location.search))).toEqual({
      q: "CAFE", type: "invoice", direction: "in", status: "needs_review", min: "80", max: "150",
    });
    expect(screen.getAllByRole("button", { name: /^Remove filter / })).toHaveLength(6);
    expect(screen.getByRole("combobox", { name: "Category" })).toHaveValue("");
  });

  it("clears every criterion from the filter bar while preserving other URL state", async () => {
    renderPage(filterFixtureScans(), "?q=CAFE&type=invoice&direction=in&status=needs_review&classification=customer_service&from=2026-09-10&to=2026-09-10&min=100.5&max=100.5&campaign=lab#results");
    await expectVisibleTitles(["Invoice INV-1042"]);
    const filters = screen.getByRole("region", { name: "Document filters" });
    await userEvent.setup().click(within(filters).getByRole("button", { name: "Clear filters" }));
    await expectVisibleTitles(FILTER_RECORD_TITLES);
    expect(window.location.search).toBe("?campaign=lab");
    expect(window.location.hash).toBe("#results");
    for (const label of ["Search documents", "Record type", "Money direction", "Status", "Category", "Invoice date from", "Invoice date to", "Minimum amount", "Maximum amount"]) {
      expect(within(filters).getByLabelText(label)).toHaveValue("");
    }
    expect(screen.queryByRole("button", { name: /^Remove filter / })).not.toBeInTheDocument();
    expect(within(filters).getByRole("button", { name: "Clear filters" })).toBeDisabled();
  });

  it.each([/to enter/i, /entered in quickbooks/i])("clears a filtered empty state in %s", async (sectionName) => {
    renderPage(filterFixtureScans(), "?q=unmatched&campaign=lab");
    await expectVisibleTitles([]);
    const section = screen.getByRole("region", { name: sectionName });
    expect(within(section).getByText("No documents match these filters")).toBeInTheDocument();
    await userEvent.setup().click(within(section).getByRole("button", { name: "Clear filters" }));
    await expectVisibleTitles(FILTER_RECORD_TITLES);
    expect(window.location.search).toBe("?campaign=lab");
  });

  it.each([
    { search: "matching", pending: ["Matching first.pdf", "Matching second.pdf"], completed: [] },
    { search: "entered", pending: [], completed: ["Only entered.pdf"] },
  ])("keeps independent section counts and a clearable mixed empty state for $search", async ({ search, pending, completed }) => {
    const pendingTitles = ["Matching first.pdf", "Matching second.pdf", "Unrelated pending.pdf"];
    const completedTitles = ["Only entered.pdf"];
    const recordTitles = [...pendingTitles, ...completedTitles];
    renderPage([
      ...pendingTitles.map((fileName, index) => scan({ id: `pending-${index}`, fileName })),
      scan({ id: "completed", fileName: completedTitles[0], enteredAt: "2026-09-03T12:00:00Z" }),
    ], `?q=${search}&campaign=lab#results`);

    expect(await screen.findByText(`${pending.length + completed.length} of 4`)).toBeInTheDocument();
    const pendingSection = expectSectionTitles("To enter", pending, recordTitles);
    const completedSection = expectSectionTitles("Entered in QuickBooks", completed, recordTitles);
    const emptySection = pending.length === 0 ? pendingSection : completedSection;
    const populatedSection = pending.length === 0 ? completedSection : pendingSection;
    expect(within(emptySection).getByText("No documents match these filters")).toBeInTheDocument();
    expect(within(populatedSection).queryByText("No documents match these filters")).not.toBeInTheDocument();
    await userEvent.setup().click(within(emptySection).getByRole("button", { name: "Clear filters" }));

    expect(await screen.findByText("4 of 4")).toBeInTheDocument();
    expectSectionTitles("To enter", pendingTitles, recordTitles);
    expectSectionTitles("Entered in QuickBooks", completedTitles, recordTitles);
    expect(screen.queryByText("No documents match these filters")).not.toBeInTheDocument();
    expect(window.location.search).toBe("?campaign=lab");
    expect(window.location.hash).toBe("#results");
  });

  it("labels every control, follows keyboard focus order and activates chips and clear with the keyboard", async () => {
    renderPage(filterFixtureScans(), "?q=CAFE&type=invoice&direction=in&status=needs_review&classification=customer_service&from=2026-09-10&to=2026-09-10&min=100.5&max=100.5");
    await expectVisibleTitles(["Invoice INV-1042"]);
    const filters = screen.getByRole("region", { name: "Document filters" });
    const user = userEvent.setup();
    within(filters).getByRole("searchbox", { name: "Search documents" }).focus();
    expect(within(filters).getByLabelText("Search documents")).toHaveFocus();
    await user.tab();
    expect(within(filters).getByRole("button", { name: "Clear filters" })).toHaveFocus();
    for (const label of ["Record type", "Money direction", "Status", "Category", "Invoice date from", "Invoice date to", "Minimum amount", "Maximum amount"]) {
      await user.tab();
      expect(within(filters).getByLabelText(label)).toHaveFocus();
    }
    await user.tab();
    expect(screen.getByRole("button", { name: "Remove filter Search: CAFE" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(new URLSearchParams(window.location.search).has("q")).toBe(false);
    expect(new URLSearchParams(window.location.search).get("type")).toBe("invoice");
    within(filters).getByRole("button", { name: "Clear filters" }).focus();
    await user.keyboard(" ");
    await expectVisibleTitles(FILTER_RECORD_TITLES);
    expect(window.location.search).toBe("");
  });
});
