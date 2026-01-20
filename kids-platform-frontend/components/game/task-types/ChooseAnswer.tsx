"use client";

import { useState } from "react";

export default function ChooseAnswer({
  data,
  onSubmit,
}: {
  data: { options: Array<string | number> };
  onSubmit: (answer: any) => void;
}) {
  const [selected, setSelected] = useState<string | number | null>(null);

  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        {data.options.map((opt, idx) => {
          const isSel = selected === opt;
          return (
            <button
              key={idx}
              onClick={() => setSelected(opt)}
              className={[
                "rounded-xl py-4 font-semibold shadow-sm border",
                isSel ? "border-black" : "border-gray-200",
              ].join(" ")}
            >
              {opt}
            </button>
          );
        })}
      </div>

      <button
        className="mt-4 w-full rounded-xl bg-black text-white py-3 font-semibold disabled:opacity-40"
        disabled={selected === null}
        onClick={() => onSubmit({ selected })}
      >
        Відповісти
      </button>
    </div>
  );
}
