import type { ProjectTypeRepositoryPort } from "@/projectType";

export type ProjectTypesAppContext = Readonly<{
  repos: Readonly<{
    projectType: ProjectTypeRepositoryPort;
  }>;
}>;
