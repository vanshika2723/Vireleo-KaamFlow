
import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  ClipboardList,
  CheckCircle2,
  Clock3,
  Download,
  Wrench,
  IndianRupee,
  RefreshCw,
  FileSpreadsheet
} from "lucide-react";
import API from "../services/api";

const completedStatuses = [
  "Repair Completed",
  "QC Passed",
  "Ready for Handover",
  "Completed"
];

const activeStatuses = [
  "In Diagnosis",
  "Diagnosis Completed",
  "Repair In Progress"
];

const pendingStatuses = [
  "Needs Review",
  "Accepted",
  "Needs More Information",
  "Open"
];

function Reports() {
  const [requests, setRequests] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReports = async () => {
    try {
      setLoading(true);
      setError("");

      const [requestResult, invoiceResult] =
        await Promise.allSettled([
          API.get("/requests"),
          API.get("/invoices")
        ]);

      if (requestResult.status === "fulfilled") {
        setRequests(
          requestResult.value.data.requests || []
        );
      } else {
        throw requestResult.reason;
      }

      if (invoiceResult.status === "fulfilled") {
        setInvoices(
          invoiceResult.value.data.invoices || []
        );
      } else {
        setInvoices([]);
      }

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load report data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const completedRequests = useMemo(
    () =>
      requests.filter((item) =>
        completedStatuses.includes(item.status)
      ),
    [requests]
  );

  const activeRepairs = useMemo(
    () =>
      requests.filter((item) =>
        activeStatuses.includes(item.status)
      ),
    [requests]
  );

  const pendingRequests = useMemo(
    () =>
      requests.filter((item) =>
        pendingStatuses.includes(item.status)
      ),
    [requests]
  );

  const totalRevenue = useMemo(
    () =>
      invoices.reduce(
        (total, invoice) =>
          total + Number(invoice.totalAmount || 0),
        0
      ),
    [invoices]
  );

  const completionRate = requests.length
    ? (completedRequests.length / requests.length) * 100
    : 0;

  // Last six months
  const monthlyData = useMemo(() => {
    const now = new Date();

    const months = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(
        now.getFullYear(),
        now.getMonth() - i,
        1
      );

      const year = date.getFullYear();
      const month = date.getMonth();

      const monthRequests = requests.filter((request) => {
        const created = new Date(request.createdAt);

        return (
          created.getFullYear() === year &&
          created.getMonth() === month
        );
      });

      const monthCompleted = monthRequests.filter(
        (request) =>
          completedStatuses.includes(request.status)
      );

      months.push({
        month: date.toLocaleDateString("en-IN", {
          month: "short"
        }),
        requests: monthRequests.length,
        completed: monthCompleted.length
      });
    }

    return months;
  }, [requests]);

  const maxRequests = Math.max(
    1,
    ...monthlyData.map((item) => item.requests)
  );

  // Asset category distribution
  const serviceData = useMemo(() => {
    const categories = {};

    requests.forEach((request) => {
      const category =
        request.asset?.category || "Other";

      categories[category] =
        (categories[category] || 0) + 1;
    });

    const total = requests.length || 1;

    return Object.entries(categories)
      .map(([name, count]) => ({
        name,
        count,
        value: Math.round((count / total) * 100)
      }))
      .sort((a, b) => b.count - a.count);
  }, [requests]);

  // Export actual report data
  const exportReport = () => {
    const rows = [
      [
        "Request ID",
        "Customer",
        "Asset Category",
        "Status",
        "Priority",
        "Created Date"
      ],
      ...requests.map((request) => [
        request.requestId || "",
        request.customer?.name || "",
        request.asset?.category || "Other",
        request.status || "",
        request.priority || "",
        request.createdAt
          ? new Date(request.createdAt).toLocaleDateString("en-IN")
          : ""
      ])
    ];

    const csv = rows
      .map((row) =>
        row
          .map((value) => {
            const safeValue = String(value).replace(/"/g, '""');
            return `"${safeValue}"`;
          })
          .join(",")
      )
      .join("\n");

    const blob = new Blob(
      ["\uFEFF" + csv],
      { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `KAAMFLOW-Report-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(amount || 0);

  return (
    <div className="space-y-6 p-5 md:p-8">

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-violet-100 p-2.5 text-violet-600">
              <BarChart3 size={22} />
            </div>

            <h1 className="text-2xl font-bold text-slate-800">
              Reports & Analytics
            </h1>
          </div>

          <p className="mt-2 text-sm text-slate-500">
            Understand service performance and business outcomes
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={loadReports}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>

          <button
            onClick={exportReport}
            disabled={loading || requests.length === 0}
            className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50"
          >
            <Download size={17} />
            Export Report
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-600">
          {error}
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          title="Total Requests"
          value={loading ? "..." : requests.length}
          subtitle="Actual service requests"
          icon={ClipboardList}
          color="violet"
        />

        <StatCard
          title="Completed Repairs"
          value={loading ? "..." : completedRequests.length}
          subtitle={`${completionRate.toFixed(1)}% completion rate`}
          icon={CheckCircle2}
          color="green"
        />

        <StatCard
          title="Invoices Generated"
          value={loading ? "..." : invoices.length}
          subtitle="Recorded service invoices"
          icon={FileSpreadsheet}
          color="blue"
        />

        <StatCard
          title="Repair Revenue"
          value={loading ? "..." : formatCurrency(totalRevenue)}
          subtitle="Total generated invoice value"
          icon={IndianRupee}
          color="amber"
        />

      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

        {/* Monthly Performance */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 xl:col-span-2">

          <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-bold text-slate-800">
                Monthly Service Performance
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Requests received and currently completed
              </p>
            </div>

            <span className="rounded-lg bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-700">
              Last 6 months
            </span>
          </div>

          {loading ? (
            <ChartLoading />
          ) : (
            <>
              <div className="flex h-64 items-end justify-around gap-3 border-b border-slate-100 pb-2">
                {monthlyData.map((item) => (
                  <div
                    key={item.month}
                    className="flex h-full flex-1 items-end justify-center gap-1"
                  >
                    <div
                      title={`${item.requests} requests`}
                      style={{
                        height: `${(item.requests / maxRequests) * 90}%`
                      }}
                      className="w-3 rounded-t-md bg-violet-500 sm:w-6"
                    />

                    <div
                      title={`${item.completed} completed`}
                      style={{
                        height: `${(item.completed / maxRequests) * 90}%`
                      }}
                      className="w-3 rounded-t-md bg-emerald-400 sm:w-6"
                    />
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap justify-center gap-5 text-xs text-slate-500">
                <Legend color="bg-violet-500" label="Requests" />
                <Legend color="bg-emerald-400" label="Completed" />
              </div>

              <div className="mt-3 flex justify-around text-xs text-slate-400">
                {monthlyData.map((item) => (
                  <span key={item.month}>{item.month}</span>
                ))}
              </div>
            </>
          )}

        </div>

        {/* Categories */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5">

          <h2 className="font-bold text-slate-800">
            Service Categories
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Actual asset category distribution
          </p>

          {loading ? (
            <ChartLoading />
          ) : serviceData.length > 0 ? (
            <div className="mt-6 space-y-5">
              {serviceData.map((item) => (
                <div key={item.name}>
                  <div className="mb-2 flex items-center justify-between gap-2 text-sm">
                    <span className="text-slate-600">
                      {item.name}
                    </span>

                    <span className="font-semibold text-slate-800">
                      {item.value}%
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-violet-500"
                      style={{ width: `${item.value}%` }}
                    />
                  </div>

                  <p className="mt-1 text-xs text-slate-400">
                    {item.count} requests
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyChart message="No service category data available." />
          )}

        </div>
      </div>

      {/* Operations */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

        {/* Completion */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5">

          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
              <TrendingUp size={21} />
            </div>

            <div>
              <h3 className="font-bold text-slate-800">
                Repair Completion
              </h3>

              <p className="text-xs text-slate-500">
                Completed vs total requests
              </p>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between">
            <span className="text-3xl font-bold text-slate-800">
              {loading ? "..." : `${completionRate.toFixed(1)}%`}
            </span>

            <span className="text-sm font-medium text-emerald-600">
              {completedRequests.length} / {requests.length}
            </span>
          </div>

          <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${completionRate}%` }}
            />
          </div>

        </div>

        {/* Repair Operations */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5">

          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <Wrench size={21} />
            </div>

            <div>
              <h3 className="font-bold text-slate-800">
                Repair Operations
              </h3>

              <p className="text-xs text-slate-500">
                Current operational overview
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-4">

            <div>
              <p className="text-xs text-slate-400">
                Active Repairs
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-800">
                {loading ? "..." : activeRepairs.length}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-400">
                Pending Requests
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-800">
                {loading ? "..." : pendingRequests.length}
              </p>
            </div>

          </div>
        </div>

      </div>

      <p className="text-xs text-slate-400">
        Report figures are loaded from your KAAMFLOW service request and invoice APIs. Monthly completed counts use each request's creation month and its current status.
      </p>

    </div>
  );
}

function StatCard({ title, value, subtitle, icon: Icon, color }) {
  const styles = {
    violet: "bg-violet-50 text-violet-600",
    green: "bg-emerald-50 text-emerald-600",
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600"
  };

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{title}</p>

        <span className={`rounded-xl p-3 ${styles[color]}`}>
          <Icon size={21} />
        </span>
      </div>

      <h2 className="mt-3 text-2xl font-bold text-slate-800">
        {value}
      </h2>

      <p className="mt-1 text-xs text-slate-400">
        {subtitle}
      </p>
    </div>
  );
}

function Legend({ color, label }) {
  return (
    <span className="flex items-center gap-2">
      <span className={`h-2.5 w-2.5 rounded-sm ${color}`} />
      {label}
    </span>
  );
}

function ChartLoading() {
  return (
    <div className="flex h-64 items-center justify-center text-sm text-slate-400">
      <RefreshCw size={18} className="mr-2 animate-spin" />
      Loading report data...
    </div>
  );
}

function EmptyChart({ message }) {
  return (
    <div className="mt-6 rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-400">
      {message}
    </div>
  );
}

export default Reports;
