
import { useEffect, useState } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  Mail,
  Phone,
  Briefcase,
  RefreshCw
} from "lucide-react";
import API from "../services/api";

function TechnicianApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filter, setFilter] = useState("All");
const [activationLink, setActivationLink] = useState("");

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/admin/technician-applications");

      setApplications(response.data.applications || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load technician applications."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleApprove = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to approve this technician application?"
    );

    if (!confirmed) return;

    try {
      setActionId(id);
      setError("");
      setSuccess("");

      const response = await API.patch(
        `/admin/technician-applications/${id}/approve`
      );

      setSuccess(response.data.message);
      setActivationLink(response.data.activationLink || "");
      setApplications((prev) =>
  prev.map((app) =>
    app._id === id ? { ...app, status: "Approved" } : app
  )
);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to approve application."
      );
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to reject this application?"
    );

    if (!confirmed) return;

    try {
      setActionId(id);
      setError("");
      setSuccess("");

      const response = await API.patch(
        `/admin/technician-applications/${id}/reject`,
        { adminNotes: "Application rejected by Admin." }
      );

      setSuccess(response.data.message);
     setApplications((prev) =>
  prev.map((app) =>
    app._id === id ? { ...app, status: "Rejected" } : app
  )
);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to reject application."
      );
    } finally {
      setActionId(null);
    }
  };

  const filteredApplications =
    filter === "All"
      ? applications
      : applications.filter((app) => app.status === filter);

  const getStatusStyle = (status) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-700";
      case "Rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-amber-100 text-amber-700";
    }
  };

  const pendingCount = applications.filter(
    (app) => app.status === "Pending"
  ).length;

  const approvedCount = applications.filter(
    (app) => app.status === "Approved"
  ).length;

  const rejectedCount = applications.filter(
    (app) => app.status === "Rejected"
  ).length;

  return (
    <div className="p-5 sm:p-7 space-y-6">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Technician Applications
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review and manage technician joining requests.
          </p>
        </div>

        <button
          onClick={fetchApplications}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

   
      {/* Alerts */}
      {success && (
        <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm">
          {success}
        </div>
      )}

      {activationLink && (
        <div className="p-4 rounded-xl bg-violet-50 border border-violet-200 space-y-3">
          <div>
            <h3 className="font-semibold text-violet-800">
              Technician Activation Link
            </h3>
            <p className="text-sm text-violet-600 mt-1">
              Share this secure link with the approved technician.
              It expires after 24 hours.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              readOnly
              value={activationLink}
              className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-violet-200 bg-white text-sm text-slate-700"
            />

            <button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(activationLink);
                  setSuccess("Activation link copied successfully.");
                } catch {
                  setError("Unable to copy link. Please copy it manually.");
                }
              }}
              className="px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700"
            >
              Copy Activation Link
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}



      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Pending</p>
              <h2 className="text-3xl font-bold text-slate-800 mt-2">
                {pendingCount}
              </h2>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
              <Clock size={23} />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Approved</p>
              <h2 className="text-3xl font-bold text-slate-800 mt-2">
                {approvedCount}
              </h2>
            </div>
            <div className="p-3 rounded-xl bg-green-50 text-green-600">
              <CheckCircle size={23} />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Rejected</p>
              <h2 className="text-3xl font-bold text-slate-800 mt-2">
                {rejectedCount}
              </h2>
            </div>
            <div className="p-3 rounded-xl bg-red-50 text-red-600">
              <XCircle size={23} />
            </div>
          </div>
        </div>

      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {["All", "Pending", "Approved", "Rejected"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              filter === status
                ? "bg-violet-600 text-white"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Applications */}
      {loading ? (
        <div className="bg-white rounded-2xl p-10 text-center text-slate-500">
          Loading applications...
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center">
          <Briefcase size={38} className="mx-auto text-slate-300 mb-3" />
          <h3 className="font-semibold text-slate-700">
            No applications found
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            There are no {filter.toLowerCase()} applications right now.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {filteredApplications.map((app) => (
            <div
              key={app._id}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">
                    {app.name}
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    {app.specialization}
                  </p>
                </div>

                <span
                  className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(app.status)}`}
                >
                  {app.status}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-slate-400" />
                  <span className="break-all">{app.email}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-slate-400" />
                  {app.phone}
                </div>

                <div className="flex items-center gap-2">
                  <Briefcase size={16} className="text-slate-400" />
                  {app.experience}
                </div>

                <div className="flex items-center gap-2">
                  <User size={16} className="text-slate-400" />
                  Technician Applicant
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">
                  Skills
                </p>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {app.skills}
                </p>
              </div>

              {app.message && (
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">
                    Applicant Message
                  </p>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {app.message}
                  </p>
                </div>
              )}

              {app.status === "Pending" && (
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={() => handleApprove(app._id)}
                    disabled={actionId === app._id}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    <CheckCircle size={17} />
                    {actionId === app._id ? "Processing..." : "Approve"}
                  </button>

                  <button
                    onClick={() => handleReject(app._id)}
                    disabled={actionId === app._id}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50"
                  >
                    <XCircle size={17} />
                    Reject
                  </button>
                </div>
              )}

              <p className="text-xs text-slate-400 border-t border-slate-100 pt-3">
                Applied:{" "}
                {app.createdAt
                  ? new Date(app.createdAt).toLocaleDateString()
                  : "Date unavailable"}
              </p>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

export default TechnicianApplications;
