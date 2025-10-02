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

export default function Home() {
  const [cryptos, setCryptos] = useState<Crypto[]>([]);
  const [form, setForm] = useState({ symbol: "", name: "" });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [syncedData, setSyncedData] = useState<SyncedData>({});

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

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Crypto Dashboard</h1>
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
              <button type="button" onClick={() => handleUpdate(editingId)} className="btn btn-warning">
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
      </header>

      <div className="crypto-grid">
        {cryptos.map((c) => (
          <div key={c.id} className="crypto-card">
            <div className="crypto-card-header">
              <h2>
                {c.symbol} - {c.name}
              </h2>
              <div className="crypto-actions">
                <button onClick={() => handleEditClick(c)} className="btn btn-info">Editar</button>
                <button onClick={() => handleDelete(c.id)} className="btn btn-danger">Eliminar</button>
                <button onClick={() => handleSync(c.symbol)} className="btn btn-primary">Sync</button>
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
                    <Line type="monotone" dataKey="price" stroke="#82ca9d" dot={false} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
