"use client";

import { useState } from "react";
import { Drawer } from "vaul";
import { evaluate } from "mathjs";
import { motion, AnimatePresence } from "framer-motion";
import { Category } from "@/types/ui";
import CalculatorStep from "@/components/tree/CalculatorStep";
import ExpenseDetailsStep from "@/components/tree/ExpenseDetailsStep";
import CategoryPickerStep from "@/components/tree/CategoryPickerStep";
import CategoryEditorStep from "@/components/tree/CategoryEditorStep";
import CustomPatternModal from "@/components/tree/CustomPatternModal";

interface CalculatorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}

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

  // Props preparation for CategoryEditor
  const handleEditorCreate = () => {
    setEditingCategory({
      id: "new",
      label: "",
      icon: "📁",
      color: "",
      parentId: currentPickerPath[currentPickerPath.length - 1]?.id,
    });
  };

  const handleSaveCategory = () => {
    handleAddCategory(currentPickerPath[currentPickerPath.length - 1]?.id);
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
                  <CalculatorStep
                    expression={expression}
                    onInput={handleInput}
                    onDelete={handleDelete}
                    onClear={handleClear}
                    onEqual={handleEqual}
                    onNext={handleNext}
                  />
                </motion.div>
              )}

              {/* === Step 2: Details === */}
              {step === "details" && (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex flex-col h-full"
                >
                  <ExpenseDetailsStep
                    amount={finalAmount}
                    category={selectedCategory}
                    note={note}
                    customFields={customFields}
                    onBack={() => setStep("calculator")}
                    onChangeCategory={() => setStep("categoryPicker")}
                    onChangeNote={setNote}
                    onChangeCustomField={(i, val) =>
                      setCustomFields((prev) =>
                        prev.map((f, idx) =>
                          idx === i ? { ...f, value: val } : f
                        )
                      )
                    }
                    onOpenPatternModal={() => setIsPatternModalOpen(true)}
                    onSave={handleSaveExpense}
                  />
                </motion.div>
              )}

              {/* === Step 3: Category Picker === */}
              {step === "categoryPicker" && (
                <motion.div
                  key="categoryPicker"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex flex-col h-full"
                >
                  <CategoryPickerStep
                    currentPath={currentPickerPath}
                    categories={getCurrentLevelCategories()}
                    onBack={handlePickerBack}
                    onClose={() => setStep("details")}
                    onSelect={handleCategorySelect}
                    onBreadcrumbClick={setCurrentPickerPath}
                    onManage={() => {
                      setCurrentPickerPath([]);
                      setStep("categoryEditor");
                    }}
                  />
                </motion.div>
              )}

              {/* === Step 4: Category Editor === */}
              {step === "categoryEditor" && (
                <motion.div
                  key="categoryEditor"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col h-full"
                >
                  <CategoryEditorStep
                    currentPath={currentPickerPath}
                    categories={getCurrentLevelCategories()}
                    editingCategory={editingCategory}
                    newCatName={newCatName}
                    newCatIcon={newCatIcon}
                    onBack={() => {
                      if (currentPickerPath.length > 0) {
                        setCurrentPickerPath((prev) => prev.slice(0, -1));
                      } else {
                        setStep("categoryPicker");
                      }
                    }}
                    onClose={() => setStep("categoryPicker")}
                    onSelect={(cat) =>
                      setCurrentPickerPath((prev) => [...prev, cat])
                    }
                    onCreate={handleEditorCreate}
                    onEdit={setEditingCategory}
                    onDelete={() => {}} /* TODO: Implement delete */
                    onNameChange={setNewCatName}
                    onIconChange={setNewCatIcon}
                    onCancelEdit={() => setEditingCategory(null)}
                    onSaveCategory={handleSaveCategory}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <CustomPatternModal
              isOpen={isPatternModalOpen}
              targetLabel={selectedCategory.label}
              newPatternName={newPatternName}
              onClose={() => setIsPatternModalOpen(false)}
              onAdd={handleAddPattern}
              onChangeName={setNewPatternName}
            />
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
