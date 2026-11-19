
import { useEffect, useMemo, useState } from "react";
import {
  RefreshCw,
  Search,
  CheckCircle2,
  Clock3,
  AlertTriangle,
  Star,
  MessageSquare,
  TrendingUp,
  Plus,
  X,
  ClipboardCheck,
  Send
} from "lucide-react";
import API from "../services/api";

const outcomeStyles = {
  "Working as Expected": "bg-emerald-50 text-emerald-700",
  "Same Symptom Persists": "bg-rose-50 text-rose-700",
  "Partly Improved": "bg-amber-50 text-amber-700",
  "Different Issue": "bg-blue-50 text-blue-700",
  Unknown: "bg-slate-100 text-slate-600"
};

const emptyAnalytics = {
  totalFollowUps: 0,
  responded: 0,
  noResponse: 0,
  pending: 0,
  comebacks: 0,
  comebackRate: 0,
  averageRating: 0,
  totalRatings: 0,
  outcomeStats: []
};

function FixLoop() {
  const [followUps, setFollowUps] = useState([]);
  const [requests, setRequests] = useState([]);
  const [analytics, setAnalytics] = useState(emptyAnalytics);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showOutcomeModal, setShowOutcomeModal] = useState(false);

  const [selectedRequest, setSelectedRequest] = useState("");
  const [selectedFollowUp, setSelectedFollowUp] = useState(null);

  const [outcome, setOutcome] = useState("Working as Expected");
  const [rating, setRating] = useState("5");
  const [feedback, setFeedback] = useState("");

  // Load all FixLoop data
  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const results = await Promise.allSettled([
        API.get("/followups"),
        API.get("/requests"),
        API.get("/outcome-analytics")
      ]);

      const followUpResult = results[0];
      const requestResult = results[1];
      const analyticsResult = results[2];

      if (followUpResult.status === "fulfilled") {
        setFollowUps(
          followUpResult.value.data.followUps || []
        );
      } else {
        throw followUpResult.reason;
      }

      if (requestResult.status === "fulfilled") {
        setRequests(
          requestResult.value.data.requests || []
        );
      }

      if (analyticsResult.status === "fulfilled") {
        setAnalytics({
          ...emptyAnalytics,
          ...analyticsResult.value.data.analytics
        });
      } else {
        setAnalytics(emptyAnalytics);
      }

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load FixLoop records."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Completed requests without existing follow-ups
  const availableRequests = useMemo(() => {
    const existingRequestIds = followUps.map((item) => {
      const request = item.serviceRequest;
      return String(
        typeof request === "object" ? request?._id : request
      );
    });

    return requests.filter(
      (request) =>
        request.status === "Completed" &&
        !existingRequestIds.includes(String(request._id))
    );
  }, [requests, followUps]);

  // Search and filter
  const filteredFollowUps = useMemo(() => {
    return followUps.filter((item) => {
      const customer =
        item.customer?.name || "";

      const requestId =
        item.serviceRequest?.requestId || "";

      const followUpId =
        item._id || "";

      const searchText =
        `${customer} ${requestId} ${followUpId}`.toLowerCase();

      const matchesSearch = searchText.includes(
        search.toLowerCase()
      );

      const status = item.responseStatus || "Pending";

      const matchesFilter =
        filter === "All" || status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [followUps, search, filter]);

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const openCreateModal = () => {
    setSelectedRequest("");
    setError("");
    setSuccess("");
    setShowCreateModal(true);
  };

  // Create follow-up
  const handleCreateFollowUp = async (e) => {
    e.preventDefault();

    if (!selectedRequest) {
      setError("Please select a completed service request.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await API.post("/followups", {
        requestId: selectedRequest
      });

      setSuccess(
        response.data.message ||
        "Follow-up created successfully."
      );

      setShowCreateModal(false);
      setSelectedRequest("");

      await loadData();

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to create follow-up."
      );
    } finally {
      setSaving(false);
    }
  };

  // Open outcome modal
  const openOutcomeModal = (followUp) => {
    setSelectedFollowUp(followUp);
    setOutcome("Working as Expected");
    setRating("5");
    setFeedback("");
    setError("");
    setShowOutcomeModal(true);
  };

  // Submit outcome
  const handleSubmitOutcome = async (e) => {
    e.preventDefault();

    if (!selectedFollowUp) return;

    try {
      setSaving(true);
      setError("");

      const response = await API.patch(
        `/followups/${selectedFollowUp._id}/outcome`,
        {
          outcome,
          customerFeedback: feedback,
          rating: rating ? Number(rating) : null
        }
      );

      setSuccess(
        response.data.message ||
        "Outcome saved successfully."
      );

      setShowOutcomeModal(false);
      setSelectedFollowUp(null);

      await loadData();

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to submit outcome."
      );
    } finally {
      setSaving(false);
    }
  };

  // Mark no response
  const handleNoResponse = async (followUp) => {
    const confirmed = window.confirm(
      "Mark this follow-up as No Response?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await API.patch(
        `/followups/${followUp._id}/no-response`
      );

      setSuccess("Follow-up marked as No Response.");

      await loadData();

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to update follow-up."
      );
    }
  };

  const getStatusStyle = (status) => {
    if (status === "Responded") {
      return "bg-emerald-50 text-emerald-700";
    }

    if (status === "Pending") {
      return "bg-amber-50 text-amber-700";
    }

    return "bg-slate-100 text-slate-600";
  };

  const getOutcome = (item) => {
    return item.outcome || "Unknown";
  };

  return (
    <div className="space-y-6 p-5 md:p-8">

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-violet-100 p-2.5 text-violet-600">
              <RefreshCw size={22} />
            </div>

            <h1 className="text-2xl font-bold text-slate-800">
              FixLoop Outcomes
            </h1>
          </div>

          <p className="mt-2 text-sm text-slate-500">
            Track post-repair customer feedback and identify recurring issues
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
          >
            <Plus size={17} />
            Create Follow-up
          </button>
        </div>
      </div>

      {/* Success */}
      {success && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-700">
          <CheckCircle2 size={18} />
          {success}

          <button
            onClick={() => setSuccess("")}
            className="ml-auto"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Error */}
      {error && !showCreateModal && !showOutcomeModal && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-600">
          <AlertTriangle size={18} />
          {error}

          <button
            onClick={() => setError("")}
            className="ml-auto"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Main Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          title="Total Follow-ups"
          value={analytics.totalFollowUps}
          subtitle="Customer follow-up records"
          icon={MessageSquare}
          color="violet"
        />

        <StatCard
          title="Responses Received"
          value={analytics.responded}
          subtitle="Recorded responses"
          icon={CheckCircle2}
          color="green"
        />

        <StatCard
          title="Comeback Rate"
          value={`${analytics.comebackRate}%`}
          subtitle="Same symptom persists"
          icon={AlertTriangle}
          color="rose"
        />

        <StatCard
          title="Average Rating"
          value={`${Number(analytics.averageRating || 0).toFixed(1)} / 5`}
          subtitle={`${analytics.totalRatings || 0} customer ratings`}
          icon={Star}
          color="amber"
        />

      </div>

      {/* Secondary Statistics */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

        <StatCard
          title="Pending Follow-ups"
          value={analytics.pending}
          subtitle="Awaiting response"
          icon={Clock3}
          color="amber"
        />

        <StatCard
          title="No Response"
          value={analytics.noResponse}
          subtitle="Without customer response"
          icon={AlertTriangle}
          color="rose"
        />

        <StatCard
          title="Comeback Cases"
          value={analytics.comebacks}
          subtitle="Same symptom reported again"
          icon={TrendingUp}
          color="violet"
        />

      </div>

      {/* Outcome Distribution */}
      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <h2 className="font-bold text-slate-800">
          Outcome Distribution
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Actual recorded customer outcomes
        </p>

        {analytics.outcomeStats?.length > 0 ? (
          <div className="mt-5 space-y-4">
            {analytics.outcomeStats.map((item) => {
              const total = analytics.totalFollowUps || 1;
              const percentage = Math.round(
                (item.count / total) * 100
              );

              const label = item._id || "Unknown";

              return (
                <div key={label}>
                  <div className="mb-2 flex justify-between gap-3 text-xs">
                    <span className="font-semibold text-slate-600">
                      {label}
                    </span>

                    <span className="font-bold text-slate-700">
                      {item.count} ({percentage}%)
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-violet-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="mt-5 rounded-xl bg-slate-50 p-5 text-center text-sm text-slate-400">
            No outcome data available yet.
          </p>
        )}
      </section>

      {/* Follow-up Records */}
      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">

        <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <h2 className="font-bold text-slate-800">
              Customer Outcomes
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Post-repair follow-up history
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative w-full sm:w-72">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search follow-ups..."
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-violet-400"
              />
            </div>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 outline-none"
            >
              <option value="All">All Status</option>
              <option value="Responded">Responded</option>
              <option value="Pending">Pending</option>
              <option value="No Response">No Response</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">

            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                <th className="px-4 py-4 font-semibold">Follow-up ID</th>
                <th className="px-4 py-4 font-semibold">Customer</th>
                <th className="px-4 py-4 font-semibold">Request</th>
                <th className="px-4 py-4 font-semibold">Date</th>
                <th className="px-4 py-4 font-semibold">Outcome</th>
                <th className="px-4 py-4 font-semibold">Rating</th>
                <th className="px-4 py-4 font-semibold">Status</th>
                <th className="px-4 py-4 font-semibold">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-50">

              {loading ? (
                <tr>
                  <td colSpan="8" className="px-4 py-14 text-center">
                    <RefreshCw
                      size={22}
                      className="mx-auto mb-3 animate-spin text-violet-500"
                    />
                    <p className="text-sm text-slate-400">
                      Loading FixLoop records...
                    </p>
                  </td>
                </tr>
              ) : (
                filteredFollowUps.map((item) => {
                  const status = item.responseStatus || "Pending";
                  const itemOutcome = getOutcome(item);

                  return (
                    <tr
                      key={item._id}
                      className="hover:bg-slate-50/70"
                    >
                      <td className="px-4 py-4 text-xs font-semibold text-violet-700">
                        FL-{String(item._id).slice(-6).toUpperCase()}
                      </td>

                      <td className="px-4 py-4 text-sm font-medium text-slate-700">
                        {item.customer?.name || "Unknown"}
                      </td>

                      <td className="px-4 py-4 text-sm text-slate-500">
                        {item.serviceRequest?.requestId || "—"}
                      </td>

                      <td className="px-4 py-4 text-sm text-slate-500">
                        {formatDate(item.scheduledAt)}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ${
                            outcomeStyles[itemOutcome] || outcomeStyles.Unknown
                          }`}
                        >
                          {itemOutcome}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        {item.rating ? (
                          <span className="flex items-center gap-1 text-sm font-semibold text-slate-700">
                            <Star
                              size={15}
                              className="fill-amber-400 text-amber-400"
                            />
                            {item.rating}/5
                          </span>
                        ) : (
                          <span className="text-sm text-slate-400">
                            —
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusStyle(status)}`}
                        >
                          {status}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        {status === "Pending" ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openOutcomeModal(item)}
                              className="rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white hover:bg-violet-700"
                            >
                              Record Outcome
                            </button>

                            <button
                              onClick={() => handleNoResponse(item)}
                              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                            >
                              No Response
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">
                            Completed
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}

              {!loading && filteredFollowUps.length === 0 && (
                <tr>
                  <td colSpan="8" className="px-4 py-14 text-center">
                    <ClipboardCheck
                      size={30}
                      className="mx-auto mb-3 text-slate-300"
                    />

                    <p className="text-sm font-bold text-slate-600">
                      No follow-up records found
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Create a follow-up for a completed service request.
                    </p>
                  </td>
                </tr>
              )}

            </tbody>
          </table>
        </div>
      </section>

      {/* Create Follow-up Modal */}
      {showCreateModal && (
        <Modal
          title="Create Follow-up"
          subtitle="Select a completed service request"
          onClose={() => setShowCreateModal(false)}
        >
          <form onSubmit={handleCreateFollowUp} className="space-y-5">

            <div>
              <label className="mb-2 block text-xs font-bold text-slate-700">
                Completed Service Request
              </label>

              <select
                value={selectedRequest}
                onChange={(e) => setSelectedRequest(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-violet-400"
              >
                <option value="">Select a request</option>

                {availableRequests.map((request) => (
                  <option key={request._id} value={request._id}>
                    {request.requestId} — {request.customer?.name || "Customer"}
                  </option>
                ))}
              </select>

              {availableRequests.length === 0 && (
                <p className="mt-2 text-xs text-amber-600">
                  No eligible requests found. Only Completed requests without an existing follow-up can be selected.
                </p>
              )}
            </div>

            {error && (
              <p className="rounded-xl bg-rose-50 p-3 text-xs text-rose-600">
                {error}
              </p>
            )}

            <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving || !selectedRequest}
                className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-violet-700 disabled:opacity-50"
              >
                {saving ? "Creating..." : "Create Follow-up"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Outcome Modal */}
      {showOutcomeModal && selectedFollowUp && (
        <Modal
          title="Record Follow-up Outcome"
          subtitle={`${selectedFollowUp.serviceRequest?.requestId || ""} · ${selectedFollowUp.customer?.name || ""}`}
          onClose={() => setShowOutcomeModal(false)}
        >
          <form onSubmit={handleSubmitOutcome} className="space-y-5">

            <div>
              <label className="mb-2 block text-xs font-bold text-slate-700">
                Customer Outcome
              </label>

              <select
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-violet-400"
              >
                <option value="Working as Expected">
                  Working as Expected
                </option>
                <option value="Same Symptom Persists">
                  Same Symptom Persists
                </option>
                <option value="Partly Improved">
                  Partly Improved
                </option>
                <option value="Different Issue">
                  Different Issue
                </option>
                <option value="Unknown">Unknown</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold text-slate-700">
                Customer Rating
              </label>

              <select
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-violet-400"
              >
                <option value="">No rating</option>
                <option value="5">5 - Excellent</option>
                <option value="4">4 - Good</option>
                <option value="3">3 - Average</option>
                <option value="2">2 - Poor</option>
                <option value="1">1 - Very Poor</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold text-slate-700">
                Customer Feedback
              </label>

              <textarea
                rows="3"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Enter recorded customer feedback..."
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-400"
              />
            </div>

            <p className="rounded-xl bg-violet-50 p-3 text-xs leading-5 text-violet-700">
              This action records the outcome in FixLoop. It does not send an SMS or email to the customer.
            </p>

            {error && (
              <p className="rounded-xl bg-rose-50 p-3 text-xs text-rose-600">
                {error}
              </p>
            )}

            <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setShowOutcomeModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-violet-700 disabled:opacity-50"
              >
                <Send size={14} />
                {saving ? "Saving..." : "Save Outcome"}
              </button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
}

function StatCard({ title, value, subtitle, icon: Icon, color }) {
  const styles = {
    violet: "bg-violet-50 text-violet-600",
    green: "bg-emerald-50 text-emerald-600",
    rose: "bg-rose-50 text-rose-600",
    amber: "bg-amber-50 text-amber-600"
  };

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
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

function Modal({ title, subtitle, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="my-auto w-full max-w-lg rounded-2xl bg-white shadow-2xl">

        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <div>
            <h2 className="text-lg font-extrabold text-slate-800">
              {title}
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              {subtitle}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
          >
            <X size={19} />
          </button>
        </div>

        <div className="p-5">
          {children}
        </div>

      </div>
    </div>
  );
}

export default FixLoop;
