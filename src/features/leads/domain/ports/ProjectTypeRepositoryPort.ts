import type { ProjectType } from "@/projectType";

export interface ProjectTypeRepositoryPort {
  findAll(): Promise<ProjectType[]>;
}
