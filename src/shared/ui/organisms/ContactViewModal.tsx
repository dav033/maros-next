"use client";

import * as React from "react";
import { Modal } from "../molecules/Modal";

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
    <Modal isOpen={isOpen} title="Contact Information" onClose={onClose}>
      <div className="space-y-2 p-4">
        <div>
          <span className="font-semibold text-theme-light">Name:</span>{" "}
          {contact.name}
        </div>
        <div>
          <span className="font-semibold text-theme-light">Phone:</span>{" "}
          {contact.phone || "—"}
        </div>
        <div>
          <span className="font-semibold text-theme-light">Email:</span>{" "}
          {contact.email || "—"}
        </div>
        <div>
          <span className="font-semibold text-theme-light">Occupation:</span>{" "}
          {contact.occupation || "—"}
        </div>
        <div>
          <span className="font-semibold text-theme-light">Address:</span>{" "}
          {contact.address || "—"}
        </div>
        <div>
          <span className="font-semibold text-theme-light">Customer:</span>{" "}
          {contact.isCustomer ? "Yes" : "No"}
        </div>
        <div>
          <span className="font-semibold text-theme-light">Client:</span>{" "}
          {contact.isClient ? "Yes" : "No"}
        </div>
      </div>
    </Modal>
  );
}
