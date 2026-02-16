"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { finishAttempt, startAttempt, submitAnswer, StartAttemptResponse } from "@/lib/endpoints";
import { getChildSession } from "@/lib/auth";

function normalizeDifficulty(value: string | null): number | null {
  if (!value) return null;

  const numeric = Number(value);
  if (Number.isInteger(numeric) && numeric > 0) {
    return numeric;
  }

  const map: Record<string, number> = {
    easy: 1,
    medium: 2,
    hard: 3,
  };

  return map[value.toLowerCase()] ?? null;
}

export default function GamePage() {
  const params = useParams<{ gameId: string }>();
  const search = useSearchParams();
  const gameId = Number(params.gameId);
  const attemptIdFromUrl = search.get("attemptId");
  const difficultyFromUrl = search.get("difficulty");
  const normalizedDifficulty = normalizeDifficulty(difficultyFromUrl);
  const levelFromUrl = search.get("level");
  const selectedLevel = Number.isInteger(Number(levelFromUrl)) && Number(levelFromUrl) > 0 ? Number(levelFromUrl) : null;
  const levelIdFromUrl = search.get("levelId");
  const selectedLevelId = Number.isInteger(Number(levelIdFromUrl)) && Number(levelIdFromUrl) > 0 ? Number(levelIdFromUrl) : null;

  const effectiveLevel = selectedLevelId !== null ? null : selectedLevel;
  const effectiveLevelId = selectedLevelId;

  const [childProfileId, setChildProfileId] = useState<number | null>(null);
  const [attemptId, setAttemptId] = useState<number | null>(attemptIdFromUrl ? Number(attemptIdFromUrl) : null);

  const [task, setTask] = useState<StartAttemptResponse["task"] | null>(null);
  const [msg, setMsg] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<{ score: number; correctCount: number; totalCount: number } | null>(null);
  const [elapsedSec, setElapsedSec] = useState(0);

  const [textAnswer, setTextAnswer] = useState("");
  const attemptStartedAtRef = useRef<number | null>(null);

  const formatDuration = (seconds: number) => {
    const safe = Math.max(0, seconds);
    const mm = String(Math.floor(safe / 60)).padStart(2, "0");
    const ss = String(safe % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  };

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
          attemptStartedAtRef.current = Date.now();
          setElapsedSec(0);
          setMsg("");
        } finally {
          setLoading(false);
        }
      }
    }
    boot().catch((e: any) => setMsg(e.message ?? "Error"));
  }, [attemptId, childProfileId, gameId, normalizedDifficulty, effectiveLevel, effectiveLevelId]);

  useEffect(() => {
    if (!attemptId || summary) return;

    if (attemptStartedAtRef.current === null) {
      attemptStartedAtRef.current = Date.now();
    }

    const timer = setInterval(() => {
      if (attemptStartedAtRef.current === null) return;
      const elapsed = Math.floor((Date.now() - attemptStartedAtRef.current) / 1000);
      setElapsedSec(elapsed);
    }, 1000);

    return () => clearInterval(timer);
  }, [attemptId, summary]);

  const current = useMemo(() => {
    if (!task) return null;
    return {
      taskId: task.taskId,
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
        if (attemptStartedAtRef.current !== null) {
          const elapsed = Math.floor((Date.now() - attemptStartedAtRef.current) / 1000);
          setElapsedSec(elapsed);
        }
        setMsg("✅ Гру завершено!");
        setTask(null);
        return;
      }

      const next = (res as any).nextTask;
      setTask({
        taskId: next.taskId,
        position: next.position,
        taskVersion: {
          id: next.taskVersion.id,
          prompt: next.taskVersion.prompt,
          data: next.taskVersion.data,
        },
      });

      setMsg(res.isCorrect ? "✅ Правильно!" : "❌ Неправильно!");
      setTextAnswer("");
    } catch (e: any) {
      setMsg(e.message ?? "Error");
    } finally {
      setLoading(false);
    }
  }

  async function finishCurrentAttempt() {
    if (!attemptId || summary) return;

    setLoading(true);
    setMsg("");
    try {
      const res = await finishAttempt(attemptId, elapsedSec);
      setSummary({
        score: res.summary?.score ?? 0,
        correctCount: res.summary?.correctCount ?? 0,
        totalCount: res.summary?.totalCount ?? 0,
      });
      setTask(null);
      setMsg("⏹ Гру завершено достроково.");
    } catch (e: any) {
      setMsg(e.message ?? "Не вдалося завершити гру");
    } finally {
      setLoading(false);
    }
  }

  if (loading && !current) {
    return <div style={{ padding: 16 }}>Завантаження...</div>;
  }

  return (
    <div style={{ padding: 16 }}>
      <h1>Гра #{gameId}</h1>
      {effectiveLevel && <div style={{ fontSize: 12, opacity: 0.8 }}>Обраний рівень: {effectiveLevel}</div>}
      {selectedLevelId && <div style={{ fontSize: 12, opacity: 0.8 }}>levelId: {selectedLevelId}</div>}
      {attemptId && <div style={{ fontSize: 12, opacity: 0.8 }}>attemptId: {attemptId}</div>}
      {attemptId && <div style={{ fontSize: 12, opacity: 0.8 }}>Таймер: {formatDuration(elapsedSec)}</div>}
      {msg && <p>{msg}</p>}

      {!current ? (
        summary ? (
          <div style={{ border: "1px solid #333", padding: 16, borderRadius: 10, maxWidth: 420 }}>
            <h2 style={{ marginTop: 0 }}>Результат гри</h2>
            <p>Бали: {summary.score}</p>
            <p>
              Правильні відповіді: {summary.correctCount} / {summary.totalCount}
            </p>
            <p>Час: {formatDuration(elapsedSec)}</p>
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button onClick={() => (window.location.href = "/child/subjects")}>До меню планет</button>
            </div>
          </div>
        ) : (
          <p>Нема активного завдання.</p>
        )
      ) : (
        <div style={{ border: "1px solid #333", padding: 12, borderRadius: 10 }}>
          <div style={{ fontWeight: 700, marginBottom: 10 }}>{current.prompt}</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 12, opacity: 0.8 }}>Час проходження: {formatDuration(elapsedSec)}</div>
            <button disabled={loading} onClick={finishCurrentAttempt}>Завершити гру</button>
          </div>

          {options.length > 0 ? (
            <div style={{ display: "grid", gap: 10, maxWidth: 320 }}>
              {options.map((opt, idx) => (
                <button
                  key={idx}
                  disabled={loading}
                  onClick={() => sendAnswer({ answer: opt })}
                  style={{ padding: 10, borderRadius: 10, cursor: "pointer" }}
                >
                  {String(opt)}
                </button>
              ))}
            </div>
          ) : (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                placeholder="Введи відповідь..."
              />
              <button
                disabled={loading}
                onClick={() => sendAnswer({ answer: isNaN(Number(textAnswer)) ? textAnswer : Number(textAnswer) })}
              >
                Відправити
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
