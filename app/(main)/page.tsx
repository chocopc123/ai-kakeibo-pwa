"use client";

import useSWR from "swr";
import {
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Calendar,
  Wallet,
  PieChart,
} from "lucide-react";

interface Stats {
  monthlyExpense: number;
  monthlyIncome: number;
  totalAssets: number;
  month: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DashboardPage() {
  const { data: stats, isLoading } = useSWR<Stats>(
    "/api/expenses/stats",
    fetcher
  );

  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-500">Loading dashboard...</div>
    );
  }

  const {
    monthlyExpense = 0,
    monthlyIncome = 0,
    totalAssets = 0,
    month = "---",
  } = stats || {};

  // Simple calculation for budget percentage (assuming 200k budget for now or just ratio)
  // Let's just use a dummy budget of 200,000 for the progress bar visual
  const dummyBudget = 200000;
  const budgetPercent = Math.min(
    100,
    Math.round((monthlyExpense / dummyBudget) * 100)
  );

  return (
    <div className="p-4 space-y-4 pb-32">
      {/* Header Info: Total Assets */}
      <div className="flex items-center justify-between py-2 px-2">
        <div>
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Total Assets
          </h2>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            ¥{totalAssets.toLocaleString()}
          </h1>
        </div>
        <div className="w-10 h-10 rounded-full bg-linear-to-tr from-indigo-500 to-purple-500 p-[2px] shadow-lg shadow-indigo-500/20 cursor-pointer hover:scale-105 transition-transform">
          <div className="w-full h-full rounded-full bg-white border-2 border-white overflow-hidden">
            <img
              src="https://api.dicebear.com/7.x/notionists/svg?seed=Felix"
              alt="User"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Main Card: Monthly Spending */}
        <div className="col-span-2 bg-black text-white rounded-[32px] p-8 relative overflow-hidden group shadow-xl shadow-gray-200">
          <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500 rounded-full blur-[80px] opacity-40 group-hover:opacity-60 transition-opacity" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500 rounded-full blur-[60px] opacity-30 group-hover:opacity-50 transition-opacity" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <span className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                <Calendar size={12} />
                {month}
              </span>
              {/* Dummy comparison for now */}
              <span className="flex items-center gap-1 text-xs font-bold text-green-400 bg-green-400/20 px-2 py-1 rounded-full border border-green-400/20">
                <ArrowDownRight size={12} />
                N/A% vs last
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-sm text-gray-400">Monthly Spending</span>
              <h3 className="text-5xl font-light tabular-nums tracking-tighter">
                ¥{monthlyExpense.toLocaleString()}
              </h3>
            </div>

            {/* Progress Bar */}
            <div className="mt-8 space-y-2">
              <div className="flex justify-between text-xs font-medium text-gray-400">
                <span>{budgetPercent}% of Budget (est.)</span>
                <span>
                  ¥{(dummyBudget - monthlyExpense).toLocaleString()} left
                </span>
              </div>
              <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full shadow-[0_0_20px_rgba(99,102,241,0.5)]"
                  style={{ width: `${budgetPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Income Card */}
        <div className="col-span-2 bg-white p-6 rounded-[32px] border border-white/60 shadow-lg shadow-indigo-100/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-5">
            <TrendingUp size={120} />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-green-400" />
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Monthly Income
              </h3>
            </div>
            <p className="text-3xl font-black text-green-600 tracking-tight">
              +¥{monthlyIncome.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 mt-1 font-medium">
              Recorded this month
            </p>
          </div>
        </div>

        {/* Asset Breakdown (Placeholder for Assets tab preview) */}
        <div className="bg-white p-5 rounded-[28px] border border-white/60 shadow-lg shadow-indigo-100/50 flex flex-col justify-between h-36">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Wallet size={20} />
          </div>
          <div>
            <span className="text-xs font-bold text-gray-400 block mb-0.5">
              Cash
            </span>
            <span className="text-xl font-black text-gray-900">30%</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-[28px] border border-white/60 shadow-lg shadow-indigo-100/50 flex flex-col justify-between h-36">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600">
            <PieChart size={20} />
          </div>
          <div>
            <span className="text-xs font-bold text-gray-400 block mb-0.5">
              Invest
            </span>
            <span className="text-xl font-black text-gray-900">70%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
