
import { useEffect, useMemo, useState } from "react";
import {
  Stethoscope,
  Search,
  ClipboardCheck,
  Clock3,
  CheckCircle2,
  AlertCircle,
  FileText,
  MoreHorizontal,
  Plus,
  X,
  Upload,
  Save,
  Pencil,
  Eye,
  Loader2,
  Trash2
} from "lucide-react";
import API from "../services/api";

const initialForm = {
  problemFound: "",
  rootCause: "",
  diagnosisNotes: "",
  recommendedSolution: "",
  estimatedRepairTime: "",
  partsRequired: [{ name: "", quantity: 1 }]
};

function Diagnosis() {
  const [requests, setRequests] = useState([]);
  const [diagnoses, setDiagnoses] = useState({});
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [evidenceFile, setEvidenceFile] = useState(null);

  const [openMenuId, setOpenMenuId] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/requests");
      const requestList = response.data.requests || [];

      setRequests(requestList);

      const eligibleRequests = requestList.filter((request) =>
       [
  "Open",
  "In Diagnosis",
  "Diagnosis Completed",
  "Repair In Progress",
  "Repair Completed",
  "QC Passed",
  "QC Failed",
  "Ready for Handover",
  "Completed"
].includes(request.status)
      );

      const results = await Promise.all(
        eligibleRequests.map(async (request) => {
          try {
            const result = await API.get(
              `/diagnosis/request/${request._id}`
            );

            return [request._id, result.data.diagnosis];
          } catch (err) {
            if (err.response?.status === 404) {
              return [request._id, null];
            }

            throw err;
          }
        })
      );

      const diagnosisMap = {};
      results.forEach(([requestId, diagnosis]) => {
        diagnosisMap[requestId] = diagnosis;
      });

      setDiagnoses(diagnosisMap);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load diagnosis records. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const records = useMemo(() => {
    return requests
      .filter((request) =>
        [
  "Open",
  "In Diagnosis",
  "Diagnosis Completed",
  "Repair In Progress",
  "Repair Completed",
  "QC Passed",
  "QC Failed",
  "Ready for Handover",
  "Completed"
].includes(request.status)
      )
      .map((request) => {
        const diagnosis = diagnoses[request._id] || null;

        return {
          ...request,
          diagnosis,
          customerName:
            request.customer?.name || "Unknown Customer",
          assetName: [
            request.asset?.brand,
            request.asset?.model || request.asset?.category
          ].filter(Boolean).join(" ") || "Unknown Equipment",
          issue: request.reportedSymptom || "No issue description",
          technicianName:
            diagnosis?.technician?.name || "Not available",
          date: request.createdAt
            ? new Date(request.createdAt).toLocaleDateString("en-IN")
            : "—"
        };
      });
  }, [requests, diagnoses]);

  const filteredRecords = records.filter((record) => {
    const searchText = [
      record.requestId,
      record.customerName,
      record.assetName,
      record.issue,
      record.technicianName
    ].join(" ").toLowerCase();

    const matchesSearch = searchText.includes(search.toLowerCase());
    const matchesFilter =
      filter === "All" || record.status === filter;

    return matchesSearch && matchesFilter;
  });

  const totalDiagnoses = records.filter((r) => r.diagnosis).length;
  const pendingDiagnoses = records.filter(
    (r) => !r.diagnosis && r.status !== "Diagnosis Completed"
  ).length;
  const completedDiagnoses = records.filter(
    (r) => r.status === "Diagnosis Completed"
  ).length;

  const openNewDiagnosis = (request = null) => {
    setSelectedRequest(request);
    setForm(initialForm);
    setEvidenceFile(null);
    setMessage("");
    setError("");
    setShowForm(true);
    setOpenMenuId(null);
  };

  const openEditDiagnosis = (request) => {
    const diagnosis = request.diagnosis;

    setSelectedRequest(request);
    setForm({
      problemFound: diagnosis?.problemFound || "",
      rootCause: diagnosis?.rootCause || "",
      diagnosisNotes: diagnosis?.diagnosisNotes || "",
      recommendedSolution: diagnosis?.recommendedSolution || "",
      estimatedRepairTime: diagnosis?.estimatedRepairTime || "",
      partsRequired:
        diagnosis?.partsRequired?.length
          ? diagnosis.partsRequired.map((part) => ({
              name: part.name || "",
              quantity: part.quantity || 1
            }))
          : [{ name: "", quantity: 1 }]
    });

    setEvidenceFile(null);
    setMessage("");
    setError("");
    setShowForm(true);
    setOpenMenuId(null);
  };

  const updateForm = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value
    }));
  };

  const updatePart = (index, field, value) => {
    setForm((previous) => ({
      ...previous,
      partsRequired: previous.partsRequired.map((part, i) =>
        i === index ? { ...part, [field]: value } : part
      )
    }));
  };

  const addPart = () => {
    setForm((previous) => ({
      ...previous,
      partsRequired: [
        ...previous.partsRequired,
        { name: "", quantity: 1 }
      ]
    }));
  };

  const removePart = (index) => {
    setForm((previous) => ({
      ...previous,
      partsRequired: previous.partsRequired.filter(
        (_, i) => i !== index
      )
    }));
  };

 const uploadEvidence = async (requestId, file) => {
  const formData = new FormData();
  formData.append("evidence", file);

  await API.post(
    `/diagnosis/request/${requestId}/evidence`,
    formData,
    {
      headers: {
        "Content-Type": undefined
      }
    }
  );
};

  const handleSave = async (event) => {
    event.preventDefault();

    if (!selectedRequest) {
      setError("Please select a service request.");
      return;
    }

    if (!form.problemFound.trim()) {
      setError("Please enter the problem found.");
      return;
    }

    const payload = {
      problemFound: form.problemFound.trim(),
      rootCause: form.rootCause,
      diagnosisNotes: form.diagnosisNotes,
      recommendedSolution: form.recommendedSolution,
      estimatedRepairTime: form.estimatedRepairTime,
      partsRequired: form.partsRequired
        .filter((part) => part.name.trim())
        .map((part) => ({
          name: part.name.trim(),
          quantity: Math.max(1, Number(part.quantity) || 1)
        }))
    };

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const existingDiagnosis = selectedRequest.diagnosis;

      let savedDiagnosis;

      if (existingDiagnosis) {
        const response = await API.put(
          `/diagnosis/${existingDiagnosis._id}`,
          payload
        );
        savedDiagnosis = response.data.diagnosis;
      } else {
        const response = await API.post("/diagnosis", {
          ...payload,
          serviceRequest: selectedRequest._id
        });
        savedDiagnosis = response.data.diagnosis;
      }

      if (evidenceFile) {
        try {
          setUploading(true);
          await uploadEvidence(selectedRequest._id, evidenceFile);
        } catch (uploadError) {
          setError(
            uploadError.response?.data?.message ||
            "Diagnosis saved, but evidence upload failed. You can upload it again later."
          );
          await loadData();
          setSaving(false);
          setUploading(false);
          return;
        }
      }

      setMessage("Diagnosis saved successfully!");
      setShowForm(false);
      setSelectedRequest(null);
      setEvidenceFile(null);

      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to save diagnosis. Please try again."
      );
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  const handleCompleteDiagnosis = async (request) => {
    const diagnosis = request.diagnosis;

    if (!diagnosis) {
      setError("Please save diagnosis details first.");
      setOpenMenuId(null);
      return;
    }

    const confirmed = window.confirm(
      `Mark ${request.requestId} as Diagnosis Completed?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setMessage("");

      await API.patch(`/requests/${request._id}/status`, {
        status: "Diagnosis Completed"
      });

      setMessage("Diagnosis marked as completed successfully.");
      setOpenMenuId(null);
      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to update request status."
      );
    }
  };

  const openDiagnosisDetails = (request) => {
    setSelectedRequest(request);
    setShowDetails(true);
    setOpenMenuId(null);
  };

  const getStatusStyle = (status) => {
    if (status === "Diagnosis Completed") {
      return "bg-emerald-50 text-emerald-600";
    }

    if (status === "In Diagnosis") {
      return "bg-orange-50 text-orange-600";
    }

    return "bg-blue-50 text-blue-600";
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-semibold text-slate-400">
            OPERATIONS / DIAGNOSIS
          </p>
          <h1 className="mt-2 text-2xl font-extrabold text-slate-800">
            Diagnosis Center
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Inspect equipment, record faults and recommend repairs.
          </p>
        </div>

        <button
          onClick={() => openNewDiagnosis()}
          className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-violet-200 hover:bg-violet-700"
        >
          <Plus size={18} />
          New Diagnosis
        </button>
      </div>

      {error && !showForm && (
        <div className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {message && !showForm && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-700">
          <CheckCircle2 size={18} />
          {message}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Total Diagnoses"
          value={totalDiagnoses}
          icon={ClipboardCheck}
          color="violet"
        />
        <StatCard
          title="Pending Diagnosis"
          value={pendingDiagnoses}
          icon={Clock3}
          color="orange"
        />
        <StatCard
          title="Completed"
          value={completedDiagnoses}
          icon={CheckCircle2}
          color="green"
        />
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center">
          <div>
            <h2 className="font-bold text-slate-800">
              Diagnosis Records
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Live service requests and saved diagnosis records
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 sm:w-64">
              <Search size={17} className="text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search diagnosis..."
                className="w-full bg-transparent text-xs outline-none"
              />
            </div>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-600 outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Diagnosis">In Diagnosis</option>
              <option value="Diagnosis Completed">
                Diagnosis Completed
              </option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">
            <thead className="bg-slate-50">
              <tr className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <th className="px-6 py-4">Request</th>
                <th className="px-6 py-4">Equipment / Issue</th>
                <th className="px-6 py-4">Technician</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <Loader2 className="mx-auto animate-spin text-violet-600" />
                    <p className="mt-2 text-sm text-slate-400">
                      Loading diagnosis records...
                    </p>
                  </td>
                </tr>
              ) : filteredRecords.map((record) => (
                <tr key={record._id} className="hover:bg-slate-50/70">
                  <td className="px-6 py-4">
                    <p className="text-xs font-bold text-violet-700">
                      {record.requestId}
                    </p>
                    <p className="mt-1 text-[10px] text-slate-400">
                      {record.customerName}
                    </p>
                  </td>

                  <td className="px-6 py-4">
                    <p className="text-xs font-bold text-slate-700">
                      {record.assetName}
                    </p>
                    <p className="mt-1 max-w-xs text-[10px] text-slate-400">
                      {record.issue}
                    </p>
                  </td>

                  <td className="px-6 py-4 text-xs text-slate-600">
                    {record.technicianName}
                  </td>

                  <td className="px-6 py-4 text-xs text-slate-500">
                    {record.date}
                  </td>

                  <td className="px-6 py-4">
                    <span className={`rounded-full px-3 py-1.5 text-[10px] font-bold ${getStatusStyle(record.status)}`}>
                      {record.status}
                    </span>
                    <p className="mt-1 text-[10px] text-slate-400">
                      {record.diagnosis ? "Diagnosis saved" : "Not started"}
                    </p>
                  </td>

                  <td className="relative px-6 py-4">
                    <button
                      onClick={() =>
                        setOpenMenuId(
                          openMenuId === record._id ? null : record._id
                        )
                      }
                      aria-label={`More actions for ${record.requestId}`}
                      className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-violet-600"
                    >
                      <MoreHorizontal size={19} />
                    </button>

                    {openMenuId === record._id && (
                      <div className="absolute right-8 top-12 z-20 w-52 rounded-xl border border-slate-100 bg-white p-2 shadow-xl">
                        <button
                          onClick={() => openDiagnosisDetails(record)}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs font-medium text-slate-600 hover:bg-violet-50 hover:text-violet-700"
                        >
                          <Eye size={15} />
                          View Details
                        </button>

                        <button
                          onClick={() => openEditDiagnosis(record)}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs font-medium text-slate-600 hover:bg-violet-50 hover:text-violet-700"
                        >
                          {record.diagnosis ? (
                            <>
                              <Pencil size={15} />
                              Edit Diagnosis
                            </>
                          ) : (
                            <>
                              <Plus size={15} />
                              Add Diagnosis
                            </>
                          )}
                        </button>

                        {record.diagnosis &&
                          record.status === "In Diagnosis" && (
                            <button
                              onClick={() => handleCompleteDiagnosis(record)}
                              className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs font-medium text-emerald-600 hover:bg-emerald-50"
                            >
                              <CheckCircle2 size={15} />
                              Mark Completed
                            </button>
                          )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}

              {!loading && filteredRecords.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-sm text-slate-400">
                    No diagnosis records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="rounded-2xl border border-violet-100 bg-violet-50/60 p-5">
        <div className="flex items-start gap-3">
          <FileText size={20} className="mt-0.5 text-violet-600" />
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              Diagnosis workflow
            </h3>
            <p className="mt-1 text-xs leading-6 text-slate-500">
              Review the reported issue, identify the root cause, document inspection notes,
              add supporting evidence and recommend a repair solution.
            </p>
          </div>
        </div>
      </div>

      {/* CREATE / EDIT DIAGNOSIS MODAL */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/40 p-4">
          <div className="my-6 w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <h2 className="text-lg font-extrabold text-slate-800">
                  {selectedRequest?.diagnosis
                    ? "Edit Diagnosis"
                    : "New Diagnosis"}
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  Request: {selectedRequest?.requestId}
                </p>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 p-5">
              {error && (
                <div className="rounded-xl bg-red-50 p-3 text-xs text-red-600">
                  {error}
                </div>
              )}

              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs font-bold text-slate-700">
                  {selectedRequest?.customerName}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {selectedRequest?.assetName} · {selectedRequest?.issue}
                </p>
              </div>

              <FormField label="Problem Found *">
                <textarea
                  required
                  rows="2"
                  value={form.problemFound}
                  onChange={(e) => updateForm("problemFound", e.target.value)}
                  placeholder="Describe the fault identified during inspection..."
                  className="form-input"
                />
              </FormField>

              <FormField label="Root Cause">
                <textarea
                  rows="2"
                  value={form.rootCause}
                  onChange={(e) => updateForm("rootCause", e.target.value)}
                  placeholder="What caused this issue?"
                  className="form-input"
                />
              </FormField>

              <FormField label="Diagnosis Notes">
                <textarea
                  rows="3"
                  value={form.diagnosisNotes}
                  onChange={(e) => updateForm("diagnosisNotes", e.target.value)}
                  placeholder="Enter inspection and testing observations..."
                  className="form-input"
                />
              </FormField>

              <FormField label="Recommended Solution">
                <textarea
                  rows="2"
                  value={form.recommendedSolution}
                  onChange={(e) => updateForm("recommendedSolution", e.target.value)}
                  placeholder="Recommended repair or replacement..."
                  className="form-input"
                />
              </FormField>

              <FormField label="Estimated Repair Time">
                <input
                  value={form.estimatedRepairTime}
                  onChange={(e) => updateForm("estimatedRepairTime", e.target.value)}
                  placeholder="Example: 2-3 hours"
                  className="form-input"
                />
              </FormField>

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">
                    Parts Required
                  </label>
                  <button
                    type="button"
                    onClick={addPart}
                    className="flex items-center gap-1 text-xs font-bold text-violet-600 hover:text-violet-700"
                  >
                    <Plus size={14} />
                    Add Part
                  </button>
                </div>

                <div className="space-y-2">
                  {form.partsRequired.map((part, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        value={part.name}
                        onChange={(e) =>
                          updatePart(index, "name", e.target.value)
                        }
                        placeholder="Part name"
                        className="form-input flex-1"
                      />
                      <input
                        type="number"
                        min="1"
                        value={part.quantity}
                        onChange={(e) =>
                          updatePart(index, "quantity", e.target.value)
                        }
                        className="form-input w-20"
                        aria-label="Part quantity"
                      />
                      {form.partsRequired.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePart(index)}
                          className="rounded-lg p-2 text-red-400 hover:bg-red-50"
                          aria-label="Remove part"
                        >
                          <Trash2 size={17} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <FormField label="Evidence Attachment (Image / PDF)">
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-violet-200 bg-violet-50/50 p-4 hover:bg-violet-50">
                  <Upload className="text-violet-600" size={20} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-700">
                      {evidenceFile?.name || "Choose evidence file"}
                    </p>
                    <p className="mt-1 text-[10px] text-slate-400">
                      JPEG, PNG, WebP or PDF · Maximum 5 MB
                    </p>
                  </div>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.pdf"
                    className="hidden"
                    onChange={(e) =>
                      setEvidenceFile(e.target.files?.[0] || null)
                    }
                  />
                </label>
              </FormField>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-xs font-bold text-white hover:bg-violet-700 disabled:opacity-60"
                >
                  {saving || uploading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  {uploading
                    ? "Uploading Evidence..."
                    : saving
                      ? "Saving..."
                      : "Save Diagnosis"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DIAGNOSIS DETAILS MODAL */}
      {showDetails && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/40 p-4">
          <div className="my-6 w-full max-w-xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <h2 className="text-lg font-extrabold text-slate-800">
                  Diagnosis Details
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  {selectedRequest.requestId}
                </p>
              </div>
              <button
                onClick={() => setShowDetails(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <Detail label="Customer" value={selectedRequest.customerName} />
              <Detail label="Equipment" value={selectedRequest.assetName} />
              <Detail label="Reported Issue" value={selectedRequest.issue} />
              <Detail
                label="Request Status"
                value={selectedRequest.status}
              />

              {selectedRequest.diagnosis ? (
                <>
                  <Detail
                    label="Problem Found"
                    value={selectedRequest.diagnosis.problemFound}
                  />
                  <Detail
                    label="Root Cause"
                    value={selectedRequest.diagnosis.rootCause}
                  />
                  <Detail
                    label="Diagnosis Notes"
                    value={selectedRequest.diagnosis.diagnosisNotes}
                  />
                  <Detail
                    label="Recommended Solution"
                    value={selectedRequest.diagnosis.recommendedSolution}
                  />
                  <Detail
                    label="Estimated Repair Time"
                    value={selectedRequest.diagnosis.estimatedRepairTime}
                  />

                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-400">
                      Parts Required
                    </p>
                    {selectedRequest.diagnosis.partsRequired?.length ? (
                      <div className="mt-2 space-y-1">
                        {selectedRequest.diagnosis.partsRequired.map((part, i) => (
                          <p key={i} className="text-xs text-slate-600">
                            {part.name} — Qty: {part.quantity}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-1 text-xs text-slate-400">
                        No parts recorded.
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase text-slate-400">
                      Evidence Files
                    </p>
                    {selectedRequest.diagnosis.evidence?.length ? (
                      <div className="mt-2 space-y-2">
                        {selectedRequest.diagnosis.evidence.map((file, i) => (
                          <div key={i} className="flex items-center gap-2 rounded-lg bg-slate-50 p-3">
                            <FileText size={16} className="text-violet-600" />
                            <span className="text-xs text-slate-600">
                              {file.fileName}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-1 text-xs text-slate-400">
                        No evidence uploaded.
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <p className="rounded-xl bg-orange-50 p-4 text-xs text-orange-700">
                  No diagnosis has been saved for this request yet.
                </p>
              )}
            </div>

            <div className="border-t border-slate-100 p-5 text-right">
              <button
                onClick={() => setShowDetails(false)}
                className="rounded-xl bg-violet-600 px-5 py-3 text-xs font-bold text-white hover:bg-violet-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-bold text-slate-700">
        {label}
      </label>
      {children}
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase text-slate-400">
        {label}
      </p>
      <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
        {value || "—"}
      </p>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }) {
  const styles = {
    violet: "bg-violet-50 text-violet-600",
    orange: "bg-orange-50 text-orange-600",
    green: "bg-emerald-50 text-emerald-600"
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

export default Diagnosis;
