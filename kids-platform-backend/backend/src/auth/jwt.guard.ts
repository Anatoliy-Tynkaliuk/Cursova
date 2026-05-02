/**
 * 📘 ОГЛЯД ФАЙЛУ: `kids-platform-backend/backend/src/auth/jwt.guard.ts`.
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


import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
// Клас: JwtGuard. Об'єднує пов'язану логіку та методи в одному модулі для зрозумілого керування поведінкою.
export class JwtGuard implements CanActivate {
  constructor(private jwt: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const authHeader = req.headers['authorization'];
  // Метод: if. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
    if (!authHeader) {
      throw new UnauthorizedException('No authorization header');
    }

    const [type, token] = authHeader.split(' ');
  // Метод: if. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid authorization format');
    }

    try {
      const payload = await this.jwt.verifyAsync(token);
      req.user = payload; // 👈 ОЦЕ ГОЛОВНЕ
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
