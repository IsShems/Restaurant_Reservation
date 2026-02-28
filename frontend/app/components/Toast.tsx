"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useRef } from "react";

export interface Toast {
  id: string;
  type: "success" | "error" | "info";
  message: string;
  duration?: number;
}

interface ToastProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

export default function Toast({ toasts, onRemove }: ToastProps) {
  return (
    <div className="fixed top-4 right-4 z-50 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({
  toast,
  onRemove,
}: {
  toast: Toast;
  onRemove: (id: string) => void;
}) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClose = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    onRemove(toast.id);
  }, [onRemove, toast.id]);

  useEffect(() => {
    timeoutRef.current = setTimeout(handleClose, toast.duration || 4000);
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [handleClose, toast.duration]);

  const bgColor =
    toast.type === "success"
      ? "bg-green-900/80"
      : toast.type === "error"
        ? "bg-red-900/80"
        : "bg-blue-900/80";

  const borderColor =
    toast.type === "success"
      ? "border-green-500"
      : toast.type === "error"
        ? "border-red-500"
        : "border-blue-500";

  const icon =
    toast.type === "success" ? "✓" : toast.type === "error" ? "✕" : "ℹ";

  return (
    <motion.div
      initial={{ opacity: 0, x: 400, y: 0 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 400 }}
      transition={{ type: "spring", stiffness: 100 }}
      className={`${bgColor} ${borderColor} border rounded-lg px-4 py-3 mb-2 pointer-events-auto flex items-center gap-3 backdrop-blur-sm max-w-sm`}
    >
      <span className="text-lg font-bold">{icon}</span>
      <p className="text-sm text-white flex-1">{toast.message}</p>
      <button
        onClick={handleClose}
        className="text-white/60 hover:text-white transition-colors"
      >
        ✕
      </button>
    </motion.div>
  );
}
