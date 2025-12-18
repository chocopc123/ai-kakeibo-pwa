import React, { useState } from "react";
import {
  ChevronLeft,
  X,
  Plus,
  Edit2,
  Trash2,
  Check,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Category } from "@/types/ui";
import { motion, AnimatePresence } from "framer-motion";

interface CategoryEditorStepProps {
  currentPath: Category[];
  categories: Category[];
  editingCategory: Category | null;
  newCatName: string;
  newCatIcon: string;
  onBack: () => void;
  onCreate: () => void;
  onClose: () => void;
  onSelect: (cat: Category) => void;
  onEdit: (cat: Category) => void;
  onDelete: (cat: Category) => void;
  onNameChange: (val: string) => void;
  onIconChange: (val: string) => void;
  onSaveCategory: () => void;
  onCancelEdit: () => void;
}

export default function CategoryEditorStep({
  currentPath,
  categories,
  editingCategory,
  newCatName,
  newCatIcon,
  onBack,
  onCreate,
  onClose,
  onSelect,
  onEdit,
  onDelete,
  onNameChange,
  onIconChange,
  onSaveCategory,
  onCancelEdit,
}: CategoryEditorStepProps) {
  const [showIconPicker, setShowIconPicker] = useState(false);

  return (
    <div className="flex flex-col h-full bg-white rounded-[32px] overflow-hidden relative">
      <div className="bg-white p-6 pb-4 border-b border-gray-100 z-10 sticky top-0">
        <div className="flex items-center justify-between">
          {/* Back Button */}
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-600 active:scale-95 transition-all hover:bg-gray-100"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Title & Path */}
          <div className="flex flex-col items-center">
            <h3 className="font-bold text-gray-900 text-lg leading-none">
              Manage
            </h3>
            <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full mt-1">
              {currentPath.length > 0
                ? currentPath[currentPath.length - 1].label
                : "Root Level"}
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={onCreate}
              className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200 active:scale-95 transition-all hover:bg-indigo-700"
            >
              <Plus size={20} />
            </button>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-gray-50 border border-gray-200 text-gray-400 flex items-center justify-center active:scale-95 transition-all hover:bg-gray-100 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
        {categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center space-y-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-3xl text-gray-300">
              📭
            </div>
            <div>
              <p className="font-bold text-gray-400">No categories here</p>
              <p className="text-xs text-gray-400">Tap + to create one</p>
            </div>
          </div>
        ) : (
          categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onSelect(cat)}
              className="group relative bg-white rounded-[24px] p-4 flex items-center justify-between shadow-sm border border-gray-100 hover:shadow-lg hover:border-indigo-100 transition-all duration-300 cursor-pointer overflow-hidden"
            >
              {/* Hover Highlight */}
              <div className="absolute inset-0 bg-indigo-50/0 group-hover:bg-indigo-50/30 transition-colors pointer-events-none" />

              <div className="flex items-center gap-4 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-gray-50 to-gray-100 border border-white shadow-inner flex items-center justify-center text-3xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  {cat.icon}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-lg leading-tight group-hover:text-indigo-900 transition-colors">
                    {cat.label}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-400 group-hover:bg-indigo-100 group-hover:text-indigo-500 transition-colors">
                      {cat.children?.length ?? 0} items
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 relative z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(cat);
                  }}
                  className="w-10 h-10 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-white hover:text-indigo-600 hover:shadow-md transition-all active:scale-90"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(cat);
                  }}
                  className="w-10 h-10 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-white hover:text-red-500 hover:shadow-md transition-all active:scale-90"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Premium Add/Edit Overlay */}
      <AnimatePresence>
        {editingCategory && (
          <div className="absolute inset-0 z-20 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-md"
              onClick={onCancelEdit}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
                transition: {
                  type: "spring",
                  damping: 25,
                  stiffness: 300,
                },
              }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-xs rounded-[40px] p-8 relative z-30 shadow-2xl shadow-indigo-500/20"
            >
              <div className="flex flex-col items-center space-y-6">
                <div className="text-center space-y-1">
                  <h4 className="text-xl font-black text-gray-900 tracking-tight">
                    {editingCategory.id === "new"
                      ? "New Category"
                      : "Edit Category"}
                  </h4>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    {currentPath.length > 0
                      ? `in ${currentPath[currentPath.length - 1].label}`
                      : "Root Level"}
                  </p>
                </div>

                <div className="flex flex-col items-center space-y-4">
                  <button
                    onClick={() => setShowIconPicker(!showIconPicker)}
                    className="relative group cursor-pointer"
                  >
                    <div className="w-24 h-24 rounded-full bg-linear-to-br from-indigo-50 to-purple-50 border-4 border-white shadow-xl flex items-center justify-center text-5xl group-hover:scale-105 transition-transform duration-300">
                      {newCatIcon}
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-full flex items-center justify-center border border-gray-100 shadow-md text-indigo-600">
                      <RefreshCw
                        size={18}
                        className={cn(
                          showIconPicker && "rotate-180 transition-transform"
                        )}
                      />
                    </div>
                  </button>

                  <AnimatePresence>
                    {showIconPicker && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="w-full bg-gray-50 rounded-2xl p-3 border border-gray-100 overflow-hidden"
                      >
                        <div className="grid grid-cols-6 gap-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                          {[
                            "🍔",
                            "🍱",
                            "🍽️",
                            "☕",
                            "🥦",
                            "🍎",
                            "🚕",
                            "🚃",
                            "🚲",
                            "✈️",
                            "⛽",
                            "🏠",
                            "🧻",
                            "🚿",
                            "💊",
                            "💄",
                            "👕",
                            "👟",
                            "🎮",
                            "🎬",
                            "📚",
                            "🎨",
                            "🎈",
                            "🎁",
                            "💰",
                            "💳",
                            "📈",
                            "💼",
                            "🏢",
                            "🏫",
                            "🐶",
                            "🐱",
                            "🌱",
                            "☀️",
                            "☁️",
                            "🌙",
                            "📁",
                            "📝",
                            "⚙️",
                            "🔧",
                            "📱",
                            "💻",
                            "⚡",
                            "🔥",
                            "🌈",
                            "⭐",
                            "❤️",
                            "🔔",
                          ].map((emoji) => (
                            <button
                              key={emoji}
                              onClick={() => {
                                onIconChange(emoji);
                                setShowIconPicker(false);
                              }}
                              className={cn(
                                "w-10 h-10 flex items-center justify-center text-2xl rounded-xl transition-all active:scale-90",
                                newCatIcon === emoji
                                  ? "bg-indigo-100 border-2 border-indigo-400"
                                  : "hover:bg-white"
                              )}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="w-full space-y-3">
                  <div className="bg-gray-50 px-4 py-3 rounded-2xl border border-gray-100 focus-within:border-indigo-500/50 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                    <input
                      type="text"
                      className="w-full bg-transparent font-bold text-gray-900 outline-none text-center placeholder:text-gray-300"
                      placeholder="Category Name"
                      value={newCatName}
                      onChange={(e) => onNameChange(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex gap-3 w-full">
                  <button
                    onClick={onCancelEdit}
                    className="flex-1 py-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onSaveCategory}
                    className="flex-1 py-4 bg-indigo-600 rounded-2xl font-bold text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Check size={20} /> Save
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
