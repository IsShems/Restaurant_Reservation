"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import FilterForm, { FilterState } from "./components/FilterForm";
import TableList from "./components/TableList";
import LoadingSpinner from "./components/LoadingSpinner";

interface Table {
  id: number | string;
  name: string;
  capacity: number;
  zone: { id: number; name: string };
  features: string[];
  occupied: boolean;
}

export default function Home() {
  const [tables, setTables] = useState<Table[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Fetch initial tables on mount
  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async (filters?: FilterState) => {
    setIsLoading(true);
    setError(null);

    try {
      // Build URL with query parameters
      const url = new URL("http://localhost:8081/tables");

      if (filters) {
        if (filters.zone) {
          url.searchParams.append("zone", filters.zone);
        }
        if (filters.guests) {
          url.searchParams.append("capacity", filters.guests.toString());
        }
      }

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error("Failed to fetch tables");
      }

      const data = await response.json();
      setTables(Array.isArray(data) ? data : []);
      setHasSearched(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while fetching tables",
      );
      setTables([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilter = (filters: FilterState) => {
    fetchTables(filters);
  };

  const handleReserve = (tableId: number | string) => {
    alert(`Table ${tableId} reserved! (Integration with backend coming soon)`);
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
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 md:mb-12"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3">
            Restaurant Reservation
          </h1>
          <div className="h-1 w-24 mx-auto gradient-purple-red rounded-full mb-4" />
          <p className="text-gray-400 text-lg">
            Discover and reserve the perfect table for your dining experience
          </p>
        </motion.div>

        {/* Filter Form */}
        <FilterForm onFilter={handleFilter} isLoading={isLoading} />

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8 p-4 rounded-lg bg-red-accent/20 border border-red-accent/50 text-red-200"
          >
            <p className="font-semibold">Error: {error}</p>
            <p className="text-sm mt-1">
              Please make sure the backend is running on http://localhost:8081
            </p>
          </motion.div>
        )}

        {/* Loading State */}
        {isLoading && <LoadingSpinner />}

        {/* Results Section */}
        {!isLoading && hasSearched && (
          <>
            {tables.length > 0 ? (
              <TableList tables={tables} onReserve={handleReserve} />
            ) : (
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
            )}
          </>
        )}

        {/* Initial State */}
        {!hasSearched && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="glassmorphic rounded-2xl p-8 border border-dark-border/50">
              <p className="text-2xl text-gray-400 mb-4">📋</p>
              <h3 className="text-xl font-bold text-white mb-2">
                Ready to Reserve?
              </h3>
              <p className="text-gray-400">
                Use the filters above to search for available tables matching
                your preferences.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}
