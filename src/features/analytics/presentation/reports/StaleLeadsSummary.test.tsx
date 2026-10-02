import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { StaleLeadsSummary } from "./StaleLeadsSummary";
import { StaleLeadsTable } from "./StaleLeadsTable";
import type { StaleLead, StaleLeadsSummary as Summary } from "./useStaleLeads";

afterEach(cleanup);

const summary: Summary = {
  totalCount: 35,
  totalEstimate: 500000,
  buckets: [
    { bucket: "0-29", count: 0, estimate: 0 },
    { bucket: "30-59", count: 0, estimate: 0 },
    { bucket: "60-89", count: 10, estimate: 100000 },
    { bucket: "90-179", count: 0, estimate: 0 },
    { bucket: "180-364", count: 20, estimate: 300000 },
    { bucket: "365+", count: 5, estimate: 100000 },
  ],
  undatedCount: 27,
  undatedEstimate: 90000,
};

describe("Stale leads summary", () => {
  it("renders all six buckets even when some are empty", () => {
    render(<StaleLeadsSummary summary={summary} days={60} />);

    const buckets = screen.getByRole("list", { name: "Age buckets" });
    expect(within(buckets).getAllByRole("listitem")).toHaveLength(6);
    for (const label of ["0-29 days", "30-59 days", "60-89 days", "90-179 days", "180-364 days", "365+ days"]) {
      expect(within(buckets).getByText(label)).toBeInTheDocument();
    }
  });

  it("keeps undated leads out of the buckets but still on screen with their money", () => {
    render(<StaleLeadsSummary summary={summary} days={60} />);

    const buckets = screen.getByRole("list", { name: "Age buckets" });
    expect(within(buckets).queryByText("27")).not.toBeInTheDocument();

    const undated = screen.getByRole("region", { name: "Leads with no start date" });
    expect(within(undated).getByText("27")).toBeInTheDocument();
    expect(within(undated).getByText("$90,000")).toBeInTheDocument();
  });

  it("shows the threshold and the total value above the buckets", () => {
    render(<StaleLeadsSummary summary={summary} days={90} />);

    expect(screen.getByText("35")).toBeInTheDocument();
    expect(screen.getByText(/more than 90 days/)).toBeInTheDocument();
    expect(screen.getByText("$500,000")).toBeInTheDocument();
  });
});

const lead: StaleLead = {
  id: 42,
  leadNumber: "L-0042",
  name: "Warehouse roof",
  status: null,
  estimate: 0,
  ageDays: 517,
  ageBucket: "365+",
};

describe("Stale leads table", () => {
  it("links to the lead, names a missing status and presents age as a floor", () => {
    render(
      <StaleLeadsTable
        leads={[lead, { ...lead, id: 43, status: "NEW_LEAD", name: "Deck rebuild" }]}
      />,
    );

    expect(screen.getByRole("link", { name: "Warehouse roof" })).toHaveAttribute(
      "href",
      "/lead/42",
    );
    expect(screen.getByText("No status")).toBeInTheDocument();
    expect(screen.getByText("New lead")).toBeInTheDocument();
    expect(screen.getAllByText("517+ d")).toHaveLength(2);
  });
});
