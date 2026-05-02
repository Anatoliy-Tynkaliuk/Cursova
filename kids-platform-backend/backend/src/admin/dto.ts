/**
 * ФАЙЛ: `src/admin/dto.ts`.
 * ЗАГАЛОМ: цей файл є частиною backend-сервера на NestJS і реалізує окремий модуль/шар архітектури.
 * ВЗАЄМОДІЯ: файл імпортує сутності з інших модулів (DTO, Service, Guard, Prisma), а результати експортує через класи/функції.
 * ПОТІК ДАНИХ: запит -> Controller -> Service -> Prisma/БД -> відповідь клієнту.
 * ПОНЯТТЯ:
 * - NestJS: фреймворк для серверних застосунків на Node.js із модульною архітектурою.
 * - Controller: приймає HTTP-запити і передає їх у сервіс.
 * - Service: містить бізнес-логіку, валідацію, обчислення.
 * - DTO (Data Transfer Object): контракт форми даних для входу/виходу.
 * - Guard: перевіряє доступ до маршруту (автентифікація/ролі).
 * - Prisma: ORM для читання/запису даних у БД через типізований API.
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
