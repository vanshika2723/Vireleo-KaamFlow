
import { useState } from "react";
import {
  Monitor,
  Search,
  Plus,
  Laptop,
  Smartphone,
  Tv,
  Refrigerator,
  MoreHorizontal,
  ArrowUpRight
} from "lucide-react";

const assets = [
  {
    id: "AST-001",
    name: "Dell Inspiron 15",
    category: "Laptop",
    brand: "Dell",
    serial: "DL-2024-001",
    customer: "Aarav Sharma",
    icon: Laptop,
    status: "Under Repair"
  },
  {
    id: "AST-002",
    name: "Samsung Galaxy S24",
    category: "Smartphone",
    brand: "Samsung",
    serial: "SG-2024-002",
    customer: "Priya Verma",
    icon: Smartphone,
    status: "Registered"
  },
  {
    id: "AST-003",
    name: "LG Smart TV 43",
    category: "Television",
    brand: "LG",
    serial: "LG-2024-003",
    customer: "Rahul Mehta",
    icon: Tv,
    status: "Under Repair"
  },
  {
    id: "AST-004",
    name: "Whirlpool Refrigerator",
    category: "Home Appliance",
    brand: "Whirlpool",
    serial: "WH-2024-004",
    customer: "Sneha Gupta",
    icon: Refrigerator,
    status: "Completed"
  }
];

function Assets() {
  const [search, setSearch] = useState("");

  const filteredAssets = assets.filter((asset) =>
    `${asset.name} ${asset.brand} ${asset.serial} ${asset.customer}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-semibold text-slate-400">
            OVERVIEW / ASSETS
          </p>
          <h1 className="mt-2 text-2xl font-extrabold text-slate-800">
            Asset Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Track customer equipment and repair history.
          </p>
        </div>

        <button className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700">
          <Plus size={18} />
          Add Asset
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Assets</span>
            <span className="rounded-xl bg-violet-50 p-3 text-violet-600">
              <Monitor size={20} />
            </span>
          </div>
          <h2 className="mt-4 text-3xl font-extrabold text-slate-800">386</h2>
          <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-emerald-600">
            <ArrowUpRight size={14} /> Registered equipment
          </p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Under Repair</span>
            <span className="rounded-xl bg-orange-50 p-3 text-orange-600">
              <Laptop size={20} />
            </span>
          </div>
          <h2 className="mt-4 text-3xl font-extrabold text-slate-800">42</h2>
          <p className="mt-2 text-xs text-slate-400">Currently being serviced</p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:col-span-2 xl:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Completed Repairs</span>
            <span className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
              <Monitor size={20} />
            </span>
          </div>
          <h2 className="mt-4 text-3xl font-extrabold text-slate-800">281</h2>
          <p className="mt-2 text-xs text-slate-400">Equipment successfully serviced</p>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-bold text-slate-800">Equipment Directory</h2>
            <p className="mt-1 text-xs text-slate-400">
              All registered customer assets
            </p>
          </div>

          <div className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 sm:w-72">
            <Search size={17} className="text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search equipment..."
              className="w-full bg-transparent text-xs outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead className="bg-slate-50">
              <tr className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <th className="px-6 py-4">Equipment</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Serial Number</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredAssets.map((asset) => {
                const Icon = asset.icon;

                return (
                  <tr key={asset.id} className="transition hover:bg-slate-50/70">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-50 text-violet-600">
                          <Icon size={19} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-700">{asset.name}</p>
                          <p className="mt-1 text-[10px] text-slate-400">{asset.brand} · {asset.id}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-xs text-slate-600">{asset.category}</td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-500">{asset.serial}</td>
                    <td className="px-6 py-4 text-xs text-slate-600">{asset.customer}</td>

                    <td className="px-6 py-4">
                      <span className={`rounded-full px-3 py-1.5 text-[10px] font-bold ${
                        asset.status === "Completed"
                          ? "bg-emerald-50 text-emerald-600"
                          : asset.status === "Under Repair"
                          ? "bg-orange-50 text-orange-600"
                          : "bg-violet-50 text-violet-600"
                      }`}>
                        {asset.status}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <button
                        aria-label={`More actions for ${asset.name}`}
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-violet-600"
                      >
                        <MoreHorizontal size={19} />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredAssets.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-sm text-slate-400">
                    No assets found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-100 px-6 py-4 text-xs text-slate-400">
          Showing {filteredAssets.length} of {assets.length} assets
        </div>
      </section>
    </div>
  );
}

export default Assets;
