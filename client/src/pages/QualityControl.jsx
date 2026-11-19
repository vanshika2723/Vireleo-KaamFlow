
import { useEffect, useMemo, useState } from "react";
import {
  ShieldCheck,
  Search,
  ClipboardCheck,
  CheckCircle2,
  AlertCircle,
  Clock3,
  Plus,
  X,
  RefreshCw,
  Eye
} from "lucide-react";
import API from "../services/api";

const defaultChecks = [
  { item: "Reported issue resolved", passed: true, remarks: "" },
  { item: "Repaired components tested", passed: true, remarks: "" },
  { item: "Equipment safety verified", passed: true, remarks: "" },
  { item: "Equipment functionality verified", passed: true, remarks: "" },
  { item: "Equipment ready for handover", passed: true, remarks: "" }
];

function QualityControl() {
  const [inspections, setInspections] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedInspection, setSelectedInspection] = useState(null);

  const [checks, setChecks] = useState(defaultChecks);
  const [overallNotes, setOverallNotes] = useState("");

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("kaamflow_user") || "{}");
    } catch {
      return {};
    }
  }, []);

  const isAdmin = user.role === "Admin";

  // Load requests, latest QC and repair logs
  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/requests");
      const allRequests = response.data.requests || [];
const eligibleRequests = allRequests.filter(
  (request) =>
    request.status === "Repair Completed" ||
    request.status === "QC Passed" ||
    request.status === "QC Failed" ||
    request.status === "Ready for Handover" ||
    request.status === "Completed"
);
      const qcResults = await Promise.all(
        eligibleRequests.map(async (request) => {
          const [qcResult, repairResult] = await Promise.all([
            API.get(`/qc/${request._id}`).catch((err) => {
              if (err.response?.status === 404) {
                return { data: { qc: null } };
              }
              throw err;
            }),

            API.get(`/repair-logs/${request._id}`)
          ]);

          const repairLogs = repairResult.data.repairLogs || [];

          const latestRepairLog = [...repairLogs].sort(
            (a, b) =>
              new Date(b.createdAt || 0) -
              new Date(a.createdAt || 0)
          )[0] || null;

          return {
            request,
            qc: qcResult.data.qc || null,
            latestRepairLog
          };
        })
      );

      setInspections(qcResults);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load quality control records."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Open new inspection
  const openNewInspection = (request) => {
    setSelectedRequest(request);
    setChecks(defaultChecks.map((check) => ({ ...check })));
    setOverallNotes("");
    setError("");
    setSuccess("");
    setShowModal(true);
  };

  // Update checklist
  const updateCheck = (index, field, value) => {
    setChecks((previous) =>
      previous.map((check, i) =>
        i === index
          ? { ...check, [field]: value }
          : check
      )
    );
  };

  // Submit QC
  const handleSubmitQC = async (e) => {
    e.preventDefault();

    if (!selectedRequest) return;

    try {
      setSaving(true);
      setError("");

      const response = await API.post(
        `/qc/${selectedRequest._id}`,
        {
          checks,
          overallNotes
        }
      );

      setShowModal(false);
      setSelectedRequest(null);

      setSuccess(
        response.data.message ||
        "Quality inspection completed successfully."
      );

      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to submit quality inspection."
      );
    } finally {
      setSaving(false);
    }
  };

  // Search and filter
  const filteredInspections = inspections.filter(
    ({ request, qc }) => {
      const customer = request.customer?.name || "";

      const equipment = [
        request.asset?.brand,
        request.asset?.model
      ].filter(Boolean).join(" ");

      const requestNumber = request.requestId || "";

      const result = qc?.result || "Pending";

      const searchText =
        `${requestNumber} ${customer} ${equipment}`.toLowerCase();

      const matchesSearch = searchText.includes(
        search.toLowerCase()
      );

      const matchesFilter =
        filter === "All" || result === filter;

      return matchesSearch && matchesFilter;
    }
  );

  const totalInspections = inspections.filter(
    (item) => item.qc
  ).length;

  const passedCount = inspections.filter(
    (item) => item.qc?.result === "Passed"
  ).length;

  const failedCount = inspections.filter(
    (item) => item.qc?.result === "Failed"
  ).length;

  const pendingCount = inspections.filter(
    (item) => !item.qc
  ).length;

  const getEquipment = (request) => {
    const asset = request.asset || {};

    return [
      asset.brand,
      asset.model
    ].filter(Boolean).join(" ") || asset.category || "Equipment";
  };

  const getDate = (item) => {
    const date =
      item.qc?.reviewedAt ||
      item.qc?.createdAt ||
      item.request.updatedAt;

    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const getResultStyle = (result) => {
    if (result === "Passed") {
      return "bg-emerald-50 text-emerald-600";
    }

    if (result === "Failed") {
      return "bg-rose-50 text-rose-600";
    }

    return "bg-orange-50 text-orange-600";
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedRequest(null);
    setError("");
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
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

        <button
          onClick={loadData}
          disabled={loading}
          className="flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-600 shadow-sm hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw
            size={15}
            className={loading ? "animate-spin" : ""}
          />
          Refresh Records
        </button>
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
      {error && !showModal && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-600">
          <AlertCircle size={18} />
          {error}

          <button
            onClick={() => setError("")}
            className="ml-auto"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Inspections"
          value={totalInspections}
          icon={ShieldCheck}
          color="violet"
        />

        <StatCard
          title="Passed"
          value={passedCount}
          icon={CheckCircle2}
          color="green"
        />

        <StatCard
          title="Failed"
          value={failedCount}
          icon={AlertCircle}
          color="rose"
        />

        <StatCard
          title="Pending"
          value={pendingCount}
          icon={Clock3}
          color="orange"
        />
      </div>

      {/* Inspection Records */}
      <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">

        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center">
          <div>
            <h2 className="font-bold text-slate-800">
              Inspection Records
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Latest inspection results for completed repairs
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
          <table className="w-full min-w-[950px] text-left">
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
              {loading ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-14 text-center text-sm text-slate-400"
                  >
                    <RefreshCw
                      size={20}
                      className="mx-auto mb-3 animate-spin"
                    />
                    Loading inspection records...
                  </td>
                </tr>
              ) : (
                filteredInspections.map(
                  ({ request, qc, latestRepairLog }) => {
                    const result = qc?.result || "Pending";

                    const technician =
                      request.assignedTechnician?.name || "—";

                    const qcRepairLogId =
                      typeof qc?.repairLog === "object"
                        ? qc.repairLog?._id
                        : qc?.repairLog;

                    const latestRepairLogId =
                      latestRepairLog?._id;

                    const needsReinspection =
                      !!qc &&
                      !!latestRepairLogId &&
                      String(qcRepairLogId) !==
                        String(latestRepairLogId);

               const canInspect =
  isAdmin &&
  request.status === "Repair Completed" &&
  !!latestRepairLogId &&
  (!qc || needsReinspection);
                    return (
                      <tr
                        key={request._id}
                        className="hover:bg-slate-50/70"
                      >
                        <td className="px-6 py-4 text-xs font-bold text-violet-700">
                          {qc
                            ? `QC-${String(qc._id).slice(-6).toUpperCase()}`
                            : "Not submitted"}
                        </td>

                        <td className="px-6 py-4">
                          <p className="text-xs font-bold text-slate-700">
                            {request.customer?.name || "Unknown Customer"}
                          </p>

                          <p className="mt-1 text-[10px] text-slate-400">
                            {request.requestId || "—"}
                          </p>
                        </td>

                        <td className="px-6 py-4 text-xs text-slate-600">
                          {getEquipment(request)}
                        </td>

                        <td className="px-6 py-4 text-xs text-slate-600">
                          {technician}
                        </td>

                        <td className="px-6 py-4 text-xs text-slate-500">
                          {getDate({ request, qc })}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`rounded-full px-3 py-1.5 text-[10px] font-bold ${getResultStyle(result)}`}
                          >
                            {result}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          {canInspect ? (
                            <button
                              onClick={() => openNewInspection(request)}
                              className="flex items-center gap-2 rounded-lg bg-violet-600 px-3 py-2 text-xs font-bold text-white hover:bg-violet-700"
                            >
                              <Plus size={14} />
                              {qc ? "Re-Inspect" : "Inspect"}
                            </button>
                          ) : qc ? (
                            <button
                              onClick={() =>
                                setSelectedInspection({ request, qc })
                              }
                              className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-violet-600 hover:bg-violet-50"
                            >
                              <Eye size={15} />
                              View
                            </button>
                          ) : (
                            <span className="text-xs text-slate-400">
                              Awaiting repair log
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  }
                )
              )}

              {!loading && filteredInspections.length === 0 && (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-14 text-center"
                  >
                    <ClipboardCheck
                      size={30}
                      className="mx-auto mb-3 text-slate-300"
                    />

                    <p className="text-sm font-bold text-slate-600">
                      No inspection records found
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Requests appear here after their repair is completed.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Checklist Information */}
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5">
        <div className="flex items-start gap-3">
          <ClipboardCheck
            size={21}
            className="mt-0.5 text-emerald-600"
          />

          <div>
            <h3 className="text-sm font-bold text-slate-800">
              Quality assurance checklist
            </h3>

            <p className="mt-1 text-xs leading-6 text-slate-500">
              Verify the reported issue, test repaired components,
              inspect equipment safety and confirm that the repair
              is ready for customer handover.
            </p>
          </div>
        </div>
      </div>

      {/* New Inspection Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="my-auto w-full max-w-2xl rounded-2xl bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <h2 className="text-lg font-extrabold text-slate-800">
                  New Quality Inspection
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  {selectedRequest.requestId} · {selectedRequest.customer?.name}
                </p>
              </div>

              <button
                onClick={closeModal}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleSubmitQC}>
              <div className="max-h-[65vh] space-y-5 overflow-y-auto p-5">

                <div className="rounded-xl bg-violet-50 p-4">
                  <p className="text-xs font-bold text-violet-700">
                    EQUIPMENT
                  </p>

                  <p className="mt-1 text-sm font-bold text-slate-800">
                    {getEquipment(selectedRequest)}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {selectedRequest.reportedSymptom}
                  </p>
                </div>

                <div>
                  <h3 className="mb-3 text-sm font-bold text-slate-800">
                    Inspection Checklist
                  </h3>

                  <div className="space-y-3">
                    {checks.map((check, index) => (
                      <div
                        key={index}
                        className="rounded-xl border border-slate-100 p-4"
                      >
                        <p className="text-xs font-bold text-slate-700">
                          {index + 1}. {check.item}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              updateCheck(index, "passed", true)
                            }
                            className={`flex items-center gap-1 rounded-lg border px-4 py-2 text-xs font-bold transition-all ${
                              check.passed === true
                                ? "border-emerald-600 bg-emerald-600 text-white ring-2 ring-emerald-200"
                                : "border-slate-200 bg-white text-slate-500 hover:border-emerald-400 hover:bg-emerald-50"
                            }`}
                          >
                            <CheckCircle2 size={14} />
                            Pass
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              updateCheck(index, "passed", false)
                            }
                            className={`flex items-center gap-1 rounded-lg border px-4 py-2 text-xs font-bold transition-all ${
                              check.passed === false
                                ? "border-rose-600 bg-rose-600 text-white ring-2 ring-rose-200"
                                : "border-slate-200 bg-white text-slate-500 hover:border-rose-400 hover:bg-rose-50"
                            }`}
                          >
                            <AlertCircle size={14} />
                            Fail
                          </button>
                        </div>

                        <input
                          type="text"
                          value={check.remarks}
                          onChange={(e) =>
                            updateCheck(
                              index,
                              "remarks",
                              e.target.value
                            )
                          }
                          placeholder="Inspection remarks (optional)"
                          className="mt-3 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-violet-400"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold text-slate-700">
                    Overall Inspection Notes
                  </label>

                  <textarea
                    value={overallNotes}
                    onChange={(e) => setOverallNotes(e.target.value)}
                    rows="3"
                    placeholder="Write overall inspection observations..."
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-xs outline-none focus:border-violet-400"
                  />
                </div>

                <div
                  className={`rounded-xl p-4 ${
                    checks.every((check) => check.passed)
                      ? "bg-emerald-50"
                      : "bg-rose-50"
                  }`}
                >
                  <p className="text-xs font-bold text-slate-700">
                    Expected QC Result
                  </p>

                  <p
                    className={`mt-1 text-sm font-extrabold ${
                      checks.every((check) => check.passed)
                        ? "text-emerald-600"
                        : "text-rose-600"
                    }`}
                  >
                    {checks.every((check) => check.passed)
                      ? "Passed"
                      : "Failed"}
                  </p>

                  <p className="mt-1 text-[10px] text-slate-500">
                    Result is calculated automatically by the backend.
                  </p>
                </div>

                {error && (
                  <div className="rounded-xl bg-rose-50 p-3 text-xs text-rose-600">
                    {error}
                  </div>
                )}
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 p-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-xs font-bold text-white hover:bg-violet-700 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <RefreshCw size={15} className="animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={15} />
                      Submit QC Inspection
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Inspection Details */}
      {selectedInspection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="my-auto w-full max-w-xl rounded-2xl bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <h2 className="text-lg font-extrabold text-slate-800">
                  Inspection Details
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  {selectedInspection.request.requestId}
                </p>
              </div>

              <button
                onClick={() => setSelectedInspection(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={19} />
              </button>
            </div>

            <div className="max-h-[65vh] space-y-5 overflow-y-auto p-5">

              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                <div>
                  <p className="text-xs text-slate-500">
                    Inspection Result
                  </p>

                  <span
                    className={`mt-2 inline-block rounded-full px-3 py-1.5 text-xs font-bold ${getResultStyle(selectedInspection.qc.result)}`}
                  >
                    {selectedInspection.qc.result}
                  </span>
                </div>

                <ShieldCheck
                  size={30}
                  className="text-violet-500"
                />
              </div>

              <div>
                <h3 className="mb-3 text-sm font-bold text-slate-800">
                  Checklist Results
                </h3>

                <div className="space-y-3">
                  {selectedInspection.qc.checks?.map((check, index) => (
                    <div
                      key={index}
                      className="flex items-start justify-between gap-3 rounded-xl border border-slate-100 p-3"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-700">
                          {check.item}
                        </p>

                        {check.remarks && (
                          <p className="mt-1 text-xs text-slate-400">
                            {check.remarks}
                          </p>
                        )}
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-bold ${
                          check.passed
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-rose-50 text-rose-600"
                        }`}
                      >
                        {check.passed ? "Pass" : "Fail"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-700">
                  Overall Notes
                </h3>

                <p className="mt-2 rounded-xl bg-slate-50 p-4 text-xs leading-6 text-slate-600">
                  {selectedInspection.qc.overallNotes || "No additional notes."}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-100 p-3">
                  <p className="text-[10px] text-slate-400">
                    Reviewed By
                  </p>

                  <p className="mt-1 text-xs font-bold text-slate-700">
                    {selectedInspection.qc.reviewer?.name || "Admin"}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-100 p-3">
                  <p className="text-[10px] text-slate-400">
                    Review Date
                  </p>

                  <p className="mt-1 text-xs font-bold text-slate-700">
                    {getDate(selectedInspection)}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 p-5">
              <button
                onClick={() => setSelectedInspection(null)}
                className="w-full rounded-xl bg-slate-900 py-3 text-xs font-bold text-white hover:bg-slate-800"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
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

export default QualityControl;
