import { type ChildBadgeItem } from "@/lib/endpoints";
import styles from "../child.module.css";

function parseThreshold(code: string) {
  const match = code.match(/^FINISHED_(\d+)$/i);
  if (!match) return null;
  const value = Number(match[1]);
  return Number.isFinite(value) ? value : null;
}

export function BadgeCard({ badge }: { badge: ChildBadgeItem }) {
  const threshold = parseThreshold(badge.code);
  return (
    <li className={`${styles.badgeCard} ${badge.isEarned ? "" : styles.badgeMuted}`}>
      <div className={styles.badgeTitle}>{badge.icon ? `${badge.icon} ` : ""}{badge.title}</div>
      {badge.description && <div className={styles.badgeText}>{badge.description}</div>}
      {threshold != null && <div className={styles.badgeText}>Потрібно завершених ігор: {threshold}</div>}
      <div className={styles.badgeStatus}>{badge.isEarned ? "Отримано ✅" : "Ще не отримано"}</div>
    </li>
  );
}
