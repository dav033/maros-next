import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({ post: vi.fn() }));
vi.mock("@/shared/infra/http/OptimizedApiClient", () => ({
  optimizedApiClient: { post: api.post },
}));

import { attachInvoiceScanFile } from "./invoiceScansApi";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

beforeEach(() => {
  api.post.mockReset();
});

describe("attachInvoiceScanFile", () => {
  const file = new File(["receipt"], "receipt.pdf", {
    type: "application/pdf",
  });
  const prepared = {
    id: "scan-1",
    key: "mcp/attachments/invoice-scans/scan-1/receipt.pdf",
    uploadUrl: "https://storage.example/upload",
  };

  it("uploads first and finalizes only after storage accepts the file", async () => {
    api.post
      .mockResolvedValueOnce({ data: prepared })
      .mockResolvedValueOnce({ data: { id: "scan-1", hasFile: true } });
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    await expect(attachInvoiceScanFile("scan-1", file)).resolves.toEqual({
      id: "scan-1",
      hasFile: true,
    });

    expect(api.post).toHaveBeenNthCalledWith(
      1,
      "/invoice-scans/scan-1/attachment",
      { fileName: file.name, contentType: file.type, sizeBytes: file.size },
    );
    expect(fetchMock).toHaveBeenCalledWith(prepared.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });
    expect(api.post).toHaveBeenNthCalledWith(
      2,
      "/invoice-scans/scan-1/attachment/complete",
      {
        key: prepared.key,
        fileName: file.name,
        contentType: file.type,
        sizeBytes: file.size,
      },
    );
  });

  it("does not finalize or poison the record when the storage upload fails", async () => {
    api.post.mockResolvedValueOnce({ data: prepared });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));

    await expect(attachInvoiceScanFile("scan-1", file)).rejects.toThrow(
      "The file could not be uploaded. Try again.",
    );

    expect(api.post).toHaveBeenCalledTimes(1);
    expect(api.post).toHaveBeenCalledWith(
      "/invoice-scans/scan-1/attachment",
      expect.any(Object),
    );
  });

  it("does not finalize when the storage request rejects", async () => {
    api.post.mockResolvedValueOnce({ data: prepared });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("network down")),
    );

    await expect(attachInvoiceScanFile("scan-1", file)).rejects.toThrow(
      "network down",
    );

    expect(api.post).toHaveBeenCalledTimes(1);
  });
});
