"use client";

import { Calendar, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const SUBSCRIPTIONS = [
  {
    id: 1,
    name: "Netflix Premium",
    amount: 1980,
    cycle: "Monthly",
    next: "Dec 25",
    logo: "N",
    color: "bg-red-600 text-white",
  },
  {
    id: 2,
    name: "Spotify Duo",
    amount: 1280,
    cycle: "Monthly",
    next: "Dec 28",
    logo: "S",
    color: "bg-green-500 text-white",
  },
  {
    id: 3,
    name: "Amazon Prime",
    amount: 600,
    cycle: "Monthly",
    next: "Jan 05",
    logo: "a",
    color: "bg-blue-400 text-white",
  },
  {
    id: 4,
    name: "Room Rent",
    amount: 85000,
    cycle: "Monthly",
    next: "Dec 27",
    logo: "🏠",
    color: "bg-orange-100 text-orange-600",
  },
  {
    id: 5,
    name: "Gym Membership",
    amount: 7500,
    cycle: "Monthly",
    next: "Jan 01",
    logo: "💪",
    color: "bg-gray-800 text-white",
  },
];

export default function RecurringPage() {
  const totalFixed = SUBSCRIPTIONS.reduce((acc, item) => acc + item.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50/50 pb-32 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Fixed & Subs</h1>
        <button className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full">
          + Add New
        </button>
      </div>

      {/* Summary */}
      <div className="bg-indigo-600 text-white p-6 rounded-[28px] shadow-lg shadow-indigo-500/20 flex items-center justify-between">
        <div>
          <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-1">
            Total Fixed Cost
          </p>
          <h2 className="text-3xl font-black">
            ¥{totalFixed.toLocaleString()}
          </h2>
          <p className="text-indigo-200 text-xs mt-1">/ month</p>
        </div>
        <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
          <Calendar size={24} />
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-gray-900">Upcoming Payments</h3>

        {SUBSCRIPTIONS.map((sub) => (
          <div
            key={sub.id}
            className="bg-white p-4 rounded-[24px] border border-gray-100 shadow-sm flex items-center justify-between group cursor-pointer hover:border-indigo-100 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold shadow-xs",
                  sub.color
                )}
              >
                {sub.logo}
              </div>
              <div>
                <p className="font-bold text-gray-900">{sub.name}</p>
                <p className="text-xs text-gray-400 font-medium">
                  {sub.cycle} • {sub.next}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-900">
                ¥{sub.amount.toLocaleString()}
              </p>
              <div className="flex items-center justify-end gap-1 text-xs text-gray-400 mt-1">
                <AlertCircle size={10} />
                <span>Due soon</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
