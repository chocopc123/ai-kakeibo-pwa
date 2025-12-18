"use client";

import { Home, History, PieChart, Repeat, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { CalculatorDrawer } from "@/components/forest/CalculatorDrawer";
import { usePathname } from "next/navigation";
import { NavButton } from "@/components/leaf/NavButton";
import { useSWRConfig } from "swr";

export function BottomNav() {
  const pathname = usePathname();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { mutate } = useSWRConfig();

  const isActive = (path: string) => pathname === path;

  const handleSave = async (data: any) => {
    const newExpense = {
      id: Math.random().toString(36).substr(2, 9), // Temporary ID
      amount: Number(data.amount),
      date: data.date,
      note: data.note,
      type: data.type,
      categoryId: data.category.id,
      category: data.category, // Include full category for display
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: "loading", // Placeholder
    };

    try {
      setIsDrawerOpen(false); // Close immediately

      // Optimistic Update for Expenses List
      await mutate(
        "/api/expenses",
        (currentData: any[] | undefined) => {
          return [newExpense, ...(currentData || [])];
        },
        false // Do not revalidate immediately
      );

      // Optimistic Update for Stats (Approximate)
      await mutate(
        "/api/expenses/stats",
        (currentStats: any | undefined) => {
          if (!currentStats) return undefined;
          const isExpense = data.type === "expense";
          const amount = Number(data.amount);
          return {
            ...currentStats,
            monthlyExpense: isExpense
              ? currentStats.monthlyExpense + amount
              : currentStats.monthlyExpense,
            monthlyIncome: !isExpense
              ? currentStats.monthlyIncome + amount
              : currentStats.monthlyIncome,
            totalAssets: isExpense
              ? currentStats.totalAssets - amount
              : currentStats.totalAssets + amount,
          };
        },
        false
      );

      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: data.amount,
          date: data.date,
          categoryId: data.category.id, // Ensure we send ID
          note: data.note,
          type: data.type,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save expense");
      }

      // Revalidate to get authoritative data (background)
      mutate("/api/expenses");
      mutate("/api/expenses/stats");
    } catch (error) {
      console.error("Save error:", error);
      alert("保存に失敗しました。");
      // Rollback
      mutate("/api/expenses");
      mutate("/api/expenses/stats");
    }
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-2 pointer-events-none">
        <div className="glass-panel pointer-events-auto mx-auto max-w-md rounded-[32px] p-2 flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-white/50 bg-white/80 backdrop-blur-xl">
          <NavButton
            href="/"
            icon={Home}
            label="Home"
            isActive={isActive("/")}
          />
          <NavButton
            href="/history"
            icon={History}
            label="History"
            isActive={isActive("/history")}
          />

          {/* Central Add Button */}
          <div className="relative -mt-2 mx-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsDrawerOpen(true)}
              className="w-16 h-16 rounded-full bg-linear-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/40 text-white border-4 border-white cursor-pointer"
            >
              <Plus size={32} strokeWidth={2.5} />
            </motion.button>
          </div>

          <NavButton
            href="/assets"
            icon={PieChart}
            label="Assets"
            isActive={isActive("/assets")}
          />
          <NavButton
            href="/recurring"
            icon={Repeat}
            label="Recurring"
            isActive={isActive("/recurring")}
          />
        </div>
      </div>

      <CalculatorDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSave={handleSave}
      />
    </>
  );
}
