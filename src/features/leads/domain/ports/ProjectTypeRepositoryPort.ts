import type { ProjectType } from "@/projectType/domain";

export interface ProjectTypeRepositoryPort {
  findAll(): Promise<ProjectType[]>;
}
