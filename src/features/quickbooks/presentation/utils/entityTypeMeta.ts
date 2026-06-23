import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  CircleDollarSign,
  FileText,
  FileSignature,
  Landmark,
  Pencil,
  Receipt,
  ScrollText,
  ShoppingBag,
  ShoppingCart,
  Wallet,
} from "lucide-react";
import type { QboAttachmentEntityType } from "../../domain/models";

export interface QboEntityTypeMeta {
  key: QboAttachmentEntityType | string;
  label: string;
  pluralLabel: string;
  icon: LucideIcon;
  description: string;
}

const META: Record<string, QboEntityTypeMeta> = {
  Customer: {
    key: "Customer",
    label: "Customer / Project",
    pluralLabel: "Customer & project files",
    icon: Briefcase,
    description: "Files attached to the project (Customer/Job) record itself.",
  },
  Invoice: {
    key: "Invoice",
    label: "Invoice",
    pluralLabel: "Invoices",
    icon: Receipt,
    description: "Files attached to invoices issued for this project.",
  },
  Estimate: {
    key: "Estimate",
    label: "Estimate",
    pluralLabel: "Estimates",
    icon: FileText,
    description: "Files attached to project estimates / quotes.",
  },
  Payment: {
    key: "Payment",
    label: "Payment",
    pluralLabel: "Payments",
    icon: CircleDollarSign,
    description: "Files attached to customer payments received.",
  },
  Purchase: {
    key: "Purchase",
    label: "Expense",
    pluralLabel: "Expenses",
    icon: ShoppingCart,
    description: "Files attached to expenses and purchases.",
  },
  Bill: {
    key: "Bill",
    label: "Bill",
    pluralLabel: "Bills",
    icon: ScrollText,
    description: "Files attached to vendor bills.",
  },
  BillPayment: {
    key: "BillPayment",
    label: "Bill payment",
    pluralLabel: "Bill payments",
    icon: Wallet,
    description: "Files attached to bill payments.",
  },
  VendorCredit: {
    key: "VendorCredit",
    label: "Vendor credit",
    pluralLabel: "Vendor credits",
    icon: FileSignature,
    description: "Files attached to vendor credits.",
  },
  PurchaseOrder: {
    key: "PurchaseOrder",
    label: "Purchase order",
    pluralLabel: "Purchase orders",
    icon: ShoppingBag,
    description: "Files attached to purchase orders.",
  },
  JournalEntry: {
    key: "JournalEntry",
    label: "Journal entry",
    pluralLabel: "Journal entries",
    icon: Landmark,
    description: "Files attached to journal entries.",
  },
};

const FALLBACK: QboEntityTypeMeta = {
  key: "Other",
  label: "Other",
  pluralLabel: "Other",
  icon: Pencil,
  description: "Files attached to other QuickBooks transactions.",
};

export function getEntityTypeMeta(
  entityType: string,
): QboEntityTypeMeta {
  return META[entityType] ?? { ...FALLBACK, key: entityType, label: entityType, pluralLabel: `${entityType}s` };
}

export function getAllEntityTypeOrder(): QboAttachmentEntityType[] {
  return [
    "Customer",
    "Estimate",
    "Invoice",
    "Payment",
    "Purchase",
    "Bill",
    "BillPayment",
    "VendorCredit",
    "PurchaseOrder",
    "JournalEntry",
  ];
}
