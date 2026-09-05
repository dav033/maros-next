import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "./sheet";

afterEach(cleanup);

describe("Sheet content modes", () => {
  it("keeps route content in the page without locking scroll or hiding navigation", async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    const onOpenChange = vi.fn();
    render(<>
      <nav aria-label="Workspace"><button onClick={onNavigate}>Tasks</button></nav>
      <Sheet open onOpenChange={onOpenChange}>
        <SheetContent pageMode>
          <SheetTitle>Task details</SheetTitle>
          <SheetDescription>Edit this task</SheetDescription>
          <input aria-label="Task title" defaultValue="Inspect the roof" />
        </SheetContent>
      </Sheet>
    </>);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(document.body).not.toHaveAttribute("data-scroll-locked");
    expect(document.body.style.pointerEvents).not.toBe("none");
    expect(screen.getByRole("navigation", { name: "Workspace" })).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Tasks" }));
    expect(onNavigate).toHaveBeenCalledOnce();
    expect(onOpenChange).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("preserves the modal drawer and its close action", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<Sheet open onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetTitle>Task details</SheetTitle>
        <SheetDescription>Edit this task</SheetDescription>
      </SheetContent>
    </Sheet>);
    expect(screen.getByRole("dialog", { name: "Task details" })).toBeVisible();
    expect(document.body).toHaveAttribute("data-scroll-locked");
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
