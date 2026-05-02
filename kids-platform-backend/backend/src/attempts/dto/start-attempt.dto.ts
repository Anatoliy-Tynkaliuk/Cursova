/**
 * Огляд файлу: `kids-platform-backend/backend/src/attempts/dto/start-attempt.dto.ts`.
 * Призначення: містить частину логіки бекенду/фронтенду платформи навчальних ігор.
 * Взаємодія: імпортує типи, сервіси та компоненти з сусідніх модулів і передає дані через DTO/API props.
 * Терміни: API — контракт обміну даними; DTO — тип вхідних/вихідних даних; Service — бізнес-логіка; Controller/Page — точка входу запитів або UI-екран.
 */

export class StartAttemptDto {
  childProfileId!: number;
  gameId!: number;
  difficulty!: number;
  level?: number;
  levelId?: number;
}
