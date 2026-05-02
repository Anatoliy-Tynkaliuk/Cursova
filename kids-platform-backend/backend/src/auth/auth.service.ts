/**
 * 📘 ОГЛЯД ФАЙЛУ: `kids-platform-backend/backend/src/auth/auth.service.ts`.
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
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto';

@Injectable()
// Клас: AuthService. Об'єднує пов'язану логіку та методи в одному модулі для зрозумілого керування поведінкою.
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  // Метод: register. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();
    const username = dto.username.trim();

    const exists = await this.prisma.user.findUnique({ where: { email } });
    if (exists) throw new BadRequestException('Email already in use');
    if (!username) throw new BadRequestException('Username is required');

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: { email, username, passwordHash, role: 'parent' },
    });

    const payload = {
      sub: user.id.toString(),
      role: user.role,
      email: user.email,
    };
    const accessToken = await this.jwt.signAsync(payload);

    return {
      accessToken,
      user: { id: Number(user.id), email: user.email, role: user.role },
    };
  }

  // Метод: login. Частина поведінки класу; використовує поля класу та зовнішні сервіси для виконання задачі.
  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const payload = {
      sub: user.id.toString(),
      role: user.role,
      email: user.email,
    };
    const accessToken = await this.jwt.signAsync(payload);

    return {
      accessToken,
      user: { id: Number(user.id), email: user.email, role: user.role },
    };
  }
}
