"use client";

import { motion } from "framer-motion";
import React from "react";

interface Table {
  id: number | string;
  name: string;
  capacity: number;
  zone: { id: number; name: string };
  features: string[];
  occupied: boolean;
  positionX: number;
  positionY: number;
}

interface FloorPlanProps {
  tables: Table[];
  recommendedTableId?: number | null;
  selectedTableId?: number | null;
  onTableClick: (table: Table) => void;
  isLoading?: boolean;
}

export default function FloorPlan({
  tables,
  recommendedTableId,
  selectedTableId,
  onTableClick,
  isLoading,
}: FloorPlanProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-dark-border border-t-purple-accent mx-auto mb-4"></div>
          <p className="text-gray-400">Loading floor plan...</p>
        </div>
      </div>
    );
  }

  if (tables.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 rounded-lg border border-dark-border bg-dark-card/30">
        <div className="text-center">
          <p className="text-2xl mb-2">🪑</p>
          <p className="text-gray-400">
            No tables available for your selection
          </p>
        </div>
      </div>
    );
  }

  // Calculate canvas size based on table positions
  const maxX = Math.max(...tables.map((t) => t.positionX)) + 100;
  const maxY = Math.max(...tables.map((t) => t.positionY)) + 100;

  return (
    <div className="w-full rounded-lg border border-dark-border bg-dark-card/50 p-6 overflow-auto">
      <div
        className="relative mx-auto bg-gradient-to-br from-dark-bg via-dark-card/20 to-dark-bg rounded-lg border border-dark-border/50"
        style={{
          width: Math.min(maxX, 1000),
          height: Math.min(maxY, 600),
          minHeight: 400,
        }}
      >
        {/* Grid background */}
        <svg
          className="absolute inset-0 w-full h-full opacity-10"
          style={{ pointerEvents: "none" }}
        >
          <defs>
            <pattern
              id="grid"
              width="50"
              height="50"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 50 0 L 0 0 0 50"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Tables */}
        {tables.map((table) => {
          const isRecommended = table.id === recommendedTableId;
          const isSelected = table.id === selectedTableId;
          const isAvailable = !table.occupied;

          return (
            <motion.div
              key={table.id}
              className="absolute"
              style={{
                left: `${table.positionX}px`,
                top: `${table.positionY}px`,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <motion.button
                onClick={() => isAvailable && onTableClick(table)}
                disabled={!isAvailable}
                className={`
                  relative w-20 h-20 rounded-full font-semibold transition-all cursor-pointer
                  flex items-center justify-center flex-col text-sm
                  ${
                    isAvailable
                      ? "hover:shadow-lg active:scale-95"
                      : "cursor-not-allowed opacity-60"
                  }
                  ${
                    isSelected
                      ? "ring-2 ring-purple-accent"
                      : isRecommended
                        ? "ring-2 ring-purple-accent"
                        : ""
                  }
                `}
                style={{
                  background: isAvailable
                    ? "linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)"
                    : "linear-gradient(135deg, #5f0f0f 0%, #3f0a0a 100%)",
                  boxShadow:
                    isAvailable && isRecommended
                      ? "0 0 20px rgba(168, 85, 247, 0.6), inset 0 0 10px rgba(255,255,255,0.1)"
                      : "0 2px 8px rgba(0, 0, 0, 0.3)",
                }}
                whileHover={
                  isAvailable
                    ? {
                        scale: 1.08,
                        boxShadow:
                          "0 0 25px rgba(168, 85, 247, 0.8), inset 0 0 10px rgba(255,255,255,0.1)",
                      }
                    : {}
                }
                whileTap={isAvailable ? { scale: 0.95 } : {}}
              >
                <span className="font-bold text-white">{table.capacity}</span>
                <span className="text-xs text-purple-100 whitespace-nowrap">
                  {table.name.split(" ")[0]}
                </span>

                {/* Recommended badge */}
                {isRecommended && (
                  <motion.div
                    className="absolute -top-2 -right-2 bg-purple-accent text-dark-bg rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    ⭐
                  </motion.div>
                )}

                {/* Occupied badge */}
                {table.occupied && (
                  <motion.div
                    className="absolute -bottom-2 -left-2 bg-red-dark text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    ✕
                  </motion.div>
                )}
              </motion.button>

              {/* Tooltip */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                whileHover={{ opacity: 1, y: -35 }}
                className="absolute left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap pointer-events-none"
              >
                {table.name} • {table.capacity} seats
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* Table count info */}
      <div className="mt-4 text-sm text-gray-400">
        Showing {tables.filter((t) => !t.occupied).length} of {tables.length}{" "}
        tables available
      </div>
    </div>
  );
}
