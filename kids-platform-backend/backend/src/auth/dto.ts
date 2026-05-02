/**
 * Огляд файлу: `kids-platform-backend/backend/src/auth/dto.ts`.
 * Призначення: містить частину логіки бекенду/фронтенду платформи навчальних ігор.
 * Взаємодія: імпортує типи, сервіси та компоненти з сусідніх модулів і передає дані через DTO/API props.
 * Терміни: API — контракт обміну даними; DTO — тип вхідних/вихідних даних; Service — бізнес-логіка; Controller/Page — точка входу запитів або UI-екран.
 */

export class RegisterDto {
  email: string;
  username: string;
  password: string;
}

export class LoginDto {
  email: string;
  password: string;
}
