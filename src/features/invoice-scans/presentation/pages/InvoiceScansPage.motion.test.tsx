import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ElementType, HTMLAttributes, ReactNode } from "react";
import type { MotionProps } from "motion/react";
import { describe, expect, it, vi } from "vitest";

import { routeEntranceTransition, sharedEntityReturnTransition, taskCardSurfaceTransition } from "@/shared/presentation/motionTransitions";

vi.mock("motion/react", async (importOriginal) => {
  const original = await importOriginal<typeof import("motion/react")>();
  const { createElement, forwardRef } = await import("react");
  function probe(Component: ElementType) {
    return forwardRef<HTMLElement, MotionProps & HTMLAttributes<HTMLElement> & { layoutCrossfade?: boolean }>(
      function MotionProbe({ layout, layoutId, initial, animate, exit, transition, layoutCrossfade: _crossfade,
        onLayoutAnimationStart: _layoutStart, onLayoutAnimationComplete: _layoutComplete, ...props }, ref) {
        return createElement(Component, {
          ...props, ref,
          "data-motion-props": JSON.stringify({ layout, layoutId, initial, animate, exit, transition }),
        });
      },
    );
  }
  return {
    ...original,
    motion: { create: probe, span: probe("span"), li: probe("li") },
    AnimatePresence: ({ children }: { children: ReactNode }) => children,
    LayoutGroup: ({ children }: { children: ReactNode }) => children,
    useIsPresent: () => true,
  };
});

import { chooseFilterOption, filterFixtureScans, renderPage } from "./InvoiceScansPage.filters.test-support";

function motionProps(element: Element | null): unknown {
  expect(element).not.toBeNull();
  return JSON.parse(element?.getAttribute("data-motion-props") ?? "null");
}

describe("InvoiceScansPage motion contract", () => {
  it("gives desktop rows and mobile cards layout, entrance and exit transitions from shared tokens", async () => {
    renderPage(filterFixtureScans());
    await screen.findByText("10 of 10");
    const expected = {
      layout: "position", initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 },
      transition: { ...routeEntranceTransition.transition, ...taskCardSurfaceTransition },
    };
    const links = screen.getAllByRole("link", { name: /^Invoice INV-1042/ });
    expect(links).toHaveLength(4);
    for (const link of links) {
      expect(motionProps(link.closest("tr, li"))).toEqual(expected);
    }
  });

  it("moves an option to its chip and returns the same shared identity when removed", async () => {
    renderPage(filterFixtureScans());
    await screen.findByText("10 of 10");
    const user = userEvent.setup();
    await user.click(screen.getByRole("combobox", { name: "Record type" }));
    const option = screen.getByRole("button", { name: "Apply filter Record type: Invoice file" });
    const shared = { layoutId: "maros-invoice-filter-recordType-invoice", transition: sharedEntityReturnTransition };
    expect(motionProps(option)).toEqual(shared);
    await user.click(option);
    const chip = screen.getByRole("button", { name: "Remove filter Record type: Invoice file" });
    expect(motionProps(chip)).toEqual({ ...shared, layout: "position" });
    expect(screen.getByText("6 of 10")).toBeInTheDocument();
    await user.click(screen.getByRole("combobox", { name: "Record type" }));
    expect(motionProps(screen.getByRole("button", { name: "Apply filter Record type: Invoice file" }))).toEqual({});
    await user.keyboard("{Escape}");
    await user.click(chip);
    expect(screen.getByRole("dialog", { name: "Record type" })).toBeInTheDocument();
    expect(motionProps(screen.getByRole("button", { name: "Apply filter Record type: Invoice file" }))).toEqual(shared);
    expect(screen.queryByRole("button", { name: "Remove filter Record type: Invoice file" })).not.toBeInTheDocument();
    expect(screen.getByText("10 of 10")).toBeInTheDocument();
  });

  it("selects and removes a filter with the keyboard and returns focus to its control", async () => {
    renderPage(filterFixtureScans());
    await screen.findByText("10 of 10");
    const user = userEvent.setup();
    const control = screen.getByRole("combobox", { name: "Record type" });
    control.focus();
    await user.keyboard("{ArrowDown}{Tab}{Enter}");
    expect(control).toHaveFocus();
    expect(control).toHaveValue("invoice");
    const chip = screen.getByRole("button", { name: "Remove filter Record type: Invoice file" });
    chip.focus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("dialog", { name: "Record type" })).toBeInTheDocument();
    expect(control).toHaveValue("");
    await user.keyboard("{Escape}");
    expect(control).toHaveFocus();
    expect(screen.queryByRole("dialog", { name: "Record type" })).not.toBeInTheDocument();
  });

  it("replaces the projection node when changing an active criterion to another option", async () => {
    renderPage(filterFixtureScans(), "?type=invoice");
    await screen.findByText("6 of 10");
    const previousChip = screen.getByRole("button", { name: "Remove filter Record type: Invoice file" });
    const user = userEvent.setup();
    await chooseFilterOption(user, "Record type", "Manual transaction");
    const chip = screen.getByRole("button", { name: "Remove filter Record type: Manual transaction" });
    // Motion fixes a projection node's layoutId at mount, so a new identity needs a new node.
    expect(chip).not.toBe(previousChip);
    expect(motionProps(chip)).toEqual({
      layout: "position", layoutId: "maros-invoice-filter-recordType-transaction", transition: sharedEntityReturnTransition,
    });
    expect(screen.getByText("4 of 10")).toBeInTheDocument();
    await user.click(chip);
    expect(motionProps(screen.getByRole("button", { name: "Apply filter Record type: Manual transaction" }))).toEqual({
      layoutId: "maros-invoice-filter-recordType-transaction", transition: sharedEntityReturnTransition,
    });
  });
});
