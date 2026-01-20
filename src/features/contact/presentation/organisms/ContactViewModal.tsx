"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export interface ContactViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact: {
    name?: string;
    phone?: string;
    email?: string;
    occupation?: string;
    address?: string;
    isCustomer?: boolean;
    isClient?: boolean;
  } | null;
}

export function ContactViewModal({
  isOpen,
  onClose,
  contact,
}: ContactViewModalProps) {
  if (!contact) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Contact Information</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 p-4">
          <div>
            <span className="font-semibold text-foreground">Name:</span>{" "}
            {contact.name}
          </div>
          <div>
            <span className="font-semibold text-foreground">Phone:</span>{" "}
            {contact.phone || "—"}
          </div>
          <div>
            <span className="font-semibold text-foreground">Email:</span>{" "}
            {contact.email || "—"}
          </div>
          <div>
            <span className="font-semibold text-foreground">Occupation:</span>{" "}
            {contact.occupation || "—"}
          </div>
          <div>
            <span className="font-semibold text-foreground">Address:</span>{" "}
            {contact.address || "—"}
          </div>
          <div>
            <span className="font-semibold text-foreground">Customer:</span>{" "}
            {contact.isCustomer ? "Yes" : "No"}
          </div>
          <div>
            <span className="font-semibold text-foreground">Client:</span>{" "}
            {contact.isClient ? "Yes" : "No"}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}




