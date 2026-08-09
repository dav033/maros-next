"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, Users } from "lucide-react";
import { useNoteAccess } from "../hooks/data/useNoteAccess";
import { SharePeoplePanel } from "../molecules/SharePeoplePanel";
import { SharePublicLinkPanel } from "../molecules/SharePublicLinkPanel";

export interface ShareNoteDialogProps {
  pageId: number;
  pageTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Two tabs because they are two different decisions with two different blast radii:
 * naming a colleague is reversible from this same screen, while handing out a URL is
 * not — for anyone who already copied it. Merging them into one list would make the
 * second look as routine as the first.
 */
export function ShareNoteDialog({
  pageId,
  pageTitle,
  open,
  onOpenChange,
}: ShareNoteDialogProps) {
  const [tab, setTab] = useState("people");
  const { panel, isLoading } = useNoteAccess(pageId, open);

  const canManage = panel?.myAccess === "owner";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100svh-1rem)] w-[calc(100%-1rem)] max-w-lg overflow-y-auto overscroll-contain p-4 sm:max-h-[calc(100svh-2rem)] sm:p-6">
        <DialogHeader>
          <DialogTitle className="truncate">Share “{pageTitle || "Untitled"}”</DialogTitle>
          <DialogDescription>
            Grants apply to this page and everything nested under it.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="people" className="gap-1.5">
              <Users className="h-3.5 w-3.5" aria-hidden="true" />
              People
            </TabsTrigger>
            <TabsTrigger value="link" className="gap-1.5">
              <Globe className="h-3.5 w-3.5" aria-hidden="true" />
              Public link
            </TabsTrigger>
          </TabsList>

          <TabsContent value="people" className="mt-4">
            <SharePeoplePanel
              pageId={pageId}
              panel={panel}
              isLoading={isLoading}
              canManage={canManage}
            />
          </TabsContent>

          <TabsContent value="link" className="mt-4">
            <SharePublicLinkPanel
              pageId={pageId}
              panel={panel}
              isLoading={isLoading}
              canManage={canManage}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
