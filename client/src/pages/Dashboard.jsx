
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ClipboardList,
  Wrench,
  CheckCircle2,
  Clock3,
  ArrowUpRight,
  Activity,
  Star,
  Plus,
  RefreshCw,
  Users,
  Package,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import API from "../services/api";

const completedStatuses = [
  "Repair Completed",
  "QC Passed",
  "Ready for Handover",
  "Completed"
];

const inProgressStatuses = [
  "In Diagnosis",
  "Diagnosis Completed",
  "Repair In Progress"
];

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};

const getStatusColor = (status) => {
  if (completedStatuses.includes(status)) {
    return "bg-emerald-50 text-emerald-600";
  }

  if (inProgressStatuses.includes(status)) {
    return "bg-orange-50 text-orange-600";
  }

  if (status === "QC Failed" || status === "Declined") {
    return "bg-rose-50 text-rose-600";
  }

  return "bg-blue-50 text-blue-600";
};
function AdminDashboard() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [assets, setAssets] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("kaamflow_user") || "{}");
    } catch {
      return {};
    }
  }, []);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const results = await Promise.allSettled([
        API.get("/requests"),
        API.get("/customers"),
        API.get("/assets"),
        API.get("/outcome-analytics")
      ]);

      const [requestResult, customerResult, assetResult, analyticsResult] =
        results;

      if (requestResult.status === "fulfilled") {
        setRequests(requestResult.value.data?.requests || []);
      } else {
        setRequests([]);
        setError(
          requestResult.reason?.response?.data?.message ||
          "Unable to load service requests."
        );
      }

      setCustomers(
        customerResult.status === "fulfilled"
          ? customerResult.value.data?.customers || []
          : []
      );

      setAssets(
        assetResult.status === "fulfilled"
          ? assetResult.value.data?.assets || []
          : []
      );

      setAnalytics(
        analyticsResult.status === "fulfilled"
          ? analyticsResult.value.data?.analytics || {}
          : {}
      );
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const totalRequests = requests.length;

  const inProgress = requests.filter((request) =>
    inProgressStatuses.includes(request.status)
  ).length;

  const completed = requests.filter((request) =>
    completedStatuses.includes(request.status)
  ).length;

  const pending = requests.filter(
    (request) => request.status === "Needs Review"
  ).length;

  const overview = [
    {
      label: "Completed",
      value: completed,
      color: "bg-violet-500"
    },
    {
      label: "In Progress",
      value: inProgress,
      color: "bg-orange-400"
    },
    {
      label: "Other / Pending",
      value: Math.max(0, totalRequests - completed - inProgress),
      color: "bg-blue-400"
    }
  ];

  const completedPercent = totalRequests
    ? (completed / totalRequests) * 100
    : 0;

  const inProgressPercent = totalRequests
    ? (inProgress / totalRequests) * 100
    : 0;

  const pendingPercent = totalRequests
    ? (Math.max(0, totalRequests - completed - inProgress) / totalRequests) * 100
    : 0;

  const chartData = useMemo(() => {
    const days = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - i);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayRequests = requests.filter((request) => {
        const created = new Date(request.createdAt);
        return created >= date && created < nextDate;
      });

      days.push({
        label: date.toLocaleDateString("en-IN", { weekday: "short" }),
        total: dayRequests.length,
        completed: dayRequests.filter((request) =>
          completedStatuses.includes(request.status)
        ).length
      });
    }

    return days;
  }, [requests]);

  const maxChartValue = Math.max(
    1,
    ...chartData.map((item) => item.total)
  );

  const stats = [
    {
      title: "Total Requests",
      value: totalRequests,
      note: "All service requests",
      icon: ClipboardList,
      color: "bg-violet-50 text-violet-600"
    },
    {
      title: "In Progress",
      value: inProgress,
      note: "Active repair jobs",
      icon: Wrench,
      color: "bg-orange-50 text-orange-600"
    },
    {
      title: "Completed Jobs",
      value: completed,
      note: "Repair completed or closed",
      icon: CheckCircle2,
      color: "bg-emerald-50 text-emerald-600"
    },
    {
      title: "Pending Review",
      value: pending,
      note: "Awaiting initial review",
      icon: Clock3,
      color: "bg-blue-50 text-blue-600"
    }
  ];

  const recentRequests = [...requests]
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    )
    .slice(0, 5);

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric"
  });

  const firstName = user.name?.split(" ")[0] || "Admin";

  return (
    <div className="min-h-screen bg-[#f6f7fb] p-4 sm:p-6 lg:p-8">

      {/* Page Heading */}
      <section className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[2px] text-violet-600">
            {today}
          </p>

          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-800 sm:text-3xl">
            Good day, {firstName} <span className="text-amber-400">✦</span>
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Here's what's happening with your repair operations today.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={loadDashboard}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>

          <button
            onClick={() => navigate("/requests")}
            className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:-translate-y-0.5 hover:bg-violet-700"
          >
            <Plus size={18} />
            New Service Request
          </button>
        </div>
      </section>

      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

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
                {loading ? "—" : item.value}
              </h2>

              <p className="mt-3 text-xs text-slate-400">{item.note}</p>
            </article>
          );
        })}
      </section>

      {/* Additional Metrics */}
      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            title: "Customers",
            value: customers.length,
            icon: Users,
            color: "text-blue-600 bg-blue-50"
          },
          {
            title: "Registered Assets",
            value: assets.length,
            icon: Package,
            color: "text-orange-600 bg-orange-50"
          },
          {
            title: "Comeback Rate",
            value: `${analytics.comebackRate ?? 0}%`,
            icon: TrendingUp,
            color: "text-rose-600 bg-rose-50"
          },
          {
            title: "Average Rating",
            value: `${analytics.averageRating ?? 0}/5`,
            icon: Star,
            color: "text-amber-600 bg-amber-50"
          }
        ].map((item) => {
          const Icon = item.icon;

          return (
            <article
              key={item.title}
              className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
            >
              <div className={`grid h-12 w-12 place-items-center rounded-xl ${item.color}`}>
                <Icon size={21} />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">
                  {item.title}
                </p>
                <h3 className="mt-1 text-2xl font-extrabold text-slate-800">
                  {loading ? "—" : item.value}
                </h3>
              </div>
            </article>
          );
        })}
      </section>

      {/* Charts Section */}
      <section className="mb-6 grid grid-cols-1 gap-5 xl:grid-cols-[1.6fr_1fr]">

        {/* Performance Chart */}
        <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
          <div>
            <h2 className="font-bold text-slate-800">
              Repair Performance
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Service requests created in the last 7 days
            </p>
          </div>

          <div className="mt-7 flex items-end justify-between">
            <div>
              <h3 className="text-3xl font-extrabold text-slate-800">
                {loading ? "—" : completed}
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                Completed / passed jobs
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-sm bg-violet-600" />
                Total
              </span>
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-sm bg-violet-100" />
                Completed
              </span>
            </div>
          </div>

          <div className="mt-6 flex h-48 items-end justify-between gap-3 border-b border-slate-100 px-2">
            {chartData.map((item) => (
              <div
                key={item.label}
                className="flex h-full flex-1 flex-col items-center justify-end gap-2"
              >
                <div className="flex h-[85%] w-full items-end justify-center gap-1">
                  <div
                    className="w-3 rounded-t-md bg-violet-500 transition hover:bg-violet-700 sm:w-5"
                    style={{
                      height: `${Math.max(3, (item.total / maxChartValue) * 100)}%`
                    }}
                    title={`${item.total} requests`}
                  />

                  <div
                    className="w-3 rounded-t-md bg-violet-100 sm:w-5"
                    style={{
                      height: `${Math.max(3, (item.completed / maxChartValue) * 100)}%`
                    }}
                    title={`${item.completed} completed`}
                  />
                </div>

                <span className="pb-2 text-[10px] text-slate-400">
                  {item.label}
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
            <div
              className="grid h-44 w-44 place-items-center rounded-full"
              style={{
                background: totalRequests
                  ? `conic-gradient(#7867e7 0% ${completedPercent}%, #f0a44f ${completedPercent}% ${completedPercent + inProgressPercent}%, #7ab2e8 ${completedPercent + inProgressPercent}% 100%)`
                  : "#f1f5f9"
              }}
            >
              <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-white">
                <strong className="text-3xl font-extrabold text-slate-800">
                  {loading ? "—" : totalRequests}
                </strong>
                <span className="text-xs text-slate-400">Total Jobs</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {overview.map((item) => (
              <div key={item.label} className="flex items-center gap-3 text-sm">
                <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                <span className="flex-1 text-slate-500">{item.label}</span>
                <strong className="text-slate-800">
                  {loading ? "—" : item.value}
                </strong>
              </div>
            ))}
          </div>
        </article>
      </section>

      {/* FixLoop Summary */}
      <section className="mb-6 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-slate-800">
              FixLoop Outcome Intelligence
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Post-repair customer follow-up summary
            </p>
          </div>

          <button
            onClick={() => navigate("/fixloop")}
            className="flex items-center gap-1 text-xs font-bold text-violet-600 hover:text-violet-800"
          >
            View FixLoop <ArrowUpRight size={15} />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            ["Total Follow-ups", analytics.totalFollowUps ?? 0],
            ["Responded", analytics.responded ?? 0],
            ["No Response", analytics.noResponse ?? 0],
            ["Pending", analytics.pending ?? 0]
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs text-slate-500">{label}</p>
              <p className="mt-2 text-2xl font-extrabold text-slate-800">
                {loading ? "—" : value}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Requests Table */}
      <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 p-5 sm:p-6">
          <div>
            <h2 className="font-bold text-slate-800">
              Recent Service Requests
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Latest repair jobs from your database
            </p>
          </div>

          <button
            onClick={() => navigate("/requests")}
            className="flex items-center gap-1 text-xs font-bold text-violet-600 hover:text-violet-800"
          >
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
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-5 py-12 text-center text-sm text-slate-400">
                    Loading dashboard data...
                  </td>
                </tr>
              ) : recentRequests.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-5 py-12 text-center text-sm text-slate-400">
                    No service requests found.
                  </td>
                </tr>
              ) : (
                recentRequests.map((request) => (
                  <tr
                    key={request._id}
                    className="border-t border-slate-100 text-xs transition hover:bg-slate-50"
                  >
                    <td className="px-5 py-4 font-bold text-violet-600">
                      {request.requestId || request._id}
                    </td>

                    <td className="px-5 py-4 font-semibold text-slate-700">
                      {request.customer?.name || "—"}
                    </td>

                    <td className="px-5 py-4">
                      <strong className="block text-slate-700">
                        {request.asset?.category ||
                          request.asset?.model ||
                          "Device"}
                      </strong>
                      <span className="mt-1 block text-slate-400">
                        {request.reportedSymptom || "No issue description"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span className={`rounded-full px-3 py-1.5 text-[10px] font-bold ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span className="flex items-center gap-2 text-slate-600">
                        <span className={`h-2 w-2 rounded-full ${
                          request.priority === "Urgent" || request.priority === "High"
                            ? "bg-rose-500"
                            : request.priority === "Normal"
                            ? "bg-orange-400"
                            : "bg-emerald-500"
                        }`} />
                        {request.priority || "Normal"}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-slate-500">
                      {formatDate(request.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-7 flex flex-wrap items-center justify-between gap-3 text-[10px] text-slate-400">
        <span>© 2026 KAAMFLOW. All rights reserved.</span>
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Backend connected
        </span>
      </footer>
    </div>
  );
}

function TechnicianDashboard() {
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("kaamflow_user") || "{}");
    } catch {
      return {};
    }
  }, []);

  const loadTechnicianDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/requests");
      setRequests(response.data?.requests || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load your assigned jobs."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTechnicianDashboard();
  }, [loadTechnicianDashboard]);

  const pendingDiagnosis = requests.filter((request) =>
    ["Open", "In Diagnosis"].includes(request.status)
  ).length;

  const repairInProgress = requests.filter((request) =>
    ["Repair In Progress", "QC Failed"].includes(request.status)
  ).length;

  const completedRepairs = requests.filter((request) =>
    completedStatuses.includes(request.status)
  ).length;

  const todayJobs = requests.filter((request) => {
    if (!request.preferredDate) return false;

    return (
      new Date(request.preferredDate).toDateString() ===
      new Date().toDateString()
    );
  });

  const sortedRequests = [...requests]
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    )
    .slice(0, 6);

  const firstName = user.name?.split(" ")[0] || "Technician";

  const stats = [
    {
      title: "My Assigned Jobs",
      value: requests.length,
      note: "Jobs assigned to you",
      icon: ClipboardList,
      color: "bg-violet-50 text-violet-600"
    },
    {
      title: "Pending Diagnosis",
      value: pendingDiagnosis,
      note: "Awaiting diagnosis work",
      icon: Clock3,
      color: "bg-blue-50 text-blue-600"
    },
    {
      title: "Repair In Progress",
      value: repairInProgress,
      note: "Active repairs and rework",
      icon: Wrench,
      color: "bg-orange-50 text-orange-600"
    },
    {
      title: "Completed Repairs",
      value: completedRepairs,
      note: "Completed or QC-passed jobs",
      icon: CheckCircle2,
      color: "bg-emerald-50 text-emerald-600"
    }
  ];

  return (
    <div className="min-h-screen bg-[#f6f7fb] p-4 sm:p-6 lg:p-8">

      {/* Heading */}
      <section className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[2px] text-violet-600">
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              day: "2-digit",
              month: "long",
              year: "numeric"
            })}
          </p>

          <h1 className="mt-2 text-2xl font-extrabold text-slate-800 sm:text-3xl">
            Welcome, {firstName} ✦
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage your assigned repair jobs and daily work.
          </p>
        </div>

        <button
          onClick={loadTechnicianDashboard}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw
            size={17}
            className={loading ? "animate-spin" : ""}
          />
          Refresh Jobs
        </button>
      </section>

      {/* Error */}
      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Statistics */}
      <section className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <article
              key={item.title}
              className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-slate-50">
                <Icon size={21} className={item.color.split(" ")[1]} />
              </div>

              <p className="mt-5 text-sm font-medium text-slate-500">
                {item.title}
              </p>

              <h2 className="mt-1 text-3xl font-extrabold text-slate-800">
                {loading ? "—" : item.value}
              </h2>

              <p className="mt-3 text-xs text-slate-400">
                {item.note}
              </p>
            </article>
          );
        })}
      </section>

      {/* Today's Tasks */}
      <section className="mb-7 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-slate-800">
              Today's Scheduled Jobs
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Jobs with today's preferred service date
            </p>
          </div>

          <div className="rounded-xl bg-violet-50 px-4 py-2 text-xl font-extrabold text-violet-600">
            {loading ? "—" : todayJobs.length}
          </div>
        </div>

        {!loading && todayJobs.length === 0 && (
          <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
            No jobs scheduled for today.
          </p>
        )}

        {!loading && todayJobs.length > 0 && (
          <div className="mt-4 space-y-3">
            {todayJobs.slice(0, 4).map((request) => (
              <div
                key={request._id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 p-4"
              >
                <div>
                  <p className="text-sm font-bold text-slate-700">
                    {request.requestId || request._id}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {request.customer?.name || "Customer"}
                  </p>
                </div>

                <span className={`rounded-full px-3 py-1.5 text-[10px] font-bold ${getStatusColor(request.status)}`}>
                  {request.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Assigned Jobs */}
      <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 p-5 sm:p-6">
          <div>
            <h2 className="font-bold text-slate-800">
              My Assigned Jobs
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Your latest assigned service requests
            </p>
          </div>

          <button
            onClick={() => navigate("/requests")}
            className="text-xs font-bold text-violet-600 hover:text-violet-800"
          >
            View All Jobs →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px] text-left">
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
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-5 py-12 text-center text-sm text-slate-400">
                    Loading your assigned jobs...
                  </td>
                </tr>
              ) : sortedRequests.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-5 py-12 text-center text-sm text-slate-400">
                    No jobs assigned to you yet.
                  </td>
                </tr>
              ) : (
                sortedRequests.map((request) => (
                  <tr
                    key={request._id}
                    className="border-t border-slate-100 text-xs hover:bg-slate-50"
                  >
                    <td className="px-5 py-4 font-bold text-violet-600">
                      {request.requestId || request._id}
                    </td>

                    <td className="px-5 py-4 font-semibold text-slate-700">
                      {request.customer?.name || "—"}
                    </td>

                    <td className="px-5 py-4">
                      <strong className="block text-slate-700">
                        {request.asset?.category ||
                          request.asset?.model ||
                          "Device"}
                      </strong>
                      <span className="mt-1 block text-slate-400">
                        {request.reportedSymptom || "—"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span className={`rounded-full px-3 py-1.5 text-[10px] font-bold ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {request.priority || "Normal"}
                    </td>

                    <td className="px-5 py-4 text-slate-500">
                      {formatDate(request.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <footer className="mt-7 text-[10px] text-slate-400">
        © 2026 KAAMFLOW. Technician Workspace.
      </footer>
    </div>
  );
}


function Dashboard() {
  let user = {};

  try {
    user = JSON.parse(localStorage.getItem("kaamflow_user") || "{}");
  } catch {
    user = {};
  }

  if (user.role === "Technician") {
    return <TechnicianDashboard />;
  }

  return <AdminDashboard />;
}

export default Dashboard;
