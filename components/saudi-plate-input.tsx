"use client";

import { useState, useRef, useEffect } from "react";

interface SaudiPlateInputProps {
  numbers: string;
  letters: string;
  onNumbersChange: (value: string) => void;
  onLettersChange: (value: string) => void;
}

const arabicLetters = [
  "أ", "ب", "ح", "د", "ر", "س", "ص", "ط", "ع", "ق", "ك", "ل", "م", "ن", "ه", "و", "ي",
];

export function SaudiPlateInput({
  numbers,
  letters,
  onNumbersChange,
  onLettersChange,
}: SaudiPlateInputProps) {
  const [showLetterPicker, setShowLetterPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  const arabicToWestern = (str: string) => {
    const arabicNums = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
    return str.replace(/[٠-٩]/g, (d) => arabicNums.indexOf(d).toString());
  };

  const handleLetterAdd = (letter: string) => {
    if (letters.length < 4) {
      onLettersChange(letters + letter);
    }
  };

  const handleLetterRemoveLast = () => {
    onLettersChange(letters.slice(0, -1));
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowLetterPicker(false);
      }
    };
    if (showLetterPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showLetterPicker]);

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground">
        لوحة المركبة
      </label>

      {/* Plate preview — single row */}
      <div className="mx-auto w-full max-w-md">
        <div className="bg-white rounded-xl p-0.5 border-4 border-gray-800 shadow-lg">
          <div className="flex items-stretch">
            {/* Numbers — left side, LTR */}
            <div className="flex-1 flex items-center justify-center py-3 border-r-2 border-gray-800">
              <div className="flex gap-1 items-center" dir="ltr">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="text-2xl font-bold font-mono text-gray-800 w-6 text-center">
                    {numbers?.[i] ?? <span className="text-gray-300">-</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Center emblem */}
            <div className="flex flex-col items-center justify-center px-3 py-2 shrink-0">
              <svg className="w-6 h-5 mb-0.5" viewBox="0 0 24 24" fill="none">
                <rect width="24" height="24" fill="#165E3C" rx="2" />
                <path
                  d="M12 8l-1.5 4h3L12 8z M8 14h8 M10 16l2-2 2 2"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="text-[8px] font-bold text-gray-800 leading-none">السعودية</div>
              <div className="text-[7px] font-bold text-gray-500 leading-none">KSA</div>
            </div>

            {/* Letters — right side, 4 slots */}
            <div className="flex-1 flex items-center justify-center py-3 border-l-2 border-gray-800">
              <div className="flex gap-1 items-center">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="text-2xl font-bold text-gray-800 w-6 text-center">
                    {letters?.[i] ?? <span className="text-gray-300">-</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inputs row */}
      <div className="flex gap-3">

        {/* Letters picker */}
        <div className="flex-1 relative" ref={pickerRef}>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">الحروف (حتى 4)</label>
            <button
              type="button"
              onClick={() => setShowLetterPicker(!showLetterPicker)}
              className="w-full h-11 px-3 rounded-lg border border-border bg-background text-foreground text-center text-lg flex items-center justify-between hover:border-[#1a7a3a]/50 transition-colors"
            >
              <span className="text-xs text-gray-400">▼</span>
              <span className="font-bold tracking-widest flex-1 text-center">
                {letters || <span className="text-sm text-muted-foreground font-normal">اختر الحروف</span>}
              </span>
              {letters ? (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onLettersChange(""); }}
                  className="w-5 h-5 rounded-full bg-red-100 text-red-500 hover:bg-red-200 flex items-center justify-center text-xs font-bold transition-colors"
                >
                  ×
                </button>
              ) : (
                <span className="w-5" />
              )}
            </button>
          </div>

          {showLetterPicker && (
            <div className="absolute z-20 top-full mt-1.5 left-0 right-0 min-w-[260px] p-3 bg-white border border-[#1a7a3a]/20 rounded-xl shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-gray-500">اختر حرفاً ({letters.length}/4)</span>
                {letters && (
                  <button
                    type="button"
                    onClick={handleLetterRemoveLast}
                    className="text-[10px] text-red-500 hover:text-red-700 font-bold px-2 py-0.5 rounded bg-red-50 hover:bg-red-100 transition-colors"
                  >
                    ← حذف آخر
                  </button>
                )}
              </div>
              <div className="grid grid-cols-6 gap-1.5">
                {arabicLetters.map((letter) => (
                  <button
                    key={letter}
                    type="button"
                    onClick={() => handleLetterAdd(letter)}
                    disabled={letters.length >= 4}
                    className="h-10 rounded-lg border border-gray-200 hover:border-[#1a7a3a] hover:bg-[#1a7a3a]/5 font-bold text-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
                  >
                    {letter}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-2.5 pt-2 border-t border-gray-100">
                <div className="flex-1 text-center text-xs font-bold tracking-widest text-gray-700 bg-gray-50 rounded-lg py-1">
                  {letters || "----"}
                </div>
                <button
                  type="button"
                  onClick={() => setShowLetterPicker(false)}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-[#1a7a3a] rounded-lg hover:bg-[#0d5c2a] transition-colors"
                >
                  تم
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Numbers input */}
        <div className="flex-1 space-y-1.5">
          <label className="text-xs text-muted-foreground">الأرقام (حتى 4)</label>
          <input
            type="text"
            inputMode="numeric"
            value={numbers}
            onChange={(e) => {
              const normalized = arabicToWestern(e.target.value);
              const value = normalized.replace(/[^0-9]/g, "");
              if (value.length <= 4) {
                onNumbersChange(value);
              }
            }}
            placeholder="1234"
            className="w-full h-11 px-3 rounded-lg border border-border bg-background text-foreground text-center text-lg font-mono"
            maxLength={4}
          />
        </div>
      </div>
    </div>
  );
}
