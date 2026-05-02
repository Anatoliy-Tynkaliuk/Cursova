/**
 * 📘 ОГЛЯД ФАЙЛУ: `kids-platform-backend/backend/src/auth/auth.controller.ts`.
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


import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto';

@Controller('auth')
// Клас: AuthController. Об'єднує пов'язану логіку та методи в одному модулі для зрозумілого керування поведінкою.
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  // Метод: register. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
  register(@Body() body: RegisterDto) {
    return this.auth.register(body);
  }

  @Post('login')
  // Метод: login. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
  login(@Body() body: LoginDto) {
    return this.auth.login(body);
  }
}
