"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { finishAttempt, startAttempt, submitAnswer, StartAttemptResponse } from "@/lib/endpoints";
import { getChildSession } from "@/lib/auth";
import styles from "./game.module.css";

function normalizeDifficulty(value: string | null): number | null {
  if (!value) return null;

  const numeric = Number(value);
  if (Number.isInteger(numeric) && numeric > 0) return numeric;

  const map: Record<string, number> = { easy: 1, medium: 2, hard: 3 };
  return map[value.toLowerCase()] ?? null;
}

type Summary = { score: number; correctCount: number; totalCount: number };

const TIMER_DURATION_SEC = 45;

type TaskState = {
  taskId: number;
  position?: number | null;
  taskVersionId: number;
  prompt: string;
  data: any;
};

export default function GamePage() {
  const params = useParams<{ gameId: string }>();
  const search = useSearchParams();

  const gameId = Number(params.gameId);
  const attemptIdFromUrl = search.get("attemptId");
  const difficultyFromUrl = search.get("difficulty");
  const normalizedDifficulty = normalizeDifficulty(difficultyFromUrl);

  const levelFromUrl = search.get("level");
  const selectedLevel =
    Number.isInteger(Number(levelFromUrl)) && Number(levelFromUrl) > 0 ? Number(levelFromUrl) : null;

  const levelIdFromUrl = search.get("levelId");
  const selectedLevelId =
    Number.isInteger(Number(levelIdFromUrl)) && Number(levelIdFromUrl) > 0 ? Number(levelIdFromUrl) : null;

  const effectiveLevel = selectedLevelId !== null ? null : selectedLevel;
  const effectiveLevelId = selectedLevelId;

  const [childProfileId, setChildProfileId] = useState<number | null>(null);
  const [attemptId, setAttemptId] = useState<number | null>(attemptIdFromUrl ? Number(attemptIdFromUrl) : null);

  const [task, setTask] = useState<StartAttemptResponse["task"] | null>(null);
  const [msg, setMsg] = useState<string>("");
  const [msgKind, setMsgKind] = useState<"ok" | "bad" | "info">("info");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [score, setScore] = useState(0);
  const [totalTasks, setTotalTasks] = useState<number | null>(null);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION_SEC);

  const [textAnswer, setTextAnswer] = useState("");

  useEffect(() => {
    const session = getChildSession();
    if (!session.childProfileId) {
      window.location.href = "/child/join";
      return;
    }

    if (!attemptIdFromUrl && normalizedDifficulty === null) {
      window.location.href = `/child/game/${gameId}/difficulty`;
      return;
    }

    if (!attemptIdFromUrl && normalizedDifficulty !== null && effectiveLevel === null && effectiveLevelId === null) {
      window.location.href = `/child/game/${gameId}/levels?difficulty=${normalizedDifficulty}`;
      return;
    }

    setChildProfileId(session.childProfileId);
  }, [attemptIdFromUrl, gameId, normalizedDifficulty, effectiveLevel, effectiveLevelId]);

  useEffect(() => {
    async function boot() {
      if (!attemptId && childProfileId) {
        setLoading(true);
        setMsg("Завантаження завдання...");
        setMsgKind("info");
        try {
          const res = await startAttempt(
            childProfileId,
            gameId,
            normalizedDifficulty!,
            effectiveLevel !== null ? effectiveLevel : undefined,
            effectiveLevelId !== null ? effectiveLevelId : undefined,
          );
          setAttemptId(res.attemptId);
          setTask(res.task);
          setScore(0);
          setTotalTasks(res.totalTasks ?? null);
          setCompletedTasks(0);
          setTimeLeft(TIMER_DURATION_SEC);
          setMsg("");
        } finally {
          setLoading(false);
        }
      }
    }

    boot().catch((e: any) => {
      setMsg(e.message ?? "Error");
      setMsgKind("bad");
    });
  }, [attemptId, childProfileId, gameId, normalizedDifficulty, effectiveLevel, effectiveLevelId]);

  useEffect(() => {
    if (!attemptId || !!summary) return;

    const intervalId = window.setInterval(() => {
      setTimeLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [attemptId, summary]);

  useEffect(() => {
    async function completeByTimeout() {
      if (!attemptId || !!summary || timeLeft > 0) return;

      setLoading(true);
      setMsg("Час вийшов. Завершуємо гру...");
      setMsgKind("info");

      try {
        const res = await finishAttempt(attemptId, TIMER_DURATION_SEC);
        setSummary({
          score: res.summary.score,
          correctCount: res.summary.correctCount,
          totalCount: res.summary.totalCount,
        });
        setTask(null);
        setScore(res.summary.score);
        setCompletedTasks(res.summary.totalCount);
        setMsg("Час вийшов. Гру завершено.");
        setMsgKind("bad");
      } catch (e: any) {
        setMsg(e.message ?? "Не вдалося завершити гру по таймеру");
        setMsgKind("bad");
      } finally {
        setLoading(false);
      }
    }

    completeByTimeout();
  }, [attemptId, summary, timeLeft]);

  const current: TaskState | null = useMemo(() => {
    if (!task) return null;
    return {
      taskId: task.taskId,
      position: task.position ?? null,
      taskVersionId: task.taskVersion.id,
      prompt: task.taskVersion.prompt,
      data: task.taskVersion.data as any,
    };
  }, [task]);

  const options: any[] = useMemo(() => {
    const d = current?.data;
    if (!d) return [];
    if (Array.isArray(d.options)) return d.options;
    if (Array.isArray(d.items)) return d.items;
    return [];
  }, [current]);

  const positionIndex = (current?.position ?? 0) + 1;
  const progressText = totalTasks ? `${Math.min(completedTasks, totalTasks)} / ${totalTasks}` : `${positionIndex}`;
  const progressValue = totalTasks
    ? Math.min(100, Math.round((Math.min(completedTasks, totalTasks) / totalTasks) * 100))
    : 18;

  const levelTitle = effectiveLevel ? `Рівень ${effectiveLevel}` : "Рівень";

  async function sendAnswer(userAnswer: any) {
    if (!attemptId || !current) return;

    setLoading(true);
    setMsg("");

    try {
      const res = await submitAnswer(attemptId, {
        taskId: current.taskId,
        taskVersionId: current.taskVersionId,
        userAnswer,
      });

      if ("finished" in res && res.finished) {
        setSummary({
          score: res.summary?.score ?? 0,
          correctCount: res.summary?.correctCount ?? 0,
          totalCount: res.summary?.totalCount ?? 0,
        });
        setScore(res.summary?.score ?? 0);
        setCompletedTasks(res.summary?.totalCount ?? 0);
        setMsg("Гру завершено!");
        setMsgKind("ok");
        setTask(null);
        return;
      }

      const next = res.nextTask;
      setTask({
        taskId: next.taskId,
        position: next.position,
        taskVersion: {
          id: next.taskVersion.id,
          prompt: next.taskVersion.prompt,
          data: next.taskVersion.data,
        },
      });

      setScore((prev) => res.progress?.score ?? prev);
      setCompletedTasks((prev) => res.progress?.totalCount ?? prev);
      setTotalTasks((prev) => res.progress?.totalTasks ?? prev);

      if (res.isCorrect) {
        setMsg("Правильно!");
        setMsgKind("ok");
      } else {
        setMsg("Неправильно!");
        setMsgKind("bad");
      }

      setTextAnswer("");
    } catch (e: any) {
      setMsg(e.message ?? "Error");
      setMsgKind("bad");
    } finally {
      setLoading(false);
    }
  }

  const minutes = Math.floor(timeLeft / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (timeLeft % 60).toString().padStart(2, "0");

  return (
    <main className={styles.page}>
      <div className={styles.bg} />
      <div className={styles.overlay} />

      <div className={styles.container}>
        <header className={styles.header}>
          <Link className={styles.backBtn} href="/child/subjects">
            <span className={styles.backArrow}>←</span>
            Назад
          </Link>

          <div className={styles.headerTitle}>{levelTitle}</div>
        </header>

        <section className={styles.progressWrap}>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${progressValue}%` }} />
            <div className={styles.progressGlow} />
          </div>
          <div className={styles.progressText}>{progressText}</div>
        </section>

        <section className={styles.card}>
          {!!msg && (
            <div
              className={[
                styles.toast,
                msgKind === "ok" ? styles.toastOk : msgKind === "bad" ? styles.toastBad : styles.toastInfo,
              ].join(" ")}
            >
              {msgKind === "ok" ? "✅" : msgKind === "bad" ? "❌" : "ℹ️"} {msg}
            </div>
          )}

          {!current ? (
            summary ? (
              <div className={styles.summary}>
                <h2 className={styles.summaryTitle}>Результат</h2>
                <div className={styles.summaryRow}>
                  <span>Бали</span>
                  <b>{summary.score}</b>
                </div>
                <div className={styles.summaryRow}>
                  <span>Правильні</span>
                  <b>
                    {summary.correctCount} / {summary.totalCount}
                  </b>
                </div>

                <div className={styles.actions}>
                  <Link className={styles.primaryBtn} href="/child/subjects">
                    До меню
                  </Link>
                </div>
              </div>
            ) : (
              <div className={styles.loadingBox}>{loading ? "Завантаження..." : "Нема активного завдання."}</div>
            )
          ) : (
            <>
              <div className={styles.question}>{current.prompt}</div>

              {options.length > 0 ? (
                <div className={styles.answers}>
                  {options.map((opt, idx) => (
                    <button
                      key={idx}
                      disabled={loading}
                      onClick={() => sendAnswer({ answer: opt })}
                      className={styles.answerBtn}
                      type="button"
                    >
                      <span className={styles.answerText}>{String(opt)}</span>
                      <span className={styles.answerSheen} />
                    </button>
                  ))}
                </div>
              ) : (
                <div className={styles.textAnswerRow}>
                  <input
                    className={styles.input}
                    value={textAnswer}
                    onChange={(e) => setTextAnswer(e.target.value)}
                    placeholder="Введи відповідь..."
                  />
                  <button
                    className={styles.sendBtn}
                    disabled={loading}
                    onClick={() =>
                      sendAnswer({ answer: isNaN(Number(textAnswer)) ? textAnswer : Number(textAnswer) })
                    }
                    type="button"
                  >
                    Відправити
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        <footer className={styles.hud}>
          <div className={styles.hudItem}>
            <span className={styles.hudIcon}>⏳</span>
            <span className={styles.hudValue}>
              {minutes}:{seconds}
            </span>
          </div>
          <div className={styles.hudItem}>
            <span className={styles.hudIcon}>⭐</span>
            <span className={styles.hudValue}>{score}</span>
          </div>
        </footer>
      </div>
    </main>
  );
}
