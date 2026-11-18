
import { useState } from "react";
import {
  ClipboardList,
  Search,
  Plus,
  Clock3,
  CheckCircle2,
  AlertCircle,
  MoreHorizontal
} from "lucide-react";

const requests = [
  {
    id: "KF-1001",
    customer: "Aarav Sharma",
    asset: "Dell Inspiron 15",
    issue: "Laptop not powering on",
    date: "18 Nov 2026",
    priority: "High",
    status: "In Diagnosis"
  },
  {
    id: "KF-1002",
    customer: "Priya Verma",
    asset: "Samsung Galaxy S24",
    issue: "Screen flickering",
    date: "17 Nov 2026",
    priority: "Medium",
    status: "Needs Review"
  },
  {
    id: "KF-1003",
    customer: "Rahul Mehta",
    asset: "LG Smart TV 43",
    issue: "No display",
    date: "16 Nov 2026",
    priority: "High",
    status: "Repair In Progress"
  },
  {
    id: "KF-1004",
    customer: "Sneha Gupta",
    asset: "Whirlpool Refrigerator",
    issue: "Cooling problem",
    date: "15 Nov 2026",
    priority: "Low",
    status: "Completed"
  }
];

function Requests() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      `${request.id} ${request.customer} ${request.asset} ${request.issue}`
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || request.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-semibold text-slate-400">
            OVERVIEW / SERVICE REQUESTS
          </p>
          <h1 className="mt-2 text-2xl font-extrabold text-slate-800">
            Service Requests
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Track, review and manage customer repair requests.
          </p>
        </div>

        <button className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-violet-200 hover:bg-violet-700">
          <Plus size={18} />
          Create Request
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Requests" value="248" icon={ClipboardList} color="violet" />
        <StatCard title="Needs Review" value="18" icon={AlertCircle} color="orange" />
        <StatCard title="In Progress" value="42" icon={Clock3} color="blue" />
        <StatCard title="Completed" value="186" icon={CheckCircle2} color="green" />
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center">
          <div>
            <h2 className="font-bold text-slate-800">All Service Requests</h2>
            <p className="mt-1 text-xs text-slate-400">
              Monitor every repair request
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 sm:w-64">
              <Search size={17} className="text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search requests..."
                className="w-full bg-transparent text-xs outline-none"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-600 outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Needs Review">Needs Review</option>
              <option value="In Diagnosis">In Diagnosis</option>
              <option value="Repair In Progress">Repair In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">
            <thead className="bg-slate-50">
              <tr className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <th className="px-6 py-4">Request ID</th>
                <th className="px-6 py-4">Customer / Asset</th>
                <th className="px-6 py-4">Reported Issue</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredRequests.map((request) => (
                <tr key={request.id} className="hover:bg-slate-50/70">
                  <td className="px-6 py-4 text-xs font-bold text-violet-700">
                    {request.id}
                  </td>

                  <td className="px-6 py-4">
                    <p className="text-xs font-bold text-slate-700">{request.customer}</p>
                    <p className="mt-1 text-[10px] text-slate-400">{request.asset}</p>
                  </td>

                  <td className="px-6 py-4 text-xs text-slate-600">{request.issue}</td>
                  <td className="px-6 py-4 text-xs text-slate-500">{request.date}</td>

                  <td className="px-6 py-4">
                    <span className={`rounded-full px-3 py-1.5 text-[10px] font-bold ${
                      request.priority === "High"
                        ? "bg-rose-50 text-rose-600"
                        : request.priority === "Medium"
                        ? "bg-orange-50 text-orange-600"
                        : "bg-slate-100 text-slate-500"
                    }`}>
                      {request.priority}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span className={`rounded-full px-3 py-1.5 text-[10px] font-bold ${
                      request.status === "Completed"
                        ? "bg-emerald-50 text-emerald-600"
                        : request.status === "Needs Review"
                        ? "bg-orange-50 text-orange-600"
                        : request.status === "Repair In Progress"
                        ? "bg-blue-50 text-blue-600"
                        : "bg-violet-50 text-violet-600"
                    }`}>
                      {request.status}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <button
                      aria-label={`More actions for ${request.id}`}
                      className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-violet-600"
                    >
                      <MoreHorizontal size={19} />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredRequests.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-sm text-slate-400">
                    No service requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-100 px-6 py-4 text-xs text-slate-400">
          Showing {filteredRequests.length} of {requests.length} requests
        </div>
      </section>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }) {
  const styles = {
    violet: "bg-violet-50 text-violet-600",
    orange: "bg-orange-50 text-orange-600",
    blue: "bg-blue-50 text-blue-600",
    green: "bg-emerald-50 text-emerald-600"
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

export default Requests;
