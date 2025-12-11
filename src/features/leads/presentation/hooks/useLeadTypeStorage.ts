"use client";

import { useState, useEffect } from "react";
import { LeadType } from "@/leads/domain";

const STORAGE_KEY = "maros-lead-type";

const DEFAULT_TYPE = LeadType.CONSTRUCTION;

export function useLeadTypeStorage() {
  const [leadType, setLeadTypeState] = useState<LeadType>(DEFAULT_TYPE);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Solo leer del localStorage en el cliente
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && Object.values(LeadType).includes(stored as LeadType)) {
        setLeadTypeState(stored as LeadType);
      }
      setIsHydrated(true);
    }
  }, []);

  const setLeadType = (type: LeadType) => {
    setLeadTypeState(type);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, type);
    }
  };

  return {
    leadType,
    setLeadType,
    isHydrated,
  };
}



