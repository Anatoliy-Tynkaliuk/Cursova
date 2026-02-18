import type { Prisma } from "@prisma/client";

export type CreateAgeGroupDto = {
  code: string;
  title: string;
  minAge: number;
  maxAge: number;
  sortOrder?: number;
  isActive?: boolean;
};

export type UpdateAgeGroupDto = Partial<CreateAgeGroupDto>;

export type CreateModuleDto = {
  code: string;
  title: string;
  description?: string;
  icon?: string;
  isActive?: boolean;
};

export type UpdateModuleDto = Partial<CreateModuleDto>;

export type CreateGameTypeDto = {
  code: string;
  title: string;
  description?: string;
  icon?: string;
  isActive?: boolean;
};

export type UpdateGameTypeDto = Partial<CreateGameTypeDto>;

export type CreateGameDto = {
  moduleId: number;
  gameTypeId: number;
  minAgeGroupId: number;
  title: string;
  description?: string;
  difficulty?: number;
  isActive?: boolean;
};

export type UpdateGameDto = Partial<CreateGameDto>;

export type CreateTaskDto = {
  gameId: number;
  levelId?: number;
  position: number;
  isActive?: boolean;
};

export type UpdateTaskDto = Partial<CreateTaskDto>;

export type CreateTaskVersionDto = {
  taskId: number;
  version: number;
  prompt: string;
  dataJson?: Prisma.InputJsonValue;
  correctJson: Prisma.InputJsonValue;
  explanation?: string;
  difficulty?: number;
  isCurrent?: boolean;
};

export type UpdateTaskVersionDto = Partial<CreateTaskVersionDto>;

export type CreateBadgeDto = {
  code: string;
  title: string;
  description?: string;
};

export type UpdateBadgeDto = Partial<CreateBadgeDto>;


export type CreateGameLevelDto = {
  gameId: number;
  difficulty: number;
  levelNumber?: number;
  title: string;
  isActive?: boolean;
};

export type UpdateGameLevelDto = {
  title?: string;
  levelNumber?: number;
  isActive?: boolean;
};
