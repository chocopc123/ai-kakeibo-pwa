"use client";

import { useState } from "react";
import { Drawer } from "vaul";
import {
  Delete,
  Divide,
  Plus,
  Minus,
  X as Multiply,
  Check,
  Tag,
  Calendar,
  ChevronLeft,
  Settings2,
  PlusCircle,
  X,
  ChevronRight,
  Edit2,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { evaluate } from "mathjs";
import { motion, AnimatePresence } from "framer-motion";

interface CalculatorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}

// Category Type Definition
type Category = {
  id: string;
  label: string;
  icon: string;
  color: string;
  children?: Category[];
  parentId?: string;
};

// Initial Mock Categories (Hierarchical)
const INITIAL_CATEGORIES: Category[] = [
  {
    id: "food",
    label: "Food",
    icon: "🍔",
    color: "bg-orange-100 text-orange-600",
    children: [
      {
        id: "lunch",
        label: "Lunch",
        icon: "🍱",
        color: "bg-orange-50 text-orange-500",
        parentId: "food",
      },
      {
        id: "dinner",
        label: "Dinner",
        icon: "🍽️",
        color: "bg-orange-50 text-orange-500",
        parentId: "food",
      },
      {
        id: "cafe",
        label: "Cafe",
        icon: "☕",
        color: "bg-orange-50 text-orange-500",
        parentId: "food",
      },
      {
        id: "grocery",
        label: "Grocery",
        icon: "🥦",
        color: "bg-orange-50 text-orange-500",
        parentId: "food",
      },
    ],
  },
  {
    id: "transport",
    label: "Transport",
    icon: "🚕",
    color: "bg-blue-100 text-blue-600",
    children: [
      {
        id: "train",
        label: "Train",
        icon: "🚃",
        color: "bg-blue-50 text-blue-500",
        parentId: "transport",
      },
      {
        id: "taxi",
        label: "Taxi",
        icon: "🚕",
        color: "bg-blue-50 text-blue-500",
        parentId: "transport",
      },
    ],
  },
  {
    id: "daily",
    label: "Daily",
    icon: "🧻",
    color: "bg-green-100 text-green-600",
  },
  {
    id: "ent",
    label: "Entertain",
    icon: "🎮",
    color: "bg-purple-100 text-purple-600",
  },
];

