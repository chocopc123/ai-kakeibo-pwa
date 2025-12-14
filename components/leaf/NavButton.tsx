import Link from "next/link";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import React from "react";

interface NavButtonProps {
  href: string;
  icon: React.ElementType;
  label: string;
  isActive: boolean;
}

export function NavButton({
  href,
  icon: Icon,
  label,
  isActive,
}: NavButtonProps) {
  return (
    <Link
      href={href}
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
    </Link>
  );
}
