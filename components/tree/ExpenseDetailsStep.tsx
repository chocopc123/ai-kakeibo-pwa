import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  Settings2,
  PlusCircle,
  Check,
} from "lucide-react";
import { Category } from "@/types/ui";

interface ExpenseDetailsStepProps {
  amount: number | null;
  category: Category;
  note: string;
  customFields: { label: string; value: string }[];
  onBack: () => void;
  onChangeCategory: () => void;
  onChangeNote: (val: string) => void;
  onChangeCustomField: (index: number, val: string) => void;
  onOpenPatternModal: () => void;
  onSave: () => void;
}

export default function ExpenseDetailsStep({
  amount,
  category,
  note,
  customFields,
  onBack,
  onChangeCategory,
  onChangeNote,
  onChangeCustomField,
  onOpenPatternModal,
  onSave,
}: ExpenseDetailsStepProps) {
  return (
    <div className="flex flex-col h-full bg-gray-50 rounded-[32px] p-6 overflow-y-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600"
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase">Expense</p>
          <h2 className="text-2xl font-black text-gray-900">
            ¥{amount?.toLocaleString()}
          </h2>
        </div>
      </div>

      {/* Category Selection Trigger */}
      <div className="mb-6 space-y-3">
        <label className="text-xs font-bold text-gray-400 uppercase">
          Category
        </label>
        <button
          onClick={onChangeCategory}
          className="w-full bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between hover:border-indigo-200 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{category.icon}</span>
            <span className="font-bold text-gray-900">{category.label}</span>
          </div>
          <div className="flex items-center gap-2 text-indigo-600 text-sm font-bold">
            Change <ChevronRight size={16} />
          </div>
        </button>
      </div>

      {/* Note */}
      <div className="mb-6 space-y-3">
        <label className="text-xs font-bold text-gray-400 uppercase">
          Note
        </label>
        <textarea
          value={note}
          onChange={(e) => onChangeNote(e.target.value)}
          placeholder="Add a note..."
          className="w-full bg-white rounded-2xl p-4 text-sm font-medium border-none focus:ring-2 focus:ring-indigo-500/20 outline-none resize-none h-20 shadow-sm"
        />
      </div>

      {/* Custom Fields */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1">
            <Settings2 size={12} /> Custom Items
          </label>
          <button
            onClick={onOpenPatternModal}
            className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md flex items-center gap-1 active:scale-95 transition-transform"
          >
            <PlusCircle size={12} /> Add Pattern
          </button>
        </div>

        <div className="space-y-3 pb-20">
          {customFields.length === 0 ? (
            <div className="text-center py-4 bg-white/50 rounded-2xl border border-dashed border-gray-200">
              <p className="text-xs text-gray-400">
                No custom patterns for {category.label}
              </p>
            </div>
          ) : (
            customFields.map((field, i) => (
              <div
                key={i}
                className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm"
              >
                <div className="bg-gray-100 px-3 py-2 rounded-xl text-xs font-bold text-gray-600 min-w-[30%] text-center">
                  {field.label}
                </div>
                <input
                  type="text"
                  placeholder="Value"
                  value={field.value}
                  onChange={(e) => onChangeCustomField(i, e.target.value)}
                  className="flex-1 bg-transparent font-bold text-gray-900 outline-none text-right pr-4"
                />
              </div>
            ))
          )}
        </div>
      </div>

      <div className="absolute bottom-6 left-6 right-6">
        <button
          onClick={onSave}
          className="w-full bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-[24px] py-4 font-bold shadow-lg shadow-indigo-500/30 active:scale-95 transition-transform flex items-center justify-center gap-2"
        >
          <Check size={20} strokeWidth={3} />
          Save Transaction
        </button>
      </div>
    </div>
  );
}
