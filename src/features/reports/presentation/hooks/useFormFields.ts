import { useMemo } from "react";
import type { ActivityRow, RestorationVisitReport } from "@/reports/domain/models";
import type { Contact } from "@/contact/domain";
import { createEmptyActivity } from "../utils/reportFormHelpers";

export const useFormFields = (
  form: RestorationVisitReport,
  setForm: React.Dispatch<React.SetStateAction<RestorationVisitReport>>,
  updateTranslation: (field: "overview" | "activities" | "additionalActivities", index: number | null, value: string, language: "en" | "es") => void
) => {
  const updateField = (field: keyof RestorationVisitReport, value: string | null) => {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };

      if (field === "overview" && prev.language) {
        const currentLang = prev.language as "en" | "es";
        updateTranslation("overview", null, value || "", currentLang);
      }

      return updated;
    });
  };

  const updateActivityRow = (
    listKey: "activities" | "additionalActivities",
    index: number,
    data: Partial<ActivityRow>
  ) => {
    setForm((prev) => {
      const updated = {
        ...prev,
        [listKey]: prev[listKey].map((row, i) =>
          i === index ? { ...row, ...data } : row
        ),
      };

      if (
        data.activity !== undefined &&
        prev.language &&
        (listKey === "activities" || listKey === "additionalActivities")
      ) {
        const currentLang = prev.language as "en" | "es";
        updateTranslation(
          listKey,
          index,
          data.activity || "",
          currentLang
        );
      }

      return updated;
    });
  };

  const addActivityRow = (listKey: "activities" | "additionalActivities") => {
    setForm((prev) => ({
      ...prev,
      [listKey]: [...prev[listKey], createEmptyActivity()],
    }));
  };

  const deleteActivityRow = (
    listKey: "activities" | "additionalActivities",
    index: number
  ) => {
    setForm((prev) => ({
      ...prev,
      [listKey]: prev[listKey].filter((_, i) => i !== index),
    }));
  };

  const updateStringList = (
    key: "nextActivities" | "observations",
    index: number,
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: prev[key].map((item, i) => (i === index ? value : item)),
    }));
  };

  const addStringItem = (key: "nextActivities" | "observations") => {
    setForm((prev) => ({ ...prev, [key]: [...prev[key], ""] }));
  };

  const deleteStringItem = (key: "nextActivities" | "observations", index: number) => {
    setForm((prev) => ({
      ...prev,
      [key]: prev[key].filter((_, i) => i !== index),
    }));
  };

  return {
    updateField,
    updateActivityRow,
    addActivityRow,
    deleteActivityRow,
    updateStringList,
    addStringItem,
    deleteStringItem,
  };
};