export function CalculatorDrawer({
  isOpen,
  onClose,
  onSave,
}: CalculatorDrawerProps) {
  // Steps: calculator -> details -> categoryPicker -> categoryEditor
  type Step = "calculator" | "details" | "categoryPicker" | "categoryEditor";
  const [step, setStep] = useState<Step>("calculator");

  const [expression, setExpression] = useState("0");
  const [finalAmount, setFinalAmount] = useState<number | null>(null);

  // Data
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState<Category>(
    INITIAL_CATEGORIES[0]
  );

  // Details State
  const [note, setNote] = useState("");
  const [customFields, setCustomFields] = useState<
    { label: string; value: string }[]
  >([]);

  // Custom Pattern Management
  const [categoryPatterns, setCategoryPatterns] = useState<
    Record<string, string[]>
  >({
    transport: ["Mileage (km)", "Fuel (L)"],
  });
  const [isPatternModalOpen, setIsPatternModalOpen] = useState(false);
  const [newPatternName, setNewPatternName] = useState("");

  // Category Picker/Editor State
  const [currentPickerPath, setCurrentPickerPath] = useState<Category[]>([]); // For breadcrumb navigation
  const [editingCategory, setEditingCategory] = useState<Category | null>(null); // For edit modal
  const [newCatName, setNewCatName] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("📁");

  // -- Calculator Logic --
  const handleInput = (val: string) => {
    const isOperator = ["+", "-", "*", "/"].includes(val);
    if (expression === "0" && !isOperator) {
      setExpression(val);
      return;
    }
    if (isOperator && ["+", "-", "*", "/"].includes(expression.slice(-1))) {
      setExpression((prev) => prev.slice(0, -1) + val);
      return;
    }
    setExpression((prev) => prev + val);
  };

  const handleDelete = () =>
    expression.length > 1
      ? setExpression((prev) => prev.slice(0, -1))
      : setExpression("0");
  const handleClear = () => setExpression("0");

  const handleCalculate = () => {
    try {
      let evalExpr = expression;
      if (["+", "-", "*", "/"].includes(evalExpr.slice(-1)))
        evalExpr = evalExpr.slice(0, -1);
      return evaluate(evalExpr);
    } catch {
      return null;
    }
  };

  const handleEqual = () => {
    const res = handleCalculate();
    if (res !== null) setExpression(res.toString());
  };

  const handleNext = () => {
    const res = handleCalculate();
    if (res !== null) {
      setFinalAmount(Number(res));
      setStep("details");
      loadCustomFieldsForCategory(selectedCategory.id);
    }
  };

  // -- Helper: Find current category level in picker --
  const getCurrentLevelCategories = () => {
    if (currentPickerPath.length === 0) return categories;
    const parent = currentPickerPath[currentPickerPath.length - 1];
    return parent.children || [];
  };

  // -- Category Logic --
  const handleCategorySelect = (cat: Category) => {
    if (cat.children && cat.children.length > 0) {
      // Dive deeper
      setCurrentPickerPath((prev) => [...prev, cat]);
    } else {
      // Select leaf
      setSelectedCategory(cat);
      setStep("details");
      loadCustomFieldsForCategory(cat.id);
      setCurrentPickerPath([]); // Reset path for search next time
    }
  };

  const handlePickerBack = () => {
    if (currentPickerPath.length > 0) {
      setCurrentPickerPath((prev) => prev.slice(0, -1));
    } else {
      setStep("details");
    }
  };

  const handleAddCategory = (parentId?: string) => {
    if (!newCatName.trim()) return;
    const newId = Math.random().toString(36).substr(2, 9);
    const newCat: Category = {
      id: newId,
      label: newCatName,
      icon: newCatIcon,
      color: "bg-gray-100 text-gray-600",
      parentId,
    };

    const addRecursive = (cats: Category[]): Category[] => {
      return cats.map((c) => {
        if (c.id === parentId) {
          return { ...c, children: [...(c.children || []), newCat] };
        }
        if (c.children) {
          return { ...c, children: addRecursive(c.children) };
        }
        return c;
      });
    };

    if (!parentId) {
      setCategories((prev) => [...prev, newCat]);
    } else {
      setCategories((prev) => addRecursive(prev));
    }

    setEditingCategory(null);
    setNewCatName("");
  };

  // -- Save Logic --
  const loadCustomFieldsForCategory = (catId: string) => {
    // Look up pattern for this category OR its parent(s)
    // Simply using current ID for now. Ideally should traverse up.
    const patterns = categoryPatterns[catId] || [];
    setCustomFields(patterns.map((label) => ({ label, value: "" })));
  };

  const handleSaveExpense = () => {
    if (finalAmount !== null) {
      onSave({
        amount: finalAmount,
        category: selectedCategory,
        date: new Date().toISOString(),
        note,
        customFields: customFields.filter((f) => f.value),
      });
      resetState();
    }
  };

  const resetState = () => {
    setExpression("0");
    setStep("calculator");
    setNote("");
    setFinalAmount(null);
    setCurrentPickerPath([]);
    onClose();
  };

  const handleAddPattern = () => {
    if (newPatternName.trim()) {
      setCategoryPatterns((prev) => ({
        ...prev,
        [selectedCategory.id]: [
          ...(prev[selectedCategory.id] || []),
          newPatternName,
        ],
      }));
      setCustomFields((prev) => [
        ...prev,
        { label: newPatternName, value: "" },
      ]);
      setNewPatternName("");
      setIsPatternModalOpen(false);
    }
  };

  return (
    <Drawer.Root open={isOpen} onOpenChange={(open) => !open && resetState()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
        <Drawer.Content className="bg-white flex flex-col rounded-t-[32px] mt-24 fixed bottom-0 left-0 right-0 z-50 h-[92vh] outline-none">
          <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-300 mt-4 mb-4" />
          <Drawer.Title className="sr-only">Expense Calculator</Drawer.Title>

          <div className="flex-1 flex flex-col p-4 max-w-md mx-auto w-full relative overflow-hidden">
            <AnimatePresence mode="wait">
              {/* === Step 1: Calculator === */}
              {step === "calculator" && (
                <motion.div
                  key="calculator"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col h-full"
                >
                  {/* Amount Display */}
                  <div className="flex flex-col items-end justify-center mb-6 px-4 space-y-1">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest self-center">
                      Amount
                    </span>
                    <div className="flex items-center justify-end w-full overflow-x-auto scrollbar-hide">
                      <span className="text-6xl font-black text-gray-900 tracking-tight whitespace-nowrap">
                        {expression.replace(/\*/g, "×").replace(/\//g, "÷")}
                      </span>
                    </div>
                  </div>

                  {/* Keypad */}
                  <div className="grid grid-cols-4 gap-3 bg-gray-50 p-4 rounded-[32px] flex-1">
                    <ActionBtn
                      onClick={handleClear}
                      className="bg-gray-200 text-gray-600 font-bold text-sm"
                    >
                      AC
                    </ActionBtn>
                    <ActionBtn
                      onClick={handleDelete}
                      className="bg-gray-200 text-gray-600"
                    >
                      <Delete size={22} />
                    </ActionBtn>
                    <OpBtn onClick={() => handleInput("/")}>
                      <Divide size={24} />
                    </OpBtn>
                    <OpBtn onClick={() => handleInput("*")}>
                      <Multiply size={24} />
                    </OpBtn>

                    <NumBtn num="7" onClick={handleInput} />
                    <NumBtn num="8" onClick={handleInput} />
                    <NumBtn num="9" onClick={handleInput} />
                    <OpBtn onClick={() => handleInput("-")}>
                      <Minus size={24} />
                    </OpBtn>

                    <NumBtn num="4" onClick={handleInput} />
                    <NumBtn num="5" onClick={handleInput} />
                    <NumBtn num="6" onClick={handleInput} />
                    <OpBtn onClick={() => handleInput("+")}>
                      <Plus size={24} />
                    </OpBtn>

                    <div className="col-span-3 grid grid-cols-3 gap-3">
                      <NumBtn num="1" onClick={handleInput} />
                      <NumBtn num="2" onClick={handleInput} />
                      <NumBtn num="3" onClick={handleInput} />
                      <NumBtn num="0" onClick={handleInput} />
                      <NumBtn num="00" onClick={handleInput} />
                      <NumBtn num="." onClick={handleInput} />
                    </div>

                    <div className="flex flex-col gap-3 h-full">
                      <button
                        onClick={handleEqual}
                        className="h-[72px] bg-indigo-100 text-indigo-600 rounded-[24px] flex items-center justify-center shadow-xs active:scale-95 transition-transform"
                      >
                        <span className="text-2xl font-bold">=</span>
                      </button>
                      <button
                        onClick={handleNext}
                        className="flex-1 bg-indigo-600 text-white rounded-[24px] flex items-center justify-center shadow-lg shadow-indigo-500/30 active:scale-95 transition-transform"
                      >
                        <Check size={32} strokeWidth={3} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* === Step 2: Details === */}
              {step === "details" && (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex flex-col h-full bg-gray-50 rounded-[32px] p-6 overflow-y-auto"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <button
                      onClick={() => setStep("calculator")}
                      className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase">
                        Expense
                      </p>
                      <h2 className="text-2xl font-black text-gray-900">
                        ¥{finalAmount?.toLocaleString()}
                      </h2>
                    </div>
                  </div>

                  {/* Category Selection Trigger */}
                  <div className="mb-6 space-y-3">
                    <label className="text-xs font-bold text-gray-400 uppercase">
                      Category
                    </label>
                    <button
                      onClick={() => setStep("categoryPicker")}
                      className="w-full bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between hover:border-indigo-200 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {selectedCategory.icon}
                        </span>
                        <span className="font-bold text-gray-900">
                          {selectedCategory.label}
                        </span>
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
                      onChange={(e) => setNote(e.target.value)}
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
                        onClick={() => setIsPatternModalOpen(true)}
                        className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md flex items-center gap-1 active:scale-95 transition-transform"
                      >
                        <PlusCircle size={12} /> Add Pattern
                      </button>
                    </div>

                    <div className="space-y-3 pb-20">
                      {customFields.length === 0 ? (
                        <div className="text-center py-4 bg-white/50 rounded-2xl border border-dashed border-gray-200">
                          <p className="text-xs text-gray-400">
                            No custom patterns for {selectedCategory.label}
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
                              onChange={(e) => {
                                const newVal = e.target.value;
                                setCustomFields((prev) =>
                                  prev.map((f, idx) =>
                                    idx === i ? { ...f, value: newVal } : f
                                  )
                                );
                              }}
                              className="flex-1 bg-transparent font-bold text-gray-900 outline-none text-right pr-4"
                            />
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="absolute bottom-6 left-6 right-6">
                    <button
                      onClick={handleSaveExpense}
                      className="w-full bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-[24px] py-4 font-bold shadow-lg shadow-indigo-500/30 active:scale-95 transition-transform flex items-center justify-center gap-2"
                    >
                      <Check size={20} strokeWidth={3} />
                      Save Transaction
                    </button>
                  </div>
                </motion.div>
              )}

              {/* === Step 3: Category Picker / Editor === */}
              {step === "categoryPicker" && (
                <motion.div
                  key="categoryPicker"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex flex-col h-full bg-white rounded-[32px] overflow-hidden"
                >
                  <div className="bg-gray-50 p-6 pb-4 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <button
                        onClick={handlePickerBack}
                        className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 active:scale-95 transition-all hover:bg-gray-50 shadow-sm"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <h3 className="font-bold text-gray-900">
                        Select Category
                      </h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setCurrentPickerPath([]); // Reset to root
                            setStep("categoryEditor");
                          }}
                          className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm active:scale-95 transition-all hover:bg-indigo-100"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => setStep("details")}
                          className="w-10 h-10 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center active:scale-95 transition-all hover:bg-gray-200 hover:text-gray-600"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </div>
                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-2 text-sm overflow-x-auto scrollbar-hide">
                      <span
                        onClick={() => setCurrentPickerPath([])}
                        className={cn(
                          "font-bold whitespace-nowrap cursor-pointer transition-colors hover:text-indigo-500",
                          currentPickerPath.length === 0
                            ? "text-indigo-600"
                            : "text-gray-400"
                        )}
                      >
                        Root
                      </span>
                      {currentPickerPath.map((cat, i) => (
                        <div key={cat.id} className="flex items-center gap-2">
                          <ChevronRight size={14} className="text-gray-300" />
                          <span
                            className={cn(
                              "font-bold whitespace-nowrap",
                              i === currentPickerPath.length - 1
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
                      {getCurrentLevelCategories().map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => handleCategorySelect(cat)}
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
                </motion.div>
              )}

              {/* === Step 4: Category Management Mode (Editor) === */}
              {step === "categoryEditor" && (
                <motion.div
                  key="categoryEditor"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col h-full bg-white rounded-[32px] overflow-hidden"
                >
                  <div className="bg-white p-6 pb-4 border-b border-gray-100 z-10 sticky top-0">
                    <div className="flex items-center justify-between">
                      {/* Back Button */}
                      <button
                        onClick={() => {
                          if (currentPickerPath.length > 0) {
                            setCurrentPickerPath((prev) => prev.slice(0, -1));
                          } else {
                            setStep("categoryPicker");
                          }
                        }}
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
                          {currentPickerPath.length > 0
                            ? currentPickerPath[currentPickerPath.length - 1]
                                .label
                            : "Root"}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            setEditingCategory({
                              id: "new",
                              label: "",
                              icon: "📁",
                              color: "",
                              parentId:
                                currentPickerPath[currentPickerPath.length - 1]
                                  ?.id,
                            })
                          }
                          className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200 active:scale-95 transition-all hover:bg-indigo-700"
                        >
                          <Plus size={20} />
                        </button>
                        <button
                          onClick={() => setStep("categoryPicker")}
                          className="w-10 h-10 rounded-full bg-gray-50 border border-gray-200 text-gray-400 flex items-center justify-center active:scale-95 transition-all hover:bg-gray-100 hover:text-gray-600"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
                    {getCurrentLevelCategories().length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-48 text-center space-y-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-3xl text-gray-300">
                          📭
                        </div>
                        <div>
                          <p className="font-bold text-gray-400">
                            No categories here
                          </p>
                          <p className="text-xs text-gray-400">
                            Tap + to create one
                          </p>
                        </div>
                      </div>
                    ) : (
                      getCurrentLevelCategories().map((cat) => (
                        <div
                          key={cat.id}
                          onClick={() => {
                            // Drill down in editor mode too
                            setCurrentPickerPath((prev) => [...prev, cat]);
                          }}
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
                                /* TODO: Edit logic */
                                setEditingCategory(cat); // Temporary: open edit mock
                              }}
                              className="w-10 h-10 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-white hover:text-indigo-600 hover:shadow-md transition-all active:scale-90"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                /* TODO: Delete logic */
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
                          onClick={() => setEditingCategory(null)}
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
                                {currentPickerPath.length > 0
                                  ? `in ${
                                      currentPickerPath[
                                        currentPickerPath.length - 1
                                      ].label
                                    }`
                                  : "Root Level"}
                              </p>
                            </div>

                            <button className="relative group">
                              <div className="w-24 h-24 rounded-full bg-linear-to-br from-indigo-50 to-purple-50 border-4 border-white shadow-xl flex items-center justify-center text-5xl group-hover:scale-105 transition-transform duration-300">
                                {newCatIcon}
                              </div>
                              <div className="absolute bottom-0 right-0 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-md border-2 border-white">
                                <Edit2 size={12} />
                              </div>
                            </button>

                            <div className="w-full">
                              <input
                                autoFocus
                                type="text"
                                placeholder="Name"
                                value={newCatName}
                                onChange={(e) => setNewCatName(e.target.value)}
                                className="w-full text-center text-2xl font-black text-gray-900 placeholder-gray-200 border-b-2 border-gray-100 py-2 focus:border-indigo-500 focus:outline-none transition-colors bg-transparent"
                              />
                            </div>

                            <div className="flex gap-3 w-full pt-2">
                              <button
                                onClick={() => setEditingCategory(null)}
                                className="flex-1 py-4 rounded-3xl font-bold text-sm text-gray-500 hover:bg-gray-50 transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() =>
                                  handleAddCategory(
                                    currentPickerPath[
                                      currentPickerPath.length - 1
                                    ]?.id
                                  )
                                }
                                className="flex-1 py-4 rounded-3xl font-bold text-sm text-white bg-linear-to-r from-indigo-600 to-purple-600 shadow-xl shadow-indigo-500/30 active:scale-95 transition-transform hover:opacity-90"
                              >
                                Create
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pattern Modal (Global) */}
            <AnimatePresence>
              {isPatternModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    onClick={() => setIsPatternModalOpen(false)}
                  />
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white w-full max-w-sm rounded-[32px] p-6 relative z-10 shadow-2xl"
                  >
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      Add Custom Pattern
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Add a recurring field for{" "}
                      <strong>{selectedCategory.label}</strong> (e.g.,
                      &quot;Fuel (L)&quot;, &quot;Mileage&quot;).
                    </p>
                    <input
                      autoFocus
                      type="text"
                      placeholder="Label Name"
                      value={newPatternName}
                      onChange={(e) => setNewPatternName(e.target.value)}
                      className="w-full bg-gray-50 rounded-xl p-4 font-bold text-gray-900 outline-none border border-gray-200 focus:border-indigo-500 mb-6"
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={() => setIsPatternModalOpen(false)}
                        className="flex-1 py-3 text-gray-500 font-bold bg-gray-100 rounded-xl"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddPattern}
                        className="flex-1 py-3 text-white font-bold bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20"
                      >
                        Add
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

function NumBtn({
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

function OpBtn({
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

function ActionBtn({
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
