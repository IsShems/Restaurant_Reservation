"use client";

import { motion } from "framer-motion";

export default function Legend() {
  const items = [
    {
      color: "purple",
      label: "Available",
      description: "Table can be reserved",
    },
    {
      color: "red",
      label: "Occupied",
      description: "Table is currently booked",
    },
    {
      color: "purple-glow",
      label: "Recommended",
      description: "Best match for your preferences",
    },
    {
      color: "outline",
      label: "Selected",
      description: "Table selected for booking",
    },
  ];

  return (
    <motion.div
      className="rounded-lg border border-dark-border bg-dark-card/50 p-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <h3 className="text-sm font-semibold text-white mb-3 flex items-center">
        <span className="text-lg mr-2">📋</span>
        Table Status Legend
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {items.map((item, index) => (
          <motion.div
            key={index}
            className="flex items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 * (index + 1) }}
          >
            {/* Color indicator */}
            <div className="flex-shrink-0">
              {item.color === "purple" && (
                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-purple-accent to-purple-dark" />
              )}
              {item.color === "red" && (
                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-red-accent to-red-dark" />
              )}
              {item.color === "purple-glow" && (
                <div
                  className="w-4 h-4 rounded-full bg-purple-accent"
                  style={{
                    boxShadow: "0 0 8px rgba(168, 85, 247, 0.8)",
                  }}
                />
              )}
              {item.color === "outline" && (
                <div className="w-4 h-4 rounded-full border-2 border-purple-accent" />
              )}
            </div>

            {/* Label */}
            <div className="text-xs">
              <p className="text-white font-medium">{item.label}</p>
              <p className="text-gray-500 text-[10px]">{item.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
