"use client";

import { useMemo, useState } from "react";
import { Check, ChevronsUpDown, Lock, Trash2, Users2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type {
  NoteAccessPanel,
  NoteDirectoryUser,
  NoteShareAccess,
} from "@/notes/domain";
import { useNoteDirectory } from "../hooks/data/useNoteDirectory";
import { useNoteSharingMutations } from "../hooks/mutations/useNoteSharingMutations";

const ACCESS_LABELS: Record<NoteShareAccess, string> = {
  viewer: "Can view",
  // Stored and enforced already; behaves as view-only until the comments UI exists.
  commenter: "Can comment",
  editor: "Can edit",
};

function initials(name: string | null, email: string | null): string {
  const source = name?.trim() || email?.trim() || "?";
  return source.slice(0, 2).toUpperCase();
}

export interface SharePeoplePanelProps {
  pageId: number;
  panel: NoteAccessPanel | null;
  isLoading: boolean;
  canManage: boolean;
}

export function SharePeoplePanel({
  pageId,
  panel,
  isLoading,
  canManage,
}: SharePeoplePanelProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [access, setAccess] = useState<NoteShareAccess>("viewer");
  const { users, isLoading: directoryLoading } = useNoteDirectory(true);
  const {
    shareMutation,
    updateShareMutation,
    revokeShareMutation,
    visibilityMutation,
  } = useNoteSharingMutations(pageId);

  const alreadyShared = useMemo(
    () =>
      new Set(
        (panel?.shares ?? [])
          .filter((share) => share.subjectType === "user")
          .map((share) => share.subjectId)
      ),
    [panel]
  );

  const candidates = users.filter((user) => !alreadyShared.has(user.id));

  const grant = (user: NoteDirectoryUser) => {
    setPickerOpen(false);
    shareMutation.mutate({ id: pageId, userId: user.id, access });
  };

  if (isLoading || !panel) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={pickerOpen}
              className="flex-1 justify-between font-normal text-muted-foreground"
            >
              Add people…
              <ChevronsUpDown className="h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
            <Command>
              <CommandInput placeholder="Search by name or email…" />
              <CommandList>
                <CommandEmpty>
                  {directoryLoading ? "Loading…" : "Nobody left to add."}
                </CommandEmpty>
                <CommandGroup>
                  {candidates.map((user) => (
                    <CommandItem
                      key={user.id}
                      value={`${user.name ?? ""} ${user.email}`}
                      onSelect={() => grant(user)}
                      className="gap-2"
                    >
                      <Avatar className="h-6 w-6">
                        {user.picture && <AvatarImage src={user.picture} alt="" />}
                        <AvatarFallback className="text-[10px]">
                          {initials(user.name, user.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="truncate text-sm">{user.name ?? user.email}</div>
                        {user.name && (
                          <div className="truncate text-xs text-muted-foreground">
                            {user.email}
                          </div>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <Select value={access} onValueChange={(v) => setAccess(v as NoteShareAccess)}>
          <SelectTrigger className="w-[9.5rem]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(ACCESS_LABELS) as NoteShareAccess[]).map((level) => (
              <SelectItem key={level} value={level}>
                {ACCESS_LABELS[level]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        {panel.shares.length === 0 && (
          <p className="py-2 text-sm text-muted-foreground">
            Nobody has been given access to this note yet.
          </p>
        )}

        {panel.shares.map((share) => (
          <div key={share.id} className="flex items-center gap-2 rounded-md px-1 py-1.5">
            <Avatar className="h-7 w-7">
              {share.subject.picture && <AvatarImage src={share.subject.picture} alt="" />}
              <AvatarFallback className="text-[10px]">
                {share.subjectType === "role" ? (
                  <Users2 className="h-3 w-3" />
                ) : (
                  initials(share.subject.name, share.subject.email)
                )}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <div className="truncate text-sm">
                {share.subject.name ?? share.subject.email ?? `Role #${share.subjectId}`}
              </div>
              {share.inheritedFrom && (
                // The control below is disabled for these on purpose: the grant lives on
                // an ancestor, and changing it from here would silently alter access for
                // every other page in that subtree.
                <div className="truncate text-xs text-muted-foreground">
                  Inherited from “{share.inheritedFrom}”
                </div>
              )}
            </div>

            <Select
              value={share.access}
              disabled={!!share.inheritedFrom || updateShareMutation.isPending}
              onValueChange={(v) =>
                updateShareMutation.mutate({
                  id: pageId,
                  shareId: share.id,
                  patch: { access: v as NoteShareAccess },
                })
              }
            >
              <SelectTrigger className="h-8 w-[8.5rem] border-none text-xs shadow-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(ACCESS_LABELS) as NoteShareAccess[]).map((level) => (
                  <SelectItem key={level} value={level}>
                    {ACCESS_LABELS[level]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              disabled={!!share.inheritedFrom || revokeShareMutation.isPending}
              title={
                share.inheritedFrom
                  ? `Managed on “${share.inheritedFrom}”`
                  : "Remove access"
              }
              onClick={() =>
                revokeShareMutation.mutate({ id: pageId, shareId: share.id })
              }
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-border/60 p-3">
        <div className="mb-2 flex items-center gap-2 text-sm font-medium">
          <Lock className="h-3.5 w-3.5 text-muted-foreground" />
          General access
        </div>
        <Select
          value={panel.visibility}
          disabled={!canManage || visibilityMutation.isPending}
          onValueChange={(v) =>
            visibilityMutation.mutate({
              id: pageId,
              visibility: v as "private" | "team",
            })
          }
        >
          <SelectTrigger className="h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="private">Only me and people I share it with</SelectItem>
            <SelectItem value="team">Anyone at Maros</SelectItem>
          </SelectContent>
        </Select>
        <p className={cn("mt-2 text-xs text-muted-foreground", canManage && "hidden")}>
          Only the note’s owner can change this.
        </p>
      </div>
    </div>
  );
}
