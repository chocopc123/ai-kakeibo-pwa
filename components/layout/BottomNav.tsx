"use client";

import { Home, History, PieChart, Repeat, Plus, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useState } from "react";
import { CalculatorDrawer } from "@/components/expense/CalculatorDrawer";

export function BottomNav() {
  const activeTab = "home";
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-6 right-6 z-40">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsDrawerOpen(true)}
          className="w-14 h-14 rounded-full bg-linear-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/40 text-white border-2 border-white/20 cursor-pointer backdrop-blur-sm"
        >
          <Plus size={28} strokeWidth={2.5} />
        </motion.button>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 px-6 pb-6 pt-2 pointer-events-none">
        <div className="glass-panel pointer-events-auto mx-auto max-w-sm rounded-[32px] p-2 flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-white/50 bg-white/80 backdrop-blur-xl">
          <NavButton icon={Home} label="Home" isActive={activeTab === "home"} />
          <NavButton
            icon={History}
            label="History"
            isActive={activeTab === "history"}
          />
          <NavButton
            icon={PieChart}
            label="Assets"
            isActive={activeTab === "assets"}
          />
          <NavButton
            icon={Repeat}
            label="Recurring"
            isActive={activeTab === "recurring"}
          />
        </div>
      </div>

      <CalculatorDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSave={(amount, category, date) => {
          console.log("Saved", amount, category, date);
          setIsDrawerOpen(false);
        }}
      />
    </>
  );
}

function NavButton({
  icon: Icon,
  label,
  isActive,
}: {
  icon: any;
  label: string;
  isActive: boolean;
}) {
  return (
    <button
      className={cn(
        "flex-1 flex flex-col items-center justify-center gap-1 py-2 px-1 relative cursor-pointer active:scale-95 transition-transform rounded-2xl",
        isActive ? "text-indigo-600" : "text-gray-400 hover:bg-gray-50/50"
      )}
    >
      {isActive && (
        <motion.div
          layoutId="navIndicator"
          className="absolute -top-1 w-8 h-1 rounded-full bg-indigo-600"
        />
      )}
      <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
      <span className="text-[9px] font-bold tracking-tight">{label}</span>
    </button>
  );
}
