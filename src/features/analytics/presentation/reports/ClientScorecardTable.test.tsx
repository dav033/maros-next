import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ClientScorecardTable } from "./ClientScorecardTable";
import type { ClientScorecardRow } from "./useClientScorecard";

afterEach(cleanup);

const base: ClientScorecardRow = {
  contactId: 1,
  contactName: "Geoff Bruno",
  companyId: 10,
  companyName: "Bruno Holdings",
  leadCount: 7,
  wonCount: 6,
  lostCount: 1,
  openCount: 0,
  decidedCount: 7,
  closeRate: 0.8571,
  estimatedValueTotal: 400000,
  estimatedValueWon: 350000,
  lastLeadDate: "2026-09-01",
};

const neverCloses: ClientScorecardRow = {
  ...base,
  contactId: 2,
  contactName: "Sebastian Trujillo",
  companyId: null,
  companyName: null,
  wonCount: 0,
  lostCount: 7,
  closeRate: 0,
  estimatedValueWon: 0,
};

const undecided: ClientScorecardRow = {
  ...base,
  contactId: 3,
  contactName: "Fresh Client",
  leadCount: 3,
  wonCount: 0,
  lostCount: 0,
  openCount: 3,
  decidedCount: 0,
  closeRate: null,
  estimatedValueWon: 0,
};

function badgeFor(text: string): HTMLElement {
  return screen.getByText(text);
}

describe("Client scorecard table", () => {
  it("never shows an undecided client as 0%", () => {
    render(<ClientScorecardTable rows={[undecided]} now={Date.parse("2026-10-01T00:00:00Z")} />);

    expect(screen.queryByText("0%")).not.toBeInTheDocument();
    expect(screen.getByText("Not decided yet")).toBeInTheDocument();
    expect(screen.getByText("0 of 3 decided")).toBeInTheDocument();
  });

  it("styles an undecided client apart from one that closes nothing", () => {
    render(
      <ClientScorecardTable
        rows={[undecided, neverCloses]}
        now={Date.parse("2026-10-01T00:00:00Z")}
      />,
    );

    const undecidedBadge = badgeFor("Not decided yet");
    const zeroBadge = badgeFor("0%");

    expect(undecidedBadge.className).not.toBe(zeroBadge.className);
    expect(undecidedBadge.className).not.toMatch(/rose/);
    expect(zeroBadge.className).toMatch(/rose/);
  });

  it("separates a 6/7 client from a 0/7 client at a glance", () => {
    render(
      <ClientScorecardTable
        rows={[base, neverCloses]}
        now={Date.parse("2026-10-01T00:00:00Z")}
      />,
    );

    const winner = badgeFor("86%");
    const loser = badgeFor("0%");

    expect(winner.className).toMatch(/emerald/);
    expect(loser.className).toMatch(/rose/);
    expect(screen.getByText("6 of 7 decided")).toBeInTheDocument();
    expect(screen.getByText("0 of 7 decided")).toBeInTheDocument();

    const rows = screen.getAllByRole("row").slice(1);
    const accentOf = (row: HTMLElement) => row.firstElementChild?.className ?? "";
    expect(accentOf(rows[0])).toMatch(/border-l-emerald/);
    expect(accentOf(rows[1])).toMatch(/border-l-rose/);
  });

  it("links each client to its contact and flags a cooling relationship", () => {
    render(
      <ClientScorecardTable
        rows={[{ ...base, lastLeadDate: "2025-01-05" }]}
        now={Date.parse("2026-10-01T00:00:00Z")}
      />,
    );

    expect(screen.getByRole("link", { name: "Geoff Bruno" })).toHaveAttribute(
      "href",
      "/contact/1",
    );
    expect(screen.getByText("20 mo ago").className).toMatch(/rose/);
  });
});
