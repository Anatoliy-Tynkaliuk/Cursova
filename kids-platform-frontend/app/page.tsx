export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <div className="text-xl font-semibold">Kids Learning Platform</div>
        <nav className="hidden items-center gap-4 text-sm font-medium md:flex">
          <a className="text-slate-600 hover:text-slate-900" href="#features">
            Можливості
          </a>
          <a className="text-slate-600 hover:text-slate-900" href="#roles">
            Для кого
          </a>
          <a className="text-slate-600 hover:text-slate-900" href="#cta">
            Почати
          </a>
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <a className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700" href="/login">
            Увійти
          </a>
          <a className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white" href="/register">
            Реєстрація
          </a>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-20 px-6 pb-20">
        <section className="grid items-center gap-10 rounded-3xl bg-white px-8 py-14 shadow-sm md:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
              Навчання через гру
            </p>
            <h1 className="text-3xl font-semibold leading-tight text-slate-900 md:text-4xl">
              Розвивай логіку, математику та англійську у форматі інтерактивних ігор.
            </h1>
            <p className="text-base leading-relaxed text-slate-600">
              Kids Learning Platform допомагає батькам керувати профілями дітей, а дітям — проходити
              завдання, які адаптовані до їхнього віку та рівня складності.
            </p>
            <div className="flex flex-wrap gap-3">
              <a className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white" href="/register">
                Створити акаунт батьків
              </a>
              <a className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-900" href="/child/join">
                Вхід для дитини
              </a>
            </div>
          </div>
          <div className="rounded-2xl bg-slate-100 p-6">
            <div className="space-y-4">
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase text-slate-400">Модуль</p>
                <p className="text-lg font-semibold text-slate-900">Логіка та мислення</p>
                <p className="text-sm text-slate-500">Міні-ігри для розвитку уваги та памʼяті.</p>
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase text-slate-400">Результат</p>
                <p className="text-lg font-semibold text-slate-900">Прогрес дитини</p>
                <p className="text-sm text-slate-500">Слідкуй за успіхами та отриманими балами.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Профілі дітей",
              description: "Створюй декілька профілів, налаштовуй вікову групу та керуй доступом.",
            },
            {
              title: "Ігрові завдання",
              description: "Навчальні вправи з логіки, математики та англійської мови.",
            },
            {
              title: "Статистика",
              description: "Відстежуй прогрес, правильні відповіді та завершені ігри.",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.description}</p>
            </div>
          ))}
        </section>

        <section id="roles" className="rounded-3xl bg-slate-900 px-8 py-12 text-white">
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Parent</p>
              <h3 className="mt-2 text-xl font-semibold">Батьки</h3>
              <p className="mt-2 text-sm text-slate-200">
                Реєструються, створюють профілі дітей та контролюють прогрес.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Child</p>
              <h3 className="mt-2 text-xl font-semibold">Діти</h3>
              <p className="mt-2 text-sm text-slate-200">
                Заходять за кодом і отримують завдання, які відповідають їхньому віку.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Admin</p>
              <h3 className="mt-2 text-xl font-semibold">Адміністратори</h3>
              <p className="mt-2 text-sm text-slate-200">
                Наповнюють контент: модулі, ігри та завдання для навчання.
              </p>
            </div>
          </div>
        </section>

        <section id="cta" className="rounded-3xl bg-white px-8 py-12 shadow-sm">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">
                Почніть розвивати навички дитини вже сьогодні
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Зареєструйтеся як батьки або увійдіть, якщо вже маєте акаунт.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white" href="/login">
                Увійти
              </a>
              <a className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-900" href="/register">
                Зареєструватися
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
