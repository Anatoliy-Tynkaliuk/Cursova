/**
 * ФАЙЛ: `src/age-groups/age-groups.controller.ts`.
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


import { Controller, Get } from '@nestjs/common';
import { AgeGroupsService } from './age-groups.service';

@Controller('age-groups')
// AgeGroupsController: клас, що інкапсулює відповідальність цього файлу та координує роботу методів.
export class AgeGroupsController {
  constructor(private readonly service: AgeGroupsService) {}

  @Get()
  // Метод `getAll(без параметрів)`: обробляє частину бізнес-логіки; отримує дані, викликає залежності та повертає результат.
  async getAll() {
    return this.service.findAll();
  }
}
