"use client";

import { motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";

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

  const usableTables = [...tables];

  // layout will be grid-like; we'll compute positions responsively inside the canvas
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [canvasSize, setCanvasSize] = useState({ w: 900, h: 540 });
  useEffect(() => {
    function update() {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setCanvasSize({
        w: Math.max(360, rect.width - 40),
        h: Math.max(360, rect.height - 40),
      });
    }
    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const normalizeZoneName = (table: Table) => {
    const rawZone = (table.zone?.name || "").toLowerCase();
    if (rawZone.startsWith("ter") || rawZone.endsWith("ony")) return "Terrace";
    if (rawZone.includes("private")) return "Private Room";
    if (rawZone.includes("kids")) return "Kids Zone";
    if (rawZone.includes("patio")) return "Patio";
    if (rawZone.includes("main")) return "Main Hall";
    return "Main Hall";
  };

  const zoneLayouts: Array<{
    key: "Main Hall" | "Patio" | "Terrace" | "Private Room" | "Kids Zone";
    leftPct: number;
    topPct: number;
    widthPct: number;
    heightPct: number;
  }> = [
    { key: "Main Hall", leftPct: 0, topPct: 0, widthPct: 50, heightPct: 100 },
    { key: "Patio", leftPct: 50, topPct: 0, widthPct: 50, heightPct: 60 },
    { key: "Terrace", leftPct: 50, topPct: 60, widthPct: 50, heightPct: 40 },
    {
      key: "Private Room",
      leftPct: 0,
      topPct: 60,
      widthPct: 15,
      heightPct: 40,
    },
    { key: "Kids Zone", leftPct: 75, topPct: 0, widthPct: 25, heightPct: 30 },
  ];

  const zoneVisuals: Record<
    "Main Hall" | "Patio" | "Terrace" | "Private Room" | "Kids Zone",
    { bg: string; label: string }
  > = {
    "Main Hall": { bg: "rgba(59, 130, 246, 0.08)", label: "Main Hall" },
    Patio: { bg: "rgba(16, 185, 129, 0.08)", label: "Patio" },
    Terrace: { bg: "rgba(236, 72, 153, 0.08)", label: "Terrace" },
    "Private Room": { bg: "rgba(245, 158, 11, 0.10)", label: "Private Room" },
    "Kids Zone": { bg: "rgba(168, 85, 247, 0.10)", label: "Kids Zone" },
  };

  const tablesByZone: Record<string, Table[]> = {
    "Main Hall": [],
    Patio: [],
    Terrace: [],
    "Private Room": [],
    "Kids Zone": [],
  };

  for (const table of usableTables) {
    const normalized = normalizeZoneName(table);
    tablesByZone[normalized].push(table);
  }

  const tableRoleById = new Map<Table["id"], string>();
  for (const table of usableTables) {
    const lower = table.name.toLowerCase();
    if (lower.includes("large table"))
      tableRoleById.set(table.id, "main-large");
    else if (lower.includes("patio table 1"))
      tableRoleById.set(table.id, "patio-anchor");
    else if (lower.includes("kids zone table"))
      tableRoleById.set(table.id, "kids-anchor");
    else if (
      lower.includes("balcony corner") ||
      lower.includes("terrace corner")
    )
      tableRoleById.set(table.id, "terrace-right");
    else tableRoleById.set(table.id, "regular");
  }

  const ensureVisualTable = (zoneKey: string, table: Table, role: string) => {
    if (!tablesByZone[zoneKey].some((t) => t.id === table.id)) {
      tablesByZone[zoneKey].push(table);
      tableRoleById.set(table.id, role);
    }
  };

  ensureVisualTable(
    "Terrace",
    {
      id: "visual-terrace-left-1",
      name: "Terrace Left 1",
      capacity: 2,
      zone: { id: -1, name: "Terrace" },
      features: ["terrace"],
      occupied: false,
      positionX: 0,
      positionY: 0,
    },
    "terrace-left-1",
  );

  ensureVisualTable(
    "Terrace",
    {
      id: "visual-terrace-left-2",
      name: "Terrace Left 2",
      capacity: 2,
      zone: { id: -1, name: "Terrace" },
      features: ["terrace"],
      occupied: false,
      positionX: 0,
      positionY: 0,
    },
    "terrace-left-2",
  );

  ensureVisualTable(
    "Patio",
    {
      id: "visual-patio-4-seat",
      name: "Patio 4-seat",
      capacity: 4,
      zone: { id: -1, name: "Patio" },
      features: ["patio"],
      occupied: false,
      positionX: 0,
      positionY: 0,
    },
    "patio-4-seat",
  );

  const displayNameByZoneAndId = new Map<string, string>();
  const displayNameById = new Map<Table["id"], string>();
  let seq = 1;
  const numberingZoneOrder: Array<
    "Main Hall" | "Private Room" | "Patio" | "Kids Zone" | "Terrace"
  > = ["Main Hall", "Private Room", "Patio", "Kids Zone", "Terrace"];

  for (const zoneKey of numberingZoneOrder) {
    const zoneList = [...(tablesByZone[zoneKey] || [])];
    if (zoneKey === "Terrace") {
      zoneList.sort((a, b) => {
        const rank = (id: Table["id"]) => {
          const role = tableRoleById.get(id);
          if (role === "terrace-left-1") return 0;
          if (role === "terrace-left-2") return 1;
          if (role === "terrace-right") return 2;
          return 3;
        };
        return rank(a.id) - rank(b.id);
      });
    }

    for (const table of zoneList) {
      const label = `Table ${seq++}`;
      displayNameByZoneAndId.set(`${zoneKey}-${table.id}`, label);
      displayNameById.set(table.id, label);
    }
  }

  const kidsZoneRect = zoneLayouts.find((z) => z.key === "Kids Zone");
  const privateRoomRect = zoneLayouts.find((z) => z.key === "Private Room");
  const kidsZoneAnchorTable =
    (tablesByZone["Kids Zone"] || []).find(
      (t) => tableRoleById.get(t.id) === "kids-anchor",
    ) || (tablesByZone["Kids Zone"] || [])[0];

  const kidsZoneAnchorRightBoundary = (() => {
    if (!kidsZoneRect || !kidsZoneAnchorTable) return canvasSize.w * 0.88;
    const zoneLeft = (kidsZoneRect.leftPct / 100) * canvasSize.w;
    const zoneWidth = (kidsZoneRect.widthPct / 100) * canvasSize.w;
    const zoneHeight = (kidsZoneRect.heightPct / 100) * canvasSize.h;
    const zonePaddingX = 14;
    const zonePaddingY = 14;
    const usableZoneW = Math.max(0, zoneWidth - zonePaddingX * 2);
    const usableZoneH = Math.max(0, zoneHeight - zonePaddingY * 2);

    const size =
      kidsZoneAnchorTable.capacity <= 2
        ? {
            w: Math.max(30, Math.min(56, Math.floor(usableZoneW * 0.22))),
            h: Math.max(30, Math.min(56, Math.floor(usableZoneW * 0.22))),
          }
        : kidsZoneAnchorTable.capacity <= 4
          ? {
              w: Math.max(44, Math.min(78, Math.floor(usableZoneW * 0.28))),
              h: Math.max(44, Math.min(78, Math.floor(usableZoneW * 0.28))),
            }
          : {
              w: Math.max(70, Math.min(130, Math.floor(usableZoneW * 0.42))),
              h: Math.max(34, Math.min(58, Math.floor(usableZoneH * 0.16))),
            };

    const x = zoneLeft + zonePaddingX + usableZoneW * 0.58 - size.w / 2;
    return x + size.w;
  })();

  return (
    <div className="w-full rounded-lg border border-dark-border bg-dark-card/50 p-6 overflow-auto">
      <div
        ref={containerRef}
        className="relative mx-auto bg-gradient-to-br from-dark-bg via-dark-card/20 to-dark-bg rounded-lg border border-dark-border/50"
        style={{ width: "100%", maxWidth: 1100, height: 600, minHeight: 420 }}
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

        {/* Windows indicators */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <line
            x1="8"
            y1="20%"
            x2="8"
            y2="45%"
            stroke="#9ee7ff"
            strokeWidth="2"
            opacity="0.35"
          />
          <line
            x1="8"
            y1="65%"
            x2="8"
            y2="90%"
            stroke="#9ee7ff"
            strokeWidth="2"
            opacity="0.35"
          />
          <line
            x1="99%"
            y1="20%"
            x2="99%"
            y2="45%"
            stroke="#9ee7ff"
            strokeWidth="2"
            opacity="0.35"
          />
          <line
            x1="99%"
            y1="65%"
            x2="99%"
            y2="90%"
            stroke="#9ee7ff"
            strokeWidth="2"
            opacity="0.35"
          />
        </svg>

        {/* Tables laid out in fixed spatial zones */}
        {(() => {
          let table2BottomBoundary: number | null = null;

          return zoneLayouts.map((zone) => {
            const zoneLeft = (zone.leftPct / 100) * canvasSize.w;
            const zoneTop = (zone.topPct / 100) * canvasSize.h;
            const zoneWidth = (zone.widthPct / 100) * canvasSize.w;
            const zoneHeight = (zone.heightPct / 100) * canvasSize.h;

            const alignmentAxisY = canvasSize.h * 0.24;
            const zoneTables = [...(tablesByZone[zone.key] || [])];

            const hasTableByName = (arr: Table[], name: string) =>
              arr.some((t) => t.name.toLowerCase() === name.toLowerCase());

            if (zone.key === "Terrace") {
              if (!hasTableByName(zoneTables, "Terrace Left 1")) {
                zoneTables.push({
                  id: "visual-terrace-left-1",
                  name: "Terrace Left 1",
                  capacity: 2,
                  zone: { id: -1, name: "Terrace" },
                  features: ["terrace"],
                  occupied: false,
                  positionX: 0,
                  positionY: 0,
                });
              }
              if (!hasTableByName(zoneTables, "Terrace Left 2")) {
                zoneTables.push({
                  id: "visual-terrace-left-2",
                  name: "Terrace Left 2",
                  capacity: 2,
                  zone: { id: -1, name: "Terrace" },
                  features: ["terrace"],
                  occupied: false,
                  positionX: 0,
                  positionY: 0,
                });
              }
            }

            if (
              zone.key === "Patio" &&
              !hasTableByName(zoneTables, "Patio 4-seat")
            ) {
              zoneTables.push({
                id: "visual-patio-4-seat",
                name: "Patio 4-seat",
                capacity: 4,
                zone: { id: -1, name: "Patio" },
                features: ["patio"],
                occupied: false,
                positionX: 0,
                positionY: 0,
              });
            }

            const zonePaddingX = 14;
            const zonePaddingY = 14;
            const usableZoneW = Math.max(0, zoneWidth - zonePaddingX * 2);
            const usableZoneH = Math.max(0, zoneHeight - zonePaddingY * 2);

            const sizeForFixed = (
              cap: number,
              referenceW: number,
              referenceH: number,
            ) => {
              if (cap <= 2) {
                const side = Math.max(
                  30,
                  Math.min(56, Math.floor(referenceW * 0.22)),
                );
                return { w: side, h: side };
              }
              if (cap <= 4) {
                const side = Math.max(
                  44,
                  Math.min(78, Math.floor(referenceW * 0.28)),
                );
                return { w: side, h: side };
              }
              return {
                w: Math.max(70, Math.min(130, Math.floor(referenceW * 0.42))),
                h: Math.max(34, Math.min(58, Math.floor(referenceH * 0.16))),
              };
            };

            const positionsById = new Map<
              Table["id"],
              { x: number; y: number; w: number; h: number }
            >();

            if (zone.key === "Main Hall") {
              const smallTables = zoneTables.filter((t) => t.capacity <= 4);
              const largeTables = zoneTables.filter((t) => t.capacity >= 6);

              const smallCount = Math.max(1, smallTables.length);
              const leftColumnX = zoneLeft + zonePaddingX + usableZoneW * 0.12;
              const topBand = zoneTop + zonePaddingY + usableZoneH * 0.08;
              const bottomBand = zoneTop + zonePaddingY + usableZoneH * 0.58;
              const stepYSmall = (bottomBand - topBand) / smallCount;

              smallTables.forEach((table, idx) => {
                const size = sizeForFixed(
                  table.capacity,
                  usableZoneW,
                  usableZoneH,
                );
                const y =
                  topBand + idx * stepYSmall + (stepYSmall - size.h) / 2;
                positionsById.set(table.id, {
                  x: leftColumnX,
                  y,
                  w: size.w,
                  h: size.h,
                });
              });

              const largeCount = Math.max(1, largeTables.length);
              const centerStart = zoneTop + zonePaddingY + usableZoneH * 0.2;
              const centerEnd = zoneTop + zonePaddingY + usableZoneH * 0.85;
              const stepYLarge = (centerEnd - centerStart) / largeCount;

              largeTables.forEach((table, idx) => {
                const size = sizeForFixed(
                  table.capacity,
                  usableZoneW,
                  usableZoneH,
                );
                const x =
                  zoneLeft + zonePaddingX + usableZoneW * 0.56 - size.w / 2;

                const alignedToSmallIdx = Math.min(
                  1,
                  Math.max(0, smallTables.length - 1),
                );
                const alignedYFromSmall =
                  smallTables.length > 0
                    ? topBand +
                      alignedToSmallIdx * stepYSmall +
                      (stepYSmall - size.h) / 2
                    : centerStart + (centerEnd - centerStart) * 0.28;

                const y =
                  idx === 0
                    ? alignedYFromSmall
                    : centerStart +
                      idx * stepYLarge +
                      (stepYLarge - size.h) / 2;

                positionsById.set(table.id, { x, y, w: size.w, h: size.h });
              });
            } else if (zone.key === "Patio") {
              const count = Math.max(1, zoneTables.length);
              const startY = zoneTop + zonePaddingY + usableZoneH * 0.35;
              const endY = zoneTop + zonePaddingY + usableZoneH * 0.95;
              const stepY = (endY - startY) / count;

              zoneTables.forEach((table, idx) => {
                const size = sizeForFixed(
                  table.capacity,
                  usableZoneW,
                  usableZoneH,
                );
                let x = zoneLeft + zonePaddingX + usableZoneW * 0.82 - size.w;
                let y = startY + idx * stepY + (stepY - size.h) / 2;

                const lower = table.name.toLowerCase();
                const isPatioTable1 = lower.includes("patio table 1");
                const isPatioFourSeat = lower === "patio 4-seat";
                if (isPatioTable1) {
                  y = alignmentAxisY - size.h / 2;
                }

                if (isPatioFourSeat) {
                  const largeBottom =
                    alignmentAxisY +
                    Math.max(34, Math.min(58, Math.floor(usableZoneH * 0.16))) /
                      2;
                  y = largeBottom - size.h;
                  x = Math.max(
                    zoneLeft + zonePaddingX,
                    canvasSize.w * 0.62 - size.w,
                  );
                }

                positionsById.set(table.id, { x, y, w: size.w, h: size.h });
              });
            } else if (zone.key === "Kids Zone") {
              const kidsTables = zoneTables.sort((a, b) =>
                String(a.id) > String(b.id) ? 1 : -1,
              );
              const count = Math.max(1, kidsTables.length);
              const stepY = usableZoneH / count;

              kidsTables.forEach((table, idx) => {
                const size = sizeForFixed(
                  Math.min(table.capacity, 4),
                  usableZoneW,
                  usableZoneH,
                );
                const x =
                  zoneLeft + zonePaddingX + usableZoneW * 0.58 - size.w / 2;
                let y =
                  zoneTop + zonePaddingY + idx * stepY + (stepY - size.h) / 2;

                if (table.name.toLowerCase().includes("kids zone table")) {
                  y = canvasSize.h * 0.45 - size.h;
                }

                positionsById.set(table.id, { x, y, w: size.w, h: size.h });
              });
            } else if (zone.key === "Terrace") {
              const terraceOrdered = [...zoneTables].sort((a, b) => {
                const rank = (name: string) => {
                  const lower = name.toLowerCase();
                  if (lower === "terrace left 1") return 0;
                  if (lower === "terrace left 2") return 1;
                  if (
                    lower.includes("balcony corner") ||
                    lower.includes("terrace")
                  )
                    return 2;
                  return 3;
                };
                return rank(a.name) - rank(b.name);
              });

              const baseSize = sizeForFixed(2, usableZoneW, usableZoneH);
              const rowY = zoneTop + zonePaddingY + usableZoneH * 0.52;
              const rightX =
                zoneLeft + zonePaddingX + usableZoneW * 0.84 - baseSize.w;
              const gap = Math.max(14, Math.floor(baseSize.w * 0.35));

              terraceOrdered.forEach((table, idx) => {
                const size = sizeForFixed(
                  table.capacity,
                  usableZoneW,
                  usableZoneH,
                );

                let x = rightX;
                const lower = table.name.toLowerCase();
                if (lower === "terrace left 1") x = rightX - (size.w + gap) * 2;
                else if (lower === "terrace left 2")
                  x = rightX - (size.w + gap);

                const y = rowY - size.h / 2;
                positionsById.set(table.id, { x, y, w: size.w, h: size.h });
              });
            } else if (zone.key === "Private Room") {
              const count = Math.max(1, zoneTables.length);
              const stepY = usableZoneH / count;

              zoneTables.forEach((table, idx) => {
                const size = sizeForFixed(
                  table.capacity,
                  usableZoneW,
                  usableZoneH,
                );
                const x = zoneLeft + zonePaddingX + (usableZoneW - size.w) / 2;
                const y =
                  zoneTop + zonePaddingY + idx * stepY + (stepY - size.h) / 2;
                positionsById.set(table.id, { x, y, w: size.w, h: size.h });
              });
            }

            return (
              <React.Fragment key={`zone-block-${zone.key}`}>
                <div
                  className="absolute rounded-lg border border-gray-700/30 bg-gray-900/10"
                  style={{
                    left: zoneLeft,
                    top: zoneTop,
                    width: zoneWidth,
                    height: zoneHeight,
                    pointerEvents: "none",
                    background: zoneVisuals[zone.key].bg,
                  }}
                >
                  <div className="absolute top-2 left-2 text-xs text-gray-300 font-semibold">
                    {zoneVisuals[zone.key].label}
                  </div>
                </div>

                {zoneTables.map((table) => {
                  const fallback = sizeForFixed(
                    table.capacity,
                    usableZoneW,
                    usableZoneH,
                  );
                  const computed = positionsById.get(table.id);
                  const size = computed
                    ? { w: computed.w, h: computed.h }
                    : fallback;
                  const x = computed
                    ? computed.x
                    : zoneLeft + zonePaddingX + (usableZoneW - fallback.w) / 2;
                  const y = computed
                    ? computed.y
                    : zoneTop + zonePaddingY + (usableZoneH - fallback.h) / 2;

                  const lowerName = table.name.toLowerCase();
                  const isMainHallTable1 =
                    zone.key === "Main Hall" &&
                    (lowerName === "table 1" || lowerName.includes("table 1"));
                  const isLargeTable = lowerName.includes("large table");

                  if (isMainHallTable1 || isLargeTable) {
                    const adjustedY = alignmentAxisY - size.h / 2;
                    if (computed) {
                      computed.y = adjustedY;
                    }
                  }

                  let finalY =
                    isMainHallTable1 || isLargeTable
                      ? alignmentAxisY - size.h / 2
                      : y;

                  const displayName =
                    displayNameByZoneAndId.get(`${zone.key}-${table.id}`) ||
                    table.name;

                  const effectiveZoneKey =
                    displayName === "Table 4" ? "Private Room" : zone.key;

                  const isRecommended = table.id === recommendedTableId;
                  const isSelected = table.id === selectedTableId;
                  const isAvailable = !table.occupied;

                  const isPatioTable1 = lowerName.includes("patio table 1");
                  const isPatioFourSeat = lowerName === "patio 4-seat";
                  const isBalconyCorner = lowerName.includes("balcony corner");

                  let renderW = isPatioTable1
                    ? Math.max(34, Math.floor(size.w * 0.774))
                    : size.w;

                  let renderX = isPatioTable1
                    ? kidsZoneAnchorRightBoundary - renderW
                    : x;

                  let renderH = size.h;

                  if (displayName === "Table 4") {
                    const prLeft = privateRoomRect
                      ? (privateRoomRect.leftPct / 100) * canvasSize.w
                      : 0;
                    const prWidth = privateRoomRect
                      ? (privateRoomRect.widthPct / 100) * canvasSize.w
                      : canvasSize.w * 0.15;
                    finalY = canvasSize.h * 0.65;
                    renderH = canvasSize.h * 0.25;
                    renderX = prLeft + (prWidth - renderW) / 2;
                  }

                  if (displayName === "Table 5") {
                    renderX = renderX + 10;
                  }

                  if (displayName === "Table 2") {
                    table2BottomBoundary = finalY + renderH;
                  }

                  if (
                    displayName === "Table 6" &&
                    table2BottomBoundary !== null
                  ) {
                    finalY = table2BottomBoundary - renderH;
                  }

                  const forceNotNearWindow =
                    lowerName.includes("large table") ||
                    lowerName.includes("patio table 1") ||
                    lowerName === "patio 4-seat";

                  const forceNearWindow = isBalconyCorner;

                  const nearWindow =
                    forceNearWindow ||
                    (!forceNotNearWindow &&
                      (renderX < 60 ||
                        renderX + renderW > canvasSize.w - 60 ||
                        finalY < 60 ||
                        finalY + renderH > canvasSize.h - 60));

                  const cleanedFeatures = (table.features || [])
                    .map((feature) => feature.trim())
                    .filter((feature) => feature.length > 0)
                    .filter((feature) => {
                      const lower = feature.toLowerCase();
                      const normalized = lower.replace(/[_-]/g, " ");
                      if (lower.includes("window")) return false;
                      if (normalized.includes("private area")) return false;
                      if (normalized.includes("main hall")) return false;
                      if (normalized.includes("patio")) return false;
                      if (normalized.includes("terrace")) return false;
                      if (normalized.includes("private room")) return false;
                      if (normalized.includes("kids zone")) return false;
                      return true;
                    });

                  if (effectiveZoneKey === "Private Room") {
                    cleanedFeatures.push("Quiet Corner");
                  }

                  let uniqueDescriptors = Array.from(new Set(cleanedFeatures));

                  if (displayName === "Table 5") {
                    uniqueDescriptors = uniqueDescriptors.filter(
                      (desc) => !desc.toLowerCase().includes("private"),
                    );
                    uniqueDescriptors.push("Kids Zone");
                  }

                  if (displayName === "Table 6") {
                    uniqueDescriptors = uniqueDescriptors.filter(
                      (desc) => !desc.toLowerCase().includes("kids zone"),
                    );
                  }

                  if (displayName === "Table 4" || displayName === "Table 10") {
                    uniqueDescriptors = uniqueDescriptors.filter(
                      (desc) => !desc.toLowerCase().includes("private area"),
                    );
                  }

                  return (
                    <motion.div
                      key={`${zone.key}-${table.id}`}
                      className="absolute group"
                      style={{
                        left: renderX,
                        top: finalY,
                        width: renderW,
                        height: renderH,
                      }}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.25 }}
                    >
                      <motion.button
                        onClick={() => isAvailable && onTableClick(table)}
                        disabled={!isAvailable}
                        className={`relative font-semibold transition-all flex items-center justify-center text-sm select-none ${
                          isAvailable ? "cursor-pointer" : "cursor-not-allowed"
                        }`}
                        style={{
                          width: "100%",
                          height: "100%",
                          borderRadius: isRecommended ? 8 : 6,
                          background: "linear-gradient(135deg,#8b5cf6,#6d28d9)",
                          opacity: isAvailable ? 1 : 0.4,
                          boxShadow: isRecommended
                            ? "0 0 18px rgba(139,92,246,0.6)"
                            : "0 2px 8px rgba(0,0,0,0.3)",
                          border: isSelected
                            ? "2px solid #f0abfc"
                            : "2px solid rgba(255,255,255,0.04)",
                        }}
                        whileHover={isAvailable ? { scale: 1.03 } : {}}
                        whileTap={isAvailable ? { scale: 0.98 } : {}}
                      >
                        <div
                          className="flex flex-col items-center justify-center w-full"
                          style={{ color: "white" }}
                        >
                          <span className="font-bold text-sm">
                            {displayName}
                          </span>
                          <span className="text-xs">
                            {table.capacity} seats
                          </span>
                        </div>

                        {isRecommended && (
                          <div className="absolute -top-3 -right-3 bg-yellow-400 text-black rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                            ⭐
                          </div>
                        )}
                      </motion.button>

                      <div className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 bg-gray-900 text-white text-xs rounded px-3 py-2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 shadow-lg">
                        <div className="font-semibold">
                          {displayName} • {table.capacity} seats
                        </div>
                        <div className="text-xs text-gray-300">
                          Zone: {effectiveZoneKey}
                          {nearWindow ? " • Near Window" : ""}
                        </div>
                        {uniqueDescriptors.length > 0 && (
                          <div className="text-xs text-gray-300">
                            {uniqueDescriptors.join(", ")}
                          </div>
                        )}
                        {!isAvailable && (
                          <div className="text-xs text-red-400 mt-1">
                            Currently occupied
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </React.Fragment>
            );
          });
        })()}
      </div>

      {/* Table count info */}
      <div className="mt-4 text-sm text-gray-400">
        Showing {tables.filter((t) => !t.occupied).length} of {tables.length}{" "}
        tables available
      </div>
    </div>
  );
}
