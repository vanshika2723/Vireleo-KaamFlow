
import { useState } from "react";
import {
  ShieldCheck,
  Search,
  ClipboardCheck,
  CheckCircle2,
  AlertCircle,
  Clock3,
  MoreHorizontal
} from "lucide-react";

const inspections = [
  {
    id: "QC-1001",
    request: "KF-1001",
    customer: "Aarav Sharma",
    equipment: "Dell Inspiron 15",
    technician: "Rahul Singh",
    date: "18 Nov 2026",
    result: "Passed"
  },
  {
    id: "QC-1002",
    request: "KF-1005",
    customer: "Priya Verma",
    equipment: "Samsung Galaxy S24",
    technician: "Amit Kumar",
    date: "17 Nov 2026",
    result: "Pending"
  },
  {
    id: "QC-1003",
    request: "KF-1007",
    customer: "Rahul Mehta",
    equipment: "LG Smart TV 43",
    technician: "Vikram Sharma",
    date: "16 Nov 2026",
    result: "Failed"
  }
];

function QualityControl() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const filteredInspections = inspections.filter((inspection) => {
    const matchesSearch =
      `${inspection.id} ${inspection.request} ${inspection.customer} ${inspection.equipment}`
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesFilter =
      filter === "All" || inspection.result === filter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">

      <div>
        <p className="text-xs font-semibold text-slate-400">
          OPERATIONS / QUALITY CONTROL
        </p>
        <h1 className="mt-2 text-2xl font-extrabold text-slate-800">
          Quality Control
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Verify repair quality before equipment handover.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Inspections" value="96" icon={ShieldCheck} color="violet" />
        <StatCard title="Passed" value="78" icon={CheckCircle2} color="green" />
        <StatCard title="Failed" value="8" icon={AlertCircle} color="rose" />
        <StatCard title="Pending" value="10" icon={Clock3} color="orange" />
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center">
          <div>
            <h2 className="font-bold text-slate-800">Inspection Records</h2>
            <p className="mt-1 text-xs text-slate-400">
              Review repair inspection results
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 sm:w-64">
              <Search size={17} className="text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search inspections..."
                className="w-full bg-transparent text-xs outline-none"
              />
            </div>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-600 outline-none"
            >
              <option value="All">All Results</option>
              <option value="Passed">Passed</option>
              <option value="Failed">Failed</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">
            <thead className="bg-slate-50">
              <tr className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <th className="px-6 py-4">Inspection ID</th>
                <th className="px-6 py-4">Customer / Request</th>
                <th className="px-6 py-4">Equipment</th>
                <th className="px-6 py-4">Technician</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Result</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredInspections.map((inspection) => (
                <tr key={inspection.id} className="hover:bg-slate-50/70">
                  <td className="px-6 py-4 text-xs font-bold text-violet-700">
                    {inspection.id}
                  </td>

                  <td className="px-6 py-4">
                    <p className="text-xs font-bold text-slate-700">{inspection.customer}</p>
                    <p className="mt-1 text-[10px] text-slate-400">{inspection.request}</p>
                  </td>

                  <td className="px-6 py-4 text-xs text-slate-600">{inspection.equipment}</td>
                  <td className="px-6 py-4 text-xs text-slate-600">{inspection.technician}</td>
                  <td className="px-6 py-4 text-xs text-slate-500">{inspection.date}</td>

                  <td className="px-6 py-4">
                    <span className={`rounded-full px-3 py-1.5 text-[10px] font-bold ${
                      inspection.result === "Passed"
                        ? "bg-emerald-50 text-emerald-600"
                        : inspection.result === "Failed"
                        ? "bg-rose-50 text-rose-600"
                        : "bg-orange-50 text-orange-600"
                    }`}>
                      {inspection.result}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <button
                      aria-label={`More actions for ${inspection.id}`}
                      className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-violet-600"
                    >
                      <MoreHorizontal size={19} />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredInspections.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-sm text-slate-400">
                    No inspection records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5">
        <div className="flex items-start gap-3">
          <ClipboardCheck size={21} className="mt-0.5 text-emerald-600" />
          <div>
            <h3 className="text-sm font-bold text-slate-800">Quality assurance checklist</h3>
            <p className="mt-1 text-xs leading-6 text-slate-500">
              Verify the reported issue, test repaired components, inspect equipment
              safety and confirm that the repair is ready for customer handover.
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
    green: "bg-emerald-50 text-emerald-600",
    rose: "bg-rose-50 text-rose-600",
    orange: "bg-orange-50 text-orange-600"
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

export default QualityControl;
