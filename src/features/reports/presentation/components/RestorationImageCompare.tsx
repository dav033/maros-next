"use client";

import { useEffect, useId, useState } from "react";
import Image from "next/image";
import { Label } from "@/components/ui/label";

// Adapted from Bencho Image Compare's two-layer before/after wipe.
// Copyright/license: MIT. Source block: https://bencho.dev/ (image-compare).

type PreviewImage = {
  id: string;
  name: string;
  src: string;
};

export function RestorationImageCompare({
  files,
}: {
  files: File[];
}) {
  const [images, setImages] = useState<PreviewImage[]>([]);
  const [beforeIndex, setBeforeIndex] = useState(0);
  const [afterIndex, setAfterIndex] = useState(1);
  const [position, setPosition] = useState(50);
  const selectId = useId();

  useEffect(() => {
    const previews = files
      .filter((file) => file.type.startsWith("image/"))
      .map((file, index) => ({
        id: `${file.name}-${file.lastModified}-${index}`,
        name: file.name,
        src: URL.createObjectURL(file),
      }));

    setImages(previews);
    return () => previews.forEach(({ src }) => URL.revokeObjectURL(src));
  }, [files]);

  if (images.length < 2) return null;

  const safeBeforeIndex = Math.min(beforeIndex, images.length - 1);
  const safeAfterIndex =
    afterIndex < images.length && afterIndex !== safeBeforeIndex
      ? afterIndex
      : safeBeforeIndex === 0
        ? 1
        : 0;
  const before = images[safeBeforeIndex];
  const after = images[safeAfterIndex];

  return (
    <section className="space-y-3 rounded-lg border border-line p-3">
      <h4 className="text-sm font-medium">Comparar fotos de evidencia</h4>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor={`${selectId}-before`}>Antes</Label>
          <select
            id={`${selectId}-before`}
            value={safeBeforeIndex}
            onChange={(event) => {
              const nextIndex = Number(event.target.value);
              setBeforeIndex(nextIndex);
              if (nextIndex === afterIndex) {
                setAfterIndex(images.findIndex((_, index) => index !== nextIndex));
              }
            }}
            className="h-9 w-full rounded-md border border-line-strong bg-background px-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {images.map((image, index) => (
              <option key={image.id} value={index}>
                {image.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${selectId}-after`}>Después</Label>
          <select
            id={`${selectId}-after`}
            value={safeAfterIndex}
            onChange={(event) => {
              const nextIndex = Number(event.target.value);
              setAfterIndex(nextIndex);
              if (nextIndex === beforeIndex) {
                setBeforeIndex(images.findIndex((_, index) => index !== nextIndex));
              }
            }}
            className="h-9 w-full rounded-md border border-line-strong bg-background px-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {images.map((image, index) => (
              <option key={image.id} value={index}>
                {image.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-elev-3 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        <Image
          src={after.src}
          alt=""
          fill
          unoptimized
          draggable={false}
          className="pointer-events-none select-none object-contain"
        />
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
          aria-hidden="true"
        >
          <Image
            src={before.src}
            alt=""
            fill
            unoptimized
            draggable={false}
            className="pointer-events-none select-none object-contain"
          />
        </div>
        <span className="pointer-events-none absolute left-3 top-3 rounded bg-background/90 px-2 py-1 text-xs font-medium text-foreground">
          Antes
        </span>
        <span className="pointer-events-none absolute right-3 top-3 rounded bg-background/90 px-2 py-1 text-xs font-medium text-foreground">
          Después
        </span>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.25)]"
          style={{ left: `${position}%` }}
        />
        <input
          type="range"
          min={0}
          max={100}
          value={position}
          onChange={(event) => setPosition(Number(event.target.value))}
          aria-label="Deslizar para comparar las fotos"
          aria-valuetext={`${position}% antes, ${100 - position}% después`}
          className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Mueve el control para comparar las imágenes. Esta vista previa no modifica los archivos adjuntos.
      </p>
    </section>
  );
}
