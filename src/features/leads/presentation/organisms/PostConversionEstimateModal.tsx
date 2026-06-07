"use client";

import { useEffect, useRef, useState, useCallback, type ChangeEvent } from "react";
import { Loader2, Paperclip, Mail, ExternalLink, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  appendProjectAttachmentAction,
  getProjectEstimateFileAction,
  sendProjectEstimateEmailAction,
  type EstimateFileInfo,
} from "@/features/project/actions/estimateActions";
import { getEntityPresignedUploadUrl } from "@/features/attachments/actions/s3Actions";

interface PostConversionEstimateModalProps {
  open: boolean;
  onClose: () => void;
  projectId: number;
  leadName?: string;
  contactEmail?: string;
}

function parseRecipients(raw: string): string[] {
  return raw
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function getFileName(key: string): string {
  const parts = key.split("/");
  const raw = parts[parts.length - 1] ?? key;
  return raw.replace(/^\d+-/, "");
}

export function PostConversionEstimateModal({
  open,
  onClose,
  projectId,
  leadName,
  contactEmail,
}: PostConversionEstimateModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [estimateFile, setEstimateFile] = useState<EstimateFileInfo | null>(null);
  const [to, setTo] = useState("");
  const [cc, setCc] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTo(contactEmail ?? "");
    setCc("");
    setSubject(leadName ? `Estimate - ${leadName}` : "Estimate");
    setMessage("");
    setEstimateFile(null);
    setIsLoadingFile(true);
    (async () => {
      const result = await getProjectEstimateFileAction(projectId);
      setIsLoadingFile(false);
      if (result.success) {
        setEstimateFile(result.data);
      }
    })();
  }, [open, projectId, leadName]);

  const send = useCallback(
    async (includeAttachment: boolean) => {
      const toList = parseRecipients(to);
      if (toList.length === 0) {
        toast.error("Add at least one recipient");
        return;
      }
      setIsSending(true);
      const result = await sendProjectEstimateEmailAction(projectId, {
        recipients: toList,
        cc: cc.trim() ? parseRecipients(cc) : undefined,
        subject: subject.trim() || undefined,
        message: message.trim() || undefined,
        includeAttachment,
        attachmentKey: includeAttachment ? estimateFile?.key : undefined,
      });
      setIsSending(false);
      if (result.success) {
        if (!result.data.sent) {
          toast.error("No estimate file was found. Upload one or send without attachment.");
          setEstimateFile(null);
          return;
        }

        toast.success(
          result.data.attached ? "Estimate sent" : "Email sent without attachment",
        );
        onClose();
      } else {
        toast.error(result.error || "Could not send email");
      }
    },
    [projectId, to, cc, subject, message, estimateFile, onClose],
  );

  const uploadEstimate = useCallback(
    async (file: File) => {
      setIsUploading(true);
      try {
        const contentType = file.type || "application/octet-stream";
        const uploadName = /estimate/i.test(file.name)
          ? file.name
          : `estimate-${file.name}`;
        const { url, key } = await getEntityPresignedUploadUrl(
          "project",
          projectId,
          uploadName,
          contentType,
        );
        const uploadResponse = await fetch(url, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": contentType },
        });
        if (!uploadResponse.ok) {
          throw new Error(`Upload failed for ${file.name}`);
        }

        const appendResult = await appendProjectAttachmentAction(projectId, key);
        if (!appendResult.success) {
          throw new Error(appendResult.error);
        }

        setEstimateFile({ key, fileName: getFileName(key) });
        toast.success("Estimate uploaded");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not upload estimate");
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [projectId],
  );

  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadEstimate(file);
    }
  };

  const handleViewProject = () => {
    onClose();
    window.location.href = `/project/${projectId}`;
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="!flex max-h-[92vh] w-[calc(100vw-2rem)] max-w-2xl flex-col overflow-hidden border-border/70 bg-background p-0 text-foreground shadow-2xl sm:rounded-xl">
        <DialogHeader className="border-b border-border/70 bg-muted/20 px-5 py-4 pr-12 text-left sm:px-6 sm:pr-12">
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <span className="flex size-9 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Mail className="size-4" />
            </span>
            <span>Send estimate to client</span>
          </DialogTitle>
          <DialogDescription className="max-w-xl">
            Lead won; project created. Send the estimate now, upload a replacement,
            or continue without an attachment.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4 sm:px-6">
          <div className="flex items-start gap-3 rounded-lg border border-border/70 bg-muted/25 p-3 text-sm">
            <Paperclip className="mt-0.5 size-4 shrink-0 text-primary" />
            {isLoadingFile ? (
              <span className="flex min-w-0 items-center gap-2 text-muted-foreground">
                <Loader2 className="size-3 animate-spin" /> Checking estimate
                file...
              </span>
            ) : estimateFile ? (
              <div className="min-w-0 space-y-0.5">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Attachment ready
                </p>
                <p className="truncate font-medium text-foreground">
                  {estimateFile.fileName}
                </p>
              </div>
            ) : (
              <div className="min-w-0 space-y-0.5 text-muted-foreground">
                <p className="font-medium text-foreground">No estimate file found</p>
                <p>Upload one here or send without attachment.</p>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileSelect}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="estimate-to">To</Label>
              {contactEmail && !to.includes(contactEmail) && (
                <button
                  type="button"
                  onClick={() => {
                    const current = to.trim();
                    setTo(current ? `${current}, ${contactEmail}` : contactEmail);
                  }}
                  className="ml-2 text-xs text-primary hover:underline cursor-pointer"
                >
                  + Add {contactEmail}
                </button>
              )}
              <Input
                id="estimate-to"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder={contactEmail ?? "recipient@example.com"}
                disabled={isSending || isUploading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimate-cc">CC (optional)</Label>
              <Input
                id="estimate-cc"
                value={cc}
                onChange={(e) => setCc(e.target.value)}
                placeholder="cc@example.com"
                disabled={isSending || isUploading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="estimate-subject">Subject</Label>
            <Input
              id="estimate-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={isSending || isUploading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="estimate-message">Message (optional)</Label>
            <Textarea
              id="estimate-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              disabled={isSending || isUploading}
            />
          </div>
        </div>

        <div className="border-t border-border/70 bg-muted/10 px-5 py-4 sm:px-6">
          <div className="grid gap-2 sm:grid-cols-2">
            <Button
              type="button"
              variant="ghost"
              onClick={handleViewProject}
              disabled={isSending || isUploading}
              className="w-full justify-center"
            >
              <ExternalLink className="size-4 mr-2" />
              Go to project
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSending || isUploading}
              className="w-full justify-center"
            >
              {isUploading ? (
                <Loader2 className="size-4 mr-2 animate-spin" />
              ) : (
                <Upload className="size-4 mr-2" />
              )}
              {estimateFile ? "Replace estimate" : "Upload estimate"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => send(false)}
              disabled={isSending || isUploading}
              className="w-full justify-center"
            >
              Send without attachment
            </Button>
            <Button
              type="button"
              onClick={() => send(true)}
              disabled={isSending || isUploading || isLoadingFile || !estimateFile}
              className="w-full justify-center"
            >
              {isSending ? (
                <Loader2 className="size-4 mr-2 animate-spin" />
              ) : (
                <Mail className="size-4 mr-2" />
              )}
              Send with estimate
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
