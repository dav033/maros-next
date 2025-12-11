"use client";

import { useRef } from "react";
import { Badge, Button, Icon, IconButton, Typography } from "@dav033/dav-components";

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
          leftIcon={<Icon name="mdi:upload" size={16} />}
          onClick={() => inputRef.current?.click()}
        >
          {label}
        </Button>
        {helperText && (
          <Typography as="span" variant="small" className="text-gray-400">
            {helperText}
          </Typography>
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
          <Typography variant="small" className="text-gray-300">
            Archivos existentes
          </Typography>
          <div className="flex flex-wrap gap-2">
            {existingUrls.map((url) => (
              <div key={url} className="inline-flex items-center gap-1">
                <Badge variant="info" size="sm">
                  <a href={url} target="_blank" rel="noreferrer" className="underline">
                    Ver archivo
                  </a>
                </Badge>
                {onRemoveExisting && (
                  <IconButton
                    size="sm"
                    aria-label="Eliminar adjunto existente"
                    onClick={() => onRemoveExisting(url)}
                    icon={<Icon name="mdi:close" size={14} />}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {files.length === 0 && (
          <Typography variant="small" className="text-gray-500">
            No hay archivos seleccionados.
          </Typography>
        )}
        {files.map((file, index) => (
          <div key={`${file.name}-${index}`} className="inline-flex items-center gap-1">
            <Badge variant="secondary" size="sm">
              {file.name}
            </Badge>
            <IconButton
              size="sm"
              aria-label="Quitar archivo"
              onClick={() => handleRemove(index)}
              icon={<Icon name="mdi:close" size={14} />}
            />
          </div>
        ))}
      </div>
    </div>
  );
}


