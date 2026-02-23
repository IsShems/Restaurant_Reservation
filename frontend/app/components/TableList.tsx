"use client";

import { motion } from "framer-motion";
import TableCard from "./TableCard";

interface Table {
  id: number | string;
  name: string;
  capacity: number;
  zone: { id: number; name: string };
  features: string[];
  occupied: boolean;
}

interface TableListProps {
  tables: Table[];
  onReserve: (tableId: number | string) => void;
}

export default function TableList({ tables, onReserve }: TableListProps) {
  if (tables.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12"
      >
        <div className="glassmorphic rounded-2xl p-8 border border-dark-border/50">
          <p className="text-2xl text-gray-400 mb-4">🔍</p>
          <h3 className="text-xl font-bold text-white mb-2">
            No Tables Available
          </h3>
          <p className="text-gray-400">
            Try adjusting your search criteria or selecting a different
            date/time.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-2xl font-bold text-white mb-4">
        Available Tables ({tables.length})
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {tables.map((table, index) => (
          <motion.div
            key={table.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <TableCard
              table={table}
              isRecommended={index === 0}
              onReserve={onReserve}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
