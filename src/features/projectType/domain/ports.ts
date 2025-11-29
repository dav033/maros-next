import type { ProjectType } from "./models";

export interface ProjectTypeRepositoryPort {
  findAll(): Promise<ProjectType[]>;
}
