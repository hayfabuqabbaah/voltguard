import { useState, useCallback } from 'react';

interface InputGridProps {
  values: number[];
  onChange: (values: number[]) => void;
  isLoading?: boolean;
}

export default function InputGrid({ values, onChange, isLoading = false }: InputGridProps) {
  const COLS = 16;
  const ROWS = 8;
  const TOTAL = COLS * ROWS; // 128

  const handleInputChange = (index: number, value: string) => {
    const newValues = [...values];
    const numValue = value === '' ? 0 : parseFloat(value);
    if (!isNaN(numValue)) {
      newValues[index] = numValue;
      onChange(newValues);
    }
  };

  const handleSmartPaste = useCallback((text: string) => {
    // تحليل النص المنسوخ: أرقام مفصولة بفواصل أو أسطر جديدة
    const numbers = text
      .split(/[\s,;]+/)
      .filter(s => s.trim() !== '')
      .map(s => parseFloat(s.trim()))
      .filter(n => !isNaN(n));

    if (numbers.length > 0) {
      const newValues = [...values];
      for (let i = 0; i < Math.min(numbers.length, TOTAL); i++) {
        newValues[i] = numbers[i];
      }
      onChange(newValues);
    }
  }, [values, onChange]);

  return (
    <div className="space-y-4">
      {/* شبكة الإدخال */}
      <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 backdrop-blur-md rounded-lg p-6 border border-amber-500/30 shadow-2xl">
        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
          {Array.from({ length: TOTAL }).map((_, index) => (
            <div key={index} className="relative group">
              <input
                type="number"
                value={values[index] || ''}
                onChange={(e) => handleInputChange(index, e.target.value)}
                disabled={isLoading}
                placeholder="0"
                className="w-full h-10 px-2 py-1 text-xs font-mono text-white bg-blue-950/40 border border-amber-500/40 rounded focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none transition-all duration-200 hover:bg-blue-950/60 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-amber-500 text-blue-950 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none font-bold">
                Col{index + 1}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* منطقة اللصق الذكي */}
      <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 backdrop-blur-md rounded-lg p-4 border border-amber-500/30">
        <label className="block text-sm font-mono font-bold text-amber-500 mb-2">
          اللصق الذكي (Smart Paste)
        </label>
        <textarea
          placeholder="الصق قيم CSV أو أرقام مفصولة بفواصل أو أسطر جديدة..."
          onPaste={(e) => {
            e.preventDefault();
            const text = e.clipboardData.getData('text');
            handleSmartPaste(text);
          }}
          disabled={isLoading}
          className="w-full h-24 p-3 text-sm font-mono text-white bg-blue-950/40 border border-amber-500/40 rounded focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none transition-all duration-200 hover:bg-blue-950/60 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
        />
        <p className="text-xs text-gray-400 mt-2">
          💡 انسخ والصق 128 قيمة رقمية مفصولة بفواصل أو أسطر جديدة
        </p>
      </div>
    </div>
  );
}
