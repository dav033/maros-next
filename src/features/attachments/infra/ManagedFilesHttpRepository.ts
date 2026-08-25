import type { HttpClientLike } from "@/shared/infra/http";
import { optimizedApiClient } from "@/shared/infra/http";
import { api } from "@/shared/infra/rest";

export type ManagedFileOwnerKind = "task" | "workspace";
export type ManagedFile = {
  id: number;
  ownerKind: ManagedFileOwnerKind;
  ownerId: number;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  position: number;
  status: "pending" | "ready" | "failed";
  createdAt: string;
  updatedAt: string;
};

export type UploadIntent = { file: ManagedFile; uploadUrl: string; expiresInSeconds: number };

const base = api.resource("managed-files");

export class ManagedFilesHttpRepository {
  constructor(private readonly http: HttpClientLike = optimizedApiClient) {}

  async createIntent(input: {
    ownerKind: ManagedFileOwnerKind;
    ownerId: number;
    fileName: string;
    mimeType: string;
    sizeBytes: number;
    clientUploadId: string;
  }): Promise<UploadIntent> {
    const { data } = await this.http.post<UploadIntent>(`${base}/intents`, input);
    if (!data) throw new Error("Empty response creating upload intent");
    return data;
  }

  async complete(id: number, checksum?: string): Promise<ManagedFile> {
    const { data } = await this.http.post<ManagedFile>(`${base}/${id}/complete`, checksum ? { checksum } : {});
    if (!data) throw new Error("Empty response completing managed file");
    return data;
  }

  async retry(id: number): Promise<UploadIntent> {
    const { data } = await this.http.post<UploadIntent>(`${base}/${id}/retry`, {});
    if (!data) throw new Error("Empty response retrying managed file");
    return data;
  }

  async getUrl(id: number): Promise<{ url: string; expiresInSeconds: number }> {
    const { data } = await this.http.get<{ url: string; expiresInSeconds: number }>(`${base}/${id}/url`);
    if (!data) throw new Error("Empty response loading managed file URL");
    return data;
  }

  async remove(id: number): Promise<void> {
    await this.http.delete(`${base}/${id}`);
  }

  async upload(intent: UploadIntent, file: File, onProgress?: (value: number) => void): Promise<ManagedFile> {
    await new Promise<void>((resolve, reject) => {
      const request = new XMLHttpRequest();
      request.open("PUT", intent.uploadUrl);
      request.setRequestHeader("Content-Type", file.type || "application/octet-stream");
      request.upload.onprogress = (event) => {
        if (event.lengthComputable) onProgress?.(Math.round((event.loaded / event.total) * 100));
      };
      request.onload = () => request.status >= 200 && request.status < 300 ? resolve() : reject(new Error(`Upload failed (${request.status})`));
      request.onerror = () => reject(new Error("Upload failed"));
      request.send(file);
    });
    return this.complete(intent.file.id);
  }
}
