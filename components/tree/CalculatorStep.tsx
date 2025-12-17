import React from "react";
import {
  Delete,
  Divide,
  Plus,
  Minus,
  X as Multiply,
  Check,
} from "lucide-react";
import { ActionBtn, NumBtn, OpBtn } from "@/components/leaf/CalculatorButtons";

interface CalculatorStepProps {
  expression: string;
  onInput: (val: string) => void;
  onDelete: () => void;
  onClear: () => void;
  onEqual: () => void;
  onNext: () => void;
  type: "expense" | "income";
  onTypeChange: (type: "expense" | "income") => void;
}

export default function CalculatorStep({
  expression,
  onInput,
  onDelete,
  onClear,
  onEqual,
  onNext,
  type,
  onTypeChange,
}: CalculatorStepProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Type Toggle */}
      <div className="flex justify-center mb-6">
        <div className="bg-gray-100 p-1 rounded-full flex w-48 relative">
          <button
            onClick={() => onTypeChange("expense")}
            className={`flex-1 py-2 text-xs font-bold rounded-full transition-all z-10 ${
              type === "expense"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            EXPENSE
          </button>
          <button
            onClick={() => onTypeChange("income")}
            className={`flex-1 py-2 text-xs font-bold rounded-full transition-all z-10 ${
              type === "income"
                ? "bg-white text-green-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            INCOME
          </button>
        </div>
      </div>

      {/* Amount Display */}
      <div className="flex flex-col items-end justify-center mb-6 px-4 space-y-1">
        <span
          className={`text-xs font-bold uppercase tracking-widest self-center transition-colors ${
            type === "income" ? "text-green-500" : "text-indigo-500"
          }`}
        >
          {type === "income" ? "Income Amount" : "Expense Amount"}
        </span>
        <div className="flex items-center justify-end w-full overflow-x-auto scrollbar-hide">
          <span
            className={`text-6xl font-black tracking-tight whitespace-nowrap transition-colors ${
              type === "income" ? "text-green-500" : "text-gray-900"
            }`}
          >
            {type === "income" ? "+" : ""}
            {expression.replace(/\*/g, "×").replace(/\//g, "÷")}
          </span>
        </div>
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-4 gap-3 bg-gray-50 p-4 rounded-[32px] flex-1">
        <ActionBtn
          onClick={onClear}
          className="bg-gray-200 text-gray-600 font-bold text-sm"
        >
          AC
        </ActionBtn>
        <ActionBtn onClick={onDelete} className="bg-gray-200 text-gray-600">
          <Delete size={22} />
        </ActionBtn>
        <OpBtn onClick={() => onInput("/")}>
          <Divide size={24} />
        </OpBtn>
        <OpBtn onClick={() => onInput("*")}>
          <Multiply size={24} />
        </OpBtn>

        <NumBtn num="7" onClick={onInput} />
        <NumBtn num="8" onClick={onInput} />
        <NumBtn num="9" onClick={onInput} />
        <OpBtn onClick={() => onInput("-")}>
          <Minus size={24} />
        </OpBtn>

        <NumBtn num="4" onClick={onInput} />
        <NumBtn num="5" onClick={onInput} />
        <NumBtn num="6" onClick={onInput} />
        <OpBtn onClick={() => onInput("+")}>
          <Plus size={24} />
        </OpBtn>

        <div className="col-span-3 grid grid-cols-3 gap-3">
          <NumBtn num="1" onClick={onInput} />
          <NumBtn num="2" onClick={onInput} />
          <NumBtn num="3" onClick={onInput} />
          <NumBtn num="0" onClick={onInput} />
          <NumBtn num="00" onClick={onInput} />
          <NumBtn num="." onClick={onInput} />
        </div>

        <div className="flex flex-col gap-3 h-full">
          <button
            onClick={onEqual}
            className="h-[72px] bg-indigo-100 text-indigo-600 rounded-[24px] flex items-center justify-center shadow-xs active:scale-95 transition-transform"
          >
            <span className="text-2xl font-bold">=</span>
          </button>
          <button
            onClick={onNext}
            className="flex-1 bg-indigo-600 text-white rounded-[24px] flex items-center justify-center shadow-lg shadow-indigo-500/30 active:scale-95 transition-transform"
          >
            <Check size={32} strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  );
}
