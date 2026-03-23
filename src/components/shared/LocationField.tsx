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
        places: {
          Autocomplete: new (input: HTMLInputElement, options?: any) => {
            addListener: (event: string, callback: () => void) => void;
            getPlace: () => {
              formatted_address: string;
              place_id?: string;
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
  const [useGoogleMapsAutocomplete, setUseGoogleMapsAutocomplete] = useState(false);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);

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
            fields: ["formatted_address", "place_id"],
          }
        );

        autocompleteRef.current.addListener("place_changed", () => {
          const place = autocompleteRef.current.getPlace();
          if (place.formatted_address) {
            const addressText = place.formatted_address;
            
            // Generate Google Maps link
            const encodedAddress = encodeURIComponent(addressText);
            const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
            
            // Update both address and link together to ensure synchronization
            // Use setTimeout to ensure React state updates happen after DOM update
            setTimeout(() => {
              onAddressChange?.(addressText);
              onAddressLinkChange?.(mapsLink);
              
              if (onLocationChange) {
                onLocationChange({ address: addressText, link: mapsLink });
              }
            }, 0);
          }
        });
      } catch (error) {
        console.error("Error initializing Google Places Autocomplete:", error);
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
  }, [useGoogleMapsAutocomplete, isGoogleMapsLoaded, disabled, onAddressChange, onAddressLinkChange, onLocationChange]);

  const handleToggleGoogleMaps = (checked: boolean) => {
    setUseGoogleMapsAutocomplete(checked);
  };

  const handleAddressChange = (value: string) => {
    // Always update the address value
    onAddressChange?.(value);
    // Only update location change if autocomplete is not active (autocomplete handles it)
    if (!useGoogleMapsAutocomplete && onLocationChange) {
      onLocationChange({ address: value, link: addressLink || "" });
    }
  };

  // Generate Google Maps embed URL
  const getMapsEmbedUrl = (addressText: string, link?: string | null) => {
    // If we have a link from autocomplete, convert it to embed format
    if (link && link.includes('google.com/maps')) {
      // Convert search link to embed format
      try {
        const url = new URL(link);
        const query = url.searchParams.get('query');
        if (query) {
          return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
        }
      } catch (e) {
        // If URL parsing fails, continue with address text
      }
    }
    
    // If we have address text, use it
    if (addressText.trim()) {
      const encodedAddress = encodeURIComponent(addressText.trim());
      return `https://www.google.com/maps?q=${encodedAddress}&output=embed`;
    }
    
    // Default: show a blank map (world view)
    return `https://www.google.com/maps?output=embed`;
  };

  const mapsEmbedUrl = useGoogleMapsAutocomplete ? getMapsEmbedUrl(address, addressLink) : null;

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

      {useGoogleMapsAutocomplete && mapsEmbedUrl && (
        <div className="space-y-2">
          <div className="w-full h-64 rounded-md overflow-hidden border border-border">
            <iframe
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={mapsEmbedUrl}
              title="Google Maps"
            />
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
