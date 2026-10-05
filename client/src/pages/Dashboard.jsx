import { NavLink, Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "../auth.jsx";
import Watchlist from "../components/Watchlist.jsx";
import FindProducts from "../components/FindProducts.jsx";
import Account from "../components/Account.jsx";
import { Button } from "../components/ui.jsx";

const NAV = [
  { to: "/dashboard/watchlist", label: "Watchlist", icon: "👁" },
  { to: "/dashboard/find", label: "Pokémon Sealed", icon: "⚡" },
  { to: "/dashboard/account", label: "Settings", icon: "⚙️" }
];

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="grid min-h-screen grid-cols-[minmax(0,1fr)] md:grid-cols-[240px_1fr]">
      <aside className="flex flex-row flex-wrap items-center gap-3 min-w-0 px-4 py-3 bg-surface border-b border-line md:sticky md:top-0 md:h-screen md:flex-col md:flex-nowrap md:items-stretch md:gap-6 md:px-4 md:py-5 md:border-b-0 md:border-r">
        <div className="flex items-center gap-2.5 text-lg font-extrabold tracking-[0.08em] uppercase">
          <img src="/logo.png" alt="" className="size-9 rounded-lg" />
          <span>Elite</span>
        </div>

        <nav className="order-3 w-full flex gap-1 overflow-x-auto md:order-none md:flex-col">
          {NAV.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-[10px] font-medium whitespace-nowrap transition-colors ${
                  isActive ? "bg-accent/12 text-accent" : "text-muted hover:bg-surface-2 hover:text-ink"
                }`
              }
            >
              <span aria-hidden="true">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3 md:ml-0 md:mt-auto md:flex-col md:items-stretch">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex-none grid place-items-center size-9 rounded-full bg-accent text-accent-ink font-bold">
              {user.username?.[0]?.toUpperCase()}
            </div>
            <div className="hidden min-w-0 md:block">
              <div className="font-semibold">{user.username}</div>
              <div className="text-xs text-muted truncate">{user.email}</div>
            </div>
          </div>
          <Button variant="ghost" className="md:w-full" onClick={logout}>Log out</Button>
        </div>
      </aside>

      <main className="min-w-0 max-w-[1200px] px-4 py-5 md:p-8">
        <Routes>
          <Route index element={<Navigate to="watchlist" replace />} />
          <Route path="watchlist" element={<Watchlist />} />
          <Route path="find" element={<FindProducts />} />
          <Route path="account" element={<Account />} />
          <Route path="*" element={<Navigate to="watchlist" replace />} />
        </Routes>
      </main>
    </div>
  );
}
