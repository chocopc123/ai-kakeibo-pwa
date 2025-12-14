"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const MOCK_DATA = [
  {
    id: 1,
    date: "2025-12-14",
    category: "food",
    categoryLabel: "食費",
    categoryIcon: "🍔",
    description: "ランチ（パスタ）",
    amount: 1200,
    color: "bg-orange-100 text-orange-600",
  },
  {
    id: 2,
    date: "2025-12-14",
    category: "transport",
    categoryLabel: "交通費",
    categoryIcon: "qh",
    description: "タクシー代",
    amount: 2500,
    color: "bg-blue-100 text-blue-600",
  },
  {
    id: 3,
    date: "2025-12-13",
    category: "daily",
    categoryLabel: "日用品",
    categoryIcon: "🧻",
    description: "トイレットペーパー他",
    amount: 850,
    color: "bg-green-100 text-green-600",
  },
  {
    id: 4,
    date: "2025-12-12",
    category: "entertainment",
    categoryLabel: "交際費",
    categoryIcon: "🍺",
    description: "飲み会",
    amount: 5000,
    color: "bg-purple-100 text-purple-600",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 },
};

export function ExpenseList() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="w-full max-w-md mx-auto mt-8 pb-10"
    >
      <div className="flex items-center justify-between mb-6 px-4">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <span className="w-1 h-6 rounded-full bg-indigo-500" />
          Recent History
        </h3>
        <button className="text-xs font-bold text-indigo-500 hover:text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full transition-colors">
          View All
        </button>
      </div>

      <div className="space-y-4 px-2">
        {MOCK_DATA.map((data, index) => (
          <motion.div
            key={data.id}
            variants={item}
            whileHover={{
              scale: 1.02,
              backgroundColor: "rgba(255, 255, 255, 0.95)",
            }}
            className="group glass-card rounded-[20px] p-4 flex items-center justify-between cursor-pointer transition-all"
          >
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-xs transition-transform group-hover:scale-110",
                  data.color
                )}
              >
                {data.categoryIcon}
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-400 tracking-wide uppercase">
                  {data.date.replace(/-/g, ".")}
                </span>
                <span className="text-gray-800 font-bold text-sm">
                  {data.description}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-end">
              <span className="text-lg font-bold text-gray-900">
                ¥{data.amount.toLocaleString()}
              </span>
              <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                {data.categoryLabel}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
