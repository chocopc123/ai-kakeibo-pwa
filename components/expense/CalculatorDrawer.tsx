"use client";

import { useState } from "react";
import { Drawer } from "vaul";
import { motion, AnimatePresence } from "framer-motion";
import {
  Delete,
  X,
  Check,
  Calendar,
  Tag,
  Divide,
  Plus,
  Minus,
  X as Multiply,
  Equal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { evaluate } from "mathjs";

interface CalculatorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (amount: number, category: string, date: string) => void;
}

export function CalculatorDrawer({
  isOpen,
  onClose,
  onSave,
}: CalculatorDrawerProps) {
  const [expression, setExpression] = useState("0");
  const [category, setCategory] = useState("food");

  const handleInput = (val: string) => {
    const isOperator = ["+", "-", "*", "/"].includes(val);

    if (expression === "0" && !isOperator) {
      setExpression(val);
      return;
    }

    if (isOperator) {
      // Prevent consecutive operators by replacing the last one if it's an operator
      const lastChar = expression.slice(-1);
      if (["+", "-", "*", "/"].includes(lastChar)) {
        setExpression((prev) => prev.slice(0, -1) + val);
        return;
      }
    }

    setExpression((prev) => prev + val);
  };

  const handleDelete = () => {
    if (expression.length > 1) {
      setExpression((prev) => prev.slice(0, -1));
    } else {
      setExpression("0");
    }
  };

  const handleClear = () => {
    setExpression("0");
  };

  const handleCalculate = () => {
    try {
      // Remove trailing operator before calculation
      let evalExpr = expression;
      if (["+", "-", "*", "/"].includes(evalExpr.slice(-1))) {
        evalExpr = evalExpr.slice(0, -1);
      }

      const result = evaluate(evalExpr);
      setExpression(result.toString());
      return result;
    } catch (e) {
      return null;
    }
  };

  const handleSave = () => {
    const result = handleCalculate();
    if (result !== null) {
      onSave(Number(result), category, new Date().toISOString());
      setExpression("0");
      onClose();
    }
  };

  return (
    <Drawer.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
        <Drawer.Content className="bg-white flex flex-col rounded-t-[32px] mt-24 fixed bottom-0 left-0 right-0 z-50 h-[90vh] outline-none">
          {/* Handle Bar */}
          <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-300 mt-4 mb-4" />

          <div className="flex-1 flex flex-col p-4 max-w-md mx-auto w-full">
            {/* Display Area */}
            <div className="flex flex-col items-center justify-center mb-6 space-y-1">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Amount
              </span>
              <div className="flex items-baseline justify-end w-full px-4 overflow-x-auto scrollbar-hide">
                <span className="text-3xl text-gray-400 font-light mr-2 flex-shrink-0">
                  ¥
                </span>
                <span className="text-6xl font-bold text-gray-900 tracking-tight whitespace-nowrap">
                  {expression.replace(/\*/g, "×").replace(/\//g, "÷")}
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3 mb-6 overflow-x-auto pb-2 scrollbar-hide px-1">
              <button className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-2 pr-5 text-sm font-bold text-indigo-700 whitespace-nowrap active:scale-95 transition-transform">
                <Tag size={16} />
                Food
              </button>
              <button className="flex items-center gap-2 bg-gray-100 border border-gray-200 rounded-full px-4 py-2 pr-5 text-sm font-bold text-gray-600 whitespace-nowrap active:scale-95 transition-transform">
                <Calendar size={16} />
                Today
              </button>
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-4 gap-3 bg-gray-50 p-4 rounded-[32px] flex-1">
              <ActionBtn
                onClick={handleClear}
                className="bg-gray-200 text-gray-600 font-bold text-sm"
              >
                AC
              </ActionBtn>
              <ActionBtn
                onClick={handleDelete}
                className="bg-gray-200 text-gray-600"
              >
                <Delete size={22} />
              </ActionBtn>
              <OpBtn onClick={() => handleInput("/")}>
                <Divide size={24} />
              </OpBtn>
              <OpBtn onClick={() => handleInput("*")}>
                <Multiply size={24} />
              </OpBtn>

              <NumBtn num="7" onClick={handleInput} />
              <NumBtn num="8" onClick={handleInput} />
              <NumBtn num="9" onClick={handleInput} />
              <OpBtn onClick={() => handleInput("-")}>
                <Minus size={24} />
              </OpBtn>

              <NumBtn num="4" onClick={handleInput} />
              <NumBtn num="5" onClick={handleInput} />
              <NumBtn num="6" onClick={handleInput} />
              <OpBtn onClick={() => handleInput("+")}>
                <Plus size={24} />
              </OpBtn>

              <div className="col-span-3 grid grid-cols-3 gap-3">
                <NumBtn num="1" onClick={handleInput} />
                <NumBtn num="2" onClick={handleInput} />
                <NumBtn num="3" onClick={handleInput} />
                <NumBtn
                  num="0"
                  onClick={handleInput}
                  className="col-span-2 w-full"
                />
                <NumBtn num="00" onClick={handleInput} />
              </div>

              <div className="flex flex-col gap-3 h-full">
                <button
                  className="flex-1 bg-indigo-600 text-white rounded-[24px] flex items-center justify-center shadow-lg shadow-indigo-500/30 active:scale-95 transition-transform"
                  onClick={handleSave}
                >
                  <Check size={32} strokeWidth={3} />
                </button>
              </div>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

function NumBtn({
  num,
  onClick,
  className,
}: {
  num: string;
  onClick: (n: string) => void;
  className?: string;
}) {
  return (
    <button
      onClick={() => onClick(num)}
      className={cn(
        "h-[72px] rounded-[24px] bg-white text-2xl font-bold text-gray-800 shadow-sm border border-gray-100 active:bg-gray-50 active:scale-95 transition-all flex items-center justify-center",
        className
      )}
    >
      {num}
    </button>
  );
}

function OpBtn({ children, onClick, className }: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "h-[72px] rounded-[24px] bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center active:scale-95 transition-all",
        className
      )}
    >
      {children}
    </button>
  );
}

function ActionBtn({ children, onClick, className }: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "h-[72px] rounded-[24px] flex items-center justify-center active:scale-95 transition-all",
        className
      )}
    >
      {children}
    </button>
  );
}
