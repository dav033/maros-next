"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, X } from "lucide-react";

type FileInputListProps = {
  label: string;
  files: File[];
  onChange: (files: File[]) => void;
  existingUrls?: string[];
  onRemoveExisting?: (url: string) => void;
  accept?: string;
  helperText?: string;
};

export function FileInputList({
  label,
  files,
  onChange,
  existingUrls = [],
  onRemoveExisting,
  accept,
  helperText,
}: FileInputListProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleSelectFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files ? Array.from(event.target.files) : [];
    if (selected.length) {
      onChange([...files, ...selected]);
    }
    event.target.value = "";
  };

  const handleRemove = (index: number) => {
    const next = files.filter((_, idx) => idx !== index);
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="size-4 mr-2" />
          {label}
        </Button>
        {helperText && (
          <span className="text-sm text-muted-foreground">{helperText}</span>
        )}
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accept}
          onChange={handleSelectFiles}
          className="hidden"
        />
      </div>

      {existingUrls.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">Archivos existentes</p>
          <div className="flex flex-wrap gap-2">
            {existingUrls.map((url) => (
              <div key={url} className="inline-flex items-center gap-1">
                <Badge variant="outline" style={{ borderColor: "#3b82f6", color: "#3b82f6" }}>
                  <a href={url} target="_blank" rel="noreferrer" className="underline">
                    Ver archivo
                  </a>
                </Badge>
                {onRemoveExisting && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => onRemoveExisting(url)}
                    aria-label="Eliminar adjunto existente"
                  >
                    <X className="size-3.5" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {files.length === 0 && (
          <p className="text-sm text-muted-foreground">No files selected.</p>
        )}
        {files.map((file, index) => (
          <div key={`${file.name}-${index}`} className="inline-flex items-center gap-1">
            <Badge variant="secondary">{file.name}</Badge>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => handleRemove(index)}
              aria-label="Quitar archivo"
            >
              <X className="size-3.5" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

