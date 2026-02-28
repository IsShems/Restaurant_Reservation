"use client";

import { useState, useCallback, useEffect } from "react";
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
  uiDimmed?: boolean;
}

type TableRule = {
  zone: "main_hall" | "patio" | "terrace" | "private_room";
  nearWindow: boolean;
  quietCorner: boolean;
  nearKidsZone: boolean;
};

const TABLE_RULES: Record<number, TableRule> = {
  1: {
    zone: "main_hall",
    nearWindow: true,
    quietCorner: false,
    nearKidsZone: false,
  },
  2: {
    zone: "main_hall",
    nearWindow: true,
    quietCorner: false,
    nearKidsZone: false,
  },
  3: {
    zone: "main_hall",
    nearWindow: false,
    quietCorner: false,
    nearKidsZone: false,
  },
  4: {
    zone: "private_room",
    nearWindow: true,
    quietCorner: true,
    nearKidsZone: false,
  },
  5: {
    zone: "patio",
    nearWindow: true,
    quietCorner: false,
    nearKidsZone: true,
  },
  6: {
    zone: "patio",
    nearWindow: true,
    quietCorner: true,
    nearKidsZone: true,
  },
  7: {
    zone: "patio",
    nearWindow: false,
    quietCorner: true,
    nearKidsZone: true,
  },
  8: {
    zone: "terrace",
    nearWindow: false,
    quietCorner: false,
    nearKidsZone: false,
  },
  9: {
    zone: "terrace",
    nearWindow: false,
    quietCorner: false,
    nearKidsZone: false,
  },
  10: {
    zone: "terrace",
    nearWindow: true,
    quietCorner: false,
    nearKidsZone: false,
  },
};

const getTableNumber = (table: Table): number | null => {
  const idNum = Number(table.id);
  if (Number.isFinite(idNum) && idNum >= 1 && idNum <= 10) return idNum;
  const match = String(table.name || "").match(/table\s*(\d+)/i);
  return match ? Number(match[1]) : null;
};

const normalizeZone = (zoneValue: string) => {
  const value = (zoneValue || "").toLowerCase().replace(/\s+/g, "_");
  if (!value) return "";
  if (
    value.includes("terr") ||
    value.includes("balcony") ||
    value.includes("teracce")
  )
    return "terrace";
  if (value.includes("private")) return "private_room";
  if (value.includes("kids")) return "kids_zone";
  if (value.includes("patio")) return "patio";
  if (value.includes("main")) return "main_hall";
  return value;
};

const matchesPreference = (table: Table, preference: string) => {
  const tableNumber = getTableNumber(table);
  const rule = tableNumber ? TABLE_RULES[tableNumber] : undefined;
  const features = (table.features || []).join(" ").toLowerCase();
  if (preference === "window")
    return rule ? rule.nearWindow : /window/.test(features);
  if (preference === "private")
    return rule ? rule.quietCorner : /private|quiet/.test(features);
  if (preference === "kids")
    return rule ? rule.nearKidsZone : /kids/.test(features);
  return false;
};

