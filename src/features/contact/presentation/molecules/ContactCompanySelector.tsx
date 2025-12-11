"use client";

import { useState, useEffect, useRef } from "react";
import { Icon, Input } from "@dav033/dav-components";
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
        className="flex h-10 w-full items-center gap-2 rounded-lg border border-theme-gray-subtle bg-theme-dark px-3 text-left text-sm text-theme-light placeholder:text-gray-400 outline-none focus:border-theme-accent focus:ring-1 focus:ring-theme-accent disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Icon name="lucide:building-2" size={16} className="text-gray-400" />
        <span className="flex-1 truncate">{displayText}</span>
        <Icon
          name={isOpen ? "lucide:chevron-up" : "lucide:chevron-down"}
          size={16}
          className="text-gray-400"
        />
      </button>
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-10 mt-1 w-full rounded-lg border border-theme-gray bg-theme-dark shadow-lg"
        >
          <div className="border-b border-theme-gray-subtle p-2 space-y-2">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search companies..."
              leftAddon={<Icon name="lucide:search" size={16} />}
            />
            {onCreateNewCompany && (
              <button
                type="button"
                onClick={() => {
                  onCreateNewCompany();
                  setIsOpen(false);
                }}
                disabled={disabled}
                className="flex w-full items-center gap-2 rounded-lg border border-dashed border-[#1ab3a4]/40 bg-[#1ab3a4]/8 px-3 py-2 text-sm text-[#9ff3e7] hover:bg-[#1ab3a4]/14 hover:border-[#1ab3a4]/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Icon name="lucide:plus" size={16} />
                <span>Create New Company</span>
              </button>
            )}
          </div>
          <div className="max-h-52 overflow-auto">
            <button
              type="button"
              onClick={() => handleSelectCompany(null)}
              className={`flex w-full items-center gap-2 px-3 py-2 text-sm text-theme-light hover:bg-theme-gray ${
                selectedCompanyId === null ? "bg-theme-gray/50" : ""
              }`}
            >
              <span className="flex-1 text-left">No company</span>
            </button>
            {filteredCompanies.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-400">
                {searchQuery ? "No companies found" : "No companies available"}
              </div>
            ) : (
              filteredCompanies.map((company) => (
                <button
                  key={company.id}
                  type="button"
                  onClick={() => handleSelectCompany(company.id)}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-sm text-theme-light hover:bg-theme-gray ${
                    selectedCompanyId === company.id ? "bg-theme-gray/50" : ""
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

