# `useRequireChildSession` hook documentation

## Що таке React hook

React hook — це функція, яка починається з `use` і дозволяє винести повторювану логіку React-компонентів в окремий reusable блок. Hook може використовувати інші hooks, наприклад `useEffect` або `useRouter`, і підключатися в різних client components однаковим викликом.

У цьому проєкті `useRequireChildSession` є client-side guard hook для сторінок дитячого кабінету.

## Навіщо потрібен `useRequireChildSession`

Child pages мають відкриватися тільки тоді, коли в браузері вже є активна child-сесія. Child-сесія зберігає мінімальні дані про дитину, з якою зараз працює інтерфейс, зокрема `childProfileId` і `ageGroupCode`.

Без окремого hook кожна child-сторінка мусила б повторювати однаковий код:

1. прочитати child-сесію через `getChildSession()`;
2. перевірити, чи є `childProfileId`;
3. перевірити, чи є `ageGroupCode`;
4. якщо даних немає — перенаправити користувача на сторінку входу дитини `/child/join`.

`useRequireChildSession` збирає це правило в одному місці, щоб усі child pages поводилися однаково.

## Що саме робить hook

Hook знаходиться у файлі `lib/hooks/useRequireChildSession.ts` і виконує таку логіку:

```ts
export function useRequireChildSession(redirectTo = "/child/join") {
  const router = useRouter();

  useEffect(() => {
    const session = getChildSession();
    if (!session.childProfileId || !session.ageGroupCode) {
      router.replace(redirectTo);
    }
  }, [router, redirectTo]);
}
```

Покроково:

1. `useRouter()` отримує Next.js router для client-side навігації.
2. `useEffect(...)` запускає перевірку після рендеру client component.
3. `getChildSession()` читає поточну child-сесію з frontend auth/session helper.
4. Якщо немає `childProfileId` або `ageGroupCode`, виконується `router.replace(redirectTo)`.
5. За замовчуванням `redirectTo` дорівнює `/child/join`.

## Чому використовується `router.replace`, а не `window.location.href`

`router.replace("/child/join")` виконує client-side перехід у Next.js без повного перезавантаження документа. Це краще для App Router, тому що сторінка переходить через механізм Next.js router.

`window.location.href = "/child/join"` запускає звичайну браузерну навігацію і зазвичай повністю перезавантажує сторінку.

Для guard-редіректу обрано саме `replace`, а не `push`, тому що користувач не повинен повертатися кнопкою Back на сторінку, яка вимагає child-сесію, але була відкрита без неї.

## Де використовується hook

`useRequireChildSession()` підключається в child-facing pages, які потребують активної child-сесії. Приклади використання:

- `app/child/page.tsx` — головна child-сторінка зі списком ігор.
- `app/child/math/page.tsx` — сторінка математичних ігор.
- `app/child/english/page.tsx` — сторінка англійської.
- `app/child/logic/page.tsx` — сторінка логіки.
- `app/child/subjects/page.tsx` — вибір планет/предметів.
- `app/child/profile/page.tsx` — профіль дитини.
- `app/child/settings/page.tsx` — налаштування child-flow.
- `app/child/avatar-shop/page.tsx` — магазин аватарів.
- `app/child/achievements/page.tsx` — досягнення.
- `app/child/achievements/all/page.tsx` — всі досягнення.
- `app/child/game/[gameId]/difficulty/page.tsx` — вибір складності гри.
- `app/child/game/[gameId]/levels/page.tsx` — вибір рівня гри.
- `app/child/game/[gameId]/page.tsx` — сторінка проходження гри.

## Як правильно використовувати hook у новій child-сторінці

У новій client component сторінці потрібно:

1. залишити директиву `"use client"`;
2. імпортувати hook;
3. викликати `useRequireChildSession()` всередині компонента.

Приклад:

```tsx
"use client";

import { useRequireChildSession } from "@/lib/hooks/useRequireChildSession";

export default function ChildExamplePage() {
  useRequireChildSession();

  return <main>Контент сторінки для дитини</main>;
}
```

Якщо потрібен інший redirect path, його можна передати параметром:

```tsx
useRequireChildSession("/child/join");
```

## Що змінилося після додавання hook

### Було

- Child-session перевірки повторювалися в різних компонентах.
- Редіректи могли реалізовуватися через `window.location.href`, що робило повний reload.
- Якщо потрібно було змінити правило перевірки, довелося б змінювати багато файлів.

### Стало

- Правило перевірки child-сесії винесене в один hook.
- Child pages можуть підключити guard одним рядком `useRequireChildSession()`.
- Redirect виконується через Next.js router.
- Логіку легше підтримувати: зміна правила в hook застосовується до всіх сторінок, які його використовують.

## Важливі зауваження

- Hook можна використовувати тільки в client components, тому на сторінці має бути `"use client"`.
- Якщо в компоненті використовується `useRouter()` напряму, його потрібно імпортувати з `next/navigation`.
- `useRequireChildSession` не завантажує дані з backend; він тільки перевіряє локальну child-сесію і робить redirect, якщо її немає.
