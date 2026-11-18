
import {
  BarChart3,
  TrendingUp,
  ClipboardList,
  CheckCircle2,
  Clock3,
  Download,
  Wrench,
  IndianRupee
} from "lucide-react";

const monthlyData = [
  { month: "Jun", requests: 35, completed: 28 },
  { month: "Jul", requests: 48, completed: 39 },
  { month: "Aug", requests: 42, completed: 34 },
  { month: "Sep", requests: 60, completed: 49 },
  { month: "Oct", requests: 55, completed: 47 },
  { month: "Nov", requests: 72, completed: 61 }
];

const serviceData = [
  { name: "Washing Machine", value: 32 },
  { name: "Refrigerator", value: 26 },
  { name: "Air Conditioner", value: 22 },
  { name: "Microwave", value: 12 },
  { name: "Other", value: 8 }
];

function Reports() {
  const maxRequests = Math.max(...monthlyData.map((item) => item.requests));

  return (
    <div className="space-y-6 p-5 md:p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-violet-100 p-2.5 text-violet-600">
              <BarChart3 size={22} />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Reports & Analytics</h1>
          </div>
          <p className="mt-2 text-sm text-slate-500">
            Understand service performance and business outcomes
          </p>
        </div>

        <button className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-700">
          <Download size={17} />
          Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-100 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Total Requests</p>
            <ClipboardList className="text-violet-600" size={21} />
          </div>
          <h2 className="mt-3 text-2xl font-bold text-slate-800">312</h2>
          <p className="mt-1 text-xs text-emerald-600">+12.8% vs last month</p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Completed Repairs</p>
            <CheckCircle2 className="text-emerald-600" size={21} />
          </div>
          <h2 className="mt-3 text-2xl font-bold text-slate-800">258</h2>
          <p className="mt-1 text-xs text-emerald-600">82.7% completion rate</p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Average Turnaround</p>
            <Clock3 className="text-blue-600" size={21} />
          </div>
          <h2 className="mt-3 text-2xl font-bold text-slate-800">2.4 Days</h2>
          <p className="mt-1 text-xs text-slate-400">Average repair duration</p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Repair Revenue</p>
            <IndianRupee className="text-amber-600" size={21} />
          </div>
          <h2 className="mt-3 text-2xl font-bold text-slate-800">₹1.84L</h2>
          <p className="mt-1 text-xs text-emerald-600">+8.4% vs last month</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 xl:col-span-2">
          <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-bold text-slate-800">Monthly Service Performance</h2>
              <p className="mt-1 text-sm text-slate-500">
                Requests received and repairs completed
              </p>
            </div>
            <span className="rounded-lg bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-700">
              Last 6 months
            </span>
          </div>

          <div className="flex h-64 items-end justify-around gap-3 border-b border-slate-100 pb-2">
            {monthlyData.map((item) => (
              <div key={item.month} className="flex h-full flex-1 items-end justify-center gap-1">
                <div
                  title={`${item.requests} requests`}
                  style={{ height: `${(item.requests / maxRequests) * 90}%` }}
                  className="w-3 rounded-t-md bg-violet-500 sm:w-6"
                />
                <div
                  title={`${item.completed} completed`}
                  style={{ height: `${(item.completed / maxRequests) * 90}%` }}
                  className="w-3 rounded-t-md bg-emerald-400 sm:w-6"
                />
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap justify-center gap-5 text-xs text-slate-500">
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-sm bg-violet-500" />
              Requests
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-sm bg-emerald-400" />
              Completed
            </span>
          </div>

          <div className="mt-3 flex justify-around text-xs text-slate-400">
            {monthlyData.map((item) => (
              <span key={item.month}>{item.month}</span>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5">
          <h2 className="font-bold text-slate-800">Service Categories</h2>
          <p className="mt-1 text-sm text-slate-500">Request distribution</p>

          <div className="mt-6 space-y-5">
            {serviceData.map((item) => (
              <div key={item.name}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-slate-600">{item.name}</span>
                  <span className="font-semibold text-slate-800">{item.value}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-violet-500"
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
              <TrendingUp size={21} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Repair Completion</h3>
              <p className="text-xs text-slate-500">Completed vs total requests</p>
            </div>
          </div>
          <div className="mt-5 flex items-center justify-between">
            <span className="text-3xl font-bold text-slate-800">82.7%</span>
            <span className="text-sm font-medium text-emerald-600">258 / 312</span>
          </div>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full w-[82.7%] rounded-full bg-emerald-500" />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <Wrench size={21} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800">Repair Operations</h3>
              <p className="text-xs text-slate-500">Operational overview</p>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-400">Active Repairs</p>
              <p className="mt-1 text-2xl font-bold text-slate-800">38</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Pending Requests</p>
              <p className="mt-1 text-2xl font-bold text-slate-800">16</p>
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-400">
        Illustrative report data — actual analytics API integration will be done later.
      </p>
    </div>
  );
}

export default Reports;
