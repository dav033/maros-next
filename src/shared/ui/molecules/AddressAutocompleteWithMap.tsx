"use client";

import React, { useEffect, useRef } from "react";

type AddressAutocompleteWithMapProps = {
  value?: string;
  onChange: (address: string) => void;
  onLinkChange: (link: string) => void;
  initialCenter?: { lat: number; lng: number };
  height?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  leftAddon?: React.ReactNode;
};

export function AddressAutocompleteWithMap({
  value,
  onChange,
  onLinkChange,
  initialCenter = { lat: 25.7617, lng: -80.1918 }, // Miami
  height = "220px",
  label,
  placeholder,
  required,
  disabled,
  leftAddon,
}: AddressAutocompleteWithMapProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const mapRef = useRef<HTMLDivElement | null>(null);

  const mapInstanceRef = useRef<any | null>(null);
  const markerRef = useRef<any | null>(null);
  const autocompleteRef = useRef<any | null>(null);
  const geocoderRef = useRef<any | null>(null);
  const initializedRef = useRef(false);

  // Keep the latest version of the callbacks
  const onChangeRef = useRef(onChange);
  const onLinkChangeRef = useRef(onLinkChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    onLinkChangeRef.current = onLinkChange;
  }, [onLinkChange]);

  useEffect(() => {
    if (disabled) return;

    const initialize = () => {
      if (initializedRef.current) return;

      const w = window as any;
      if (!w.google?.maps || !w.google.maps.places) {
        return;
      }

      initializedRef.current = true;

      // Geocoder
      geocoderRef.current = new w.google.maps.Geocoder();

      // Create map
      if (mapRef.current) {
        mapInstanceRef.current = new w.google.maps.Map(mapRef.current, {
          center: initialCenter,
          zoom: 12,
        });

        markerRef.current = new w.google.maps.Marker({
          map: mapInstanceRef.current,
          position: initialCenter,
        });

        // Click on map => move marker + update link (lat,lng)
        mapInstanceRef.current.addListener("click", (e: any) => {
          if (!e.latLng || !markerRef.current || !mapInstanceRef.current) return;
          const pos = e.latLng.toJSON();
          markerRef.current.setPosition(pos);
          mapInstanceRef.current.setCenter(pos);

          const link = `https://www.google.com/maps/search/?api=1&query=${pos.lat}%2C${pos.lng}`;
          onLinkChangeRef.current(link);
        });
      }

      // Autocomplete de Places JS
      if (inputRef.current) {
        autocompleteRef.current = new w.google.maps.places.Autocomplete(
          inputRef.current,
          {
            fields: ["formatted_address", "geometry", "place_id", "url"],
            types: ["address"], // addresses only
          }
        );

        autocompleteRef.current.addListener("place_changed", () => {
          const ac = autocompleteRef.current;
          if (!ac || !inputRef.current) return;

          const place = ac.getPlace();

          const address = place.formatted_address || inputRef.current.value || "";

          const location = place.geometry?.location;
          const placeId = place.place_id;
          const placeUrl = (place as any).url as string | undefined;

          // URL de Maps
          let link = "";
          if (placeUrl) {
            link = placeUrl;
          } else {
            const base = "https://www.google.com/maps/search/?api=1";
            const query = encodeURIComponent(address);
            const queryPlaceId = placeId ? `&query_place_id=${encodeURIComponent(placeId)}` : "";
            link = `${base}&query=${query}${queryPlaceId}`;
          }

          // Update form
          onChangeRef.current(address);
          onLinkChangeRef.current(link);

          // Move map / marker
          if (location && mapInstanceRef.current && markerRef.current) {
            const pos = location.toJSON();
            mapInstanceRef.current.setCenter(pos);
            mapInstanceRef.current.setZoom(16);
            markerRef.current.setPosition(pos);
          }
        });
      }

      // If an address is already provided from the form (edit lead),
      // set it in the input and center the map once.
      if (value && inputRef.current && geocoderRef.current && mapInstanceRef.current && markerRef.current) {
        inputRef.current.value = value;
        geocoderRef.current.geocode({ address: value }, (results: any, status: any) => {
          if (status === "OK" && results && results[0]) {
            const loc = results[0].geometry.location;
            const pos = loc.toJSON();
            mapInstanceRef.current!.setCenter(pos);
            mapInstanceRef.current!.setZoom(16);
            markerRef.current!.setPosition(pos);
          }
        });
      }
    };

    // Direct attempt (in case Maps is already loaded)
    initialize();

    // In case you use a global event like "google-maps-loaded"
    const handler = () => initialize();
    window.addEventListener("google-maps-loaded", handler);

    return () => {
      window.removeEventListener("google-maps-loaded", handler);
    };
  }, [initialCenter, disabled, value]);

  if (disabled) {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-gray-400">
            {label} {required && "*"}
          </label>
        )}
        <div className="flex items-center rounded-lg border border-gray-700 bg-gray-800/50 px-3 py-2 text-gray-500 cursor-not-allowed">
          {leftAddon && <span className="mr-2 text-gray-400 flex items-center">{leftAddon}</span>}
          <input
            type="text"
            disabled
            placeholder={placeholder ?? "Address"}
            className="w-full bg-transparent outline-none"
          />
        </div>
        <div
          style={{
            width: "100%",
            height,
            borderRadius: "0.75rem",
            backgroundColor: "#374151",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#9ca3af",
          }}
        >
          Map disabled
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-300">
          {label} {required && "*"}
        </label>
      )}
      <div className="flex items-center">
        {leftAddon && <span className="mr-2 text-gray-400 flex items-center">{leftAddon}</span>}
        <input
          ref={inputRef}
          type="text"
          defaultValue={value ?? ""}
          placeholder={placeholder ?? "Type an address"}
          className="flex-1 rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoComplete="off"
        />
      </div>
      <div
        ref={mapRef}
        style={{
          width: "100%",
          height,
          borderRadius: "0.75rem",
          overflow: "hidden",
          border: "1px solid #374151",
        }}
      />
    </div>
  );
}
