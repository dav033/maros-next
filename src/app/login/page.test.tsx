import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// El componente usa una server action; la mockeamos para renderizar en jsdom.
vi.mock("@/app/actions/auth", () => ({
  loginAction: vi.fn(async () => undefined),
  logoutAction: vi.fn(async () => undefined),
}));

import LoginPage from "./page";

describe("LoginPage", () => {
  it("renderiza título, campo de password y botón", () => {
    render(<LoginPage />);
    expect(screen.getByText("Maros Construction")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in/i }),
    ).toBeInTheDocument();
  });

  it("ya no muestra el label de debug AUTH_PASSWORD", () => {
    render(<LoginPage />);
    expect(screen.queryByText(/AUTH_PASSWORD/i)).toBeNull();
  });
});
