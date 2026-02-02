"use client";

import Image from "next/image";
import Link from "next/link";
import styles from "./ChildSubjectsPage.module.css";

type Subject = {
  key: "logic" | "math" | "english";
  title: string;
  image: string;
  href: string;
};

const subjects: Subject[] = [
  {
    key: "logic",
    title: "Планета Логіки",
    image: "/Child_menu/planet_of_logics.png",
    href: "/child/subjects/logics",
  },
  {
    key: "math",
    title: "Планета Математика",
    image: "/Child_menu/planet_mathematic.png",
    href: "/child/subjects/math",
  },
  {
    key: "english",
    title: "Планета Англійська",
    image: "/Child_menu/planet_english_languages.png",
    href: "/child/subjects/english",
  },
];

const stats = [
  { label: "Рівень", value: "3", icon: "⭐" },
  { label: "Зірочки", value: "45", icon: "✨" },
  { label: "Досягнення", value: "5", icon: "🏆" },
];

export default function ChildSubjectsPage() {
  const childName = "Марійко";

  return (
    <div className={styles.page}>
      <Image
        src="/Child_menu/background.png"
        alt="space background"
        fill
        priority
        className={styles.bgImg}
      />
      <div className={styles.overlay} />

      <div className={styles.container}>
        <header className={styles.topBar}>
          <div className={styles.topTitle}>Меню дитини</div>

          <Link href="/child" className={styles.backBtn}>
            ← Назад
          </Link>
        
        </header>

        <h1 className={styles.greeting}>Привіт, {childName}!</h1>
        <section className={styles.panel}>
          <div className={styles.planetsGrid}>
            {subjects.map((s) => (
              <Link key={s.key} href={s.href} className={styles.planetCard}>
                <Image src={s.image} alt={s.title} fill className={styles.planetBg} />
                <div className={styles.planetOverlay} />

                <div className={styles.planetContent}>
                  <div className={styles.planetTitle}>{s.title}</div>
                  <div className={styles.planetHint}>Натисни, щоб почати</div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className={styles.statsPanel}>
          <div className={styles.statsGrid}>
            {stats.map((st) => (
              <div key={st.label} className={styles.statCard}>
                <div className={styles.statIcon}>{st.icon}</div>
                <div className={styles.statText}>
                  <div className={styles.statLabel}>{st.label}</div>
                  <div className={styles.statValue}>{st.value}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.bottom}>
          <div className={styles.bottomCard}>
            <div className={styles.bottomTitle}>Нові місії вже чекають 🚀</div>

            <div className={styles.bottomText}>
              Обирай планету, збирай зірочки та відкривай нові досягнення!
            </div>

            <div className={styles.bottomLinks}>
              <Link href="/child/achievements" className={styles.smallBtn}>
                Досягнення
              </Link>
              <Link href="/child/profile" className={styles.smallBtn}>
                Профіль
              </Link>
              <Link href="/child/settings" className={styles.smallBtn}>
                Налаштування
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
