import { cn } from "@/lib/utils";
import React from "react";

export function NumBtn({
  num,
  onClick,
  className,
}: {
  num: string;
  onClick: (n: string) => void;
  className?: string;
}) {
  return (
    <button
      onClick={() => onClick(num)}
      className={cn(
        "h-[72px] rounded-[24px] bg-white text-2xl font-bold text-gray-800 shadow-sm border border-gray-100 active:bg-gray-50 active:scale-95 transition-all flex items-center justify-center",
        className
      )}
    >
      {num}
    </button>
  );
}

export function OpBtn({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "h-[72px] rounded-[24px] bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center active:scale-95 transition-all",
        className
      )}
    >
      {children}
    </button>
  );
}

export function ActionBtn({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "h-[72px] rounded-[24px] flex items-center justify-center active:scale-95 transition-all",
        className
      )}
    >
      {children}
    </button>
  );
}
