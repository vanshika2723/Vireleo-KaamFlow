
import {
  ClipboardList,
  Wrench,
  CheckCircle2,
  Clock3,
  ArrowUpRight,
  Activity,
  Star,
  Plus
} from "lucide-react";

const stats = [
  {
    title: "Total Requests",
    value: "248",
    change: "+12.8%",
    note: "vs. last month",
    icon: ClipboardList,
    color: "bg-violet-50 text-violet-600"
  },
  {
    title: "In Progress",
    value: "36",
    change: "+4.2%",
    note: "active repairs",
    icon: Wrench,
    color: "bg-orange-50 text-orange-600"
  },
  {
    title: "Completed Jobs",
    value: "184",
    change: "+18.6%",
    note: "vs. last month",
    icon: CheckCircle2,
    color: "bg-emerald-50 text-emerald-600"
  },
  {
    title: "Pending Review",
    value: "12",
    change: "Needs attention",
    note: "awaiting action",
    icon: Clock3,
    color: "bg-blue-50 text-blue-600"
  }
];

const requests = [
  {
    id: "KF-2026-0248",
    customer: "Aarav Sharma",
    device: "Washing Machine",
    issue: "Drum not spinning",
    status: "In Diagnosis",
    priority: "High",
    date: "18 Nov 2026"
  },
  {
    id: "KF-2026-0247",
    customer: "Priya Verma",
    device: "Microwave Oven",
    issue: "Not heating properly",
    status: "Repair In Progress",
    priority: "Medium",
    date: "18 Nov 2026"
  },
  {
    id: "KF-2026-0246",
    customer: "Rohan Mehta",
    device: "Air Conditioner",
    issue: "Water leakage",
    status: "QC Passed",
    priority: "Low",
    date: "17 Nov 2026"
  },
  {
    id: "KF-2026-0245",
    customer: "Neha Gupta",
    device: "Refrigerator",
    issue: "Cooling issue",
    status: "Pending",
    priority: "High",
    date: "17 Nov 2026"
  }
];

