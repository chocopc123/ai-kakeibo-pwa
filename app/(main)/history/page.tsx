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

import useSWR from "swr";
import { Expense } from "@/lib/sqlite/client"; // Use shared type if possible, or define locally

// ... imports ...

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface GroupedExpenses {
  date: string;
  total: number;
  incomeTotal: number;
  expenseTotal: number;
  items: (Expense & {
    category: { icon: string; label: string; color: string };
  })[];
}

export default function HistoryPage() {
  const [viewMode, setViewMode] = useState<"list" | "stats">("list");
  const [periodType, setPeriodType] = useState<"month" | "year">("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [statType, setStatType] = useState<"expense" | "income">("expense");

  const { data: expenses, isLoading } = useSWR<any[]>("/api/expenses", fetcher);

  // Grouping Logic
  const groupedData: GroupedExpenses[] = [];

  if (expenses) {
    // Filter by period (Naive implementation: filter client side for now. Ideally API should handle this)
    const filtered = expenses.filter((e) => {
      const d = new Date(e.date);
      if (periodType === "month") {
        return (
          d.getMonth() === currentDate.getMonth() &&
          d.getFullYear() === currentDate.getFullYear()
        );
      } else {
        return d.getFullYear() === currentDate.getFullYear();
      }
    });

    const groups: Record<string, typeof filtered> = {};
    filtered.forEach((e) => {
      const dateKey = format(new Date(e.date), "MMM d"); // e.g. "Dec 14"
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(e);
    });

    Object.keys(groups).forEach((date) => {
      const items = groups[date];
      // Let's check how we display. UI expects negative for expenses?
      // Current UI mock had negative.
      // Let's calculate total signed.
      const incomeTotal = items
        .filter((i) => i.type === "income")
        .reduce((sum, item) => sum + item.amount, 0);
      const expenseTotal = items
        .filter((i) => i.type === "expense")
        .reduce((sum, item) => sum + item.amount, 0);

      groupedData.push({
        date,
        total: incomeTotal - expenseTotal,
        incomeTotal,
        expenseTotal,
        items: items.map((i) => ({
          ...i,
          // Adjust amount for display (negative if expense)
          amount: i.type === "expense" ? -i.amount : i.amount,
        })),
      });
    });

    // Sort by date desc (assuming API returns sorted, but grouping might mess order if using Object.keys)
    // Actually API returns sorted. Object.keys order is not guaranteed.
    // Let's rely on the order of appearance or sort manually.
    groupedData.sort((a, b) => {
      // Naive date parse for sort
      return (
        new Date(b.items[0].date).getTime() -
        new Date(a.items[0].date).getTime()
      );
    });
  }

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

  // Calculate Total Limit / Stats for the header card
  // Mocking "Limit" logic for now, or just show Total Expense
  const currentMonthTotal = groupedData.reduce(
    (sum, g) =>
      sum +
      g.items.filter((i) => i.amount < 0).reduce((s, i) => s + i.amount, 0),
    0
  );

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
            <HistoryListView
              key="list"
              data={groupedData}
              total={currentMonthTotal}
              isLoading={isLoading}
            />
          ) : (
            <StatsView
              key="stats"
              type={statType}
              onTypeChange={setStatType}
              expenses={expenses || []}
              currentDate={currentDate}
              period={periodType}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function HistoryListView({
  data,
  total,
  isLoading,
}: {
  data: GroupedExpenses[];
  total: number;
  isLoading: boolean;
}) {
  if (isLoading)
    return <div className="p-10 text-center text-gray-400">Loading...</div>;
  if (data.length === 0)
    return (
      <div className="p-10 text-center text-gray-400">No transactions</div>
    );

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <div className="bg-indigo-600 text-white p-6 rounded-[28px] shadow-lg shadow-indigo-500/20 flex flex-col items-center justify-center mb-6">
        <span className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-1">
          Total Expense
        </span>
        <div className="flex items-baseline gap-1">
          <span className="text-lg text-indigo-200">¥</span>
          <h2 className="text-4xl font-black tabular-nums">
            {Math.abs(total).toLocaleString()}
          </h2>
        </div>
      </div>

      {data.map((group) => (
        <div key={group.date} className="space-y-2">
          <div className="flex items-center justify-between px-2 text-xs font-bold text-gray-400">
            <span>{group.date}</span>
            <div className="flex gap-2">
              {group.incomeTotal > 0 && (
                <span className="text-green-600">
                  +¥{group.incomeTotal.toLocaleString()}
                </span>
              )}
              {group.expenseTotal > 0 && (
                <span className="text-gray-900">
                  ¥{group.expenseTotal.toLocaleString()}
                </span>
              )}
            </div>
          </div>
          <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
            {group.items.map((item) => (
              <div
                key={item.id}
                className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gray-50 text-xl flex items-center justify-center">
                    {item.category?.icon || "💸"}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">
                      {item.note || item.category?.label || "Unknown"}
                    </p>
                    <p className="text-xs text-gray-400 font-medium">
                      {item.category?.label || "Uncategorized"}
                    </p>
                  </div>
                </div>
                <span
                  className={cn(
                    "font-bold",
                    item.amount > 0 ? "text-green-600" : "text-gray-900"
                  )}
                >
                  {item.amount > 0 ? "+" : ""}¥
                  {Math.abs(item.amount).toLocaleString()}
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
  expenses,
  currentDate,
  period,
}: {
  type: "expense" | "income";
  onTypeChange: (t: "expense" | "income") => void;
  expenses: any[];
  currentDate: Date;
  period: "month" | "year";
}) {
  // Filter by date and type
  const filtered = expenses.filter((e) => {
    const d = new Date(e.date);
    const matchPeriod =
      period === "month"
        ? d.getMonth() === currentDate.getMonth() &&
          d.getFullYear() === currentDate.getFullYear()
        : d.getFullYear() === currentDate.getFullYear();
    return matchPeriod && e.type === type;
  });

  // Aggregate by Category
  const categoryMap: Record<
    string,
    { name: string; value: number; color: string; icon: string }
  > = {};
  filtered.forEach((e) => {
    const catName = e.category?.label || "Uncategorized";
    if (!categoryMap[catName]) {
      categoryMap[catName] = {
        name: catName,
        value: 0,
        color: e.category?.color
          ? e.category.color.split(" ")[0].replace("bg-", "")
          : "#ccc", // Naive color extraction from tailwind class or fallback
        // Real implementation needs proper color mapping from tailwind class "bg-blue-100" to hex "#..." for Recharts
        // For now let's generate random colors or use a map
        icon: e.category?.icon || "❓",
      };
    }
    categoryMap[catName].value += e.amount;
  });

  // Recharts Color Map Helper (Naive)
  const COLORS = [
    "#6366f1",
    "#8b5cf6",
    "#ec4899",
    "#f43f5e",
    "#10b981",
    "#f59e0b",
    "#3b82f6",
  ];

  const chartData = Object.values(categoryMap)
    .map((c, i) => ({
      ...c,
      color: COLORS[i % COLORS.length],
    }))
    .sort((a, b) => b.value - a.value);

  const total = chartData.reduce((acc, cur) => acc + cur.value, 0);

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
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPie width={400} height={400}>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </RechartsPie>
          </ResponsiveContainer>
        ) : (
          <div className="text-gray-300 font-bold">No Data</div>
        )}
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
        {chartData.map((cat, i) => (
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
