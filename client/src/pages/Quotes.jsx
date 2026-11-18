
import { useState } from "react";
import {
  FileText,
  Search,
  Plus,
  IndianRupee,
  Clock3,
  CheckCircle2,
  AlertCircle,
  MoreHorizontal
} from "lucide-react";

const quotes = [
  {
    id: "QT-1001",
    request: "KF-1001",
    customer: "Aarav Sharma",
    service: "Laptop motherboard repair",
    amount: 4500,
    date: "18 Nov 2026",
    status: "Sent"
  },
  {
    id: "QT-1002",
    request: "KF-1005",
    customer: "Priya Verma",
    service: "Display replacement",
    amount: 6200,
    date: "17 Nov 2026",
    status: "Approved"
  },
  {
    id: "QT-1003",
    request: "KF-1007",
    customer: "Rahul Mehta",
    service: "TV panel inspection",
    amount: 2800,
    date: "16 Nov 2026",
    status: "Draft"
  },
  {
    id: "QT-1004",
    request: "KF-1009",
    customer: "Sneha Gupta",
    service: "Cooling system repair",
    amount: 3500,
    date: "15 Nov 2026",
    status: "Rejected"
  }
];

function Quotes() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const filteredQuotes = quotes.filter((quote) => {
    const matchesSearch =
      `${quote.id} ${quote.request} ${quote.customer} ${quote.service}`
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesFilter =
      filter === "All" || quote.status === filter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-semibold text-slate-400">
            OPERATIONS / QUOTES
          </p>
          <h1 className="mt-2 text-2xl font-extrabold text-slate-800">
            Repair Quotes
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Prepare and manage repair estimates and approvals.
          </p>
        </div>

        <button className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-violet-200 hover:bg-violet-700">
          <Plus size={18} />
          Create Quote
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Quotes" value="124" icon={FileText} color="violet" />
        <StatCard title="Awaiting Approval" value="18" icon={Clock3} color="orange" />
        <StatCard title="Approved" value="86" icon={CheckCircle2} color="green" />
        <StatCard title="Rejected" value="12" icon={AlertCircle} color="rose" />
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center">
          <div>
            <h2 className="font-bold text-slate-800">Quote Directory</h2>
            <p className="mt-1 text-xs text-slate-400">
              Review estimates and their approval status
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 sm:w-64">
              <Search size={17} className="text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search quotes..."
                className="w-full bg-transparent text-xs outline-none"
              />
            </div>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-600 outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Sent">Sent</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">
            <thead className="bg-slate-50">
              <tr className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <th className="px-6 py-4">Quote ID</th>
                <th className="px-6 py-4">Customer / Request</th>
                <th className="px-6 py-4">Repair Service</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredQuotes.map((quote) => (
                <tr key={quote.id} className="hover:bg-slate-50/70">
                  <td className="px-6 py-4 text-xs font-bold text-violet-700">
                    {quote.id}
                  </td>

                  <td className="px-6 py-4">
                    <p className="text-xs font-bold text-slate-700">{quote.customer}</p>
                    <p className="mt-1 text-[10px] text-slate-400">{quote.request}</p>
                  </td>

                  <td className="px-6 py-4 text-xs text-slate-600">{quote.service}</td>

                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1 text-xs font-bold text-slate-700">
                      <IndianRupee size={13} />
                      {quote.amount.toLocaleString("en-IN")}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-xs text-slate-500">{quote.date}</td>

                  <td className="px-6 py-4">
                    <span className={`rounded-full px-3 py-1.5 text-[10px] font-bold ${
                      quote.status === "Approved"
                        ? "bg-emerald-50 text-emerald-600"
                        : quote.status === "Rejected"
                        ? "bg-rose-50 text-rose-600"
                        : quote.status === "Sent"
                        ? "bg-orange-50 text-orange-600"
                        : "bg-slate-100 text-slate-500"
                    }`}>
                      {quote.status}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <button
                      aria-label={`More actions for ${quote.id}`}
                      className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-violet-600"
                    >
                      <MoreHorizontal size={19} />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredQuotes.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-sm text-slate-400">
                    No quotes found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-100 px-6 py-4 text-xs text-slate-400">
          Showing {filteredQuotes.length} of {quotes.length} quotes
        </div>
      </section>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }) {
  const styles = {
    violet: "bg-violet-50 text-violet-600",
    orange: "bg-orange-50 text-orange-600",
    green: "bg-emerald-50 text-emerald-600",
    rose: "bg-rose-50 text-rose-600"
  };

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500">{title}</span>
        <span className={`rounded-xl p-3 ${styles[color]}`}>
          <Icon size={20} />
        </span>
      </div>
      <h2 className="mt-4 text-3xl font-extrabold text-slate-800">{value}</h2>
    </div>
  );
}

export default Quotes;
