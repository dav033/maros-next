"use client";

import { useState, useEffect, useRef, type ChangeEvent } from "react";
import { Building, Search, Plus, ChevronUp, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { Company } from "@/company";

interface ContactCompanySelectorProps {
  selectedCompanyId: number | null;
  companies: Company[];
  disabled?: boolean;
  onCompanyChange: (companyId: number | null) => void;
  onCreateNewCompany?: () => void;
}

export function ContactCompanySelector({
  selectedCompanyId,
  companies,
  disabled,
  onCompanyChange,
  onCreateNewCompany,
}: ContactCompanySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (dropdownRef.current?.contains(target)) return;
      setIsOpen(false);
    };
    if (isOpen) {
      window.addEventListener("mousedown", onClickOutside);
      return () => window.removeEventListener("mousedown", onClickOutside);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
    }
  }, [isOpen]);

  const selectedCompany = companies.find((c) => c.id === selectedCompanyId);
  const displayText = selectedCompany ? selectedCompany.name : "No company";

  const filteredCompanies = companies.filter((company): company is Company & { id: number } =>
    typeof company.id === "number" && company.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectCompany = (companyId: number | null) => {
    onCompanyChange(companyId);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="flex h-9 w-full items-center gap-2 rounded-md border border-input bg-transparent px-3 text-left text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Building className="size-4 text-muted-foreground" />
        <span className="flex-1 truncate">{displayText}</span>
        {isOpen ? (
          <ChevronUp className="size-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="size-4 text-muted-foreground" />
        )}
      </button>
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-10 mt-1 w-full rounded-md border border-border bg-popover shadow-lg"
        >
          <div className="border-b border-border p-2 space-y-2">
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Search className="size-4" />
              </div>
              <Input
                value={searchQuery}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                placeholder="Search companies..."
                className="pl-10"
              />
            </div>
            {onCreateNewCompany && (
              <button
                type="button"
                onClick={() => {
                  onCreateNewCompany();
                  setIsOpen(false);
                }}
                disabled={disabled}
                className="flex w-full items-center gap-2 rounded-md border border-dashed border-primary/40 bg-primary/10 px-3 py-2 text-sm text-primary hover:bg-primary/20 hover:border-primary/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="size-4" />
                <span>Create New Company</span>
              </button>
            )}
          </div>
          <div className="max-h-52 overflow-auto">
            <button
              type="button"
              onClick={() => handleSelectCompany(null)}
              className={`flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent ${
                selectedCompanyId === null ? "bg-accent/50" : ""
              }`}
            >
              <span className="flex-1 text-left">No company</span>
            </button>
            {filteredCompanies.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                {searchQuery ? "No companies found" : "No companies available"}
              </div>
            ) : (
              filteredCompanies.map((company) => (
                <button
                  key={company.id}
                  type="button"
                  onClick={() => handleSelectCompany(company.id)}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-accent ${
                    selectedCompanyId === company.id ? "bg-accent/50" : ""
                  }`}
                >
                  <span className="flex-1 truncate text-left">{company.name}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

