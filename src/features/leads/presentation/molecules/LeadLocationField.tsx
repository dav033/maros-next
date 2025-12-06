"use client";

import { useEffect, useState } from "react";
import { AddressAutocompleteInput } from "@/shared/ui/molecules/AddressAutocompleteInput";

type LeadLocationFieldProps = {
  location: string;              // texto raw
  addressLink?: string | null;   // link de Google
  disabled?: boolean;
  onLocationChange: (value: string) => void;
  onAddressLinkChange: (value: string) => void;
};

export function LeadLocationField({
  location,
  addressLink,
  disabled,
  onLocationChange,
  onAddressLinkChange,
}: LeadLocationFieldProps) {
  // ✅ Si addressLink tiene algo, arrancamos en modo Google
  const [useGoogleService, setUseGoogleService] = useState(
    !!addressLink && addressLink.trim() !== ""
  );

  useEffect(() => {
    const hasLink = !!addressLink && addressLink.trim() !== "";
    setUseGoogleService(hasLink);
  }, [addressLink]);

  const handleToggleGoogle = (checked: boolean) => {
    setUseGoogleService(checked);
    if (!checked) {
      onAddressLinkChange("");
    }
  };

  return (
    <div className="space-y-3">
      {/* Checkbox para activar/desactivar Google Maps */}
      <label className="flex items-center gap-2 text-sm text-gray-300">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-gray-500"
          checked={useGoogleService}
          onChange={(e) => handleToggleGoogle(e.target.checked)}
          disabled={disabled}
        />
        <span>
          Habilitar servicio de Google Maps
          <span className="ml-1 text-xs text-gray-500">
            (autocompletado + mapa)
          </span>
        </span>
      </label>

      {/* MODO SIMPLE: solo texto raw */}
      {!useGoogleService && (
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-300">
            Location
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => onLocationChange(e.target.value)}
            disabled={disabled}
            placeholder="Escribe la dirección (sin Google Maps)"
            className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500">
            Aquí solo se guarda el texto de la dirección. No se genera enlace
            de Google Maps.
          </p>
        </div>
      )}

      {/* MODO GOOGLE: autocompletado + mapa */}
      {useGoogleService && (
        <div className="space-y-2">
          <AddressAutocompleteInput
            label="Location (Google Maps)"
            placeholder="Empieza a escribir y selecciona la dirección"
            value={location}
            disabled={disabled}
            required={false}
            onChange={(addressText) => {
              onLocationChange(addressText);
            }}
            onLinkChange={(link) => {
              onAddressLinkChange(link);
            }}
          />
          <p className="text-xs text-gray-500">
            Se guardará el texto de la dirección en <strong>location</strong> y
            el enlace de Google Maps en <strong>addressLink</strong>. Al abrir
            de nuevo el lead, si existe <strong>addressLink</strong>, este
            modo quedará activado automáticamente.
          </p>
        </div>
      )}
    </div>
  );
}
