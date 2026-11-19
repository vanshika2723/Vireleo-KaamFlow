
import { useEffect, useState } from "react";
import {
  Wrench,
  Search,
  Plus,
  Clock3,
  ClipboardList,
  X,
  RefreshCw,
  CheckCircle2,
  Package,
  Eye
} from "lucide-react";
import API from "../services/api";

function RepairLogs() {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [repairLogs, setRepairLogs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    workPerformed: "",
    timeSpent: "",
    technicianNotes: "",
    partsUsed: []
  });

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/requests");
      const data = response.data.requests || [];

      setRequests(data.filter((request) =>
        ["Diagnosis Completed", "Repair In Progress", "Repair Completed"].includes(request.status)
      ));
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load service requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRepairLogs = async (request) => {
    try {
      const response = await API.get(`/repair-logs/${request._id}`);
      setRepairLogs(response.data.repairLogs || []);
    } catch (err) {
      setRepairLogs([]);
      setError(err.response?.data?.message || "Unable to load repair logs.");
    }
  };

  const openCreateModal = (request) => {
    setSelectedRequest(request);
    setForm({
      workPerformed: "",
      timeSpent: "",
      technicianNotes: "",
      partsUsed: []
    });
    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const addPart = () => {
    setForm((previous) => ({
      ...previous,
      partsUsed: [
        ...previous.partsUsed,
        { name: "", quantity: 1, unitCost: 0 }
      ]
    }));
  };

  const updatePart = (index, field, value) => {
    setForm((previous) => ({
      ...previous,
      partsUsed: previous.partsUsed.map((part, i) =>
        i === index ? { ...part, [field]: value } : part
      )
    }));
  };

  const removePart = (index) => {
    setForm((previous) => ({
      ...previous,
      partsUsed: previous.partsUsed.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedRequest) return;

    if (!form.workPerformed.trim()) {
      setError("Please enter the work performed.");
      return;
    }

    const invalidPart = form.partsUsed.some((part) =>
      !part.name.trim() ||
      !Number.isInteger(Number(part.quantity)) ||
      Number(part.quantity) < 1 ||
      !Number.isFinite(Number(part.unitCost)) ||
      Number(part.unitCost) < 0
    );

    if (invalidPart) {
      setError("Please enter valid parts information.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        workPerformed: form.workPerformed.trim(),
        timeSpent: Number(form.timeSpent || 0),
        technicianNotes: form.technicianNotes,
        partsUsed: form.partsUsed.map((part) => ({
          name: part.name.trim(),
          quantity: Number(part.quantity),
          unitCost: Number(part.unitCost)
        }))
      };

      const response = await API.post(
        `/repair-logs/${selectedRequest._id}`,
        payload
      );

      setSuccess(response.data.message || "Repair log created successfully!");
      setShowModal(false);
      await loadRequests();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save repair log.");
    } finally {
      setSaving(false);
    }
  };

  const openDetails = async (request) => {
    setSelectedRequest(request);
    setRepairLogs([]);
    setError("");
    setShowDetails(true);
    await loadRepairLogs(request);
  };

  const filteredRequests = requests.filter((request) => {
    const searchText = search.toLowerCase();

    return (
      request.requestId?.toLowerCase().includes(searchText) ||
      request.customer?.name?.toLowerCase().includes(searchText) ||
      request.asset?.brand?.toLowerCase().includes(searchText) ||
      request.asset?.model?.toLowerCase().includes(searchText)
    );
  });

  const totalLogs = requests.reduce(
    (total, request) => total + (request.repairLogCount || 0),
    0
  );

  return (
    <div className="p-5 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
            Repair Operations
          </p>
          <h1 className="text-2xl font-extrabold text-slate-800 mt-1">
            Repair Logs
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Record repair activities, parts used and technician work hours.
          </p>
        </div>

        <button
          onClick={loadRequests}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 text-sm font-semibold hover:bg-slate-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {success && (
        <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-sm">
          {success}
        </div>
      )}

      {error && (
        <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <div className="flex justify-between">
            <p className="text-sm text-slate-500">Eligible Requests</p>
            <ClipboardList className="text-violet-500" size={20} />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800 mt-3">
            {requests.length}
          </h2>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <div className="flex justify-between">
            <p className="text-sm text-slate-500">Repair In Progress</p>
            <Wrench className="text-blue-500" size={20} />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800 mt-3">
            {requests.filter((r) => r.status === "Repair In Progress").length}
          </h2>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <div className="flex justify-between">
            <p className="text-sm text-slate-500">Completed Repairs</p>
            <CheckCircle2 className="text-emerald-500" size={20} />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800 mt-3">
            {requests.filter((r) => r.status === "Repair Completed").length}
          </h2>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="font-bold text-slate-800">Service Requests</h2>
            <p className="text-xs text-slate-500 mt-1">
              Requests available for repair logging
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search requests..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-violet-400"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[850px]">
            <thead className="bg-slate-50 text-xs text-slate-500 uppercase">
              <tr>
                <th className="px-5 py-4">Request</th>
                <th className="px-5 py-4">Customer / Asset</th>
                <th className="px-5 py-4">Issue</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Technician</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-400">
                    Loading requests...
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-400">
                    No eligible service requests found.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((request) => (
                  <tr key={request._id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-4">
                      <p className="font-bold text-sm text-violet-600">
                        {request.requestId}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-slate-700">
                        {request.customer?.name || "Unknown"}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {request.asset?.brand} {request.asset?.model}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600 max-w-xs">
                      {request.reportedSymptom}
                    </td>

                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold">
                        {request.status}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {request.assignedTechnician?.name || "Not assigned"}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openDetails(request)}
                          className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
                          title="View repair logs"
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          onClick={() => openCreateModal(request)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-violet-600 text-white text-xs font-semibold hover:bg-violet-700"
                        >
                          <Plus size={15} />
                          Add Log
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && selectedRequest && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="font-bold text-lg text-slate-800">Create Repair Log</h2>
                <p className="text-xs text-slate-500 mt-1">
                  {selectedRequest.requestId} · {selectedRequest.customer?.name}
                </p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Work Performed *
                </label>
                <textarea
                  required
                  rows="4"
                  value={form.workPerformed}
                  onChange={(e) => setForm({ ...form, workPerformed: e.target.value })}
                  placeholder="Describe the repair work performed..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-violet-400"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-slate-700">
                    Parts Used
                  </label>
                  <button type="button" onClick={addPart} className="text-xs font-bold text-violet-600 flex items-center gap-1">
                    <Plus size={14} /> Add Part
                  </button>
                </div>

                {form.partsUsed.map((part, index) => (
                  <div key={index} className="grid grid-cols-1 sm:grid-cols-4 gap-2 mb-3 p-3 rounded-xl bg-slate-50">
                    <input
                      placeholder="Part name"
                      value={part.name}
                      onChange={(e) => updatePart(index, "name", e.target.value)}
                      className="sm:col-span-2 p-2.5 rounded-lg border border-slate-200 text-sm"
                    />
                    <input
                      type="number"
                      min="1"
                      placeholder="Quantity"
                      value={part.quantity}
                      onChange={(e) => updatePart(index, "quantity", e.target.value)}
                      className="p-2.5 rounded-lg border border-slate-200 text-sm"
                    />
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="0"
                        placeholder="Unit cost"
                        value={part.unitCost}
                        onChange={(e) => updatePart(index, "unitCost", e.target.value)}
                        className="w-full min-w-0 p-2.5 rounded-lg border border-slate-200 text-sm"
                      />
                      <button type="button" onClick={() => removePart(index)} className="text-red-500 px-2">
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Time Spent (Hours)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.25"
                    value={form.timeSpent}
                    onChange={(e) => setForm({ ...form, timeSpent: e.target.value })}
                    placeholder="e.g. 2.5"
                    className="w-full p-3 rounded-xl border border-slate-200 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Technician Notes
                  </label>
                  <input
                    value={form.technicianNotes}
                    onChange={(e) => setForm({ ...form, technicianNotes: e.target.value })}
                    placeholder="Optional notes"
                    className="w-full p-3 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                  {error}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600">
                  Cancel
                </button>
                <button disabled={saving} type="submit" className="px-5 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-bold disabled:opacity-60">
                  {saving ? "Saving..." : "Save Repair Log"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetails && selectedRequest && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="font-bold text-lg text-slate-800">Repair History</h2>
                <p className="text-xs text-slate-500 mt-1">{selectedRequest.requestId}</p>
              </div>
              <button onClick={() => setShowDetails(false)} className="p-2 rounded-lg hover:bg-slate-100">
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {repairLogs.length === 0 ? (
                <p className="text-center text-sm text-slate-400 py-8">
                  No repair logs found for this request.
                </p>
              ) : (
                repairLogs.map((log) => (
                  <div key={log._id} className="border border-slate-100 rounded-xl p-4">
                    <div className="flex justify-between gap-3">
                      <h3 className="font-bold text-sm text-slate-800">
                        {log.technician?.name || "Technician"}
                      </h3>
                      <span className="text-xs text-slate-400">
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mt-3 whitespace-pre-wrap">
                      {log.workPerformed}
                    </p>
                    <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock3 size={14} /> {log.timeSpent || 0} hours
                      </span>
                      <span className="flex items-center gap-1">
                        <Package size={14} /> {log.partsUsed?.length || 0} parts
                      </span>
                    </div>
                    {log.partsUsed?.length > 0 && (
                      <div className="mt-3 space-y-1">
                        {log.partsUsed.map((part, index) => (
                          <p key={index} className="text-xs text-slate-500">
                            {part.name} · Qty {part.quantity} · ₹{part.unitCost}
                          </p>
                        ))}
                      </div>
                    )}
                    {log.technicianNotes && (
                      <p className="text-xs text-slate-500 mt-3 bg-slate-50 p-3 rounded-lg">
                        Notes: {log.technicianNotes}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RepairLogs;
