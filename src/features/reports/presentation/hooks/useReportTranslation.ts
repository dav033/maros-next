import { useState, useEffect, useRef } from "react";
import { translateText } from "@/shared/utils/openaiTranslation";
import { useToast } from "@dav033/dav-components";
import type { RestorationVisitReport } from "@/reports/domain/models";

interface Translations {
  overview: { en: string; es: string };
  activities: Array<{ en: string; es: string }>;
  additionalActivities: Array<{ en: string; es: string }>;
  nextActivities: Array<{ en: string; es: string }>;
  observations: Array<{ en: string; es: string }>;
}

export const useReportTranslation = (
  form: RestorationVisitReport,
  setForm: React.Dispatch<React.SetStateAction<RestorationVisitReport>>
) => {
  const toast = useToast();
  const previousLanguageRef = useRef<string>(form.language || "en");
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationProgress, setTranslationProgress] = useState<{
    current: string;
    total: number;
    completed: number;
  } | null>(null);
  const [translations, setTranslations] = useState<Translations>({
    overview: { en: "", es: "" },
    activities: [],
    additionalActivities: [],
    nextActivities: [],
    observations: [],
  });

  useEffect(() => {
    const currentLanguage = form.language as "en" | "es";
    const previousLanguage = previousLanguageRef.current as "en" | "es" | "";

    if (!currentLanguage || !["en", "es"].includes(currentLanguage)) {
      previousLanguageRef.current = currentLanguage || "en";
      return;
    }

    if (previousLanguage === "" || previousLanguage === currentLanguage) {
      previousLanguageRef.current = currentLanguage;
      return;
    }

    const translateFields = async () => {
      setIsTranslating(true);
      try {
        const currentOverview = form.overview;
        const currentActivities = form.activities.map((act) => act.activity);
        const currentAdditionalActivities = form.additionalActivities.map(
          (act) => act.activity
        );
        const currentNextActivities = form.nextActivities;
        const currentObservations = form.observations;

        const sections = [
          { name: "Overview", hasContent: !!currentOverview },
          { name: "Activities", hasContent: currentActivities.length > 0 },
          { name: "Additional Activities", hasContent: currentAdditionalActivities.length > 0 },
          { name: "Next Activities", hasContent: currentNextActivities.length > 0 },
          { name: "Observations", hasContent: currentObservations.length > 0 },
        ].filter(s => s.hasContent);
        
        const totalSections = sections.length;
        let completedSections = 0;

        setTranslations((t) => ({
          overview: {
            ...t.overview,
            [previousLanguage]: currentOverview,
          },
          activities: currentActivities.map((act, idx) => ({
            ...(t.activities[idx] || { en: "", es: "" }),
            [previousLanguage]: act,
          })),
          additionalActivities: currentAdditionalActivities.map((act, idx) => ({
            ...(t.additionalActivities[idx] || { en: "", es: "" }),
            [previousLanguage]: act,
          })),
          nextActivities: currentNextActivities.map((item, idx) => ({
            ...(t.nextActivities[idx] || { en: "", es: "" }),
            [previousLanguage]: item,
          })),
          observations: currentObservations.map((item, idx) => ({
            ...(t.observations[idx] || { en: "", es: "" }),
            [previousLanguage]: item,
          })),
        }));

        if (currentOverview) {
          setTranslationProgress({
            current: "Overview",
            total: totalSections,
            completed: completedSections,
          });
          const cachedOverview = translations.overview[currentLanguage];
          if (cachedOverview) {
            setForm((prev) => ({ ...prev, overview: cachedOverview }));
          } else {
            const translated = await translateText(
              currentOverview,
              currentLanguage,
              previousLanguage as "en" | "es"
            );
            setForm((prev) => ({ ...prev, overview: translated }));
            setTranslations((t) => ({
              ...t,
              overview: {
                ...t.overview,
                [currentLanguage]: translated,
              },
            }));
          }
          completedSections++;
          setTranslationProgress({
            current: "Overview",
            total: totalSections,
            completed: completedSections,
          });
        }

        if (currentActivities.length > 0) {
          setTranslationProgress({
            current: "Activities",
            total: totalSections,
            completed: completedSections,
          });
          const translatedActivities = await Promise.all(
            currentActivities.map(async (activity, idx) => {
              const cached = translations.activities[idx]?.[currentLanguage];
              if (cached) return cached;
              return translateText(
                activity,
                currentLanguage,
                previousLanguage as "en" | "es"
              );
            })
          );

          setForm((prev) => ({
            ...prev,
            activities: prev.activities.map((act, idx) => ({
              ...act,
              activity: translatedActivities[idx] || act.activity,
            })),
          }));

          setTranslations((t) => ({
            ...t,
            activities: currentActivities.map((act, idx) => ({
              ...(t.activities[idx] || { en: "", es: "" }),
              [currentLanguage]: translatedActivities[idx] || act,
            })),
          }));
          completedSections++;
          setTranslationProgress({
            current: "Activities",
            total: totalSections,
            completed: completedSections,
          });
        }

        if (currentAdditionalActivities.length > 0) {
          setTranslationProgress({
            current: "Additional Activities",
            total: totalSections,
            completed: completedSections,
          });
          const translatedActivities = await Promise.all(
            currentAdditionalActivities.map(async (activity, idx) => {
              const cached =
                translations.additionalActivities[idx]?.[currentLanguage];
              if (cached) return cached;
              return translateText(
                activity,
                currentLanguage,
                previousLanguage as "en" | "es"
              );
            })
          );

          setForm((prev) => ({
            ...prev,
            additionalActivities: prev.additionalActivities.map((act, idx) => ({
              ...act,
              activity: translatedActivities[idx] || act.activity,
            })),
          }));

          setTranslations((t) => ({
            ...t,
            additionalActivities: currentAdditionalActivities.map((act, idx) => ({
              ...(t.additionalActivities[idx] || { en: "", es: "" }),
              [currentLanguage]: translatedActivities[idx] || act,
            })),
          }));
          completedSections++;
          setTranslationProgress({
            current: "Additional Activities",
            total: totalSections,
            completed: completedSections,
          });
        }

        if (currentNextActivities.length > 0) {
          setTranslationProgress({
            current: "Next Activities",
            total: totalSections,
            completed: completedSections,
          });
          const translatedNextActivities = await Promise.all(
            currentNextActivities.map(async (item, idx) => {
              const cached = translations.nextActivities[idx]?.[currentLanguage];
              if (cached) return cached;
              return translateText(
                item,
                currentLanguage,
                previousLanguage as "en" | "es"
              );
            })
          );

          setForm((prev) => ({
            ...prev,
            nextActivities: translatedNextActivities,
          }));

          setTranslations((t) => ({
            ...t,
            nextActivities: currentNextActivities.map((item, idx) => ({
              ...(t.nextActivities[idx] || { en: "", es: "" }),
              [currentLanguage]: translatedNextActivities[idx] || item,
            })),
          }));
          completedSections++;
          setTranslationProgress({
            current: "Next Activities",
            total: totalSections,
            completed: completedSections,
          });
        }

        if (currentObservations.length > 0) {
          setTranslationProgress({
            current: "Observations",
            total: totalSections,
            completed: completedSections,
          });
          const translatedObservations = await Promise.all(
            currentObservations.map(async (item, idx) => {
              const cached = translations.observations[idx]?.[currentLanguage];
              if (cached) return cached;
              return translateText(
                item,
                currentLanguage,
                previousLanguage as "en" | "es"
              );
            })
          );

          setForm((prev) => ({
            ...prev,
            observations: translatedObservations,
          }));

          setTranslations((t) => ({
            ...t,
            observations: currentObservations.map((item, idx) => ({
              ...(t.observations[idx] || { en: "", es: "" }),
              [currentLanguage]: translatedObservations[idx] || item,
            })),
          }));
          completedSections++;
          setTranslationProgress({
            current: "Observations",
            total: totalSections,
            completed: completedSections,
          });
        }
      } catch (error) {
        toast.showError("Error translating content. Please try again.");
      } finally {
        setIsTranslating(false);
        setTranslationProgress(null);
      }
    };

    translateFields();
    previousLanguageRef.current = currentLanguage;
  }, [form.language]);

  const updateTranslation = (
    field: "overview" | "activities" | "additionalActivities",
    index: number | null,
    value: string,
    language: "en" | "es"
  ) => {
    setTranslations((t) => {
      if (field === "overview") {
        return {
          ...t,
          overview: {
            ...t.overview,
            [language]: value,
          },
        };
      }

      if (field === "activities" && index !== null) {
        return {
          ...t,
          activities: form.activities.map((act, idx) => ({
            ...(t.activities[idx] || { en: "", es: "" }),
            [language]: idx === index ? value : act.activity,
          })),
        };
      }

      if (field === "additionalActivities" && index !== null) {
        return {
          ...t,
          additionalActivities: form.additionalActivities.map((act, idx) => ({
            ...(t.additionalActivities[idx] || { en: "", es: "" }),
            [language]: idx === index ? value : act.activity,
          })),
        };
      }

      return t;
    });
  };

  return { translations, updateTranslation, isTranslating, translationProgress };
};

