"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

type LayoutTable = {
  id: number;
  name: string;
  seats: number;
  positionX: number | null;
  positionY: number | null;
};

type ReservationItem = {
  id: number;
  guestName: string;
  guestCount: number;
  tableNumbers: string[];
  dateTime: string;
  date: string;
  time: string;
};

type ReservationGroups = {
  today: ReservationItem[];
  last7Days: ReservationItem[];
  upcoming: ReservationItem[];
};

const API_BASE = "http://localhost:8081/api/admin";
const CANVAS_WIDTH = 1060;
const CANVAS_HEIGHT = 560;
const TABLE_WIDTH = 120;
const TABLE_HEIGHT = 70;
const RELATIVE_COORD_SCALE = 100000;
const RELATIVE_COORD_THRESHOLD = 2000;

const USER_VISUAL_BASELINE_BY_NAME: Record<string, { x: number; y: number }> = {
  "table 1": { x: 74, y: 106 },
  "table 2": { x: 74, y: 176 },
  "table 3": { x: 156, y: 104 },
  "table 4": { x: 39, y: 399 },
  "table 5": { x: 783, y: 84 },
  "table 6": { x: 856, y: 176 },
  "table 7": { x: 590, y: 84 },
  "table 8": { x: 716, y: 424 },
  "table 9": { x: 791, y: 424 },
  "table 10": { x: 866, y: 424 },
};

const TABLE_DIMENSIONS_BY_NAME: Record<string, { w: number; h: number }> = {
  "table 1": { w: 56, h: 56 },
  "table 2": { w: 56, h: 78 },
  "table 3": { w: 130, h: 58 },
  "table 4": { w: 80, h: 141 },
  "table 5": { w: 49, h: 78 },
  "table 6": { w: 56, h: 78 },
  "table 7": { w: 56, h: 78 },
  "table 8": { w: 56, h: 56 },
  "table 9": { w: 56, h: 56 },
  "table 10": { w: 56, h: 56 },
};

const normalizeTableName = (name: string) =>
  name.trim().toLowerCase().replace(/\s+/g, " ");

const decodeStoredPosition = (
  value: number | null | undefined,
  maxPx: number,
) => {
  // EN: Decodes persisted relative coordinates into pixel coordinates for the editor canvas.
  // EE: Dekodeerib püsitatud suhtelised koordinaadid redaktori lõuendi pikslikoordinaatideks.
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return 0;
  }

  if (numeric > RELATIVE_COORD_THRESHOLD) {
    return Math.round((numeric / RELATIVE_COORD_SCALE) * maxPx);
  }

  return numeric;
};

const encodeRelativePosition = (valuePx: number, maxPx: number) => {
  // EN: Encodes pixel coordinates into a stable relative scale before persistence.
  // EE: Kodeerib pikslikoordinaadid enne salvestamist stabiilsesse suhtelisse skaalasse.
  const safeMax = Math.max(1, maxPx);
  const percent = Math.max(0, Math.min(1, valuePx / safeMax));
  return Math.round(percent * RELATIVE_COORD_SCALE);
};

function toDisplayDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString();
}

function toDisplayTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function AdminPage() {
  // EN: Admin workspace for authentication, floor-plan editing, and reservation management.
  // EE: Admini töövaade autentimiseks, põhiplaani muutmiseks ja broneeringute haldamiseks.
  const canvasViewportRef = useRef<HTMLDivElement | null>(null);

  const getTableDimensions = (tableName: string) => {
    return (
      TABLE_DIMENSIONS_BY_NAME[normalizeTableName(tableName)] || {
        w: TABLE_WIDTH,
        h: TABLE_HEIGHT,
      }
    );
  };

  const clampToBounds = (
    x: number,
    y: number,
    tableWidth: number = TABLE_WIDTH,
    tableHeight: number = TABLE_HEIGHT,
    boundsWidth: number = CANVAS_WIDTH,
    boundsHeight: number = CANVAS_HEIGHT,
  ) => {
    const maxX = Math.max(0, boundsWidth - tableWidth);
    const maxY = Math.max(0, boundsHeight - tableHeight);
    return {
      x: Math.max(0, Math.min(maxX, x)),
      y: Math.max(0, Math.min(maxY, y)),
    };
  };

  const canvasRef = useRef<HTMLDivElement | null>(null);
  const [canvasScale, setCanvasScale] = useState(1);

  const [password, setPassword] = useState("");
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");

  const [tables, setTables] = useState<LayoutTable[]>([]);
  const [positions, setPositions] = useState<
    Record<number, { x: number; y: number }>
  >({});
  const [dragId, setDragId] = useState<number | null>(null);
  const [layoutMessage, setLayoutMessage] = useState("");
  const [savingLayout, setSavingLayout] = useState(false);

  const [reservations, setReservations] = useState<ReservationGroups>({
    today: [],
    last7Days: [],
    upcoming: [],
  });
  const [reservationMessage, setReservationMessage] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const hasUnsavedLayout = useMemo(() => {
    return tables.some((table) => {
      const p = positions[table.id];
      if (!p) return false;
      return p.x !== (table.positionX ?? 0) || p.y !== (table.positionY ?? 0);
    });
  }, [tables, positions]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const updateScale = () => {
      if (!canvasViewportRef.current) return;
      const availableWidth = canvasViewportRef.current.clientWidth;
      const nextScale = Math.min(1, availableWidth / CANVAS_WIDTH);
      setCanvasScale(
        Number.isFinite(nextScale) && nextScale > 0 ? nextScale : 1,
      );
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    if (canvasViewportRef.current) {
      observer.observe(canvasViewportRef.current);
    }

    window.addEventListener("resize", updateScale);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateScale);
    };
  }, [isAuthenticated]);

  useEffect(() => {
    const checkSession = async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      try {
        const response = await fetch(`${API_BASE}/auth/session`, {
          credentials: "include",
          signal: controller.signal,
        });
        if (!response.ok) {
          setIsAuthenticated(false);
          setAuthError("Backend unavailable. Start backend on port 8081.");
          return;
        }
        const data = await response.json();
        setIsAuthenticated(Boolean(data.authenticated));
      } catch {
        setIsAuthenticated(false);
        setAuthError("Cannot reach backend on localhost:8081.");
      } finally {
        clearTimeout(timeout);
        setIsCheckingSession(false);
      }
    };

    checkSession();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    loadAdminData();
  }, [isAuthenticated]);

  const loadAdminData = async () => {
    setLayoutMessage("");
    setReservationMessage("");

    try {
      const [layoutResponse, reservationResponse] = await Promise.all([
        fetch(`${API_BASE}/tables/layout`, { credentials: "include" }),
        fetch(`${API_BASE}/reservations`, { credentials: "include" }),
      ]);

      if (layoutResponse.status === 401 || reservationResponse.status === 401) {
        setIsAuthenticated(false);
        setAuthError("Session expired. Please sign in again.");
        return;
      }

      if (!layoutResponse.ok || !reservationResponse.ok) {
        throw new Error("Could not load admin data");
      }

      const layoutData = await layoutResponse.json();
      const reservationData = await reservationResponse.json();

      const fetchedTables: LayoutTable[] = Array.isArray(layoutData.tables)
        ? layoutData.tables
        : [];

      const layoutActive = Boolean(layoutData.layoutActive);

      const effectiveTables = fetchedTables.map((table) => {
        if (layoutActive) {
          return {
            ...table,
            positionX: decodeStoredPosition(table.positionX, CANVAS_WIDTH),
            positionY: decodeStoredPosition(table.positionY, CANVAS_HEIGHT),
          };
        }

        const baseline =
          USER_VISUAL_BASELINE_BY_NAME[normalizeTableName(table.name)] || null;
        if (!baseline) {
          return table;
        }

        return {
          ...table,
          positionX: baseline.x,
          positionY: baseline.y,
        };
      });

      const mappedEffectivePositions = effectiveTables.reduce<
        Record<number, { x: number; y: number }>
      >((acc, table) => {
        const dims = getTableDimensions(table.name);
        const clamped = clampToBounds(
          table.positionX ?? 0,
          table.positionY ?? 0,
          dims.w,
          dims.h,
        );
        acc[table.id] = {
          x: clamped.x,
          y: clamped.y,
        };
        return acc;
      }, {});

      setTables(effectiveTables);
      setPositions(mappedEffectivePositions);
      setReservations({
        today: Array.isArray(reservationData.today)
          ? reservationData.today
          : [],
        last7Days: Array.isArray(reservationData.last7Days)
          ? reservationData.last7Days
          : [],
        upcoming: Array.isArray(reservationData.upcoming)
          ? reservationData.upcoming
          : [],
      });
    } catch {
      setLayoutMessage("Unable to load table layout.");
      setReservationMessage("Unable to load reservations.");
    }
  };

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setAuthError("");

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setAuthError(data.message || "Invalid password");
        return;
      }

      setPassword("");
      setIsAuthenticated(true);
    } catch {
      setAuthError("Could not connect to backend");
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } finally {
      setIsAuthenticated(false);
      setTables([]);
      setPositions({});
      setReservations({ today: [], last7Days: [], upcoming: [] });
      setCurrentPassword("");
      setNewPassword("");
      setPasswordMessage("");
    }
  };

  const clamp = (x: number, y: number, tableName?: string) => {
    const dims = tableName
      ? getTableDimensions(tableName)
      : { w: TABLE_WIDTH, h: TABLE_HEIGHT };

    const canvas = canvasRef.current;
    if (!canvas) {
      return clampToBounds(x, y, dims.w, dims.h);
    }

    return clampToBounds(
      x,
      y,
      dims.w,
      dims.h,
      canvas.clientWidth,
      canvas.clientHeight,
    );
  };

  const moveTable = (id: number, x: number, y: number) => {
    const table = tables.find((item) => item.id === id);
    const c = clamp(x, y, table?.name);
    setPositions((prev) => ({ ...prev, [id]: { x: c.x, y: c.y } }));
  };

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (dragId === null || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const draggedTable = tables.find((table) => table.id === dragId);
    const dims = draggedTable
      ? getTableDimensions(draggedTable.name)
      : { w: TABLE_WIDTH, h: TABLE_HEIGHT };
    const x = Math.round(
      (event.clientX - rect.left) / canvasScale - dims.w / 2,
    );
    const y = Math.round((event.clientY - rect.top) / canvasScale - dims.h / 2);
    moveTable(dragId, x, y);
    setDragId(null);
  };

  const saveLayout = async () => {
    setSavingLayout(true);
    setLayoutMessage("");

    try {
      const payload = {
        positions: tables.map((table) => ({
          id: table.id,
          positionX: encodeRelativePosition(
            positions[table.id]?.x ?? table.positionX ?? 0,
            CANVAS_WIDTH,
          ),
          positionY: encodeRelativePosition(
            positions[table.id]?.y ?? table.positionY ?? 0,
            CANVAS_HEIGHT,
          ),
        })),
      };

      const response = await fetch(`${API_BASE}/tables/layout`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.status === 401) {
        setIsAuthenticated(false);
        setAuthError("Session expired. Please sign in again.");
        return;
      }

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Could not save layout");
      }

      setTables((prev) =>
        prev.map((table) => ({
          ...table,
          positionX: positions[table.id]?.x ?? table.positionX,
          positionY: positions[table.id]?.y ?? table.positionY,
        })),
      );

      localStorage.setItem("admin-layout-saved", String(Date.now()));

      setLayoutMessage("Layout saved successfully.");
    } catch (error) {
      setLayoutMessage(
        error instanceof Error ? error.message : "Could not save layout",
      );
    } finally {
      setSavingLayout(false);
    }
  };

  const deleteReservation = async (id: number) => {
    setReservationMessage("");

    try {
      const response = await fetch(`${API_BASE}/reservations/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.status === 401) {
        setIsAuthenticated(false);
        setAuthError("Session expired. Please sign in again.");
        return;
      }

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Could not delete reservation");
      }

      setReservations((prev) => ({
        today: prev.today.filter((r) => r.id !== id),
        last7Days: prev.last7Days.filter((r) => r.id !== id),
        upcoming: prev.upcoming.filter((r) => r.id !== id),
      }));
      setReservationMessage("Reservation deleted.");
    } catch (error) {
      setReservationMessage(
        error instanceof Error ? error.message : "Could not delete reservation",
      );
    }
  };

  const changePassword = async (event: FormEvent) => {
    event.preventDefault();
    setPasswordMessage("");

    if (newPassword.length < 8) {
      setPasswordMessage("New password must be at least 8 characters.");
      return;
    }

    setChangingPassword(true);

    try {
      const response = await fetch(`${API_BASE}/auth/change-password`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (response.status === 401) {
        setIsAuthenticated(false);
        setAuthError("Session expired. Please sign in again.");
        return;
      }

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setPasswordMessage(data.message || "Password update failed.");
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setPasswordMessage("Password updated.");
    } catch {
      setPasswordMessage("Unable to change password.");
    } finally {
      setChangingPassword(false);
    }
  };

  const ReservationCard = ({
    title,
    items,
  }: {
    title: string;
    items: ReservationItem[];
  }) => (
    <section className="rounded-2xl border border-dark-border bg-dark-card p-5 shadow-lg">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-gray-400">No reservations</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-dark-border bg-dark-bg/50 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
            >
              <div className="space-y-1 text-sm text-gray-200">
                <div>
                  <span className="text-gray-400">Guest:</span> {item.guestName}
                </div>
                <div>
                  <span className="text-gray-400">Guest Count:</span>{" "}
                  {item.guestCount}
                </div>
                <div>
                  <span className="text-gray-400">Table:</span>{" "}
                  {item.tableNumbers.join(", ")}
                </div>
                <div>
                  <span className="text-gray-400">Date:</span>{" "}
                  {item.date || toDisplayDate(item.dateTime)}
                </div>
                <div>
                  <span className="text-gray-400">Time:</span>{" "}
                  {item.time || toDisplayTime(item.dateTime)}
                </div>
              </div>
              <button
                onClick={() => deleteReservation(item.id)}
                className="py-2.5 px-4 rounded-lg font-semibold text-white transition-all bg-gradient-to-r from-purple-accent to-purple-dark hover:from-purple-dark hover:to-purple-accent active:scale-95 shadow-lg"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );

  if (isCheckingSession) {
    return (
      <main className="min-h-screen bg-dark-bg text-white flex items-center justify-center px-4">
        <p className="text-gray-300">Loading admin panel...</p>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-dark-bg text-white flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-dark-border bg-dark-card p-8 shadow-lg">
          <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
          <p className="text-sm text-gray-400 mb-6">
            Sign in with admin password
          </p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-dark-bg border border-dark-border text-white focus:outline-none focus:border-purple-accent"
              placeholder="Admin password"
              required
            />
            {authError && <p className="text-sm text-red-300">{authError}</p>}
            <button
              type="submit"
              className="w-full py-3 rounded-lg font-semibold text-white transition-all bg-gradient-to-r from-purple-accent to-purple-dark hover:from-purple-dark hover:to-purple-accent active:scale-95 shadow-lg"
            >
              Sign In
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-dark-bg text-white px-4 py-8 md:px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">Admin Panel</h1>
            <p className="text-sm text-gray-400">
              Isolated admin controls for layout and reservations.
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="py-2.5 px-4 rounded-lg font-semibold text-white transition-all bg-gradient-to-r from-purple-accent to-purple-dark hover:from-purple-dark hover:to-purple-accent active:scale-95 shadow-lg"
          >
            Logout
          </button>
        </header>

        <section className="rounded-2xl border border-dark-border bg-dark-card p-5 shadow-lg">
          <h2 className="text-xl font-semibold mb-3">Change Admin Password</h2>
          <form
            onSubmit={changePassword}
            className="grid grid-cols-1 md:grid-cols-3 gap-3"
          >
            <input
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              className="px-4 py-3 rounded-lg bg-dark-bg border border-dark-border text-white focus:outline-none focus:border-purple-accent"
              placeholder="Current password"
              required
            />
            <input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              className="px-4 py-3 rounded-lg bg-dark-bg border border-dark-border text-white focus:outline-none focus:border-purple-accent"
              placeholder="New password"
              required
            />
            <button
              type="submit"
              disabled={changingPassword}
              className="py-3 rounded-lg font-semibold text-white transition-all bg-gradient-to-r from-purple-accent to-purple-dark hover:from-purple-dark hover:to-purple-accent active:scale-95 shadow-lg disabled:opacity-50"
            >
              {changingPassword ? "Updating..." : "Update Password"}
            </button>
          </form>
          {passwordMessage && (
            <p className="text-sm text-gray-300 mt-3">{passwordMessage}</p>
          )}
        </section>

        <section className="rounded-2xl border border-dark-border bg-dark-card p-5 shadow-lg space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Table Layout Editor</h2>
              <p className="text-sm text-gray-400">
                Drag tables and save X/Y positions only.
              </p>
            </div>
            <button
              onClick={saveLayout}
              disabled={!hasUnsavedLayout || savingLayout}
              className="py-2.5 px-4 rounded-lg font-semibold text-white transition-all bg-gradient-to-r from-purple-accent to-purple-dark hover:from-purple-dark hover:to-purple-accent active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {savingLayout ? "Saving..." : "Save Layout"}
            </button>
          </div>

          {layoutMessage && (
            <p className="text-sm text-gray-300">{layoutMessage}</p>
          )}

          <div ref={canvasViewportRef} className="w-full">
            <div
              className="relative mx-auto"
              style={{
                width: "100%",
                maxWidth: CANVAS_WIDTH,
                height: CANVAS_HEIGHT * canvasScale,
              }}
            >
              <div
                ref={canvasRef}
                onDrop={onDrop}
                onDragOver={(event) => event.preventDefault()}
                className="relative rounded-xl border border-dark-border bg-dark-bg overflow-hidden"
                style={{
                  width: CANVAS_WIDTH,
                  height: CANVAS_HEIGHT,
                  transform: `scale(${canvasScale})`,
                  transformOrigin: "top left",
                }}
              >
                {tables.map((table) => {
                  const p = positions[table.id] || {
                    x: table.positionX ?? 0,
                    y: table.positionY ?? 0,
                  };
                  const dims = getTableDimensions(table.name);
                  return (
                    <div
                      key={table.id}
                      draggable
                      onDragStart={() => {
                        setDragId(table.id);
                        setLayoutMessage("");
                      }}
                      onDragEnd={() => setDragId(null)}
                      style={{
                        left: p.x,
                        top: p.y,
                        width: dims.w,
                        height: dims.h,
                      }}
                      className="absolute rounded-xl border border-dark-border bg-gradient-to-r from-purple-accent to-red-accent p-2 text-white shadow-lg cursor-move select-none"
                    >
                      <div className="text-xs font-semibold truncate">
                        {table.name}
                      </div>
                      <div className="text-[11px] text-gray-100 mt-1">
                        Seats: {table.seats}
                      </div>
                      <div className="text-[11px] text-gray-200 mt-1">
                        ID: {table.id}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Reservations List</h2>
          {reservationMessage && (
            <p className="text-sm text-gray-300">{reservationMessage}</p>
          )}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <ReservationCard title="Today" items={reservations.today} />
            <ReservationCard
              title="Last 7 Days"
              items={reservations.last7Days}
            />
            <ReservationCard title="Upcoming" items={reservations.upcoming} />
          </div>
        </section>
      </div>
    </main>
  );
}
