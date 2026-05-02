/**
 * 📘 ОГЛЯД ФАЙЛУ: `kids-platform-frontend/components/game/task-types/ChooseAnswer.tsx`.
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


"use client";

import { useState } from "react";

// Функція: ChooseAnswer. Крок за кроком приймає вхідні дані, перевіряє їх та повертає прогнозований результат.
export default function ChooseAnswer({
  data,
  onSubmit,
}: {
  data: { options: Array<string | number> };
  onSubmit: (answer: any) => void;
}) {
  const [selected, setSelected] = useState<string | number | null>(null);

  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        {data.options.map((opt, idx) => {
          const isSel = selected === opt;
          return (
            <button
              key={idx}
              onClick={() => setSelected(opt)}
              className={[
                "rounded-xl py-4 font-semibold shadow-sm border",
                isSel ? "border-black" : "border-gray-200",
              ].join(" ")}
            >
              {opt}
            </button>
          );
        })}
      </div>

      <button
        className="mt-4 w-full rounded-xl bg-black text-white py-3 font-semibold disabled:opacity-40"
        disabled={selected === null}
        onClick={() => onSubmit({ selected })}
      >
        Відповісти
      </button>
    </div>
  );
}
