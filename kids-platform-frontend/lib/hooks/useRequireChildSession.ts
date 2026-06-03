"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getChildSession } from "@/lib/auth";

export function useRequireChildSession(redirectTo = "/child/join") {
  const router = useRouter();

  useEffect(() => {
    const session = getChildSession();
    if (!session.childProfileId || !session.ageGroupCode) {
      router.replace(redirectTo);
    }
  }, [router, redirectTo]);
}
