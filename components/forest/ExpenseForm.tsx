"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  {
    id: "food",
    label: "食費",
    icon: "🍔",
    color: "from-orange-400 to-red-500",
  },
  {
    id: "transport",
    label: "交通費",
    icon: "qh",
    color: "from-blue-400 to-cyan-500",
  },
  {
    id: "daily",
    label: "日用品",
    icon: "🧻",
    color: "from-green-400 to-emerald-500",
  },
  {
    id: "utilities",
    label: "光熱費",
    icon: "💡",
    color: "from-yellow-400 to-orange-500",
  },
  {
    id: "entertainment",
    label: "交際費",
    icon: "🎮",
    color: "from-purple-400 to-pink-500",
  },
  {
    id: "other",
    label: "その他",
    icon: "📦",
    color: "from-gray-400 to-slate-500",
  },
];

export function ExpenseForm() {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("food");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [memo, setMemo] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const selectedCategory =
    CATEGORIES.find((c) => c.id === category) || CATEGORIES[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto relative z-10"
    >
      <div className="glass-panel rounded-3xl p-1 overflow-hidden">
        <div className="bg-white/40 backdrop-blur-xl rounded-[20px] p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-white shadow-sm text-lg">
                ✨
              </span>
              New Expense
            </h2>
            <div className="text-xs font-medium text-gray-500 bg-white/50 px-3 py-1 rounded-full">
              {date.replace(/-/g, ".")}
            </div>
          </div>

          <form className="space-y-6">
            {/* Amount Input */}
            <div className="relative group">
              <motion.div
                animate={{ scale: isFocused ? 1.02 : 1 }}
                className={cn(
                  "relative overflow-hidden rounded-2xl bg-white border transition-all duration-300",
                  isFocused
                    ? "border-indigo-500 shadow-lg shadow-indigo-500/20"
                    : "border-transparent shadow-sm"
                )}
              >
                <div
                  className={cn(
                    "absolute inset-0 opacity-10 bg-linear-to-r",
                    selectedCategory.color
                  )}
                />
                <div className="relative p-6 flex flex-col items-center justify-center min-h-[120px]">
                  <label className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-1">
                    AMOUNT
                  </label>
                  <div className="flex items-baseline justify-center w-full">
                    <span
                      className={cn(
                        "text-3xl font-light mr-1 transition-colors duration-300",
                        amount ? "text-gray-800" : "text-gray-300"
                      )}
                    >
                      ¥
                    </span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      placeholder="0"
                      className="w-full text-center bg-transparent text-5xl font-bold text-gray-800 outline-none placeholder:text-gray-200"
                    />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Category Selection */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">
                Category
              </label>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={cn(
                      "relative flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 border",
                      category === cat.id
                        ? "bg-white border-transparent shadow-md transform scale-[1.02]"
                        : "bg-white/20 border-transparent hover:bg-white/40 hover:scale-[1.01]"
                    )}
                  >
                    {category === cat.id && (
                      <motion.div
                        layoutId="activeCategory"
                        className={cn(
                          "absolute inset-0 rounded-xl opacity-10 bg-linear-to-br",
                          cat.color
                        )}
                      />
                    )}
                    <span className="text-2xl mb-1">{cat.icon}</span>
                    <span
                      className={cn(
                        "text-[10px] font-bold",
                        category === cat.id ? "text-gray-800" : "text-gray-500"
                      )}
                    >
                      {cat.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Memo & Date Grid */}
            <div className="grid grid-cols-1 gap-4">
              <div className="glass-input rounded-xl p-1 focus-within:ring-2 focus-within:ring-indigo-500/20">
                <input
                  type="text"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="メモを入力..."
                  className="w-full bg-transparent px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 outline-none"
                />
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 rounded-xl relative overflow-hidden group shadow-lg shadow-indigo-500/30"
              type="button"
            >
              <div className="absolute inset-0 bg-linear-to-r from-indigo-600 via-purple-600 to-indigo-600 opacity-90 group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <span className="relative flex items-center justify-center gap-2 text-white font-bold tracking-wide">
                記録する
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </span>
            </motion.button>
          </form>
        </div>
      </div>
    </motion.div>
  );
}
