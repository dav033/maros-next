"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface LocationFieldProps {
  address: string;
  addressLink?: string | null;
  disabled?: boolean;
  label?: string;
  placeholder?: string;
  onAddressChange?: (value: string) => void;
  onAddressLinkChange?: (value: string) => void;
  onLocationChange?: (data: { address: string; link: string }) => void;
  className?: string;
}

declare global {
  interface Window {
    google?: {
      maps: {
        [key: string]: any;
        places: {
          PlaceAutocompleteElement: new (options?: { types?: string[] }) => HTMLElement & {
            value: string;
          };
        };
        event?: {
          clearInstanceListeners: (instance: any) => void;
        };
      };
    };
    initMaps?: () => void;
  }
}

export function LocationField({
  address,
  addressLink,
  disabled,
  label = "Location",
  placeholder = "Enter address",
  onAddressChange,
  onAddressLinkChange,
  onLocationChange,
  className,
}: LocationFieldProps) {
  const [useGoogleMapsAutocomplete, setUseGoogleMapsAutocomplete] = useState(
    Boolean(addressLink?.trim())
  );
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const [selectedCoordinates, setSelectedCoordinates] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const placeAutocompleteContainerRef = useRef<HTMLDivElement>(null);
  const placeElementRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const geocoderRef = useRef<any>(null);
  const onAddressChangeRef = useRef(onAddressChange);
  const onAddressLinkChangeRef = useRef(onAddressLinkChange);
  const onLocationChangeRef = useRef(onLocationChange);

  useEffect(() => {
    onAddressChangeRef.current = onAddressChange;
    onAddressLinkChangeRef.current = onAddressLinkChange;
    onLocationChangeRef.current = onLocationChange;
  });

  const centerMap = (lat: number, lng: number, zoom = 16) => {
    if (!mapRef.current) return;
    const position = { lat, lng };
    mapRef.current.setCenter(position);
    mapRef.current.setZoom(zoom);
    if (markerRef.current?.setPosition) {
      markerRef.current.setPosition(position);
    } else if (markerRef.current?.position !== undefined) {
      markerRef.current.position = position;
    }
  };

  useEffect(() => {
    if (addressLink?.trim()) {
      setUseGoogleMapsAutocomplete(true);
    }
  }, [addressLink]);

  // Listen for Google Maps API load
  useEffect(() => {
    const checkGoogleMaps = () => {
      if (window.google?.maps?.places) {
        setIsGoogleMapsLoaded(true);
      }
    };

    checkGoogleMaps();
    window.addEventListener("google-maps-loaded", checkGoogleMaps);

    const interval = setInterval(() => {
      if (window.google?.maps?.places) {
        setIsGoogleMapsLoaded(true);
        clearInterval(interval);
      }
    }, 500);

    return () => {
      window.removeEventListener("google-maps-loaded", checkGoogleMaps);
      clearInterval(interval);
    };
  }, []);

  // Mount / unmount PlaceAutocompleteElement
  useEffect(() => {
    if (!useGoogleMapsAutocomplete || !isGoogleMapsLoaded || disabled) return;
    if (!placeAutocompleteContainerRef.current) return;

    const mapsApi = window.google?.maps as any;
    if (!mapsApi?.places?.PlaceAutocompleteElement) return;

    if (placeElementRef.current) return;

    try {
      const el: any = new mapsApi.places.PlaceAutocompleteElement({ types: ["address"] });
      el.style.cssText = "width:100%;display:block;";
      placeAutocompleteContainerRef.current.appendChild(el);
      placeElementRef.current = el;

      if (address) el.value = address;

      const handlePlaceSelect = async (place: any) => {
        try {
          await place.fetchFields({ fields: ["formattedAddress", "location"] });
          const addressText = (place.formattedAddress ?? "").trim();

          const locLat = place.location?.lat;
          const locLng = place.location?.lng;
          const lat = typeof locLat === "function" ? locLat() : locLat;
          const lng = typeof locLng === "function" ? locLng() : locLng;

          if (typeof lat === "number" && typeof lng === "number") {
            setSelectedCoordinates({ lat, lng });
            centerMap(lat, lng);
          } else {
            setSelectedCoordinates(null);
          }

          const mapsLink = addressText
            ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressText)}`
            : "";

          onAddressChangeRef.current?.(addressText);
          onAddressLinkChangeRef.current?.(mapsLink);
          onLocationChangeRef.current?.({ address: addressText, link: mapsLink });
        } catch (err) {
          // fetchFields failed silently
        }
      };

      // Current API: gmp-placeselect fires with { place: Place }
      el.addEventListener("gmp-placeselect", async ({ place }: any) => {
        await handlePlaceSelect(place);
      });

      // Older API: gmp-select fires with { placePrediction } — call .toPlace() first
      el.addEventListener("gmp-select", async (e: any) => {
        const prediction = e.placePrediction;
        if (!prediction) return;
        await handlePlaceSelect(prediction.toPlace());
      });
    } catch (e) {
      // PlaceAutocompleteElement initialization failed
    }

    return () => {
      if (placeElementRef.current) {
        placeElementRef.current.remove();
        placeElementRef.current = null;
      }
    };
  }, [useGoogleMapsAutocomplete, isGoogleMapsLoaded, disabled]);

  // Sync address prop into PlaceAutocompleteElement (e.g. external clear)
  useEffect(() => {
    if (placeElementRef.current) {
      placeElementRef.current.value = address ?? "";
    }
  }, [address]);

  // Initialize map
  useEffect(() => {
    if (!useGoogleMapsAutocomplete || !isGoogleMapsLoaded || !mapContainerRef.current) return;

    const mapsApi = window.google?.maps as any;
    if (!mapsApi?.Map) return;

    if (!mapRef.current) {
      try {
        mapRef.current = new mapsApi.Map(mapContainerRef.current, {
          center: { lat: 20, lng: 0 },
          zoom: 2,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          mapId: "DEMO_MAP_ID",
        });

        if (mapsApi.marker?.AdvancedMarkerElement) {
          markerRef.current = new mapsApi.marker.AdvancedMarkerElement({
            map: mapRef.current,
          });
        } else if (mapsApi.Marker) {
          markerRef.current = new mapsApi.Marker({ map: mapRef.current });
        }
      } catch (e) {
        // Map initialization failed
      }
    }

    if (!geocoderRef.current && mapsApi?.Geocoder) {
      try {
        geocoderRef.current = new mapsApi.Geocoder();
      } catch {
        // Geocoder not available
      }
    }
  }, [useGoogleMapsAutocomplete, isGoogleMapsLoaded]);

  useEffect(() => {
    if (!useGoogleMapsAutocomplete || !selectedCoordinates) return;
    centerMap(selectedCoordinates.lat, selectedCoordinates.lng);
  }, [useGoogleMapsAutocomplete, selectedCoordinates]);

  useEffect(() => {
    if (!useGoogleMapsAutocomplete || !isGoogleMapsLoaded || !address.trim()) return;
    if (selectedCoordinates) return;

    const geocoder = geocoderRef.current;
    if (!geocoder?.geocode) return;

    geocoder.geocode({ address: address.trim() }, (results: any[], status: string) => {
      if (status !== "OK" || !results?.[0]?.geometry?.location) return;

      const location = results[0].geometry.location;
      const lat = typeof location.lat === "function" ? location.lat() : location.lat;
      const lng = typeof location.lng === "function" ? location.lng() : location.lng;

      if (typeof lat === "number" && typeof lng === "number") {
        centerMap(lat, lng, 14);
      }
    });
  }, [address, useGoogleMapsAutocomplete, isGoogleMapsLoaded, selectedCoordinates]);

  const handleAddressChange = (value: string) => {
    setSelectedCoordinates(null);
    onAddressChange?.(value);
    if (!useGoogleMapsAutocomplete && onLocationChange) {
      onLocationChange({ address: value, link: addressLink || "" });
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10 pointer-events-none">
          <MapPin className="size-4" />
        </div>

        {!useGoogleMapsAutocomplete && (
          <Input
            ref={inputRef}
            value={address}
            onChange={(e) => handleAddressChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className="pl-10"
          />
        )}

        {useGoogleMapsAutocomplete && (
          <div
            ref={placeAutocompleteContainerRef}
            className="pl-10 flex items-center min-h-10 w-full rounded-md border border-input bg-background text-sm ring-offset-background"
          />
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="google-maps-toggle"
          checked={useGoogleMapsAutocomplete}
          onCheckedChange={(checked) => setUseGoogleMapsAutocomplete(Boolean(checked))}
          disabled={disabled || !isGoogleMapsLoaded}
        />
        <Label
          htmlFor="google-maps-toggle"
          className="text-sm font-medium text-foreground cursor-pointer"
        >
          Enable Google Maps Service (autocomplete + map)
          {!isGoogleMapsLoaded && (
            <span className="ml-2 text-xs text-muted-foreground">(loading…)</span>
          )}
        </Label>
      </div>

      {useGoogleMapsAutocomplete && (
        <div className="space-y-2">
          <div className="w-full h-64 rounded-md overflow-hidden border border-border bg-muted/30">
            <div ref={mapContainerRef} className="h-full w-full" />
          </div>
          {address ? (
            <p className="text-xs text-muted-foreground">
              The address text and Google Maps link will be saved.
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Start typing an address to see it on the map.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
