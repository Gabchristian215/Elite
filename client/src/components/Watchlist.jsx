import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { money } from "./format.js";
import { Alert, Button, PageHeader, Spinner, buttonClass } from "./ui.jsx";

const th = "px-4 py-3 text-left text-xs font-medium text-muted border-b border-line";
const td = "px-4 py-3 align-middle";

function Stat({ label, value, className = "" }) {
  return (
    <div className={`flex flex-col gap-1 px-5 py-4 bg-surface border border-line rounded-xl ${className}`}>
      <span className="text-xs text-muted">{label}</span>
      <strong className="text-2xl tabular-nums">{value}</strong>
    </div>
  );
}

export default function Watchlist() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removing, setRemoving] = useState(null);

  const load = () => {
    setLoading(true);
    setError("");
    api.getProducts()
      .then(setProducts)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const stats = useMemo(() => ({
    count: products.length,
    sets: new Set(products.map(p => p.setSlug).filter(Boolean)).size,
    total: products.reduce((sum, p) => sum + (Number(p.price) || 0), 0)
  }), [products]);

  const remove = async product => {
    setRemoving(product.tcgPlayerId);
    try {
      await api.removeProduct(product.tcgPlayerId);
      setProducts(list => list.filter(p => p.tcgPlayerId !== product.tcgPlayerId));
    } catch (err) {
      setError(err.message);
    } finally {
      setRemoving(null);
    }
  };

  return (
    <section>
      <PageHeader title="Watchlist" subtitle="Prices are checked daily; changes are posted to Discord.">
        <Button variant="ghost" onClick={load} disabled={loading}>Refresh</Button>
      </PageHeader>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <Stat label="Products tracked" value={stats.count} />
        <Stat label="Sets" value={stats.sets} />
        <Stat label="Total value" value={money(stats.total)} className="col-span-2 md:col-span-1" />
      </div>

      {error && <Alert type="error">{error}</Alert>}

      {loading ? (
        <div className="flex justify-center py-12 border border-dashed border-line rounded-xl"><Spinner /></div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-12 px-4 text-muted border border-dashed border-line rounded-xl">
          <p>Your watchlist is empty.</p>
          <Link className={buttonClass()} to="/dashboard/find">Find products</Link>
        </div>
      ) : (
        <div className="overflow-x-auto bg-surface border border-line rounded-xl">
          <table className="w-full border-collapse text-[0.92rem]">
            <thead>
              <tr>
                <th className={th}>Product</th>
                <th className={th}>Set</th>
                <th className={`${th} text-right`}>Price</th>
                <th className={th}>Updated</th>
                <th className={th} />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {products.map(p => (
                <tr key={p.tcgPlayerId}>
                  <td className={td}>
                    <div className="flex items-center gap-3 min-w-60">
                      {p.image
                        ? <img src={p.image} alt="" className="flex-none size-11 object-contain rounded-lg bg-white" />
                        : <div className="flex-none size-11 rounded-lg bg-surface-2" />}
                      {p.url
                        ? <a href={p.url} target="_blank" rel="noreferrer" className="hover:text-accent">{p.name}</a>
                        : p.name}
                    </div>
                  </td>
                  <td className={`${td} text-muted`}>{p.setName || p.setSlug}</td>
                  <td className={`${td} text-right font-semibold tabular-nums`}>{money(p.price)}</td>
                  <td className={`${td} text-xs text-muted`}>
                    {p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : "—"}
                  </td>
                  <td className={`${td} text-right`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(p)}
                      disabled={removing === p.tcgPlayerId}
                    >
                      Remove
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
