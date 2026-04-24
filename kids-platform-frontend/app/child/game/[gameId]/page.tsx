"use client";

import Link from "next/link";
import Image from "next/image";
import { DragEvent, useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import {
  finishAttempt,
  startAttempt,
  submitAnswer,
  type StartAttemptResponse,
} from "@/lib/endpoints";
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

const MAX_STARS = 3;
function scoreToStars(score: number, totalCount?: number): number {
  if (!Number.isFinite(score)) return 0;

  if (score >= 0 && score <= MAX_STARS) return Math.round(score);

  if (totalCount && totalCount > 0) {
    const ratio = Math.max(0, Math.min(1, score / totalCount));
    if (ratio === 0) return 0;
    if (ratio <= 0.34) return 1;
    if (ratio <= 0.67) return 2;
    return 3;
  }

  return MAX_STARS;
}

function StarsRow({ filled }: { filled: number }) {
  return (
    <div className={styles.starsRow}>
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className={`${styles.starWrapper} ${i < filled ? styles.starOn : styles.starOff}`}
        >
          <Image src="/star.png" alt="star" width={100} height={100} />
        </div>
      ))}
    </div>
  );
}

export default function GamePage() {
  const params = useParams<{ gameId: string }>();
  const search = useSearchParams();

  const gameId = Number(params.gameId);
  const attemptIdFromUrl = search.get("attemptId");
  const difficultyFromUrl = search.get("difficulty");
  const normalizedDifficulty = normalizeDifficulty(difficultyFromUrl);

  const levelFromUrl = search.get("level");
  const selectedLevel =
    Number.isInteger(Number(levelFromUrl)) && Number(levelFromUrl) > 0
      ? Number(levelFromUrl)
      : null;

  const levelIdFromUrl = search.get("levelId");
  const selectedLevelId =
    Number.isInteger(Number(levelIdFromUrl)) && Number(levelIdFromUrl) > 0
      ? Number(levelIdFromUrl)
      : null;

  // якщо є levelId — level number ігноруємо
  const effectiveLevel = selectedLevelId !== null ? null : selectedLevel;
  const effectiveLevelId = selectedLevelId;

  const [childProfileId, setChildProfileId] = useState<number | null>(null);
  const [attemptId, setAttemptId] = useState<number | null>(
    attemptIdFromUrl ? Number(attemptIdFromUrl) : null
  );

  const [task, setTask] = useState<StartAttemptResponse["task"] | null>(null);
  const [msg, setMsg] = useState<string>("");
  const [awaitExplanation, setAwaitExplanation] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answerExplanationText, setAnswerExplanationText] = useState<string>("");
  const [pendingTransition, setPendingTransition] = useState<{
    finished: boolean;
    nextTask: StartAttemptResponse["task"] | null;
    nextCompleted: number;
    nextTotal: number | null;
    summary: Summary | null;
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);

  const [totalTasks, setTotalTasks] = useState<number | null>(null);
  const [completedTasks, setCompletedTasks] = useState(0);

  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION_SEC);
  const [currentLevelNumber, setCurrentLevelNumber] = useState<number | null>(effectiveLevel);

  const [textAnswer, setTextAnswer] = useState("");
  const [pickedIdx, setPickedIdx] = useState<number | null>(null);
  const [pickedState, setPickedState] = useState<"ok" | "bad" | null>(null);

  const [timeoutOpen, setTimeoutOpen] = useState(false);
  const [timeoutReason, setTimeoutReason] = useState<string>("Час вийшов!");

  const [dragAssignments, setDragAssignments] = useState<Record<string, string[]>>({});
  const [dragHoverTarget, setDragHoverTarget] = useState<string | null>(null);
  const [selectedDragItem, setSelectedDragItem] = useState<string | null>(null);

  const [sequenceSlots, setSequenceSlots] = useState<Array<string | null>>([]);
  const [selectedSequenceItem, setSelectedSequenceItem] = useState<string | null>(null);

  const levelsHref =
    normalizedDifficulty !== null
      ? `/child/game/${gameId}/levels?difficulty=${normalizedDifficulty}`
      : `/child/game/${gameId}/difficulty`;

  // Session + redirect rules
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

    if (
      !attemptIdFromUrl &&
      normalizedDifficulty !== null &&
      effectiveLevel === null &&
      effectiveLevelId === null
    ) {
      window.location.href = `/child/game/${gameId}/levels?difficulty=${normalizedDifficulty}`;
      return;
    }

    setChildProfileId(session.childProfileId);
  }, [attemptIdFromUrl, gameId, normalizedDifficulty, effectiveLevel, effectiveLevelId]);

  // Start attempt
  useEffect(() => {
    async function boot() {
      if (!attemptId && childProfileId) {
        setLoading(true);
        setMsg("Завантаження завдання...");

        try {
          const res = await startAttempt(
            childProfileId,
            gameId,
            normalizedDifficulty!,
            effectiveLevel !== null ? effectiveLevel : undefined,
            effectiveLevelId !== null ? effectiveLevelId : undefined
          );

          setAttemptId(res.attemptId);
          setTask(res.task);

          setCurrentLevelNumber(res.level?.number ?? effectiveLevel ?? null);

          setTotalTasks(res.totalTasks ?? null);
          setCompletedTasks(0);

          setTimeLeft(TIMER_DURATION_SEC);

          setPickedIdx(null);
          setPickedState(null);
          setTimeoutOpen(false);
          setSummary(null);
          setMsg("");
        } finally {
          setLoading(false);
        }
      }
    }

    boot().catch((e: any) => setMsg(e.message ?? "Error"));
  }, [attemptId, childProfileId, gameId, normalizedDifficulty, effectiveLevel, effectiveLevelId]);

  // Timer
  useEffect(() => {
    if (!attemptId || summary || timeoutOpen || awaitExplanation) return;

    const intervalId = window.setInterval(() => {
      setTimeLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [attemptId, summary, timeoutOpen, awaitExplanation]);

  // Finish by timeout
  useEffect(() => {
    async function completeByTimeout() {
      if (!attemptId || summary || timeLeft > 0 || timeoutOpen || awaitExplanation) return;

      setLoading(true);
      setMsg("");

      try {
        const res = await finishAttempt(attemptId, TIMER_DURATION_SEC);
        setSummary({
          score: res.summary.score,
          correctCount: res.summary.correctCount,
          totalCount: res.summary.totalCount,
        });

        setTask(null);
        setCompletedTasks(res.summary.totalCount);

        setTimeoutReason("Час вийшов! Гру завершено.");
        setTimeoutOpen(true);
      } catch (e: any) {
        setMsg(e.message ?? "Не вдалося завершити гру по таймеру");
      } finally {
        setLoading(false);
      }
    }

    completeByTimeout();
  }, [attemptId, summary, timeLeft, timeoutOpen, awaitExplanation]);

  // Current task state
  const current: TaskState | null = useMemo(() => {
    if (!task) return null;
    return {
      taskId: task.taskId,
      position: task.position ?? null,
      taskVersionId: task.taskVersion.id,
      prompt: task.taskVersion.prompt,
      data: task.taskVersion.data as any,
      explanation: task.taskVersion.explanation ?? null,
    };
  }, [task]);

  const options: any[] = useMemo(() => {
    const d = current?.data;
    if (!d) return [];
    if (Array.isArray(d.options)) return d.options;
    return [];
  }, [current]);

  const dragItems: string[] = useMemo(() => {
    const items = current?.data?.items;
    if (!Array.isArray(items)) return [];
    return items.map((item) => String(item));
  }, [current]);

  const dragTargets: string[] = useMemo(() => {
    const targets = current?.data?.targets;
    if (!Array.isArray(targets)) return [];
    return targets.map((target) => String(target));
  }, [current]);

  const isDragTask = dragItems.length > 0 && dragTargets.length > 0;
  const isSequenceTask = !isDragTask && dragItems.length > 0;

  // Available drag items
  const availableDragItems = useMemo(() => {
    const usedItems = new Set(Object.values(dragAssignments).flat());
    return dragItems.filter((item) => !usedItems.has(item));
  }, [dragAssignments, dragItems]);

  // Reset sequence slots when task changes
  useEffect(() => {
    if (isSequenceTask) {
      setSequenceSlots(dragItems.map(() => null));
      setSelectedSequenceItem(null);
      return;
    }
    setSequenceSlots([]);
    setSelectedSequenceItem(null);
  }, [dragItems, isSequenceTask, current?.taskVersionId]);

  const availableSequenceItems = useMemo(() => {
    const usedItems = new Set(sequenceSlots.filter((item): item is string => item !== null));
    return dragItems.filter((item) => !usedItems.has(item));
  }, [dragItems, sequenceSlots]);

  const progressText = totalTasks ? `${Math.min(completedTasks, totalTasks)} / ${totalTasks}` : "0";
  const progressValue = totalTasks
    ? Math.min(100, Math.round((Math.min(completedTasks, totalTasks) / totalTasks) * 100))
    : 18;

  const levelTitle = currentLevelNumber ? `Рівень ${currentLevelNumber}` : "Рівень";

  // Drag helpers
  function assignDragItem(target: string, item: string) {
    setDragAssignments((prev) => {
      const next: Record<string, string[]> = {};

      for (const key of Object.keys(prev)) {
        const filtered = prev[key].filter((assignedItem) => assignedItem !== item);
        if (filtered.length > 0) next[key] = filtered;
      }

      next[target] = [...(next[target] ?? []), item];
      return next;
    });

    setSelectedDragItem(null);
    setDragHoverTarget(null);
  }

  function clearDragTarget(target: string) {
    setDragAssignments((prev) => {
      if (!prev[target] || prev[target].length === 0) return prev;
      const next = { ...prev };
      delete next[target];
      return next;
    });
  }

  function removeItemFromTarget(target: string, item: string) {
    setDragAssignments((prev) => {
      const list = prev[target] ?? [];
      if (!list.includes(item)) return prev;

      const next = { ...prev };
      const filtered = list.filter((assignedItem) => assignedItem !== item);

      if (filtered.length === 0) delete next[target];
      else next[target] = filtered;

      return next;
    });
  }

  function handleItemDragStart(event: DragEvent<HTMLButtonElement>, item: string) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", item);
    setSelectedDragItem(item);
  }

  function handleDropOnTarget(event: DragEvent<HTMLButtonElement>, target: string) {
    event.preventDefault();
    const droppedItem = event.dataTransfer.getData("text/plain");
    if (!droppedItem) return;
    assignDragItem(target, droppedItem);
  }

  function submitDragAnswer() {
    if (!isDragTask) return;

    const pairs = Object.entries(dragAssignments).flatMap(([target, items]) =>
      items.map((item) => ({ item, target }))
    );

    sendAnswer({ pairs });
  }

  // Sequence helpers
  function assignSequenceItem(slotIndex: number, item: string) {
    setSequenceSlots((prev) => {
      if (slotIndex < 0 || slotIndex >= prev.length) return prev;

      const next = prev.map((slotItem) => (slotItem === item ? null : slotItem));
      next[slotIndex] = item;
      return next;
    });
    setSelectedSequenceItem(null);
  }

  function clearSequenceSlot(slotIndex: number) {
    setSequenceSlots((prev) => {
      if (slotIndex < 0 || slotIndex >= prev.length) return prev;
      if (prev[slotIndex] === null) return prev;

      const next = [...prev];
      next[slotIndex] = null;
      return next;
    });
  }

  function handleSequenceItemDragStart(event: DragEvent<HTMLButtonElement>, item: string) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", item);
    setSelectedSequenceItem(item);
  }

  function handleSequenceSlotDragStart(event: DragEvent<HTMLButtonElement>, item: string) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", item);
    setSelectedSequenceItem(item);
  }

  function handleSequenceDrop(event: DragEvent<HTMLButtonElement>, slotIndex: number) {
    event.preventDefault();
    const droppedItem = event.dataTransfer.getData("text/plain");
    if (!droppedItem) return;
    assignSequenceItem(slotIndex, droppedItem);
  }

  function submitSequenceAnswer() {
    if (!isSequenceTask || sequenceSlots.length === 0) return;
    if (sequenceSlots.some((item) => item === null)) return;
    sendAnswer({ order: sequenceSlots });
  }

  function handleSequenceAnswerClick(item: string) {
    if (loading || pickedIdx !== null) return;

    const firstEmptyIndex = sequenceSlots.findIndex((slotItem) => slotItem === null);
    if (firstEmptyIndex === -1) {
      setSelectedSequenceItem((prev) => (prev === item ? null : item));
      return;
    }

    assignSequenceItem(firstEmptyIndex, item);
  }

  function applyPendingTransition() {
    if (!pendingTransition) return;

    if (pendingTransition.finished) {
      if (pendingTransition.summary) {
        setSummary(pendingTransition.summary);
      }
      setCompletedTasks(pendingTransition.nextCompleted);
      setTask(null);
      setMsg("");
    } else if (pendingTransition.nextTask) {
      setTask(pendingTransition.nextTask);
      setCompletedTasks(pendingTransition.nextCompleted);
      setTotalTasks(pendingTransition.nextTotal ?? null);

      setTextAnswer("");
      setDragAssignments({});
      setSelectedDragItem(null);
      setDragHoverTarget(null);
      setSelectedSequenceItem(null);
      setMsg("");
    }

    setPendingTransition(null);
    setAwaitExplanation(false);
    setShowExplanation(false);
    setAnswerExplanationText("");
    setPickedIdx(null);
    setPickedState(null);
    setLoading(false);
  }

  async function sendAnswer(userAnswer: any, clickedIndex?: number) {
    if (!attemptId || !current) return;
    if (pickedIdx !== null) return;

    if (typeof clickedIndex === "number") {
      setPickedIdx(clickedIndex);
      setPickedState(null);
    }

    setLoading(true);
    setMsg("");

    try {
      const res = await submitAnswer(attemptId, {
        taskId: current.taskId,
        taskVersionId: current.taskVersionId,
        userAnswer,
      });

      const isCorrect = !!res.isCorrect;
      setPickedState(isCorrect ? "ok" : "bad");
      setMsg(isCorrect ? "Правильно!" : "Неправильно!");

      const finished = "finished" in res && res.finished;
      const nextTask = !finished ? res.nextTask : null;

      const nextCompleted = finished
        ? res.summary?.totalCount ?? 0
        : res.progress?.totalCount ?? completedTasks;

      const nextTotal = finished
        ? res.summary?.totalCount ?? totalTasks ?? null
        : res.progress?.totalTasks ?? totalTasks;

      const summaryData: Summary | null = finished
        ? {
            score: res.summary?.score ?? 0,
            correctCount: res.summary?.correctCount ?? 0,
            totalCount: res.summary?.totalCount ?? 0,
          }
        : null;

      const nextTaskState: StartAttemptResponse["task"] | null =
        !finished && nextTask
          ? {
              taskId: nextTask.taskId,
              position: nextTask.position,
              taskVersion: {
                id: nextTask.taskVersion.id,
                prompt: nextTask.taskVersion.prompt,
                data: nextTask.taskVersion.data,
                explanation: nextTask.taskVersion.explanation ?? null,
              },
            }
          : null;

      const answerExplanation = res.explanation ?? current.explanation ?? null;
      const hasExplanation = !!answerExplanation?.trim();
      if (hasExplanation) {
        setPendingTransition({
          finished,
          nextTask: nextTaskState,
          nextCompleted,
          nextTotal: nextTotal ?? null,
          summary: summaryData,
        });
        setAwaitExplanation(true);
        setShowExplanation(false);
        setAnswerExplanationText(answerExplanation?.trim() ?? "");
        setLoading(false);
        return;
      }

      window.setTimeout(() => {
        if (finished) {
          if (summaryData) {
            setSummary(summaryData);
          }
          setCompletedTasks(nextCompleted);
          setTask(null);
          setMsg("");
        } else if (nextTaskState) {
          setTask(nextTaskState);
          setCompletedTasks(nextCompleted);
          setTotalTasks(nextTotal ?? null);

          setTextAnswer("");
          setDragAssignments({});
          setSelectedDragItem(null);
          setDragHoverTarget(null);

          // важливо: sequence slots будуть перезадані useEffect-ом,
          // але ми все одно скидаємо вибір, щоб UI не мигав
          setSelectedSequenceItem(null);

          setMsg("");
        }

        setPickedIdx(null);
        setPickedState(null);
        setLoading(false);
      }, 650);
    } catch (e: any) {
      setMsg(e.message ?? "Error");
      setPickedIdx(null);
      setPickedState(null);
      setLoading(false);
    }
  }

  const minutes = Math.floor(timeLeft / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (timeLeft % 60).toString().padStart(2, "0");

  const starsFilled = summary ? scoreToStars(summary.score, summary.totalCount) : 0;

  const toastClass =
    pickedState === "ok"
      ? `${styles.toast} ${styles.toastOk}`
      : pickedState === "bad"
      ? `${styles.toast} ${styles.toastBad}`
      : `${styles.toast} ${styles.toastInfo}`;

  return (
    <main className={styles.page}>
      <div className={styles.bg} />
      <div className={styles.overlay} />

      <div className={styles.container}>
        <header className={styles.header}>
          <Link className={styles.headerBackBtn} href="/child/subjects">
            <span className={styles.backArrow}>←</span>
            Назад
          </Link>

          <div className={styles.headerTitle}>{levelTitle}</div>
          <div />
        </header>

        <section className={styles.progressWrap}>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${progressValue}%` }} />
            <div className={styles.progressGlow} />
          </div>
          <div className={styles.progressText}>{progressText}</div>
        </section>

        <section className={styles.card}>
          {!!msg && !timeoutOpen && <div className={toastClass}>{msg}</div>}

          {!current ? (
            summary ? (
              <div className={styles.summary}>
                <StarsRow filled={starsFilled} />

                <div className={styles.summaryRow}>
                  <span>Правильні відповіді</span>
                  <b>
                    {summary.correctCount} / {summary.totalCount}
                  </b>
                </div>

                <div className={styles.summaryActions}>
                  <Link className={styles.primaryBtn} href="/child/subjects">
                    До меню
                  </Link>
                  <Link className={styles.secondaryBtn} href={levelsHref}>
                    До списку рівнів
                  </Link>
                </div>
              </div>
            ) : (
              <div className={styles.loadingBox}>
                {loading ? "Завантаження..." : "Нема активного завдання."}
              </div>
            )
          ) : (
            <>
              <div className={styles.question}>{current.prompt}</div>

              {isDragTask ? (
                <>
                  <div className={styles.dragLayout}>
                    <div className={styles.dragRightColumn}>
                      <div className={styles.dragColumnTitle}>Куди відноситься</div>

                      <div className={styles.dragItemsList}>
                        {dragTargets.map((target) => {
                          const assignedItems = dragAssignments[target] ?? [];

                          return (
                            <button
                              key={target}
                              type="button"
                              className={`${styles.dropTarget} ${
                                dragHoverTarget === target ? styles.dropTargetHover : ""
                              }`}
                              disabled={loading || pickedIdx !== null}
                              onDragOver={(event) => {
                                event.preventDefault();
                                setDragHoverTarget(target);
                              }}
                              onDragLeave={() =>
                                setDragHoverTarget((prev) => (prev === target ? null : prev))
                              }
                              onDrop={(event) => handleDropOnTarget(event, target)}
                              onClick={() => {
                                if (selectedDragItem) {
                                  assignDragItem(target, selectedDragItem);
                                  return;
                                }
                                if (assignedItems.length > 0) clearDragTarget(target);
                              }}
                            >
                              <span className={styles.dropTargetLabel}>{target}</span>

                              {assignedItems.length > 0 ? (
                                <span className={styles.dropTargetValuesWrap}>
                                  {assignedItems.map((item) => (
                                    <span
                                      key={`${target}-${item}`}
                                      className={styles.dropTargetValueBadge}
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        removeItemFromTarget(target, item);
                                      }}
                                    >
                                      {item} ×
                                    </span>
                                  ))}
                                </span>
                              ) : (
                                <span className={styles.dropTargetValue}>Перетягни сюди 1+ карток</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className={styles.dragLeftColumn}>
                      <div className={styles.dragColumnTitle}>Картки</div>

                      <div className={styles.dropTargetsList}>
                        {availableDragItems.map((item) => (
                          <button
                            key={item}
                            type="button"
                            className={`${styles.dragItemCard} ${
                              selectedDragItem === item ? styles.dragItemSelected : ""
                            }`}
                            draggable={!loading}
                            disabled={loading || pickedIdx !== null}
                            onDragStart={(event) => handleItemDragStart(event, item)}
                            onClick={() => setSelectedDragItem((prev) => (prev === item ? null : item))}
                          >
                            {item}
                          </button>
                        ))}

                        {availableDragItems.length === 0 && (
                          <div className={styles.dragHint}>
                            Всі картки вже розкладені по правих відповідях.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className={styles.sendBtn}
                    disabled={loading || pickedIdx !== null || availableDragItems.length > 0}
                    onClick={submitDragAnswer}
                  >
                    Перевірити відповідність
                  </button>
                </>
              ) : isSequenceTask ? (
                <div className={styles.sequencePage}>
                  <div className={styles.sequenceHint}>
                    Перетягуй елементи у вільні комірки або клацай по картці та по комірці.
                    Щоб зняти елемент — клацни по заповненій комірці.
                  </div>

                  <div className={styles.sequenceSlots}>
                    {sequenceSlots.map((item, index) => (
                      <button
                        key={`slot-${index}`}
                        type="button"
                        className={`${styles.underlineSlot} ${
                          item ? styles.underlineSlotFilled : ""
                        }`}
                        disabled={loading || pickedIdx !== null}
                        draggable={!!item && !loading && pickedIdx === null}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handleSequenceDrop(e, index)}
                        onDragStart={(e) => {
                          if (!item) return;
                          handleSequenceSlotDragStart(e, item);
                        }}
                        onClick={() => {
                          if (selectedSequenceItem) {
                            assignSequenceItem(index, selectedSequenceItem);
                            return;
                          }
                          if (item) clearSequenceSlot(index);
                        }}
                      >
                        <span className={styles.slotIndex}>{index + 1}</span>
                        <span className={styles.slotText}>{item ?? ""}</span>
                      </button>
                    ))}
                  </div>

                  <div className={styles.sequenceAnswers}>
                    {availableSequenceItems.map((item) => (
                      <button
                        key={item}
                        type="button"
                        className={`${styles.sequenceAnswerBtn} ${
                          selectedSequenceItem === item ? styles.sequenceAnswerBtnSelected : ""
                        }`}
                        draggable={!loading}
                        disabled={loading || pickedIdx !== null}
                        onDragStart={(e) => handleSequenceItemDragStart(e, item)}
                        onClick={() => handleSequenceAnswerClick(item)}
                      >
                        {item}
                      </button>
                    ))}

                    {availableSequenceItems.length === 0 && (
                      <div className={styles.answersHint}>Всі елементи вже розставлені.</div>
                    )}
                  </div>

                  <div className={styles.sequenceActions}>
                    <button
                      type="button"
                      className={styles.sequenceSendBtn}
                      disabled={
                        loading ||
                        pickedIdx !== null ||
                        sequenceSlots.length === 0 ||
                        sequenceSlots.some((x) => x === null)
                      }
                      onClick={submitSequenceAnswer}
                    >
                      Перевірити порядок
                    </button>

                    <button
                      type="button"
                      className={styles.sequenceBackBtn}
                      disabled={loading}
                      onClick={() => (window.location.href = levelsHref)}
                    >
                      До списку рівнів
                    </button>
                  </div>
                </div>
              ) : options.length > 0 ? (
                <div className={styles.answers}>
                  {options.map((opt, idx) => {
                    const isPicked = pickedIdx === idx;
                    const cls =
                      styles.answerBtn +
                      " " +
                      (isPicked && pickedState === "ok"
                        ? styles.answerOk
                        : isPicked && pickedState === "bad"
                        ? styles.answerBad
                        : isPicked
                        ? styles.answerPending
                        : "");

                    return (
                      <button
                        key={idx}
                        disabled={loading || pickedIdx !== null}
                        onClick={() => sendAnswer({ answer: opt }, idx)}
                        className={cls}
                        type="button"
                      >
                        <span className={styles.answerText}>{String(opt)}</span>
                        <span className={styles.answerSheen} />
                      </button>
                    );
                  })}
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

              {awaitExplanation && !!answerExplanationText && (
                <div className={styles.explanationWrap}>
                  <button
                    className={`${styles.secondaryBtn} ${styles.explanationToggleBtn}`}
                    type="button"
                    onClick={() => setShowExplanation((prev) => !prev)}
                  >
                    Пояснення
                  </button>

                  {showExplanation && <div className={styles.explanationText}>{answerExplanationText}</div>}

                  <button
                    className={`${styles.primaryBtn} ${styles.explanationNextBtn}`}
                    type="button"
                    onClick={applyPendingTransition}
                  >
                    Далі
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        <footer className={styles.hud}>
          <div className={styles.hudItem}>
            <span className={styles.hudIcon}>⏳</span>
            <span className={`${styles.hudValue} ${timeLeft <= 10 ? styles.hudDanger : ""}`}>
              {minutes}:{seconds}
            </span>
          </div>
        </footer>
      </div>

      {timeoutOpen && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modal}>
            <div className={styles.modalIcon}>⏳</div>
            <h2 className={styles.modalTitle}>Час вийшов</h2>
            <p className={styles.modalText}>{timeoutReason}</p>

            {summary && (
              <>
                <StarsRow filled={scoreToStars(summary.score, summary.totalCount)} />

                <div className={styles.modalStats}>
                  <div className={styles.modalStatRow}>
                    <span>Правильні</span>
                    <b>
                      {summary.correctCount} / {summary.totalCount}
                    </b>
                  </div>
                </div>
              </>
            )}

            <div className={styles.modalActions}>
              <Link className={styles.primaryBtn} href="/child/subjects">
                До меню
              </Link>
              <Link className={styles.secondaryBtn} href={levelsHref}>
                До списку рівнів
              </Link>
              <button type="button" className={styles.ghostBtn} onClick={() => setTimeoutOpen(false)}>
                Закрити
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
