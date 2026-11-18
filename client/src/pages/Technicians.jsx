
import { useState } from "react";
import {
  Wrench,
  Search,
  Plus,
  Star,
  ClipboardList,
  CheckCircle2,
  Clock3,
  MoreHorizontal
} from "lucide-react";

const technicians = [
  {
    id: "TECH-001",
    name: "Rahul Singh",
    email: "rahul@kaamflow.com",
    phone: "+91 98765 43210",
    specialization: "Laptop & Computer",
    jobs: 48,
    rating: 4.8,
    status: "Available",
    initials: "RS"
  },
  {
    id: "TECH-002",
    name: "Amit Kumar",
    email: "amit@kaamflow.com",
    phone: "+91 98765 12345",
    specialization: "Mobile & Tablet",
    jobs: 36,
    rating: 4.6,
    status: "Busy",
    initials: "AK"
  },
  {
    id: "TECH-003",
    name: "Vikram Sharma",
    email: "vikram@kaamflow.com",
    phone: "+91 91234 56780",
    specialization: "Home Appliances",
    jobs: 52,
    rating: 4.9,
    status: "Available",
    initials: "VS"
  },
  {
    id: "TECH-004",
    name: "Karan Mehta",
    email: "karan@kaamflow.com",
    phone: "+91 99887 76655",
    specialization: "TV & Electronics",
    jobs: 29,
    rating: 4.5,
    status: "Unavailable",
    initials: "KM"
  }
];

function Technicians() {
  const [search, setSearch] = useState("");

  const filteredTechnicians = technicians.filter((technician) =>
    `${technician.name} ${technician.email} ${technician.specialization}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

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

        <button className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-violet-200 hover:bg-violet-700">
          <Plus size={18} />
          Add Technician
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Technicians" value="24" icon={Wrench} color="violet" />
        <StatCard title="Available" value="16" icon={CheckCircle2} color="green" />
        <StatCard title="Currently Busy" value="6" icon={Clock3} color="orange" />
        <StatCard title="Total Jobs" value="165" icon={ClipboardList} color="blue" />
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-bold text-slate-800">Technician Directory</h2>
            <p className="mt-1 text-xs text-slate-400">
              View technician profiles and performance
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

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">
            <thead className="bg-slate-50">
              <tr className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <th className="px-6 py-4">Technician</th>
                <th className="px-6 py-4">Specialization</th>
                <th className="px-6 py-4">Completed Jobs</th>
                <th className="px-6 py-4">Rating</th>
                <th className="px-6 py-4">Availability</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredTechnicians.map((technician) => (
                <tr key={technician.id} className="hover:bg-slate-50/70">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-50 text-xs font-extrabold text-violet-700">
                        {technician.initials}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-700">{technician.name}</p>
                        <p className="mt-1 text-[10px] text-slate-400">{technician.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-xs text-slate-600">
                    {technician.specialization}
                  </td>

                  <td className="px-6 py-4 text-xs font-bold text-slate-700">
                    {technician.jobs}
                  </td>

                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1 text-xs font-bold text-slate-700">
                      <Star size={14} className="fill-amber-400 text-amber-400" />
                      {technician.rating}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span className={`rounded-full px-3 py-1.5 text-[10px] font-bold ${
                      technician.status === "Available"
                        ? "bg-emerald-50 text-emerald-600"
                        : technician.status === "Busy"
                        ? "bg-orange-50 text-orange-600"
                        : "bg-slate-100 text-slate-500"
                    }`}>
                      {technician.status}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <button
                      aria-label={`More actions for ${technician.name}`}
                      className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-violet-600"
                    >
                      <MoreHorizontal size={19} />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredTechnicians.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-sm text-slate-400">
                    No technicians found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
        <span className="text-xs font-semibold text-slate-500">{title}</span>
        <span className={`rounded-xl p-3 ${styles[color]}`}>
          <Icon size={20} />
        </span>
      </div>
      <h2 className="mt-4 text-3xl font-extrabold text-slate-800">{value}</h2>
    </div>
  );
}

export default Technicians;
