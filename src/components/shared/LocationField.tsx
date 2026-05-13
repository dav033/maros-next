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
          Autocomplete: new (input: HTMLInputElement, options?: any) => {
            addListener: (event: string, callback: () => void) => void;
            getPlace: () => {
              formatted_address: string;
              place_id?: string;
              geometry?: {
                location?: {
                  lat: () => number;
                  lng: () => number;
                };
              };
            };
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
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const autocompleteRef = useRef<any>(null);
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
    if (!mapRef.current || !markerRef.current) return;

    const position = { lat, lng };
    mapRef.current.setCenter(position);
    mapRef.current.setZoom(zoom);
    markerRef.current.setPosition(position);
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

    // Check immediately
    checkGoogleMaps();

    // Listen for the load event
    window.addEventListener("google-maps-loaded", checkGoogleMaps);

    return () => {
      window.removeEventListener("google-maps-loaded", checkGoogleMaps);
    };
  }, []);

  // Initialize or destroy autocomplete based on checkbox state
  useEffect(() => {
    if (!inputRef.current || !isGoogleMapsLoaded || disabled) return;

    if (useGoogleMapsAutocomplete && !autocompleteRef.current) {
      // Initialize Google Places Autocomplete
      try {
        autocompleteRef.current = new window.google!.maps.places.Autocomplete(
          inputRef.current,
          {
            types: ["address"],
            fields: ["formatted_address", "place_id", "geometry"],
          }
        );

        autocompleteRef.current.addListener("place_changed", () => {
          const place = autocompleteRef.current.getPlace();
          const addressText =
            place?.formatted_address?.trim() || inputRef.current?.value?.trim() || "";
          const lat = place?.geometry?.location?.lat?.();
          const lng = place?.geometry?.location?.lng?.();

          if (typeof lat === "number" && typeof lng === "number") {
            setSelectedCoordinates({ lat, lng });
          } else {
            setSelectedCoordinates(null);
          }

          if (addressText) {
            
            // Generate Google Maps link
            const encodedAddress = encodeURIComponent(addressText);
            const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
            
            // Update both address and link together to ensure synchronization
            onAddressChangeRef.current?.(addressText);
            onAddressLinkChangeRef.current?.(mapsLink);

            if (onLocationChangeRef.current) {
              onLocationChangeRef.current({ address: addressText, link: mapsLink });
            }
          }
        });
      } catch {
        // Autocomplete initialization failed, continue without it
      }
    } else if (!useGoogleMapsAutocomplete && autocompleteRef.current) {
      // Clean up autocomplete
      if (window.google?.maps?.event) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
      autocompleteRef.current = null;
    }

    return () => {
      if (autocompleteRef.current && window.google?.maps?.event) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [useGoogleMapsAutocomplete, isGoogleMapsLoaded, disabled]);

  useEffect(() => {
    if (!useGoogleMapsAutocomplete || !isGoogleMapsLoaded || !mapContainerRef.current) return;

    const mapsApi = window.google?.maps as any;
    if (!mapsApi?.Map || !mapsApi?.Marker) return;

    if (!mapRef.current) {
      mapRef.current = new mapsApi.Map(mapContainerRef.current, {
        center: { lat: 20, lng: 0 },
        zoom: 2,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });
      markerRef.current = new mapsApi.Marker({ map: mapRef.current });
    }

    if (!geocoderRef.current && mapsApi?.Geocoder) {
      geocoderRef.current = new mapsApi.Geocoder();
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

  const handleToggleGoogleMaps = (checked: boolean) => {
    setUseGoogleMapsAutocomplete(checked);
  };

  const handleAddressChange = (value: string) => {
    setSelectedCoordinates(null);
    // Always update the address value
    onAddressChange?.(value);
    // Only update location change if autocomplete is not active (autocomplete handles it)
    if (!useGoogleMapsAutocomplete && onLocationChange) {
      onLocationChange({ address: value, link: addressLink || "" });
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          <MapPin className="size-4" />
        </div>
        <Input
          ref={inputRef}
          value={address}
          onChange={(e) => handleAddressChange(e.target.value)}
          placeholder={useGoogleMapsAutocomplete ? "Start typing an address..." : placeholder}
          disabled={disabled}
          className="pl-10"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="google-maps-toggle"
          checked={useGoogleMapsAutocomplete}
          onCheckedChange={handleToggleGoogleMaps}
          disabled={disabled || !isGoogleMapsLoaded}
        />
        <Label 
          htmlFor="google-maps-toggle" 
          className="text-sm font-medium text-foreground cursor-pointer"
        >
          Enable Google Maps Service (autocomplete + map)
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
