"use client";

import useSWR from "swr";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Define the API response type for an expense
// (Include category based on the prisma include)
interface ApiExpense {
  id: string;
  amount: number;
  date: string;
  note: string | null;
  category: {
    id: string;
    label: string;
    icon: string;
    color: string;
  };
}

// Fetcher function for SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json());

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
  const {
    data: expenses,
    error,
    isLoading,
  } = useSWR<ApiExpense[]>("/api/expenses", fetcher);

  if (isLoading) {
    return <div className="text-center p-8 text-gray-500">Loading...</div>;
  }

  if (error) {
    return (
      <div className="text-center p-8 text-red-500">
        Failed to load expenses
      </div>
    );
  }

  if (!expenses || expenses.length === 0) {
    return <div className="text-center p-8 text-gray-400">No expenses yet</div>;
  }

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
        {expenses.map((data) => (
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
                  data.category.color
                )}
              >
                {data.category.icon}
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-400 tracking-wide uppercase">
                  {/* Format date: YYYY-MM-DD to YYYY.MM.DD */}
                  {new Date(data.date)
                    .toISOString()
                    .split("T")[0]
                    .replace(/-/g, ".")}
                </span>
                <span className="text-gray-800 font-bold text-sm">
                  {data.note || data.category.label}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-end">
              <span className="text-lg font-bold text-gray-900">
                ¥{data.amount.toLocaleString()}
              </span>
              <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                {data.category.label}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
