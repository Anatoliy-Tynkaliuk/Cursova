/**
 * ФАЙЛ: `src/auth/auth.service.ts`.
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
// AuthService: клас, що інкапсулює відповідальність цього файлу та координує роботу методів.
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  // Метод `register(dto: RegisterDto)`: обробляє частину бізнес-логіки; отримує дані, викликає залежності та повертає результат.
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

  // Метод `login(dto: LoginDto)`: обробляє частину бізнес-логіки; отримує дані, викликає залежності та повертає результат.
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
