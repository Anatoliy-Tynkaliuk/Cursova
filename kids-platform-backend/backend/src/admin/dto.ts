/**
 * Огляд файлу: `kids-platform-backend/backend/src/admin/dto.ts`.
 * Призначення: містить частину логіки бекенду/фронтенду платформи навчальних ігор.
 * Взаємодія: імпортує типи, сервіси та компоненти з сусідніх модулів і передає дані через DTO/API props.
 * Терміни: API — контракт обміну даними; DTO — тип вхідних/вихідних даних; Service — бізнес-логіка; Controller/Page — точка входу запитів або UI-екран.
 */

import type { Prisma } from '@prisma/client';

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
