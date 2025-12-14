"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, PieChart, List } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { format, addMonths, subMonths, addYears, subYears } from "date-fns";
import {
  PieChart as RechartsPie,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

// Mock Data
const TRANSACTION_DATA = [
  {
    date: "Dec 14",
    total: -3450,
    items: [
      {
        id: 1,
        title: "Lunch at Starbucks",
        category: "Food",
        icon: "☕️",
        amount: -1250,
      },
      {
        id: 2,
        title: "Taxi to Shinjuku",
        category: "Transport",
        icon: "🚕",
        amount: -2200,
      },
    ],
  },
  {
    date: "Dec 13",
    total: -1400,
    items: [
      {
        id: 3,
        title: "Convenience Store",
        category: "Daily",
        icon: "🏪",
        amount: -850,
      },
      {
        id: 4,
        title: "Spotify Subscription",
        category: "Sub",
        icon: "🎧",
        amount: -550,
      },
    ],
  },
];

const CATEGORY_DATA = [
  { name: "Food", value: 45000, color: "#6366f1", icon: "🍔" },
  { name: "Transport", value: 12000, color: "#8b5cf6", icon: "🚕" },
  { name: "Daily", value: 8500, color: "#ec4899", icon: "🧻" },
  { name: "Utilities", value: 15000, color: "#f43f5e", icon: "💡" },
  { name: "Entertainment", value: 25000, color: "#10b981", icon: "🎮" },
];

export default function HistoryPage() {
  const [viewMode, setViewMode] = useState<"list" | "stats">("list");
  const [periodType, setPeriodType] = useState<"month" | "year">("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [statType, setStatType] = useState<"expense" | "income">("expense");

  const handlePrev = () => {
    setCurrentDate((prev) =>
      periodType === "month" ? subMonths(prev, 1) : subYears(prev, 1)
    );
  };

  const handleNext = () => {
    setCurrentDate((prev) =>
      periodType === "month" ? addMonths(prev, 1) : addYears(prev, 1)
    );
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-32 flex flex-col">
      {/* Header Area */}
      <div className="bg-white/80 backdrop-blur-md sticky top-0 z-20 border-b border-gray-100">
        <div className="max-w-md mx-auto px-4 py-2">
          {/* Period Type Switcher */}
          <div className="flex justify-center mb-2">
            <div className="bg-gray-100 p-1 rounded-full flex text-xs font-bold">
              <button
                onClick={() => setPeriodType("month")}
                className={cn(
                  "px-4 py-1 rounded-full transition-all",
                  periodType === "month"
                    ? "bg-white shadow-xs text-gray-900"
                    : "text-gray-400"
                )}
              >
                Monthly
              </button>
              <button
                onClick={() => setPeriodType("year")}
                className={cn(
                  "px-4 py-1 rounded-full transition-all",
                  periodType === "year"
                    ? "bg-white shadow-xs text-gray-900"
                    : "text-gray-400"
                )}
              >
                Yearly
              </button>
            </div>
          </div>

          {/* Date Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handlePrev}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-600 active:scale-95 transition-all"
            >
              <ChevronLeft size={24} />
            </button>
            <h2 className="text-lg font-black text-gray-900 tracking-tight">
              {format(
                currentDate,
                periodType === "month" ? "MMMM yyyy" : "yyyy"
              )}
            </h2>
            <button
              onClick={handleNext}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-600 active:scale-95 transition-all"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex border-t border-gray-100">
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold transition-all relative",
              viewMode === "list"
                ? "text-indigo-600"
                : "text-gray-400 hover:bg-gray-50"
            )}
          >
            <List size={18} />
            History
            {viewMode === "list" && (
              <motion.div
                layoutId="tabLine"
                className="absolute bottom-0 h-0.5 w-16 bg-indigo-600"
              />
            )}
          </button>
          <button
            onClick={() => setViewMode("stats")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold transition-all relative",
              viewMode === "stats"
                ? "text-indigo-600"
                : "text-gray-400 hover:bg-gray-50"
            )}
          >
            <PieChart size={18} />
            Analysis
            {viewMode === "stats" && (
              <motion.div
                layoutId="tabLine"
                className="absolute bottom-0 h-0.5 w-16 bg-indigo-600"
              />
            )}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 max-w-md mx-auto w-full p-4">
        <AnimatePresence mode="wait">
          {viewMode === "list" ? (
            <HistoryListView key="list" />
          ) : (
            <StatsView key="stats" type={statType} onTypeChange={setStatType} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function HistoryListView() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <div className="bg-indigo-600 text-white p-6 rounded-[28px] shadow-lg shadow-indigo-500/20 flex flex-col items-center justify-center mb-6">
        <span className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-1">
          Total Limit
        </span>
        <div className="flex items-baseline gap-1">
          <span className="text-lg text-indigo-200">¥</span>
          <h2 className="text-4xl font-black tabular-nums">148,200</h2>
        </div>
        <span className="text-xs font-medium bg-white/20 px-3 py-1 rounded-full mt-3 backdrop-blur-md">
          +12% vs last month
        </span>
      </div>

      {TRANSACTION_DATA.map((group) => (
        <div key={group.date} className="space-y-2">
          <div className="flex items-center justify-between px-2 text-xs font-bold text-gray-400">
            <span>{group.date}</span>
            <span>¥{Math.abs(group.total).toLocaleString()}</span>
          </div>
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
            {group.items.map((item) => (
              <div
                key={item.id}
                className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gray-50 text-xl flex items-center justify-center">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">
                      {item.title}
                    </p>
                    <p className="text-xs text-gray-400 font-medium">
                      {item.category}
                    </p>
                  </div>
                </div>
                <span className="font-bold text-gray-900">
                  ¥{Math.abs(item.amount).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </motion.div>
  );
}

function StatsView({
  type,
  onTypeChange,
}: {
  type: "expense" | "income";
  onTypeChange: (t: "expense" | "income") => void;
}) {
  const total = CATEGORY_DATA.reduce((acc, cur) => acc + cur.value, 0);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-6"
    >
      {/* Type Toggle */}
      <div className="bg-gray-100 p-1 rounded-[16px] flex text-sm font-bold">
        <button
          onClick={() => onTypeChange("expense")}
          className={cn(
            "flex-1 py-2 rounded-[12px] transition-all",
            type === "expense"
              ? "bg-white shadow-sm text-gray-900"
              : "text-gray-400"
          )}
        >
          Expense
        </button>
        <button
          onClick={() => onTypeChange("income")}
          className={cn(
            "flex-1 py-2 rounded-[12px] transition-all",
            type === "income"
              ? "bg-white shadow-sm text-gray-900"
              : "text-gray-400"
          )}
        >
          Income
        </button>
      </div>

      {/* Chart Area */}
      <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm h-80 relative flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsPie width={400} height={400}>
            <Pie
              data={CATEGORY_DATA}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {CATEGORY_DATA.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </RechartsPie>
        </ResponsiveContainer>
        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Total
          </span>
          <span className="text-2xl font-black text-gray-900 tracking-tight">
            ¥{total.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Category List */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-gray-900 px-2">Breakdown</h3>
        {CATEGORY_DATA.map((cat, i) => (
          <div
            key={i}
            className="bg-white p-4 rounded-[20px] border border-gray-100 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-white text-lg"
                style={{ backgroundColor: cat.color }}
              >
                {cat.icon}
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">{cat.name}</p>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(cat.value / total) * 100}%`,
                        backgroundColor: cat.color,
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-gray-400 font-bold">
                    {Math.round((cat.value / total) * 100)}%
                  </span>
                </div>
              </div>
            </div>
            <span className="font-bold text-gray-900">
              ¥{cat.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
