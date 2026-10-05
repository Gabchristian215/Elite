import { useState } from "react";
import { api } from "../api.js";
import { money } from "./format.js";
import { Alert, Button, PageHeader, inputClass } from "./ui.jsx";

export default function FindProducts() {
  const [set, setSet] = useState("");
  const [limit, setLimit] = useState(10);
  const [searchedSet, setSearchedSet] = useState("");
  const [results, setResults] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [status, setStatus] = useState({ type: "", text: "" });
  const [busy, setBusy] = useState(false);

  const search = async e => {
    e.preventDefault();
    const slug = set.trim();
    if (!slug) return;
    setBusy(true);
    setStatus({ type: "", text: "" });
    setSelected(new Set());
    try {
      const items = await api.getSealed(slug, limit);
      setResults(items);
      setSearchedSet(slug);
      if (items.length === 0) setStatus({ type: "info", text: `No sealed products found for "${slug}".` });
    } catch (err) {
      setStatus({ type: "error", text: err.message });
    } finally {
      setBusy(false);
    }
  };

  const toggle = id => setSelected(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const save = async () => {
    const products = results.filter(item => selected.has(String(item.tcgPlayerId)));
    setBusy(true);
    try {
      const res = await api.saveProducts(searchedSet, products);
      setStatus({ type: "success", text: `Added ${res.savedCount} product(s) to your watchlist.` });
      setSelected(new Set());
    } catch (err) {
      setStatus({ type: "error", text: err.message });
    } finally {
      setBusy(false);
    }
  };

  const allSelected = results?.length > 0 && selected.size === results.length;

  return (
    <section>
      <PageHeader title="Pokémon Sealed" subtitle="Search a set, pick products, and add them to your watchlist." />

      <form className="flex flex-wrap md:flex-nowrap gap-2.5 mb-4" onSubmit={search}>
        <input
          className={`${inputClass} basis-full md:basis-auto md:flex-1 min-w-0`}
          placeholder="Set name, e.g. Prismatic Evolutions"
          value={set}
          onChange={e => setSet(e.target.value)}
          required
        />
        <select
          className={`${inputClass} flex-1 md:flex-none`}
          value={limit}
          onChange={e => setLimit(Number(e.target.value))}
          aria-label="Result limit"
        >
          {[5, 10, 20, 50].map(n => <option key={n} value={n}>{n} results</option>)}
        </select>
        <Button className="flex-1 md:flex-none" disabled={busy}>Search</Button>
      </form>

      {status.text && <Alert type={status.type}>{status.text}</Alert>}

      {results?.length > 0 && (
        <>
          <div className="flex flex-wrap justify-between items-center gap-x-4 gap-y-2 mb-4">
            <span className="text-muted">{selected.size} of {results.length} selected</span>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelected(allSelected ? new Set() : new Set(results.map(r => String(r.tcgPlayerId))))}
              >
                {allSelected ? "Clear" : "Select all"}
              </Button>
              <Button size="sm" onClick={save} disabled={busy || selected.size === 0}>
                Add to watchlist
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
            {results.map(item => {
              const id = String(item.tcgPlayerId);
              const isSelected = selected.has(id);
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggle(id)}
                  aria-pressed={isSelected}
                  className={`relative flex flex-col text-left overflow-hidden cursor-pointer bg-surface border rounded-xl transition hover:-translate-y-0.5 ${
                    isSelected ? "border-accent ring-1 ring-accent" : "border-line hover:border-[#3a4248]"
                  }`}
                >
                  <div className="aspect-square grid place-items-center bg-white">
                    {item.image
                      ? <img src={item.image} alt="" className="size-full object-contain p-3" />
                      : <div className="size-full bg-surface-2" />}
                  </div>
                  <div className="flex flex-col gap-0.5 px-3.5 pt-3 pb-4">
                    <div className="text-sm font-semibold leading-snug">{item.name}</div>
                    <div className="text-xs text-muted">{item.setName}</div>
                    <div className="mt-1.5 font-bold text-accent tabular-nums">{money(item.price)}</div>
                  </div>
                  <span
                    aria-hidden="true"
                    className={`absolute top-2.5 right-2.5 grid place-items-center size-[26px] rounded-full border-2 text-sm font-extrabold text-accent-ink ${
                      isSelected ? "bg-accent border-accent" : "bg-black/55 border-white"
                    }`}
                  >
                    {isSelected ? "✓" : ""}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
