import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const actions = vi.hoisted(() => ({
  getProjectEstimateFileAction: vi.fn(),
  sendProjectEstimateEmailAction: vi.fn(),
  appendProjectAttachmentAction: vi.fn(),
  getEntityPresignedUploadUrl: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock("@/features/project/actions/estimateActions", () => ({
  getProjectEstimateFileAction: actions.getProjectEstimateFileAction,
  sendProjectEstimateEmailAction: actions.sendProjectEstimateEmailAction,
  appendProjectAttachmentAction: actions.appendProjectAttachmentAction,
}));
vi.mock("@/features/attachments/actions/s3Actions", () => ({
  getEntityPresignedUploadUrl: actions.getEntityPresignedUploadUrl,
}));
vi.mock("sonner", () => ({
  toast: { error: actions.toastError, success: vi.fn() },
}));

import { PostConversionEstimateModal } from "./PostConversionEstimateModal";

afterEach(cleanup);

beforeEach(() => {
  Object.values(actions).forEach((action) => action.mockReset());
});

function renderModal() {
  const onClose = vi.fn();
  render(
    <PostConversionEstimateModal
      open
      onClose={onClose}
      projectId={707}
      leadName="Maros Customer"
      contactEmail="customer@example.com"
    />,
  );
  return { onClose };
}

describe("PostConversionEstimateModal", () => {
  it("shows an estimate lookup failure separately from a missing estimate", async () => {
    actions.getProjectEstimateFileAction.mockResolvedValue({
      success: false,
      error: "Estimate service unavailable",
    });
    renderModal();

    expect(
      await screen.findByText("Could not check for an estimate file"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Estimate service unavailable"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("No estimate file found"),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Send without attachment" }),
    ).toBeEnabled();
  });

  it("shows provider failure and restores the send button for retry", async () => {
    actions.getProjectEstimateFileAction.mockResolvedValue({
      success: true,
      data: { key: "projects/707/Proposal.pdf", fileName: "Proposal.pdf" },
    });
    actions.sendProjectEstimateEmailAction.mockResolvedValue({
      success: false,
      error: "SMTP service does not respond",
    });
    renderModal();

    const user = userEvent.setup();
    const sendButton = await screen.findByRole("button", {
      name: "Send with estimate",
    });
    await user.click(sendButton);

    await waitFor(() => expect(sendButton).toBeEnabled());
    expect(actions.sendProjectEstimateEmailAction).toHaveBeenCalledWith(707, {
      recipients: ["customer@example.com"],
      cc: undefined,
      subject: "Estimate - Maros Customer",
      message: undefined,
      includeAttachment: true,
      attachmentKey: "projects/707/Proposal.pdf",
    });
    expect(actions.toastError).toHaveBeenCalledWith(
      "SMTP service does not respond",
    );
  });

  it("restores the send button when the action unexpectedly rejects", async () => {
    actions.getProjectEstimateFileAction.mockResolvedValue({
      success: true,
      data: { key: "projects/707/Proposal.pdf", fileName: "Proposal.pdf" },
    });
    actions.sendProjectEstimateEmailAction.mockRejectedValue(
      new Error("network down"),
    );
    renderModal();

    const user = userEvent.setup();
    const sendButton = await screen.findByRole("button", {
      name: "Send with estimate",
    });
    await user.click(sendButton);

    await waitFor(() => expect(sendButton).toBeEnabled());
    expect(actions.toastError).toHaveBeenCalledWith("network down");
  });
});
