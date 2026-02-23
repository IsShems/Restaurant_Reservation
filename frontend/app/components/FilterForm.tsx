"use client";

import { motion } from "framer-motion";
import { useState } from "react";

interface FilterFormProps {
  onFilter: (filters: FilterState) => void;
  isLoading: boolean;
}

export interface FilterState {
  guests: number;
  date: string;
  time: string;
  zone: string;
  preferences: string[];
}

const zones = ["Main Hall", "Terrace", "Private Room"];
const preferenceOptions = [
  { id: "near_window", label: "Near Window", icon: "🪟" },
  { id: "private_corner", label: "Private Corner", icon: "🔒" },
  { id: "kids_zone", label: "Near Kids Zone", icon: "👶" },
];

export default function FilterForm({ onFilter, isLoading }: FilterFormProps) {
  const [filters, setFilters] = useState<FilterState>({
    guests: 2,
    date: new Date().toISOString().split("T")[0],
    time: "19:00",
    zone: "",
    preferences: [],
  });

  const handleGuestChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, guests: parseInt(e.target.value) || 1 });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, date: e.target.value });
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, time: e.target.value });
  };

  const handleZoneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({ ...filters, zone: e.target.value });
  };

  const handlePreferenceToggle = (pref: string) => {
    setFilters({
      ...filters,
      preferences: filters.preferences.includes(pref)
        ? filters.preferences.filter((p) => p !== pref)
        : [...filters.preferences, pref],
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilter(filters);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glassmorphic rounded-2xl p-6 md:p-8 mb-8 border border-dark-border/50"
    >
      <h2 className="text-2xl md:text-3xl font-bold gradient-text mb-6">
        Find Your Perfect Table
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Guest Count, Date, Time Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Guests */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Number of Guests
            </label>
            <input
              type="number"
              min="1"
              max="20"
              value={filters.guests}
              onChange={handleGuestChange}
              className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-accent smooth-transition"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Date
            </label>
            <input
              type="date"
              value={filters.date}
              onChange={handleDateChange}
              className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-accent smooth-transition"
            />
          </div>

          {/* Time */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Time
            </label>
            <input
              type="time"
              value={filters.time}
              onChange={handleTimeChange}
              className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-accent smooth-transition"
            />
          </div>
        </div>

        {/* Zone */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Zone
          </label>
          <select
            value={filters.zone}
            onChange={handleZoneChange}
            className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-accent smooth-transition"
          >
            <option value="">All Zones</option>
            {zones.map((zone) => (
              <option key={zone} value={zone.toLowerCase().replace(" ", "_")}>
                {zone}
              </option>
            ))}
          </select>
        </div>

        {/* Preferences */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Preferences
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {preferenceOptions.map(({ id, label, icon }) => (
              <motion.label
                key={id}
                whileHover={{ scale: 1.05 }}
                className="flex items-center p-3 rounded-xl bg-dark-card border border-dark-border cursor-pointer smooth-transition hover:border-purple-accent/50"
              >
                <input
                  type="checkbox"
                  checked={filters.preferences.includes(id)}
                  onChange={() => handlePreferenceToggle(id)}
                  className="w-4 h-4 rounded accent-purple-accent"
                />
                <span className="ml-3 text-sm">
                  <span className="mr-2">{icon}</span>
                  {label}
                </span>
              </motion.label>
            ))}
          </div>
        </div>

        {/* Find Table Button */}
        <motion.button
          type="submit"
          disabled={isLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full gradient-purple-red text-white font-semibold py-3 rounded-xl smooth-transition hover:shadow-glow disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Searching..." : "Find Table"}
        </motion.button>
      </form>
    </motion.div>
  );
}
