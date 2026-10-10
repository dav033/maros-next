import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ConvertedLeadsLoadError } from "./ConvertedLeadsLoadError";

afterEach(cleanup);

describe("ConvertedLeadsLoadError", () => {
  it("shows the request failure and exposes a retry action", () => {
    const onRetry = vi.fn();
    render(<ConvertedLeadsLoadError error={new Error("API unavailable")} onRetry={onRetry} />);

    expect(screen.getByRole("alert")).toHaveTextContent("API unavailable");
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
