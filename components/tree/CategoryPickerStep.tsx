import React from "react";
import { ChevronLeft, Edit2, X, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Category } from "@/types/ui";

interface CategoryPickerStepProps {
  currentPath: Category[];
  categories: Category[]; // The list to display (siblings at current level)
  onBack: () => void;
  onSelect: (cat: Category) => void;
  onBreadcrumbClick: (path: Category[]) => void;
  onManage: () => void;
  onClose: () => void;
}

export default function CategoryPickerStep({
  currentPath,
  categories,
  onBack,
  onSelect,
  onBreadcrumbClick,
  onManage,
  onClose,
}: CategoryPickerStepProps) {
  return (
    <div className="flex flex-col h-full bg-white rounded-[32px] overflow-hidden">
      <div className="bg-gray-50 p-6 pb-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 active:scale-95 transition-all hover:bg-gray-50 shadow-sm"
          >
            <ChevronLeft size={20} />
          </button>
          <h3 className="font-bold text-gray-900">Select Category</h3>
          <div className="flex gap-2">
            <button
              onClick={onManage}
              className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm active:scale-95 transition-all hover:bg-indigo-100"
            >
              <Edit2 size={18} />
            </button>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center active:scale-95 transition-all hover:bg-gray-200 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          </div>
        </div>
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm overflow-x-auto scrollbar-hide">
          <span
            onClick={() => onBreadcrumbClick([])}
            className={cn(
              "font-bold whitespace-nowrap cursor-pointer transition-colors hover:text-indigo-500",
              currentPath.length === 0 ? "text-indigo-600" : "text-gray-400"
            )}
          >
            Root
          </span>
          {currentPath.map((cat, i) => (
            <div key={cat.id} className="flex items-center gap-2">
              <ChevronRight size={14} className="text-gray-300" />
              <span
                className={cn(
                  "font-bold whitespace-nowrap",
                  i === currentPath.length - 1
                    ? "text-indigo-600"
                    : "text-gray-400"
                )}
              >
                {cat.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelect(cat)}
              className="aspect-square bg-gray-50 rounded-3xl flex flex-col items-center justify-center gap-2 hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-transparent hover:border-indigo-100 active:scale-95"
            >
              <span className="text-4xl">{cat.icon}</span>
              <span className="font-bold text-sm">{cat.label}</span>
              {(cat.children?.length ?? 0) > 0 && (
                <span className="text-[10px] bg-white px-2 py-0.5 rounded-full text-gray-400 border border-gray-100">
                  {cat.children?.length ?? 0} items
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
