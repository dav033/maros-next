"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";

export interface NotesButtonProps {
  hasNotes: boolean;
  notesCount?: number;
  onClick: () => void;
  title?: string;
  className?: string;
}

export const NotesButton: React.FC<NotesButtonProps> = ({
  hasNotes,
  notesCount = 0,
  onClick,
  title = "View notes",
  className,
}) => {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            onClick={onClick}
            variant="ghost"
            size="sm"
            className={cn(
              "group relative inline-flex items-center gap-1.5 p-0 cursor-pointer bg-transparent shadow-none hover:bg-transparent",
              className
            )}
          >
            <div
              className={cn(
                "relative flex items-center gap-1.5 rounded-md px-2.5 py-1.5 transition-all duration-150 ease-out",
                hasNotes
                  ? "bg-accent text-foreground hover:text-foreground"
                  : "bg-accent text-muted-foreground hover:text-foreground"
              )}
            >
              <FileText
                size={16}
                className="transition-transform group-hover:scale-105"
              />
              {hasNotes && notesCount > 0 && (
                <span className="text-[10px] font-medium tabular-nums">
                  {notesCount}
                </span>
              )}
            </div>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{title}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
