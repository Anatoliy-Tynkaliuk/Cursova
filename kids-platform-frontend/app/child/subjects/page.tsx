"use client";

import Link from "next/link";

const subjects = [
  {
    title: "Планета Логіки",
    color: "from-purple-500 to-indigo-600",
    emoji: "🪐",
  },
  {
    title: "Планета Математика",
    color: "from-orange-400 to-red-500",
    emoji: "🌟",
  },
  {
    title: "Планета Англійська",
    color: "from-blue-500 to-violet-600",
    emoji: "🚀",
  },
];

const stats = [
  { label: "Рівень", value: "3", icon: "⭐️" },
  { label: "Зірочок", value: "45", icon: "🌟" },
  { label: "Досягнень", value: "5", icon: "🏆" },
];

export default function ChildSubjectsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1c1434] via-[#2a1a4d] to-[#35205a] px-4 py-8 text-white">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <p className="text-sm text-white/70">Твоя космічна подорож починається тут</p>
            <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
              Привіт, Марійко!
            </h1>
          </div>
          <Link
            href="/child"
            className="rounded-full border border-white/30 px-4 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/10"
          >
            Назад до ігор
          </Link>
        </header>

        <section className="rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur">
          <h2 className="text-lg font-semibold text-white/90">Обери планету знань</h2>
          <p className="text-sm text-white/60">
            Натисни на предмет, щоб розпочати подорож.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {subjects.map((subject) => (
              <button
                key={subject.title}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition hover:-translate-y-1 hover:border-white/30 hover:bg-white/10"
                type="button"
              >
                <div
                  className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${subject.color}`}
                />
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${subject.color} text-3xl shadow-lg`}
                  >
                    {subject.emoji}
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-white">{subject.title}</div>
                    <div className="text-sm text-white/60">Почати пригоди</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-[24px] border border-white/10 bg-white/5 px-6 py-4">
          <div className="grid gap-4 sm:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-lg">
                    {stat.icon}
                  </div>
                  <div>
                    <div className="text-sm text-white/60">{stat.label}</div>
                    <div className="text-xl font-bold text-white">{stat.value}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-6 rounded-[28px] border border-white/10 bg-white/5 p-6 sm:flex-row sm:items-center">
          <div className="flex h-32 w-32 items-center justify-center rounded-[24px] bg-gradient-to-br from-pink-400/70 via-purple-500/70 to-indigo-500/70 text-6xl shadow-lg">
            👩‍🚀
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Нові місії вже чекають</h3>
            <p className="text-sm text-white/70">
              Досліджуй планети, збирай зірочки й відкривай нові досягнення.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