export default function Home() {
  const [allTables, setAllTables] = useState<Table[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recommendedTableId, setRecommendedTableId] = useState<number | null>(
    null,
  );
  const [recommendedGroupIds, setRecommendedGroupIds] = useState<
    Array<number | string>
  >([]);
  const [selectedTableIds, setSelectedTableIds] = useState<
    Array<number | string>
  >([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [noPerfectMatch, setNoPerfectMatch] = useState(false);
  const [toasts, setToasts] = useState<ToastType[]>([]);
  const [currentFilters, setCurrentFilters] = useState<FilterState | null>(
    null,
  );
  const [isReserving, setIsReserving] = useState(false);

  const adjacencyMap: Record<number, number[]> = {
    1: [2, 3],
    2: [1, 3],
    3: [1, 2],
    4: [],
    5: [6, 7],
    6: [5, 7],
    7: [5, 6],
    8: [9, 10],
    9: [8, 10],
    10: [8, 9],
  };

  const toTableNum = (value: number | string) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : null;
  };

  const isAdjacent = (a: number | string, b: number | string) => {
    const aNum = toTableNum(a);
    const bNum = toTableNum(b);
    if (aNum === null || bNum === null) return false;
    return (adjacencyMap[aNum] || []).includes(bNum);
  };

  const addToast = useCallback(
    (type: "success" | "error" | "info", message: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setToasts((prev) => [...prev, { id, type, message }]);
    },
    [],
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const fetchAllTables = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:8081/tables");
      if (!response.ok) throw new Error("Failed to load floor plan tables");
      const data = await response.json();
      const list = Array.isArray(data) ? data : [];
      const normalizedList: Table[] = list
        .filter((table) => getTableNumber(table as Table) !== null)
        .map((table) => {
          const tableNum = getTableNumber(table as Table);
          const rule = tableNum ? TABLE_RULES[tableNum] : undefined;
          const featureSet = new Set(
            (table.features || []).map((f: string) => String(f).toUpperCase()),
          );
          if (rule?.nearWindow) featureSet.add("WINDOW");
          if (rule?.quietCorner) featureSet.add("PRIVATE_AREA");
          if (rule?.nearKidsZone) featureSet.add("KIDS_ZONE");
          return {
            ...table,
            features: Array.from(featureSet),
          } as Table;
        });
      setAllTables(normalizedList);
      if (!hasSearched) {
        setTables(
          normalizedList.map((t) => ({
            ...t,
            occupied: !!t.occupied,
            uiDimmed: false,
          })),
        );
      }
    } catch {
      addToast("error", "Unable to load floor plan tables");
    }
  }, [hasSearched]);

  useEffect(() => {
    fetchAllTables();
  }, [fetchAllTables]);

  const fetchAvailableTables = useCallback(
    async (filters: FilterState) => {
      setIsLoading(true);

      try {
        // Calculate end time (2 hours after start time)
        const [hours] = filters.time.split(":");
        const endHour = (parseInt(hours, 10) + 2) % 24;
        const endTime = `${endHour.toString().padStart(2, "0")}:00`;

        // Build query string
        const params = new URLSearchParams({
          date: filters.date,
          startTime: filters.time,
          endTime: endTime,
          guestCount: filters.guests.toString(),
        });

        const response = await fetch(
          `http://localhost:8081/api/search?${params.toString()}`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch available tables");
        }

        const data = await response.json();

        const availableIds = new Set<string>(
          (data.availableTables || []).map((table: Table) => String(table.id)),
        );

        const baseTables = allTables.length ? allTables : tables;
        const zoneFilter = normalizeZone(filters.zone);

        const availableTables = baseTables.filter((t) =>
          availableIds.has(String(t.id)),
        );

        const zoneMatches = (table: Table) => {
          if (!zoneFilter) return true;
          const tableNum = getTableNumber(table);
          const ruleZone = tableNum ? TABLE_RULES[tableNum]?.zone : undefined;
          const logicalZone = ruleZone || normalizeZone(table.zone?.name || "");
          if (zoneFilter === "kids_zone") {
            return tableNum === 5 || tableNum === 6 || tableNum === 7;
          }
          return logicalZone === zoneFilter;
        };

        const capacityMatches = (table: Table) =>
          table.capacity >= filters.guests;

        const preferenceScore = (table: Table) =>
          (filters.preferences || []).reduce(
            (score, pref) => score + (matchesPreference(table, pref) ? 1 : 0),
            0,
          );

        const preferenceMatchesAll = (table: Table) =>
          (filters.preferences || []).every((pref) =>
            matchesPreference(table, pref),
          );

        const baseMatchedTables = availableTables.filter(
          (t) => zoneMatches(t) && capacityMatches(t),
        );

        const preferenceMatchedTables =
          (filters.preferences || []).length > 0
            ? baseMatchedTables.filter(preferenceMatchesAll)
            : baseMatchedTables;

        const candidates = preferenceMatchedTables;

        const rankedSingles = [...candidates].sort((a, b) => {
          const wasteA = a.capacity - filters.guests;
          const wasteB = b.capacity - filters.guests;
          if (wasteA !== wasteB) return wasteA - wasteB;
          return preferenceScore(b) - preferenceScore(a);
        });

        const logicalZoneOf = (table: Table) => {
          const tableNum = getTableNumber(table);
          const ruleZone = tableNum ? TABLE_RULES[tableNum]?.zone : undefined;
          return ruleZone || normalizeZone(table.zone?.name || "");
        };

        const inSameZone = (a: Table, b: Table) =>
          logicalZoneOf(a) === logicalZoneOf(b);

        const adjacent = (a: Table, b: Table) => {
          const idA = Number(a.id);
          const idB = Number(b.id);
          const idNear =
            Number.isFinite(idA) &&
            Number.isFinite(idB) &&
            Math.abs(idA - idB) === 1;
          const dx = (a.positionX || 0) - (b.positionX || 0);
          const dy = (a.positionY || 0) - (b.positionY || 0);
          const distNear = Math.hypot(dx, dy) <= 140;
          return inSameZone(a, b) && (idNear || distNear);
        };

        const findRecommendedGroup = (): Table[] | null => {
          const pool = availableTables.filter((t) => zoneMatches(t));
          let best: Table[] | null = null;

          const trySet = (group: Table[]) => {
            const capacity = group.reduce((sum, t) => sum + t.capacity, 0);
            if (capacity < filters.guests) return;
            const waste = capacity - filters.guests;
            const score = group.reduce((sum, t) => sum + preferenceScore(t), 0);

            if (!best) {
              best = group;
              return;
            }

            const bestCapacity = best.reduce((sum, t) => sum + t.capacity, 0);
            const bestWaste = bestCapacity - filters.guests;
            const bestScore = best.reduce(
              (sum, t) => sum + preferenceScore(t),
              0,
            );

            if (waste < bestWaste) {
              best = group;
              return;
            }
            if (waste === bestWaste && group.length < best.length) {
              best = group;
              return;
            }
            if (
              waste === bestWaste &&
              group.length === best.length &&
              score > bestScore
            ) {
              best = group;
            }
          };

          for (let i = 0; i < pool.length; i++) {
            for (let j = i + 1; j < pool.length; j++) {
              if (!adjacent(pool[i], pool[j])) continue;
              trySet([pool[i], pool[j]]);

              for (let k = j + 1; k < pool.length; k++) {
                if (!adjacent(pool[j], pool[k]) && !adjacent(pool[i], pool[k]))
                  continue;
                trySet([pool[i], pool[j], pool[k]]);
              }
            }
          }

          return best;
        };

        const maxSingleCapacity =
          candidates.length > 0
            ? Math.max(...candidates.map((t) => t.capacity))
            : 0;
        const needsGroup =
          filters.guests > maxSingleCapacity || rankedSingles.length === 0;

        const group: Table[] | null = needsGroup
          ? findRecommendedGroup()
          : null;
        const groupIds: Array<number | string> = group
          ? group.map((table: Table) => table.id)
          : [];

        const recommendedId =
          groupIds.length > 0
            ? Number(groupIds[0]) || null
            : rankedSingles.length > 0
              ? Number(rankedSingles[0].id) || null
              : null;

        const derivedTables = baseTables.map((table) => {
          const isAvailable = availableIds.has(String(table.id));
          const isInZone = zoneMatches(table);
          const dimForZone = !!zoneFilter && !isInZone;
          return {
            ...table,
            occupied: !isAvailable,
            uiDimmed: dimForZone,
          };
        });

        const matchedIds = new Set<string>(
          (candidates.length > 0 ? candidates : group || []).map((table) =>
            String(table.id),
          ),
        );

        if (filters.guests >= 5 && filters.guests <= 6) {
          for (const table of baseTables) {
            const tableNum = getTableNumber(table);
            if (
              (tableNum === 8 || tableNum === 9 || tableNum === 10) &&
              availableIds.has(String(table.id))
            ) {
              matchedIds.add(String(table.id));
            }
          }
        }

        const noMatch = matchedIds.size === 0;

        setTables(
          derivedTables.map((table) => {
            const shouldDimByMatch = !matchedIds.has(String(table.id));
            const shouldDim = noMatch
              ? true
              : table.uiDimmed || shouldDimByMatch;
            return { ...table, uiDimmed: shouldDim };
          }),
        );
        setNoPerfectMatch(noMatch);
        setRecommendedTableId(recommendedId);
        setRecommendedGroupIds(groupIds);
        setHasSearched(true);
        setCurrentFilters(filters);

        if (noMatch) {
          addToast("info", "No perfect match found");
        } else if (groupIds.length > 0) {
          addToast(
            "success",
            `Recommended grouped tables: ${groupIds.join(" + ")}`,
          );
        } else {
          addToast(
            "success",
            `Found ${availableTables.length} available tables`,
          );
        }
      } catch (err) {
        addToast(
          "error",
          err instanceof Error ? err.message : "Failed to fetch tables",
        );
        setNoPerfectMatch(true);
      } finally {
        setIsLoading(false);
      }
    },
    [allTables, tables],
  );

  const handleTableSelect = (table: Table) => {
    setSelectedTableIds((prev) => {
      const alreadySelected = prev.includes(table.id);

      if (alreadySelected) {
        const next = prev.filter((id) => id !== table.id);
        addToast(
          "info",
          next.length ? `Deselected ${table.name}` : "Selection cleared",
        );
        return next;
      }

      if (prev.length === 0) {
        addToast("info", `Selected ${table.name}`);
        return [table.id];
      }

      const canAdd = prev.every((selectedId) =>
        isAdjacent(selectedId, table.id),
      );

      if (canAdd) {
        addToast("info", `Added ${table.name} to selection`);
        return [...prev, table.id];
      }

      addToast("info", `Selected ${table.name}`);
      return [table.id];
    });
  };

  const handleReserve = async () => {
    if (selectedTableIds.length === 0 || !currentFilters) {
      addToast("error", "Please select a table first");
      return;
    }

    const selectedTables = tables.filter((t) =>
      selectedTableIds.includes(t.id),
    );
    if (selectedTables.length === 0) {
      addToast("error", "Selected table not found");
      return;
    }

    if (currentFilters.guests <= 2 && selectedTables.length > 1) {
      addToast(
        "error",
        "For 2 guests, please select one suitable table only. Multiple-table reservation is not allowed.",
      );
      return;
    }

    setIsReserving(true);

    try {
      const [hours] = currentFilters.time.split(":");
      const endHour = (parseInt(hours, 10) + 2) % 24;
      const endTime = `${endHour.toString().padStart(2, "0")}:00`;

      for (const selectedTable of selectedTables) {
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
      }

      addToast(
        "success",
        `Reservation confirmed for ${selectedTables
          .map((table) => table.name)
          .join(", ")}!`,
      );
      fetchAvailableTables(currentFilters);
      setSelectedTableIds([]);
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
          <>
            {noPerfectMatch && (
              <div className="text-sm text-gray-300">
                No perfect match found
              </div>
            )}

            <FloorPlan
              tables={tables.length ? tables : allTables}
              recommendedTableId={recommendedTableId}
              recommendedGroupIds={recommendedGroupIds}
              selectedTableIds={selectedTableIds}
              onTableClick={handleTableSelect}
              isLoading={isLoading}
            />

            {/* Legend */}
            <Legend />

            {/* Reserve Button */}
            {selectedTableIds.length > 0 && !isLoading && (
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
                  : `Reserve Table${selectedTableIds.length > 1 ? "s" : ""} ${selectedTableIds.join(" + ")}`}
              </motion.button>
            )}
          </>
        </motion.div>
      </div>

      {/* Toast Notifications */}
      <Toast toasts={toasts} onRemove={removeToast} />
    </main>
  );
}
