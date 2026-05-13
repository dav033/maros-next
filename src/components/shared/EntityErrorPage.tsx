"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export interface EntityErrorPageProps {
  /** Entity type label (e.g., "lead", "contact", "company") */
  entityType: string;
  /** The ID that was attempted to load */
  entityId: number | string;
  /** Optional error message */
  error?: string;
}

/**
 * Reusable error page for when an entity detail fails to load.
 */
export function EntityErrorPage({
  entityType,
  entityId,
  error,
}: EntityErrorPageProps) {
  const router = useRouter();

  return (
    <div className="container mx-auto p-6 space-y-4">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="size-4 mr-2" />
        Back
      </Button>
      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">
            Error loading {entityType}
          </CardTitle>
          <CardDescription>
            {error || `Could not load ${entityType} information`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {entityType.charAt(0).toUpperCase() + entityType.slice(1)} with ID{" "}
            {entityId} does not exist or could not be found. Please verify that
            the ID is correct.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
