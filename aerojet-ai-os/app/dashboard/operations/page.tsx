"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

// ─── Types ─────────────────────────────────────────────────────
type TaskSummary = { total: number; done: number; urgent: number };

type Booking = {
  id: string;
  confirmationCode: string | null;
  clientName: string;
  clientEmail: string;
  fromCity: string;
  toCity: string;
  flightDate: string | null;
  passengerCount: number;
  aircraftType: string | null;
  totalPrice: number;
  depositAmount: number;
  currency: string;
  depositPaid: boolean;
  status: string;
  assignedTo: string | null;
  internalNotes: string | null;
  taskSummary: TaskSummary;
  createdAt: string;
};

type Task = {
  id: string;
  type: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  assignedTo: string | null;
  notes: string | null;
  dueAt: string | null;
  completedAt: string | null;
};

// ─── Constants ─────────────────────────────────────────────────
const STATUS_LABEL: Record<string, string> = {
  PENDING_DEPOSIT: "Attesa deposito",
  CONFIRMED: "Confermato",
  OPERATIONS_IN_PROGRESS: "Ops in corso",
  FLIGHT_RESERVED: "Volo riservato",
  SERVICES_CONFIRMED: "Servizi confermati",
  READY_TO_FLY: "Pronto al volo",
  COMPLETED: "Completato",
  CANCELLED: "Cancellato",
};

const STATUS_COLOR: Record<string, string> = {
  PENDING_DEPOSIT: "#888",
  CONFIRMED: "#4ade80",
  OPERATIONS_IN_PROGRESS: "#facc15",
  FLIGHT_RESERVED: "#60a5fa",
  SERVICES_CONFIRMED: "#a78bfa",
  READY_TO_FLY: "#34d399",
  COMPLETED: "#22c55e",
  CANCELLED: "#f87171",
};

const PRIORITY_COLOR: Record<string, string> = {
  LOW: "#444",
  MEDIUM: "#facc15",
  HIGH: "#f97316",
  URGENT: "#f87171",
};

const TASK_STATUSES = [
  "TODO",
  "IN_PROGRESS",
  "WAITING_VENDOR",
  "WAITING_CLIENT",
  "DONE",
  "CANCELLED",
];

const BOOKING_STATUSES = [
  "CONFIRMED",
  "OPERATIONS_IN_PROGRESS",
  "FLIGHT_RESERVED",
  "SERVICES_CONFIRMED",
  "READY_TO_FLY",
  "COMPLETED",
  "CANCELLED",
];

// ─── Helpers ───────────────────────────────────────────────────
function fmt(amount: number, currency = "EUR") {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      style={{
        fontSize: "9px",
        letterSpacing: "1px",
        padding: "3px 8px",
        border: `1px solid ${STATUS_COLOR[status] ?? "#555"}`,
        color: STATUS_COLOR[status] ?? "#555",
        whiteSpace: "nowrap",
      }}
    >
      {STATUS_LABEL[status] ?? status.replace(/_/g, " ")}
    </span>
  );
}

function PriorityDot({ priority }: { priority: string }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: "6px",
        height: "6px",
        borderRadius: "50%",
        background: PRIORITY_COLOR[priority] ?? "#444",
        marginRight: "6px",
        flexShrink: 0,
      }}
    />
  );
}

