import { useState } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { addDays, format, nextMonday } from "date-fns";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TaskDatePicker } from "./TaskDatePicker";

afterEach(cleanup);

describe("TaskDatePicker", () => {
  it("opens the selected month and selects a date without submitting its form", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onSubmit = vi.fn((event) => event.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <TaskDatePicker value="2027-02-12" onChange={onChange} />
      </form>,
    );

    await user.click(screen.getByRole("button", { name: "Feb 12, 2027" }));
    expect(screen.getByRole("grid", { name: "February 2027" })).toBeVisible();
    await user.click(screen.getByRole("button", { name: /February 18th, 2027/ }));
    expect(onChange).toHaveBeenCalledWith("2027-02-18");
    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("navigates between months", async () => {
    const user = userEvent.setup();
    render(<TaskDatePicker value="2027-02-12" onChange={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: "Feb 12, 2027" }));
    await user.click(screen.getByRole("button", { name: /next month/i }));
    expect(screen.getByRole("grid", { name: "March 2027" })).toBeVisible();
    await user.click(screen.getByRole("button", { name: /previous month/i }));
    expect(screen.getByRole("grid", { name: "February 2027" })).toBeVisible();
  });

  it("clears with the keyboard using a separate button", async () => {
    const user = userEvent.setup();
    function Field() {
      const [value, setValue] = useState<string | null>("2027-02-12");
      return <TaskDatePicker value={value} onChange={setValue} />;
    }
    render(<Field />);
    const clear = screen.getByRole("button", { name: "Clear date" });
    expect(clear.parentElement?.closest("button")).toBeNull();
    clear.focus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("button", { name: "No date" })).toBeVisible();
    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
  });

  it.each([
    ["Today", () => new Date()],
    ["Tomorrow", () => addDays(new Date(), 1)],
    ["Monday", () => nextMonday(new Date())],
  ] as const)("selects %s as a local calendar date", async (label, resolve) => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TaskDatePicker value={null} onChange={onChange} />);
    await user.click(screen.getByRole("button", { name: "No date" }));
    await user.click(screen.getByRole("button", { name: label }));
    expect(onChange).toHaveBeenCalledWith(format(resolve(), "yyyy-MM-dd"));
    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
  });
});
