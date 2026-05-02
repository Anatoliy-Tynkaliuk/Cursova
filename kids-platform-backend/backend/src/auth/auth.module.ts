/**
 * ФАЙЛ: `src/auth/auth.module.ts`.
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


import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    JwtModule.register({
      secret: 'SUPER_SECRET_KEY_CHANGE_ME',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [JwtModule], // 👈 ОБОВʼЯЗКОВО
})
// AuthModule: клас, що інкапсулює відповідальність цього файлу та координує роботу методів.
export class AuthModule {}
