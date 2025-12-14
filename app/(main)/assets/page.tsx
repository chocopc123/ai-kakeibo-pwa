"use client";

import {
  Wallet,
  TrendingUp,
  Building2,
  PiggyBank,
  ArrowUpRight,
} from "lucide-react";
import { motion } from "framer-motion";

export default function AssetsPage() {
  return (
    <div className="min-h-screen bg-gray-50/50 pb-32 p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Portfolio</h1>
        <button className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full">
          Manage
        </button>
      </div>

      {/* Total Card */}
      <div className="relative overflow-hidden rounded-[32px] bg-black p-8 text-white shadow-xl shadow-gray-200">
        <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-bl from-indigo-500 via-purple-500 to-pink-500 rounded-full blur-[80px] opacity-40" />

        <div className="relative z-10 space-y-6">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Net Worth
            </p>
            <h2 className="text-4xl font-black tracking-tight">¥1,240,500</h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 flex-1 border border-white/10">
              <span className="text-xs text-gray-400 block mb-1">Asset</span>
              <span className="text-lg font-bold">¥1.8M</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 flex-1 border border-white/10">
              <span className="text-xs text-gray-400 block mb-1">
                Liability
              </span>
              <span className="text-lg font-bold">¥560k</span>
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-gray-900">Breakdown</h3>

        <AssetItem
          icon={Wallet}
          color="bg-blue-50 text-blue-600"
          label="Cash & Bank"
          amount="¥450,000"
          percent={36}
          barColor="bg-blue-500"
        />
        <AssetItem
          icon={TrendingUp}
          color="bg-purple-50 text-purple-600"
          label="Investments"
          amount="¥720,500"
          percent={58}
          barColor="bg-purple-500"
        />
        <AssetItem
          icon={PiggyBank}
          color="bg-green-50 text-green-600"
          label="Savings"
          amount="¥70,000"
          percent={6}
          barColor="bg-green-500"
        />
      </div>
    </div>
  );
}

function AssetItem({
  icon: Icon,
  color,
  label,
  amount,
  percent,
  barColor,
}: {
  icon: any;
  color: string;
  label: string;
  amount: string;
  percent: number;
  barColor: string;
}) {
  return (
    <div className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center ${color}`}
          >
            <Icon size={20} />
          </div>
          <span className="font-bold text-gray-900">{label}</span>
        </div>
        <div className="text-right">
          <span className="block font-bold text-gray-900">{amount}</span>
          <span className="text-xs text-gray-400">{percent}%</span>
        </div>
      </div>
      {/* Bar */}
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full rounded-full ${barColor}`}
        />
      </div>
    </div>
  );
}
