"use client";

import { useEffect, useMemo, useState } from "react";
import { getChildSession } from "@/lib/auth";
import {
  startAttempt,
  submitAnswer,
  type StartAttemptResponse,
} from "@/lib/endpoints";
import ChooseAnswer from "./task-types/ChooseAnswer";

export default function GameEngine({ gameId }: { gameId: number }) {
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState<StartAttemptResponse | null>(null);
  const [task, setTask] = useState<StartAttemptResponse["task"] | null>(null);
  const [message, setMessage] = useState("");
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const session = getChildSession();
      if (typeof session.childProfileId !== "number") {
        if (mounted) {
          setLoading(false);
          setMessage("Потрібно приєднати профіль дитини.");
        }
        return;
      }

      setLoading(true);
      const res = await startAttempt(session.childProfileId, gameId, 1);
      if (!mounted) return;
      setAttempt(res);
      setTask(res.task);
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [gameId]);

  const title = useMemo(() => attempt?.game.title ?? "Гра", [attempt]);

  async function handleAnswer(answer: unknown) {
    if (!attempt || !task) return;

    setMessage("Перевіряю...");
    const res = await submitAnswer(attempt.attemptId, {
      taskId: task.taskId,
      taskVersionId: task.taskVersion.id,
      userAnswer: answer,
    });

    setMessage(res.isCorrect ? "✅ Правильно!" : "❌ Спробуй ще!");

    if (res.finished) {
      setFinished(true);
      setScore((res.summary as { score?: number } | undefined)?.score ?? 0);
      return;
    }

    if (res.nextTask) {
      setTimeout(() => {
        setTask(res.nextTask!);
        setMessage("");
      }, 500);
    }
  }

  if (loading) return <div className="p-6">Завантаження гри...</div>;
  if (!attempt || !task) return <div className="p-6">Не вдалося завантажити гру.</div>;

  if (finished) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-2xl shadow p-6 bg-white">
          <div className="text-2xl font-bold mb-2">Гру завершено 🎉</div>
          <div className="text-lg mb-4">
            Твій результат: <b>{score}</b>
          </div>
          <button
            className="w-full rounded-xl bg-black text-white py-3 font-semibold"
            onClick={() => window.location.reload()}
          >
            Грати ще раз
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-4">
        <div className="text-2xl font-bold">{title}</div>
        <div className="text-sm text-gray-600">Спроба № {attempt.attemptId}</div>
      </div>

      <div className="rounded-2xl shadow p-6 bg-white">
        <div className="text-xl font-semibold mb-4">{task.taskVersion.prompt}</div>

        <ChooseAnswer data={task.taskVersion.data} onSubmit={handleAnswer} />

        {message && <div className="mt-4 text-lg font-semibold">{message}</div>}
      </div>
    </div>
  );
}
