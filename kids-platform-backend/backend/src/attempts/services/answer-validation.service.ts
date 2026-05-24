import { Injectable } from "@nestjs/common";

type DragPair = { item: string; target: string };

@Injectable()
export class AnswerValidationService {
  private deepEqual(a: any, b: any): boolean {
    if (a === b) return true;
    if (typeof a !== typeof b) return false;
    if (a && b && typeof a === "object") {
      if (Array.isArray(a) !== Array.isArray(b)) return false;
      if (Array.isArray(a)) {
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) if (!this.deepEqual(a[i], b[i])) return false;
        return true;
      }
      const ak = Object.keys(a).sort();
      const bk = Object.keys(b).sort();
      if (!this.deepEqual(ak, bk)) return false;
      for (const k of ak) if (!this.deepEqual(a[k], b[k])) return false;
      return true;
    }
    return false;
  }

  private normalizeDragPairsValue(value: unknown): DragPair[] | null {
    if (!value || typeof value !== "object") return null;
    const pairs = (value as { pairs?: unknown }).pairs;
    if (!Array.isArray(pairs)) return null;
    const normalized: DragPair[] = [];
    for (const pair of pairs) {
      if (!pair || typeof pair !== "object") return null;
      const item = (pair as { item?: unknown }).item;
      const target = (pair as { target?: unknown }).target;
      if (typeof item !== "string" || typeof target !== "string") return null;
      normalized.push({ item: item.trim(), target: target.trim() });
    }
    normalized.sort((a, b) => (a.target === b.target ? a.item.localeCompare(b.item) : a.target.localeCompare(b.target)));
    return normalized;
  }

  answersAreEquivalent(userAnswer: unknown, correctAnswer: unknown): boolean {
    const normalizedUserPairs = this.normalizeDragPairsValue(userAnswer);
    const normalizedCorrectPairs = this.normalizeDragPairsValue(correctAnswer);
    if (normalizedUserPairs && normalizedCorrectPairs) return this.deepEqual(normalizedUserPairs, normalizedCorrectPairs);
    return this.deepEqual(userAnswer, correctAnswer);
  }
}
