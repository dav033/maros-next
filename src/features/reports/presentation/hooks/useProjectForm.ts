import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useProjectsApp } from "@/di";
import { getProjectById } from "@/features/project/application/usecases/queries/getProjectById";
import { useInstantProjects } from "@/features/project/presentation/hooks/data/useInstantProjects";
import { optimizedApiClient } from "@/shared/infra";
import { useToast } from "@dav033/dav-components";
import { EMPTY_VISIT, mapLanguage, extractProjectFormData } from "../utils/reportFormHelpers";
import type { RestorationVisitReport } from "@/reports/domain/models";

export const useProjectForm = () => {
  const toast = useToast();
  const searchParams = useSearchParams();
  const projectsApp = useProjectsApp();
  const { projects = [], isFetching: projectsLoading } = useInstantProjects();
  const dataProcessedRef = useRef(false);

  const [projectInput, setProjectInput] = useState("");
  const [activeProjectId, setActiveProjectId] = useState<number | null>(null);
  const [project, setProject] = useState<any>(null);
  const [projectLoading, setProjectLoading] = useState(false);
  const [form, setForm] = useState<RestorationVisitReport>(EMPTY_VISIT);

  useEffect(() => {
    if (activeProjectId) {
      setProjectLoading(true);
      getProjectById(projectsApp, activeProjectId)
        .then((proj) => {
          setProject(proj);
          setProjectLoading(false);
        })
        .catch(() => {
          setProject(null);
          setProjectLoading(false);
        });
    } else {
      setProject(null);
    }
  }, [activeProjectId, projectsApp]);

  useEffect(() => {
    const base64Data = searchParams.get("data");
    if (!base64Data || dataProcessedRef.current || projectsLoading) {
      return;
    }

    dataProcessedRef.current = true;

    try {
      const decodedString = atob(base64Data);
      const decodedData = JSON.parse(decodedString) as {
        lead_number: string;
        language: string;
        activities?: Array<{
          activity: string;
          imageId?: string;
          imageFile?: string;
        }>;
        additional_activities?: Array<{
          activity: string;
          imageId?: string;
          imageFile?: string;
        }>;
        next_activities?: string[];
        observations?: string[];
      };

      if (!decodedData.lead_number) {
        toast.showError("Invalid data: lead_number is missing.");
        return;
      }

      setForm((prev) => ({
        ...prev,
        leadNumber: decodedData.lead_number,
        language: mapLanguage(decodedData.language),
        activities:
          decodedData.activities && decodedData.activities.length > 0
            ? decodedData.activities.map((act) => ({
                activity: act.activity || "",
                imageFiles: [],
                imageUrls: [],
              }))
            : prev.activities,
        additionalActivities:
          decodedData.additional_activities &&
          decodedData.additional_activities.length > 0
            ? decodedData.additional_activities.map((act) => ({
                activity: act.activity || "",
                imageFiles: [],
                imageUrls: [],
              }))
            : prev.additionalActivities,
        nextActivities: decodedData.next_activities || [],
        observations: decodedData.observations || [],
      }));

      setProjectLoading(true);
      const foundProject = projects.find(
        (p) => p.lead?.leadNumber === decodedData.lead_number
      );

      if (foundProject) {
        setActiveProjectId(foundProject.id);
        setProjectInput(String(foundProject.id));
        getProjectById(projectsApp, foundProject.id)
          .then((projectData) => {
            setProject(projectData);
            const formData = extractProjectFormData(projectData);
            setForm((prev) => ({
              ...prev,
              ...formData,
              language: prev.language || "en",
            }));
            setProjectLoading(false);
            toast.showSuccess("Form pre-filled with data from URL.");
          })
          .catch(() => {
            setProjectLoading(false);
          });
      } else {
        optimizedApiClient
          .get(
            `/projects/by-lead-number?leadNumber=${encodeURIComponent(decodedData.lead_number)}`
          )
          .then((response) => {
            const projectData = response.data;
            setProject(projectData);
            const projectInList = projects.find(
              (p) => p.lead?.leadNumber === decodedData.lead_number
            );
            if (projectInList) {
              setActiveProjectId(projectInList.id);
              setProjectInput(String(projectInList.id));
            }
            const formData = extractProjectFormData(projectData);
            setForm((prev) => ({
              ...prev,
              ...formData,
              language: prev.language || "en",
            }));
            setProjectLoading(false);
            toast.showSuccess("Form pre-filled with data from URL.");
          })
          .catch(() => {
            setProjectLoading(false);
          });
      }
    } catch (error) {
      toast.showError("Invalid data in URL. Please select a project manually.");
    }
  }, [searchParams, projects, projectsLoading, projectsApp, toast]);

  useEffect(() => {
    if (project) {
      const formData = extractProjectFormData(project);
      setForm((prev) => ({
        ...prev,
        ...formData,
        language: prev.language || "en",
      }));
    }
  }, [project]);

  const handleSelectProject = (value: string) => {
    setProjectInput(value);
    setActiveProjectId(value ? parseInt(value, 10) : null);
  };

  return {
    form,
    setForm,
    project,
    projectInput,
    projectLoading,
    projectsLoading,
    projects,
    handleSelectProject,
  };
};


