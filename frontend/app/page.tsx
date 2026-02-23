"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import type { FilterState } from "./components/FilterForm";
import FloorPlan from "./components/FloorPlan";
import Legend from "./components/Legend";
import Toast, { Toast as ToastType } from "./components/Toast";

// Disable SSR for FilterForm to prevent hydration errors with date/time inputs
const FilterForm = dynamic(() => import("./components/FilterFormWrapper"), {
  ssr: false,
});

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

export default function Home() {
  const [tables, setTables] = useState<Table[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recommendedTableId, setRecommendedTableId] = useState<number | null>(
    null,
  );
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [toasts, setToasts] = useState<ToastType[]>([]);
  const [currentFilters, setCurrentFilters] = useState<FilterState | null>(
    null,
  );
  const [isReserving, setIsReserving] = useState(false);

  const addToast = (type: "success" | "error" | "info", message: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const fetchAvailableTables = useCallback(async (filters: FilterState) => {
    setIsLoading(true);
    setSelectedTableId(null);

    try {
      // Calculate end time (1 hour after start time)
      const [hours] = filters.time.split(":");
      const endHour = (parseInt(hours) + 1) % 24;
      const endTime = `${endHour.toString().padStart(2, "0")}:00`;

      // Build query string
      const params = new URLSearchParams({
        date: filters.date,
        startTime: filters.time,
        endTime: endTime,
        guestCount: filters.guests.toString(),
      });

      if (filters.zone && filters.zone !== "all") {
        params.append("zone", filters.zone);
      }

      if (filters.preferences && filters.preferences.length > 0) {
        const prefMap: Record<string, string> = {
          window: "NEAR_WINDOW",
          private: "PRIVATE_CORNER",
          kids: "NEAR_KIDS_ZONE",
        };
        const mappedPrefs = filters.preferences
          .map((p) => prefMap[p])
          .filter(Boolean)
          .join(",");
        if (mappedPrefs) {
          params.append("preferences", mappedPrefs);
        }
      }

      const response = await fetch(
        `http://localhost:8081/api/search?${params.toString()}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch available tables");
      }

      const data = await response.json();

      setTables(data.availableTables || []);
      setRecommendedTableId(data.recommendedTableId || null);
      setHasSearched(true);
      setCurrentFilters(filters);

      if (data.availableTables?.length === 0) {
        addToast("info", "No tables available for your selection");
      } else {
        addToast(
          "success",
          `Found ${data.availableTables.length} available tables`,
        );
      }
    } catch (err) {
      addToast(
        "error",
        err instanceof Error ? err.message : "Failed to fetch tables",
      );
      setTables([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleTableSelect = (table: Table) => {
    setSelectedTableId(table.id as number);
    addToast("info", `Selected ${table.name}`);
  };

  const handleReserve = async () => {
    if (!selectedTableId || !currentFilters) {
      addToast("error", "Please select a table first");
      return;
    }

    const selectedTable = tables.find((t) => t.id === selectedTableId);
    if (!selectedTable) {
      addToast("error", "Selected table not found");
      return;
    }

    setIsReserving(true);

    try {
      const [hours] = currentFilters.time.split(":");
      const endHour = (parseInt(hours) + 1) % 24;
      const endTime = `${endHour.toString().padStart(2, "0")}:00`;

      const reservationData = {
        table: selectedTable,
        date: currentFilters.date,
        startTime: currentFilters.time,
        endTime: endTime,
        guestCount: currentFilters.guests,
      };

      const response = await fetch("http://localhost:8081/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reservationData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create reservation");
      }

      const result = await response.json();

      if (result.success) {
        addToast("success", `Reservation confirmed for ${selectedTable.name}!`);
        // Refresh available tables
        fetchAvailableTables(currentFilters);
        setSelectedTableId(null);
      } else {
        addToast("error", result.error || "Failed to create reservation");
      }
    } catch (err) {
      addToast(
        "error",
        err instanceof Error
          ? err.message
          : "An error occurred while creating reservation",
      );
    } finally {
      setIsReserving(false);
    }
  };

  return (
    <main className="min-h-screen overflow-hidden">
      {/* Gradient Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-dark-bg via-dark-card to-dark-bg" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-accent/5 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <h1 className="text-6xl md:text-7xl font-bold mb-4 text-white">
            Restaurant Reservation
          </h1>
          <div className="h-1 w-24 mx-auto mb-6 bg-gradient-to-r from-purple-accent to-red-accent rounded-full" />
          <p className="text-lg text-gray-300">
            Discover and reserve the perfect table for your dining experience
          </p>
        </motion.div>

        {/* Filter Section - Full Width */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <FilterForm onFilter={fetchAvailableTables} isLoading={isLoading} />
        </motion.div>

        {/* Floor Plan Section - Below Filter */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-4"
        >
          {hasSearched ? (
            <>
              <FloorPlan
                tables={tables}
                recommendedTableId={recommendedTableId}
                selectedTableId={selectedTableId}
                onTableClick={handleTableSelect}
                isLoading={isLoading}
              />

              {/* Legend */}
              <Legend />

              {/* Reserve Button */}
              {selectedTableId && !isLoading && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={handleReserve}
                  disabled={isReserving}
                  className="w-full py-3 rounded-lg font-semibold text-white transition-all
                      bg-gradient-to-r from-purple-accent to-purple-dark hover:from-purple-dark hover:to-purple-accent
                      active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isReserving
                    ? "Reserving..."
                    : `Reserve Table ${selectedTableId}`}
                </motion.button>
              )}
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center h-96 rounded-lg border border-dark-border bg-dark-card/30"
            >
              <div className="text-center">
                <p className="text-2xl mb-2">🔍</p>
                <p className="text-gray-400">
                  Use the filter form to search for available tables
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Toast Notifications */}
      <Toast toasts={toasts} onRemove={removeToast} />
    </main>
  );
}