// ─── Main Component ────────────────────────────────────────────
export default function OperationsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selected, setSelected] = useState<Booking | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "urgent">("active");

  // Fetch bookings
  const fetchBookings = useCallback(async () => {
    try {
      const res = await fetch("/api/bookings");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Errore");
      setBookings(data.bookings ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Errore sconosciuto");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
    const interval = setInterval(fetchBookings, 30000); // refresh ogni 30s
    return () => clearInterval(interval);
  }, [fetchBookings]);

  // Fetch tasks per booking selezionato
  const selectBooking = useCallback(async (b: Booking) => {
    setSelected(b);
    setTasks([]);
    setTasksLoading(true);
    try {
      const res = await fetch(`/api/bookings/${b.id}/tasks`);
      const data = await res.json();
      setTasks(data.tasks ?? []);
    } catch {
      setTasks([]);
    } finally {
      setTasksLoading(false);
    }
  }, []);

  // Update task
  const updateTask = useCallback(
    async (taskId: string, update: Partial<Task>) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, ...update } : t))
      );
      await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(update),
      }).catch(console.error);
    },
    []
  );

  // Update booking status
  const updateBookingStatus = useCallback(
    async (bookingId: string, status: string) => {
      await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      }).catch(console.error);
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status } : b))
      );
      if (selected?.id === bookingId) {
        setSelected((prev) => (prev ? { ...prev, status } : null));
      }
    },
    [selected]
  );

  // Filtered bookings
  const filtered = bookings.filter((b) => {
    if (filter === "active")
      return b.status !== "COMPLETED" && b.status !== "CANCELLED";
    if (filter === "urgent") return (b.taskSummary?.urgent ?? 0) > 0;
    return true;
  });

  // ── Stili base ──────────────────────────────────────────────
  const base: React.CSSProperties = {
    fontFamily: "Georgia, serif",
    background: "#080808",
    color: "#fff",
  };

  // ── Loading / Error ─────────────────────────────────────────
  if (loading)
    return (
      <div
        style={{
          ...base,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{ color: "#B8973A", letterSpacing: "3px", fontSize: "11px" }}
        >
          CARICAMENTO...
        </span>
      </div>
    );

  if (error)
    return (
      <div
        style={{
          ...base,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <span style={{ color: "#f87171" }}>Errore: {error}</span>
        <p style={{ color: "#444", fontSize: "12px" }}>
          Assicurati che il modello Booking sia nella migrazione Prisma.
        </p>
      </div>
    );

  return (
    <div style={{ ...base, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* ── Header ── */}
      <header
        style={{
          background: "#050505",
          borderBottom: "1px solid #111",
          padding: "16px 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <div>
          <span
            style={{ color: "#B8973A", fontSize: "10px", letterSpacing: "3px" }}
          >
            ✦ AEROJET PRIVATE
          </span>
          <h1
            style={{
              fontSize: "16px",
              fontWeight: "400",
              marginTop: "2px",
              letterSpacing: "1px",
              color: "#ccc",
            }}
          >
            Operations Dashboard
          </h1>
        </div>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <Link
            href="/dashboard"
            style={{
              color: "#444",
              fontSize: "11px",
              letterSpacing: "1px",
              textDecoration: "none",
            }}
          >
            ← BACK
          </Link>
        </div>
      </header>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* ── Sidebar sinistra — lista booking ── */}
        <div
          style={{
            width: selected ? "360px" : "100%",
            maxWidth: selected ? "360px" : "100%",
            borderRight: "1px solid #0f0f0f",
            overflowY: "auto",
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Stats */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "1px",
              background: "#0f0f0f",
              borderBottom: "1px solid #111",
            }}
          >
            {[
              {
                label: "TOTALE",
                value: bookings.length,
                key: "all" as const,
              },
              {
                label: "ATTIVI",
                value: bookings.filter(
                  (b) =>
                    b.status !== "COMPLETED" && b.status !== "CANCELLED"
                ).length,
                key: "active" as const,
              },
              {
                label: "URGENTI",
                value: bookings.filter(
                  (b) => (b.taskSummary?.urgent ?? 0) > 0
                ).length,
                key: "urgent" as const,
                color: "#f87171",
              },
            ].map((s) => (
              <button
                key={s.key}
                onClick={() => setFilter(s.key)}
                style={{
                  background:
                    filter === s.key ? "#111" : "#080808",
                  border: "none",
                  borderBottom:
                    filter === s.key
                      ? "2px solid #B8973A"
                      : "2px solid transparent",
                  padding: "16px 8px",
                  cursor: "pointer",
                  textAlign: "center",
                }}
              >
                <p
                  style={{
                    color: "#555",
                    fontSize: "9px",
                    letterSpacing: "2px",
                    marginBottom: "4px",
                  }}
                >
                  {s.label}
                </p>
                <p
                  style={{
                    fontSize: "22px",
                    fontWeight: "300",
                    color: s.color ?? "#fff",
                  }}
                >
                  {s.value}
                </p>
              </button>
            ))}
          </div>

          {/* Lista */}
          {filtered.length === 0 ? (
            <div
              style={{
                padding: "48px 24px",
                textAlign: "center",
                color: "#333",
              }}
            >
              <p style={{ fontSize: "14px", marginBottom: "8px" }}>
                Nessuna prenotazione
              </p>
              <p style={{ fontSize: "11px", color: "#222", lineHeight: "1.6" }}>
                I booking appariranno qui dopo
                <br />
                il pagamento del deposito
              </p>
            </div>
          ) : (
            filtered.map((b) => {
              const isSelected = selected?.id === b.id;
              const progressPct =
                b.taskSummary.total > 0
                  ? Math.round(
                      (b.taskSummary.done / b.taskSummary.total) * 100
                    )
                  : 0;

              return (
                <div
                  key={b.id}
                  onClick={() => selectBooking(b)}
                  style={{
                    padding: "16px 20px",
                    borderBottom: "1px solid #0c0c0c",
                    cursor: "pointer",
                    background: isSelected ? "#0e0e0e" : "transparent",
                    borderLeft: isSelected
                      ? "2px solid #B8973A"
                      : "2px solid transparent",
                    transition: "background 0.1s",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "6px",
                    }}
                  >
                    <span style={{ fontSize: "14px", color: "#ddd" }}>
                      {b.fromCity} → {b.toCity}
                    </span>
                    <StatusBadge status={b.status} />
                  </div>

                  <p
                    style={{
                      color: "#666",
                      fontSize: "12px",
                      marginBottom: "10px",
                    }}
                  >
                    {b.clientName}
                  </p>

                  {/* Progress bar */}
                  {b.taskSummary.total > 0 && (
                    <div style={{ marginBottom: "8px" }}>
                      <div
                        style={{
                          height: "2px",
                          background: "#111",
                          borderRadius: "1px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${progressPct}%`,
                            background:
                              progressPct === 100 ? "#4ade80" : "#B8973A",
                            transition: "width 0.3s",
                          }}
                        />
                      </div>
                    </div>
                  )}

                  <div
                    style={{
                      display: "flex",
                      gap: "12px",
                      fontSize: "10px",
                      color: "#444",
                    }}
                  >
                    <span>
                      Task: {b.taskSummary.done}/{b.taskSummary.total}
                    </span>
                    {b.taskSummary.urgent > 0 && (
                      <span style={{ color: "#f87171" }}>
                        ⚠ {b.taskSummary.urgent} urgenti
                      </span>
                    )}
                    {b.flightDate && (
                      <span style={{ marginLeft: "auto" }}>
                        {fmtDate(b.flightDate)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ── Pannello destro — dettaglio booking ── */}
        {selected && (
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "28px 32px",
            }}
          >
            {/* Header dettaglio */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "28px",
              }}
            >
              <div>
                <p
                  style={{
                    color: "#B8973A",
                    fontSize: "10px",
                    letterSpacing: "3px",
                    marginBottom: "4px",
                  }}
                >
                  {selected.confirmationCode ?? "BOOKING"}
                </p>
                <h2
                  style={{
                    fontSize: "20px",
                    fontWeight: "400",
                    marginBottom: "4px",
                  }}
                >
                  {selected.fromCity} → {selected.toCity}
                </h2>
                <p style={{ color: "#666", fontSize: "13px" }}>
                  {selected.clientName} ·{" "}
                  <a
                    href={`mailto:${selected.clientEmail}`}
                    style={{ color: "#555", textDecoration: "none" }}
                  >
                    {selected.clientEmail}
                  </a>
                </p>
              </div>
              <button
                onClick={() => {
                  setSelected(null);
                  setTasks([]);
                }}
                style={{
                  background: "none",
                  border: "1px solid #1a1a1a",
                  color: "#444",
                  padding: "6px 12px",
                  cursor: "pointer",
                  fontSize: "11px",
                  letterSpacing: "1px",
                }}
              >
                ✕ CHIUDI
              </button>
            </div>

            {/* Info volo */}
            <div
              style={{
                background: "#0a0a0a",
                border: "1px solid #111",
                padding: "20px",
                marginBottom: "20px",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
              }}
            >
              {[
                {
                  label: "DATA VOLO",
                  value: fmtDate(selected.flightDate),
                },
                {
                  label: "PASSEGGERI",
                  value: `${selected.passengerCount} pax`,
                },
                {
                  label: "AEROMOBILE",
                  value: selected.aircraftType ?? "—",
                },
                {
                  label: "PREZZO TOTALE",
                  value: fmt(selected.totalPrice, selected.currency),
                },
                {
                  label: "DEPOSITO",
                  value:
                    fmt(selected.depositAmount, selected.currency) +
                    (selected.depositPaid ? " ✓" : " ⏳"),
                  color: selected.depositPaid ? "#4ade80" : "#facc15",
                },
              ].map((item) => (
                <div key={item.label}>
                  <p
                    style={{
                      color: "#444",
                      fontSize: "9px",
                      letterSpacing: "2px",
                      marginBottom: "4px",
                    }}
                  >
                    {item.label}
                  </p>
                  <p style={{ fontSize: "13px", color: item.color ?? "#ccc" }}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Status booking */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "28px",
                background: "#0a0a0a",
                border: "1px solid #111",
                padding: "16px 20px",
              }}
            >
              <span
                style={{
                  color: "#555",
                  fontSize: "10px",
                  letterSpacing: "2px",
                  whiteSpace: "nowrap",
                }}
              >
                STATO:
              </span>
              <select
                value={selected.status}
                onChange={(e) =>
                  updateBookingStatus(selected.id, e.target.value)
                }
                style={{
                  background: "#111",
                  border: "1px solid #222",
                  color: STATUS_COLOR[selected.status] ?? "#ccc",
                  padding: "6px 10px",
                  fontSize: "12px",
                  cursor: "pointer",
                  flex: 1,
                }}
              >
                {BOOKING_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABEL[s] ?? s.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>

            {/* Task operativi */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "16px",
              }}
            >
              <p
                style={{
                  color: "#B8973A",
                  fontSize: "10px",
                  letterSpacing: "3px",
                }}
              >
                TASK OPERATIVI
              </p>
              {tasks.length > 0 && (
                <p style={{ color: "#444", fontSize: "11px" }}>
                  {tasks.filter((t) => t.status === "DONE").length}/
                  {tasks.length} completati
                </p>
              )}
            </div>

            {tasksLoading ? (
              <div
                style={{
                  padding: "32px",
                  textAlign: "center",
                  color: "#333",
                  fontSize: "12px",
                }}
              >
                Caricamento task...
              </div>
            ) : tasks.length === 0 ? (
              <div
                style={{
                  padding: "32px",
                  border: "1px solid #0f0f0f",
                  textAlign: "center",
                  color: "#333",
                }}
              >
                <p style={{ fontSize: "13px" }}>Nessun task</p>
                <p
                  style={{
                    fontSize: "11px",
                    marginTop: "8px",
                    color: "#222",
                    lineHeight: "1.6",
                  }}
                >
                  I task vengono creati automaticamente
                  <br />
                  dal webhook Stripe dopo il pagamento
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    style={{
                      border: "1px solid #0f0f0f",
                      padding: "14px 16px",
                      background:
                        task.status === "DONE" ? "#050f05" : "#090909",
                      opacity: task.status === "CANCELLED" ? 0.4 : 1,
                    }}
                  >
                    {/* Task header */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        marginBottom: "8px",
                        gap: "12px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "8px",
                          flex: 1,
                        }}
                      >
                        <PriorityDot priority={task.priority} />
                        <span
                          style={{
                            fontSize: "13px",
                            color:
                              task.status === "DONE" ? "#555" : "#ddd",
                            textDecoration:
                              task.status === "DONE"
                                ? "line-through"
                                : "none",
                            lineHeight: "1.4",
                          }}
                        >
                          {task.title}
                        </span>
                      </div>
                      <select
                        value={task.status}
                        onChange={(e) =>
                          updateTask(task.id, { status: e.target.value })
                        }
                        style={{
                          background: "#111",
                          border: "1px solid #1a1a1a",
                          color: "#888",
                          padding: "3px 6px",
                          fontSize: "10px",
                          cursor: "pointer",
                          flexShrink: 0,
                        }}
                      >
                        {TASK_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s.replace(/_/g, " ")}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Description */}
                    {task.description && (
                      <p
                        style={{
                          color: "#444",
                          fontSize: "11px",
                          marginBottom: "8px",
                          lineHeight: "1.5",
                          paddingLeft: "14px",
                        }}
                      >
                        {task.description}
                      </p>
                    )}

                    {/* Meta row */}
                    <div
                      style={{
                        display: "flex",
                        gap: "12px",
                        fontSize: "10px",
                        color: "#333",
                        paddingLeft: "14px",
                        marginBottom: "8px",
                      }}
                    >
                      <span
                        style={{ color: PRIORITY_COLOR[task.priority] ?? "#444" }}
                      >
                        {task.priority}
                      </span>
                      {task.dueAt && (
                        <span>Scade: {fmtDate(task.dueAt)}</span>
                      )}
                      {task.completedAt && (
                        <span style={{ color: "#4ade80" }}>
                          ✓ {fmtDate(task.completedAt)}
                        </span>
                      )}
                    </div>

                    {/* Note interne */}
                    <input
                      type="text"
                      placeholder="Aggiungi nota interna..."
                      defaultValue={task.notes ?? ""}
                      onBlur={(e) => {
                        const val = e.target.value.trim();
                        if (val !== (task.notes ?? "")) {
                          updateTask(task.id, { notes: val || null });
                        }
                      }}
                      style={{
                        width: "100%",
                        background: "transparent",
                        border: "none",
                        borderBottom: "1px solid #111",
                        color: "#555",
                        fontSize: "11px",
                        padding: "4px 0 4px 14px",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
