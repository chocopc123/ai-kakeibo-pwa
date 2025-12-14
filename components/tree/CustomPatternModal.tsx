import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CustomPatternModalProps {
  isOpen: boolean;
  targetLabel: string;
  newPatternName: string;
  onClose: () => void;
  onAdd: () => void;
  onChangeName: (val: string) => void;
}

export default function CustomPatternModal({
  isOpen,
  targetLabel,
  newPatternName,
  onClose,
  onAdd,
  onChangeName,
}: CustomPatternModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
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
              Add a recurring field for <strong>{targetLabel}</strong> (e.g.,
              &quot;Fuel (L)&quot;, &quot;Mileage&quot;).
            </p>
            <input
              autoFocus
              type="text"
              placeholder="Label Name"
              value={newPatternName}
              onChange={(e) => onChangeName(e.target.value)}
              className="w-full bg-gray-50 rounded-xl p-4 font-bold text-gray-900 outline-none border border-gray-200 focus:border-indigo-500 mb-6"
            />
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 text-gray-500 font-bold bg-gray-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={onAdd}
                className="flex-1 py-3 text-white font-bold bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20"
              >
                Add
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
