
import { useState } from "react";
import {
  Stethoscope,
  Search,
  ClipboardCheck,
  Clock3,
  CheckCircle2,
  AlertCircle,
  FileText,
  MoreHorizontal
} from "lucide-react";

const diagnosisRecords = [
  {
    id: "KF-1001",
    customer: "Aarav Sharma",
    asset: "Dell Inspiron 15",
    issue: "Laptop not powering on",
    technician: "Rahul Singh",
    date: "18 Nov 2026",
    status: "In Diagnosis"
  },
  {
    id: "KF-1005",
    customer: "Priya Verma",
    asset: "Samsung Galaxy S24",
    issue: "Display flickering",
    technician: "Amit Kumar",
    date: "17 Nov 2026",
    status: "Diagnosis Completed"
  },
  {
    id: "KF-1007",
    customer: "Rahul Mehta",
    asset: "LG Smart TV 43",
    issue: "No display",
    technician: "Rahul Singh",
    date: "16 Nov 2026",
    status: "In Diagnosis"
  }
];

function Diagnosis() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const filteredRecords = diagnosisRecords.filter((record) => {
    const matchesSearch =
      `${record.id} ${record.customer} ${record.asset} ${record.issue} ${record.technician}`
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesFilter =
      filter === "All" || record.status === filter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-semibold text-slate-400">
            OPERATIONS / DIAGNOSIS
          </p>
          <h1 className="mt-2 text-2xl font-extrabold text-slate-800">
            Diagnosis Center
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Inspect equipment, record faults and recommend repairs.
          </p>
        </div>

        <button className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-violet-200 hover:bg-violet-700">
          <Stethoscope size={18} />
          New Diagnosis
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Total Diagnoses" value="86" icon={ClipboardCheck} color="violet" />
        <StatCard title="Pending Diagnosis" value="18" icon={Clock3} color="orange" />
        <StatCard title="Completed" value="68" icon={CheckCircle2} color="green" />
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center">
          <div>
            <h2 className="font-bold text-slate-800">Diagnosis Records</h2>
            <p className="mt-1 text-xs text-slate-400">
              Track equipment inspection and diagnosis progress
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 sm:w-64">
              <Search size={17} className="text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search diagnosis..."
                className="w-full bg-transparent text-xs outline-none"
              />
            </div>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-600 outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="In Diagnosis">In Diagnosis</option>
              <option value="Diagnosis Completed">Diagnosis Completed</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left">
            <thead className="bg-slate-50">
              <tr className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <th className="px-6 py-4">Request</th>
                <th className="px-6 py-4">Equipment / Issue</th>
                <th className="px-6 py-4">Technician</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50/70">
                  <td className="px-6 py-4">
                    <p className="text-xs font-bold text-violet-700">{record.id}</p>
                    <p className="mt-1 text-[10px] text-slate-400">{record.customer}</p>
                  </td>

                  <td className="px-6 py-4">
                    <p className="text-xs font-bold text-slate-700">{record.asset}</p>
                    <p className="mt-1 text-[10px] text-slate-400">{record.issue}</p>
                  </td>

                  <td className="px-6 py-4 text-xs text-slate-600">{record.technician}</td>
                  <td className="px-6 py-4 text-xs text-slate-500">{record.date}</td>

                  <td className="px-6 py-4">
                    <span className={`rounded-full px-3 py-1.5 text-[10px] font-bold ${
                      record.status === "Diagnosis Completed"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-orange-50 text-orange-600"
                    }`}>
                      {record.status}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <button
                      aria-label={`More actions for ${record.id}`}
                      className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-violet-600"
                    >
                      <MoreHorizontal size={19} />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-sm text-slate-400">
                    No diagnosis records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="rounded-2xl border border-violet-100 bg-violet-50/60 p-5">
        <div className="flex items-start gap-3">
          <FileText size={20} className="mt-0.5 text-violet-600" />
          <div>
            <h3 className="text-sm font-bold text-slate-800">Diagnosis workflow</h3>
            <p className="mt-1 text-xs leading-6 text-slate-500">
              Review the reported issue, identify the root cause, document inspection notes,
              add supporting evidence and recommend a repair solution.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }) {
  const styles = {
    violet: "bg-violet-50 text-violet-600",
    orange: "bg-orange-50 text-orange-600",
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

export default Diagnosis;
