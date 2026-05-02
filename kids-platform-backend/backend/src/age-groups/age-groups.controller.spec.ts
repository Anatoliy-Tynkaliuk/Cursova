/**
 * 📘 ОГЛЯД ФАЙЛУ: `kids-platform-backend/backend/src/age-groups/age-groups.controller.spec.ts`.
 * ЩО ЦЕ: цей файл — частина навчальної платформи для дітей (бекенд API або фронтенд-екран).
 * НАВІЩО: реалізує конкретний шмат логіки (дані, перевірки, маршрути, або відображення інтерфейсу).
 * ЯК ПРАЦЮЄ: імпортує залежності, приймає вхідні дані, обробляє їх, та повертає результат/HTML/API-відповідь.
 * ВЗАЄМОДІЯ З ІНШИМИ ФАЙЛАМИ: через import/export, виклики сервісів, DTO, props, HTTP-запити.
 * ГЛОСАРІЙ:
 * - API: правила обміну даними між клієнтом (фронтенд) і сервером (бекенд).
 * - DTO: структура даних, яку дозволено приймати/повертати.
 * - Service: шар бізнес-логіки (обчислення, перевірки, робота з БД).
 * - Controller/Page: точка входу запиту користувача або сторінка інтерфейсу.
 * - Component: перевикористовуваний UI-блок.
 * - Prisma/ORM: інструмент доступу до бази даних через код.
 */


import { Test, TestingModule } from '@nestjs/testing';
import { AgeGroupsController } from './age-groups.controller';

describe('AgeGroupsController', () => {
  let controller: AgeGroupsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AgeGroupsController],
    }).compile();

    controller = module.get<AgeGroupsController>(AgeGroupsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