const chartData = [38, 58, 45, 72, 54, 85, 65];
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function Dashboard() {
  return (
    <div className="min-h-screen bg-[#f6f7fb] p-4 sm:p-6 lg:p-8">

      {/* Page Heading */}
      <section className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <p className="text-[10px] font-bold tracking-[2px] text-violet-600">
            TUESDAY, 18 NOVEMBER 2026
          </p>

          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-800 sm:text-3xl">
            Good evening, Admin <span className="text-amber-400">✦</span>
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Here's what's happening with your repair operations today.
          </p>
        </div>

        <button className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:bg-violet-700">
          <Plus size={18} />
          New Service Request
        </button>
      </section>

      {/* Statistics Cards */}
      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <article
              key={item.title}
              className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className={`grid h-11 w-11 place-items-center rounded-xl ${item.color}`}>
                  <Icon size={21} />
                </div>

                <ArrowUpRight size={18} className="text-slate-300" />
              </div>

              <p className="mt-5 text-sm font-medium text-slate-500">
                {item.title}
              </p>

              <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-800">
                {item.value}
              </h2>

              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="font-bold text-emerald-600">
                  {item.change}
                </span>
                <span className="text-slate-400">{item.note}</span>
              </div>
            </article>
          );
        })}
      </section>

      {/* Charts Section */}
      <section className="mb-6 grid grid-cols-1 gap-5 xl:grid-cols-[1.6fr_1fr]">

        {/* Performance Chart */}
        <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-slate-800">
                Repair Performance
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                Overview of your repair activity
              </p>
            </div>

            <select className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 outline-none">
              <option>7 days</option>
              <option>30 days</option>
              <option>90 days</option>
            </select>
          </div>

          <div className="mt-7 flex items-end justify-between">
            <div>
              <h3 className="text-3xl font-extrabold text-slate-800">184</h3>
              <p className="mt-1 text-xs text-slate-400">Jobs completed</p>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-sm bg-violet-600" />
                Completed
              </span>
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-sm bg-violet-100" />
                Pending
              </span>
            </div>
          </div>

          <div className="mt-6 flex h-48 items-end justify-between gap-3 border-b border-slate-100 px-2">
            {chartData.map((height, index) => (
              <div
                key={days[index]}
                className="flex h-full flex-1 flex-col items-center justify-end gap-2"
              >
                <div className="flex h-[85%] w-full items-end justify-center gap-1">
                  <div
                    className="w-3 rounded-t-md bg-violet-500 transition hover:bg-violet-700 sm:w-5"
                    style={{ height: `${height}%` }}
                  />

                  <div
                    className="w-3 rounded-t-md bg-violet-100 sm:w-5"
                    style={{ height: `${Math.max(12, height * 0.36)}%` }}
                  />
                </div>

                <span className="pb-2 text-[10px] text-slate-400">
                  {days[index]}
                </span>
              </div>
            ))}
          </div>
        </article>

        {/* Request Overview */}
        <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
          <div>
            <h2 className="font-bold text-slate-800">Request Overview</h2>
            <p className="mt-1 text-xs text-slate-400">
              Current job distribution
            </p>
          </div>

          <div className="my-7 flex justify-center">
            <div className="grid h-44 w-44 place-items-center rounded-full bg-[conic-gradient(#7867e7_0%_74%,#f0a44f_74%_88.5%,#7ab2e8_88.5%_100%)]">
              <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-white">
                <strong className="text-3xl font-extrabold text-slate-800">
                  248
                </strong>
                <span className="text-xs text-slate-400">Total Jobs</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {[
              { label: "Completed", value: 184, color: "bg-violet-500" },
              { label: "In Progress", value: 36, color: "bg-orange-400" },
              { label: "Pending", value: 28, color: "bg-blue-400" }
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 text-sm">
                <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                <span className="flex-1 text-slate-500">{item.label}</span>
                <strong className="text-slate-800">{item.value}</strong>
              </div>
            ))}
          </div>
        </article>
      </section>

      {/* Recent Requests Table */}
      <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 p-5 sm:p-6">
          <div>
            <h2 className="font-bold text-slate-800">
              Recent Service Requests
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Track and manage your latest repair jobs
            </p>
          </div>

          <button className="flex items-center gap-1 text-xs font-bold text-violet-600 hover:text-violet-800">
            View all requests <ArrowUpRight size={15} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">
            <thead className="bg-slate-50">
              <tr className="text-[10px] font-bold tracking-wider text-slate-400">
                <th className="px-5 py-4">REQUEST ID</th>
                <th className="px-5 py-4">CUSTOMER</th>
                <th className="px-5 py-4">DEVICE / ISSUE</th>
                <th className="px-5 py-4">STATUS</th>
                <th className="px-5 py-4">PRIORITY</th>
                <th className="px-5 py-4">DATE</th>
              </tr>
            </thead>

            <tbody>
              {requests.map((request) => (
                <tr
                  key={request.id}
                  className="border-t border-slate-100 text-xs transition hover:bg-slate-50"
                >
                  <td className="px-5 py-4 font-bold text-violet-600">
                    {request.id}
                  </td>

                  <td className="px-5 py-4 font-semibold text-slate-700">
                    {request.customer}
                  </td>

                  <td className="px-5 py-4">
                    <strong className="block text-slate-700">
                      {request.device}
                    </strong>
                    <span className="mt-1 block text-slate-400">
                      {request.issue}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <span className={`rounded-full px-3 py-1.5 text-[10px] font-bold ${
                      request.status === "QC Passed"
                        ? "bg-emerald-50 text-emerald-600"
                        : request.status === "Repair In Progress"
                        ? "bg-orange-50 text-orange-600"
                        : request.status === "Pending"
                        ? "bg-blue-50 text-blue-600"
                        : "bg-violet-50 text-violet-600"
                    }`}>
                      {request.status}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <span className="flex items-center gap-2 text-slate-600">
                      <span className={`h-2 w-2 rounded-full ${
                        request.priority === "High"
                          ? "bg-rose-500"
                          : request.priority === "Medium"
                          ? "bg-orange-400"
                          : "bg-emerald-500"
                      }`} />
                      {request.priority}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-slate-500">
                    {request.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-7 flex flex-wrap items-center justify-between gap-3 text-[10px] text-slate-400">
        <span>© 2026 KAAMFLOW. All rights reserved.</span>
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Dashboard preview
        </span>
      </footer>

    </div>
  );
}

export default Dashboard;
