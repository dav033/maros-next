"use client";

import { Loader2, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function ProjectListLoadError({
  hasVisibleProjects,
  isFetching,
  onRetry,
}: {
  hasVisibleProjects: boolean;
  isFetching: boolean;
  onRetry: () => Promise<void>;
}) {
  return (
    <Alert variant="destructive" className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <AlertTitle>
          {hasVisibleProjects ? "Couldn’t refresh projects" : "Couldn’t load projects"}
        </AlertTitle>
        <AlertDescription>
          {hasVisibleProjects
            ? "Showing the projects already loaded. Try again to refresh them."
            : "No project data is available yet. Check your connection and try again."}
        </AlertDescription>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="shrink-0 border-destructive/50 text-foreground hover:bg-destructive/10"
        disabled={isFetching}
        onClick={() => void onRetry()}
      >
        {isFetching ? <Loader2 className="animate-spin" /> : <RefreshCw />}
        {isFetching ? "Retrying…" : "Try again"}
      </Button>
    </Alert>
  );
}
