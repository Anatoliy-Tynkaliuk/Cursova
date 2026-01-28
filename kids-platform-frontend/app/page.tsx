import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <div className={styles.wrapper}>
        <img
          className={styles.background}
          src="/landing/background.png"
          alt="Космічний фон"
        />
        <div className={styles.overlay} />

        <header className={styles.header}>
          <div className={styles.headerInner}>
            <div className={styles.logo}>
              <div className={styles.logoBadge}>⭐</div>
              <div className={styles.brand}>
                Cosmo<span>Kids</span>
              </div>
            </div>
            <nav className={styles.nav}>
              <a href="#about">Про нас</a>
              <a href="#contact">Зв&apos;язок</a>
            </nav>
            <div className={styles.headerActions}>
              <button className={styles.helpButton} type="button">
                ?
              </button>
              <a className={styles.loginButton} href="/login">
                Увійти
              </a>
            </div>
          </div>
        </header>

        <main className={styles.main}>
          <section className={styles.hero}>
            <div className={styles.heroInner}>
              <img
                className={styles.heroDecorLeft}
                src="/landing/controller.png"
                alt="Ігрова приставка"
              />
              <img
                className={styles.heroDecorRight}
                src="/landing/planets.png"
                alt="Планети"
              />
              <h1 className={styles.heroTitle}>
                Веселі ігри <br className="hidden md:block" /> для розвитку дітей!
              </h1>
              <div className={styles.heroActions}>
                <a className={styles.buttonGreen} href="/register">
                  Я батько/мама
                </a>
                <a className={styles.buttonPurple} href="/child/join">
                  Я дитина - приєднатись по коду
                </a>
              </div>
            </div>
          </section>

          <section
            id="about"
            className={styles.featuresCard}
          >
            <h2 className={styles.featuresTitle}>
              Вивчення та розвиток — весело та цікаво!
            </h2>
            <div className={styles.featuresGrid}>
              <div className={styles.featureItem}>
                <img
                  className={styles.featureIcon}
                  src="/landing/controller.png"
                  alt="Ігрові вправи"
                />
                <div>
                  <p className={styles.featureText}>Цікаві навчальні ігри</p>
                </div>
              </div>
              <div className={styles.featureItem}>
                <img
                  className={styles.featureIcon}
                  src="/landing/trophy.png"
                  alt="Ігрова мотивація"
                />
                <div>
                  <p className={styles.featureText}>Ігрова мотивація</p>
                </div>
              </div>
              <div className={styles.featureItem}>
                <img
                  className={styles.featureIcon}
                  src="/landing/shield.png"
                  alt="Безпечне середовище"
                />
                <div>
                  <p className={styles.featureText}>Безпечне середовище</p>
                </div>
              </div>
              <div className={styles.featureItem}>
                <img
                  className={styles.featureIcon}
                  src="/landing/planets.png"
                  alt="Для дітей"
                />
                <div>
                  <p className={styles.featureText}>Для дітей 3-10 років</p>
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer className={styles.footer}>
          <div className={styles.footerInner}>
            <div>
              <div className={styles.footerLogo}>
                ⭐ CosmoKids
              </div>
              <div className={styles.footerLinks}>
                <a href="#about">Про нас</a>
                <a href="#contact">Зв&apos;язок</a>
              </div>
            </div>
            <div>
              <p className={styles.footerHeading}>Про нас</p>
              <div className={styles.footerLinks}>
                <span>Ціна</span>
                <span>Блог</span>
              </div>
            </div>
            <div>
              <p className={styles.footerHeading}>Інше</p>
              <div className={styles.footerLinks}>
                <span>Блог</span>
              </div>
            </div>
            <div id="contact">
              <p className={styles.footerHeading}>Зв&apos;язок</p>
              <div className={styles.footerLinks}>
                <span>cosmokids@gmail.com</span>
                <div className={styles.footerSocials}>
                  <span className={styles.footerSocial}>f</span>
                  <span className={styles.footerSocial}>in</span>
                </div>
              </div>
            </div>
          </div>
          <p className={styles.footerCopy}>© 2024 CosmoKids. Всі права захищено.</p>
        </footer>
      </div>
    </div>
  );
}
