"use client";

import { motion } from "framer-motion";

interface Table {
  id: number | string;
  name: string;
  capacity: number;
  zone: { id: number; name: string };
  features: string[];
  occupied: boolean;
}

interface TableCardProps {
  table: Table;
  isRecommended?: boolean;
  onReserve: (tableId: number | string) => void;
}

export default function TableCard({
  table,
  isRecommended = false,
  onReserve,
}: TableCardProps) {
  const featureIcons: Record<string, string> = {
    WINDOW: "🪟",
    PRIVATE_AREA: "🔒",
    KIDS_ZONE: "👶",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={!table.occupied ? { scale: 1.02, y: -5 } : undefined}
      transition={{ duration: 0.3 }}
      className={`
        relative glassmorphic rounded-xl p-5 md:p-6 border smooth-transition
        ${
          isRecommended
            ? "border-purple-accent shadow-glow"
            : "border-dark-border/50 hover:border-purple-accent/30"
        }
        ${table.occupied ? "opacity-50" : ""}
      `}
    >
      {/* Recommended Badge */}
      {isRecommended && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-3 -right-3 bg-purple-accent text-white px-3 py-1 rounded-full text-xs font-semibold"
        >
          Recommended
        </motion.div>
      )}

      {/* Table Info */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg md:text-xl font-bold text-white">
            {table.name}
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            Zone:{" "}
            <span className="text-purple-accent capitalize">
              {table.zone.name}
            </span>
          </p>
        </div>

        {/* Status Badge */}
        <motion.div
          className={`
            px-3 py-1 rounded-full text-xs font-semibold
            ${
              table.occupied
                ? "bg-red-accent/20 text-red-300"
                : "bg-emerald-500/20 text-emerald-300"
            }
          `}
        >
          {table.occupied ? "Occupied" : "Available"}
        </motion.div>
      </div>

      {/* Capacity */}
      <div className="mb-4 p-3 bg-dark-bg rounded-lg">
        <p className="text-sm text-gray-400">Capacity</p>
        <p className="text-2xl font-bold text-purple-accent">
          {table.capacity} guests
        </p>
      </div>

      {/* Features */}
      {table.features.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-gray-400 mb-2">Features</p>
          <div className="flex flex-wrap gap-2">
            {table.features.map((feature) => (
              <motion.span
                key={feature}
                whileHover={{ scale: 1.1 }}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-dark-bg border border-dark-border/50 text-xs text-gray-300"
              >
                <span>{featureIcons[feature] || "✨"}</span>
                {feature.replace(/_/g, " ")}
              </motion.span>
            ))}
          </div>
        </div>
      )}

      {/* Reserve Button */}
      <motion.button
        onClick={() => onReserve(table.id)}
        disabled={table.occupied}
        whileHover={!table.occupied ? { scale: 1.05 } : undefined}
        whileTap={!table.occupied ? { scale: 0.95 } : undefined}
        className={`
          w-full py-2.5 rounded-lg font-semibold smooth-transition text-white
          ${
            table.occupied
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-gradient-to-r from-red-accent to-red-dark hover:shadow-glow-red"
          }
        `}
      >
        {table.occupied ? "Not Available" : "Reserve Now"}
      </motion.button>
    </motion.div>
  );
}
