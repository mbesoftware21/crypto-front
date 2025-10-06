import { useEffect, useState } from "react";
import {
  getCryptos,
  createCrypto,
  updateCrypto,
  deleteCrypto,
  syncCrypto,
} from "../services/cryptos";
import type { Crypto } from "../types/crypto";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface SyncedData {
  [symbol: string]: {
    price: number;
    volume: number;
    percent_change_24h: number;
    createdAt: string;
  }[];
}

interface Order {
  type: "buy" | "sell";
  symbol: string;
  amount: number;
  price: number;
  total: number;
  date: string;
}

export default function Home() {
  const [cryptos, setCryptos] = useState<Crypto[]>([]);
  const [form, setForm] = useState({ symbol: "", name: "" });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [syncedData, setSyncedData] = useState<SyncedData>({});
  const [balance, setBalance] = useState(10000); // saldo ficticio en USD
  const [orders, setOrders] = useState<Order[]>([]);
  const [trade, setTrade] = useState<{ [symbol: string]: { amount: number; type: "buy" | "sell" } }>({});

  useEffect(() => {
    loadCryptos();
  }, []);

  const loadCryptos = async () => {
    const data = await getCryptos();
    setCryptos(data);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.symbol || !form.name) return;
    await createCrypto(form);
    setForm({ symbol: "", name: "" });
    loadCryptos();
  };

  const handleUpdate = async (id: number) => {
    await updateCrypto(id, form);
    setEditingId(null);
    setForm({ symbol: "", name: "" });
    loadCryptos();
  };

  const handleDelete = async (id: number) => {
    if (confirm("¿Eliminar cripto?")) {
      await deleteCrypto(id);
      loadCryptos();
    }
  };

  const handleEditClick = (crypto: Crypto) => {
    setEditingId(crypto.id);
    setForm({ symbol: crypto.symbol, name: crypto.name });
  };

  const handleSync = async (symbol: string) => {
    try {
      const res = await syncCrypto(symbol);
      setSyncedData((prev) => ({
        ...prev,
        [symbol]: [
          ...(prev[symbol] || []),
          {
            price: Number(res.price),
            volume: Number(res.volume),
            percent_change_24h: Number(res.percent_change_24h),
            createdAt: new Date().toISOString(),
          },
        ],
      }));
    } catch (err) {
      console.error(err);
      alert("Error al sincronizar");
    }
  };

  const handleTrade = (symbol: string) => {
    const last = syncedData[symbol]?.at(-1);
    if (!last) {
      alert("Primero sincroniza los datos de la moneda");
      return;
    }

    const { amount, type } = trade[symbol] || { amount: 0, type: "buy" };
    const total = amount * last.price;

    if (amount <= 0) {
      alert("Cantidad inválida");
      return;
    }

    if (type === "buy" && total > balance) {
      alert("Fondos insuficientes");
      return;
    }

    setBalance((prev) => (type === "buy" ? prev - total : prev + total));

    setOrders((prev) => [
      {
        type,
        symbol,
        amount,
        price: last.price,
        total,
        date: new Date().toLocaleString(),
      },
      ...prev,
    ]);

    setTrade((prev) => ({ ...prev, [symbol]: { ...prev[symbol], amount: 0 } }));
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Crypto Exchange</h1>
        <form onSubmit={handleCreate} className="crypto-form">
          <input
            placeholder="Símbolo (ej: BTC)"
            value={form.symbol}
            onChange={(e) => setForm({ ...form, symbol: e.target.value })}
          />
          <input
            placeholder="Nombre (ej: Bitcoin)"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          {editingId ? (
            <>
              <button
                type="button"
                onClick={() => handleUpdate(editingId)}
                className="btn btn-warning"
              >
                Actualizar
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm({ symbol: "", name: "" });
                }}
                className="btn btn-secondary"
              >
                Cancelar
              </button>
            </>
          ) : (
            <button type="submit" className="btn btn-success">
              Crear
            </button>
          )}
        </form>
        <div style={{ marginTop: "1rem", fontWeight: "600" }}>
          💰 Saldo disponible:{" "}
          <span style={{ color: "#22c55e" }}>${balance.toFixed(2)}</span>
        </div>
      </header>

      <div className="crypto-grid">
        {cryptos.map((c) => (
          <div key={c.id} className="crypto-card">
            <div className="crypto-card-header">
              <h2>
                {c.symbol} - {c.name}
              </h2>
              <div className="crypto-actions">
                <button onClick={() => handleEditClick(c)} className="btn btn-info">
                  Editar
                </button>
                <button onClick={() => handleDelete(c.id)} className="btn btn-danger">
                  Eliminar
                </button>
                <button onClick={() => handleSync(c.symbol)} className="btn btn-primary">
                  Sync
                </button>
              </div>
            </div>

            {syncedData[c.symbol] && syncedData[c.symbol].length > 0 && (
              <>
                <div className="crypto-price">
                  Último precio: $
                  {syncedData[c.symbol][syncedData[c.symbol].length - 1].price.toFixed(2)} | Cambio 24h:{" "}
                  {syncedData[c.symbol][syncedData[c.symbol].length - 1].percent_change_24h.toFixed(2)}%
                </div>

                <ResponsiveContainer width="100%" height={150}>
                  <LineChart data={syncedData[c.symbol]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="createdAt" hide />
                    <YAxis domain={["auto", "auto"]} stroke="#8884d8" tick={{ fill: "#aaa" }} />
                    <Tooltip contentStyle={{ backgroundColor: "#222", borderRadius: 8 }} />
                    <Line type="monotone" dataKey="price" stroke="#22c55e" dot={false} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>

                {/* 💱 Panel de trading */}
                <div style={{ marginTop: "1rem" }}>
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <select
                      value={trade[c.symbol]?.type || "buy"}
                      onChange={(e) =>
                        setTrade((prev) => ({
                          ...prev,
                          [c.symbol]: {
                            ...prev[c.symbol],
                            type: e.target.value as "buy" | "sell",
                          },
                        }))
                      }
                      style={{
                        background: "#161b22",
                        color: "#e6edf3",
                        borderRadius: "6px",
                        padding: "0.4rem",
                        border: "1px solid #30363d",
                      }}
                    >
                      <option value="buy">Comprar</option>
                      <option value="sell">Vender</option>
                    </select>

                    <input
                      type="number"
                      placeholder="Cantidad"
                      value={trade[c.symbol]?.amount || ""}
                      onChange={(e) =>
                        setTrade((prev) => ({
                          ...prev,
                          [c.symbol]: {
                            ...prev[c.symbol],
                            amount: Number(e.target.value),
                          },
                        }))
                      }
                      style={{
                        background: "#161b22",
                        color: "#e6edf3",
                        borderRadius: "6px",
                        padding: "0.4rem",
                        border: "1px solid #30363d",
                        flex: 1,
                      }}
                    />

                    <button
                      onClick={() => handleTrade(c.symbol)}
                      className={`btn ${
                        trade[c.symbol]?.type === "buy" ? "btn-success" : "btn-danger"
                      }`}
                      style={{ flexShrink: 0 }}
                    >
                      {trade[c.symbol]?.type === "buy" ? "Comprar" : "Vender"}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* 📜 Historial de órdenes */}
      {orders.length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          <h2 style={{ color: "#9333ea" }}>Historial de Órdenes</h2>
          <ul style={{ listStyle: "none", padding: 0, marginTop: "1rem" }}>
            {orders.map((o, i) => (
              <li
                key={i}
                style={{
                  padding: "0.75rem 1rem",
                  marginBottom: "0.6rem",
                  background: "#161b22",
                  borderRadius: "10px",
                  borderLeft: `5px solid ${
                    o.type === "buy" ? "#22c55e" : "#ef4444"
                  }`,
                }}
              >
                <strong>
                  {o.type === "buy" ? "🟢 Compra" : "🔴 Venta"} {o.amount} {o.symbol}
                </strong>{" "}
                a ${o.price.toFixed(2)} = ${o.total.toFixed(2)}
                <div style={{ fontSize: "0.8rem", color: "#9ca3af" }}>{o.date}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
