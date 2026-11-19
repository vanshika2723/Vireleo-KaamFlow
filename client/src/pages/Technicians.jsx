
import { useEffect, useState } from "react";
import {
  Wrench,
  Search,
  Plus,
  Star,
  ClipboardList,
  CheckCircle2,
  Clock3,
  MoreHorizontal,
  RefreshCw
} from "lucide-react";
import API from "../services/api";

function Technicians() {
  const [technicians, setTechnicians] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTechnicians = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/users/technicians");

      setTechnicians(response.data.technicians || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load technicians. Please check login and backend."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTechnicians();
  }, []);

  const filteredTechnicians = technicians.filter((technician) =>
    `${technician.name} ${technician.email} ${technician.phone}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const availableCount = technicians.filter(
    (technician) => technician.isActive
  ).length;

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-semibold text-slate-400">
            OPERATIONS / TECHNICIANS
          </p>
          <h1 className="mt-2 text-2xl font-extrabold text-slate-800">
            Technician Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your repair team and technician workload.
          </p>
        </div>

        <button
          type="button"
          onClick={loadTechnicians}
          className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-violet-200 hover:bg-violet-700"
        >
          <RefreshCw size={17} />
          Refresh List
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Technicians"
          value={technicians.length}
          icon={Wrench}
          color="violet"
        />
        <StatCard
          title="Active Technicians"
          value={availableCount}
          icon={CheckCircle2}
          color="green"
        />
        <StatCard
          title="Currently Busy"
          value="—"
          icon={Clock3}
          color="orange"
        />
        <StatCard
          title="Total Jobs"
          value="—"
          icon={ClipboardList}
          color="blue"
        />
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-bold text-slate-800">
              Technician Directory
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Live technician profiles from your database
            </p>
          </div>

          <div className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 sm:w-72">
            <Search size={17} className="text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search technicians..."
              className="w-full bg-transparent text-xs outline-none"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm text-slate-400">
            Loading technicians...
          </div>
        ) : error ? (
          <div className="p-10 text-center">
            <p className="text-sm font-medium text-red-500">{error}</p>
            <button
              onClick={loadTechnicians}
              className="mt-4 rounded-lg bg-violet-600 px-4 py-2 text-xs font-bold text-white"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px] text-left">
              <thead className="bg-slate-50">
                <tr className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="px-6 py-4">Technician</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4">Availability</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredTechnicians.map((technician) => (
                  <tr
                    key={technician._id}
                    className="hover:bg-slate-50/70"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-50 text-xs font-extrabold text-violet-700">
                          {technician.name
                            ?.split(" ")
                            .map((part) => part[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>

                        <div>
                          <p className="text-xs font-bold text-slate-700">
                            {technician.name}
                          </p>
                          <p className="mt-1 text-[10px] text-slate-400">
                            {technician.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-xs text-slate-600">
                      {technician.role}
                    </td>

                    <td className="px-6 py-4 text-xs text-slate-600">
                      {technician.phone || "Not provided"}
                    </td>

                    <td className="px-6 py-4">
                      <span className={`rounded-full px-3 py-1.5 text-[10px] font-bold ${
                        technician.isActive
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-slate-100 text-slate-500"
                      }`}>
                        {technician.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <button
                        type="button"
                        title={`Technician: ${technician.name}`}
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-violet-600"
                      >
                        <MoreHorizontal size={19} />
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredTechnicians.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-12 text-center text-sm text-slate-400"
                    >
                      No technicians found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }) {
  const styles = {
    violet: "bg-violet-50 text-violet-600",
    green: "bg-emerald-50 text-emerald-600",
    orange: "bg-orange-50 text-orange-600",
    blue: "bg-blue-50 text-blue-600"
  };

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500">
          {title}
        </span>
        <span className={`rounded-xl p-3 ${styles[color]}`}>
          <Icon size={20} />
        </span>
      </div>
      <h2 className="mt-4 text-3xl font-extrabold text-slate-800">
        {value}
      </h2>
    </div>
  );
}

export default Technicians;
