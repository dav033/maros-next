import type { ProjectTypeRepositoryPort } from "@/features/projectType/domain";

export type ProjectTypesAppContext = Readonly<{
  repos: Readonly<{
    projectType: ProjectTypeRepositoryPort;
  }>;
}>;
