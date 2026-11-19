
import { useEffect, useState } from "react";
import {
  ClipboardList,
  Search,
  Plus,
  Clock3,
  CheckCircle2,
  AlertCircle,
  MoreHorizontal,
  X,
  RefreshCw,
  UserCheck,
  Receipt
} from "lucide-react";
import API from "../services/api";

const statuses = [
  "Needs Review",
  "Accepted",
  "Needs More Information",
  "Out of Coverage",
  "Declined",
  "Open",
  "In Diagnosis",
  "Diagnosis Completed",
  "Repair In Progress",
  "Repair Completed",
  "QC Passed",
  "QC Failed",
  "Ready for Handover",
  "Completed"
];

const statusTransitions = {
  "Needs Review": [
    "Accepted",
    "Needs More Information",
    "Out of Coverage",
    "Declined"
  ],
  "Accepted": ["Open"],
  "Open": ["In Diagnosis"],
  "In Diagnosis": ["Diagnosis Completed"],
  "Diagnosis Completed": ["Repair In Progress"],
  "Repair In Progress": ["Repair Completed"],
  "Repair Completed": ["QC Passed", "QC Failed"],
  "QC Failed": ["Repair In Progress"],
  "QC Passed": ["Ready for Handover"],
  "Ready for Handover": ["Completed"]
};

function Requests() {
  const [requests, setRequests] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [assets, setAssets] = useState([]);
  const [technicians, setTechnicians] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedTechnician, setSelectedTechnician] = useState("");
const [generatingInvoice, setGeneratingInvoice] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [newStatus, setNewStatus] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [assigning, setAssigning] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    customer: "",
    asset: "",
    reportedSymptom: "",
    priority: "Normal",
    preferredDate: "",
    serviceAddress: ""
  });

  // LOAD REQUESTS, CUSTOMERS AND ASSETS
  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [requestRes, customerRes, assetRes] = await Promise.all([
        API.get("/requests"),
        API.get("/customers"),
        API.get("/assets")
      ]);

      setRequests(requestRes.data.requests || []);
      setCustomers(customerRes.data.customers || []);
      setAssets(assetRes.data.assets || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load service requests. Please check your connection."
      );
    } finally {
      setLoading(false);
    }
  };

  // LOAD ACTIVE TECHNICIANS
  const loadTechnicians = async () => {
    try {
      const response = await API.get("/users/technicians");
      setTechnicians(response.data.technicians || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load technicians."
      );
    }
  };

  useEffect(() => {
    loadData();
    loadTechnicians();
  }, []);

  const filteredAssets = assets.filter(
    (asset) =>
      asset.customer?._id === formData.customer ||
      asset.customer === formData.customer
  );

  const handleCustomerChange = (value) => {
    setFormData({
      ...formData,
      customer: value,
      asset: ""
    });
  };

  // CREATE REQUEST
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.customer ||
      !formData.asset ||
      !formData.reportedSymptom.trim()
    ) {
      setError("Please fill all required fields.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        ...formData,
        preferredDate: formData.preferredDate || null
      };

      const response = await API.post("/requests", payload);

      setSuccess(
        response.data.message ||
        "Service request created successfully!"
      );

      setFormData({
        customer: "",
        asset: "",
        reportedSymptom: "",
        priority: "Normal",
        preferredDate: "",
        serviceAddress: ""
      });

      setShowForm(false);
      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to create service request."
      );
    } finally {
      setSaving(false);
    }
  };

  // UPDATE REQUEST STATUS
  const handleStatusUpdate = async () => {
    if (!selectedRequest || !newStatus) return;

    try {
      setUpdatingStatus(true);
      setError("");
      setSuccess("");

      const response = await API.patch(
        `/requests/${selectedRequest._id}/status`,
        { status: newStatus }
      );

      setSuccess(
        response.data.message ||
        "Request status updated successfully!"
      );

      setShowStatusModal(false);
      setSelectedRequest(null);
      setNewStatus("");

      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to update request status."
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  // OPEN ASSIGNMENT MODAL
  const openAssignModal = (request) => {
    setSelectedRequest(request);
    setSelectedTechnician("");
    setError("");
    setSuccess("");
    setShowAssignModal(true);
    setOpenMenuId(null);
  };

  // ASSIGN TECHNICIAN
  const handleAssignTechnician = async () => {
    if (!selectedRequest || !selectedTechnician) {
      setError("Please select a technician.");
      return;
    }

    try {
      setAssigning(true);
      setError("");
      setSuccess("");

      const response = await API.patch(
        `/requests/${selectedRequest._id}/assign`,
        {
          technicianId: selectedTechnician
        }
      );

      setSuccess(
        response.data.message ||
        "Technician assigned successfully!"
      );

      setShowAssignModal(false);
      setSelectedRequest(null);
      setSelectedTechnician("");

      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to assign technician."
      );
    } finally {
      setAssigning(false);
    }
  };
const handleGenerateInvoice = async (request) => {
  try {
    setGeneratingInvoice(true);
    setError("");
    setSuccess("");

    const response = await API.post(
      `/invoices/${request._id}`,
      {}
    );

    setSuccess(
      response.data.message || "Invoice generated successfully!"
    );

    setOpenMenuId(null);
  } catch (err) {
    setError(
      err.response?.data?.message ||
      "Unable to generate invoice."
    );
  } finally {
    setGeneratingInvoice(false);
  }
};
  const closeDetails = () => {
    setShowDetails(false);
    setSelectedRequest(null);
  };

  const closeStatusModal = () => {
    setShowStatusModal(false);
    setSelectedRequest(null);
    setNewStatus("");
  };

  const closeAssignModal = () => {
    setShowAssignModal(false);
    setSelectedRequest(null);
    setSelectedTechnician("");
  };

  // SEARCH AND FILTER
  const filteredRequests = requests.filter((request) => {
    const customerName = request.customer?.name || "";

    const assetName = [
      request.asset?.brand,
      request.asset?.model,
      request.asset?.category
    ].filter(Boolean).join(" ");

    const technicianName = request.assignedTechnician?.name || "";

    const matchesSearch = [
      request.requestId,
      customerName,
      assetName,
      request.reportedSymptom,
      technicianName
    ]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || request.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const total = requests.length;

  const needsReview = requests.filter(
    (r) => r.status === "Needs Review"
  ).length;

  const inProgress = requests.filter((r) =>
    [
      "In Diagnosis",
      "Diagnosis Completed",
      "Repair In Progress"
    ].includes(r.status)
  ).length;

  const completed = requests.filter(
    (r) => r.status === "Completed"
  ).length;

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const getPriorityStyle = (priority) => {
    if (priority === "Urgent" || priority === "High") {
      return "bg-rose-50 text-rose-600";
    }

    if (priority === "Normal") {
      return "bg-blue-50 text-blue-600";
    }

    return "bg-slate-100 text-slate-500";
  };

  const getStatusStyle = (status) => {
    if (status === "Completed" || status === "QC Passed") {
      return "bg-emerald-50 text-emerald-600";
    }

    if (
      status === "Needs Review" ||
      status === "Needs More Information"
    ) {
      return "bg-orange-50 text-orange-600";
    }

    if (
      status === "Repair In Progress" ||
      status === "In Diagnosis"
    ) {
      return "bg-blue-50 text-blue-600";
    }

    if (status === "Declined" || status === "QC Failed") {
      return "bg-rose-50 text-rose-600";
    }

    return "bg-violet-50 text-violet-600";
  };

  const allowedStatuses = selectedRequest
    ? statusTransitions[selectedRequest.status] || []
    : [];

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">

      {/* PAGE HEADER */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-semibold text-slate-400">
            OVERVIEW / SERVICE REQUESTS
          </p>

          <h1 className="mt-2 text-2xl font-extrabold text-slate-800">
            Service Requests
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Track, review and manage customer repair requests.
          </p>
        </div>

        <button
          onClick={() => {
            setError("");
            setSuccess("");
            setShowForm(true);
          }}
          className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-violet-200 hover:bg-violet-700"
        >
          <Plus size={18} />
          Create Request
        </button>
      </div>

      {/* SUCCESS MESSAGE */}
      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          {success}
        </div>
      )}

      {/* ERROR MESSAGE */}
      {error && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          <span>{error}</span>

          <button onClick={() => setError("")}>
            <X size={17} />
          </button>
        </div>
      )}

      {/* STATISTICS */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Requests" value={total} icon={ClipboardList} color="violet" />
        <StatCard title="Needs Review" value={needsReview} icon={AlertCircle} color="orange" />
        <StatCard title="In Progress" value={inProgress} icon={Clock3} color="blue" />
        <StatCard title="Completed" value={completed} icon={CheckCircle2} color="green" />
      </div>

      {/* REQUEST TABLE */}
      <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">

        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center">
          <div>
            <h2 className="font-bold text-slate-800">
              All Service Requests
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Monitor every repair request
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 sm:w-64">
              <Search size={17} className="text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search requests or technician..."
                className="w-full bg-transparent text-xs outline-none"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-600 outline-none"
            >
              <option value="All">All Statuses</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            <button
              onClick={() => {
                loadData();
                loadTechnicians();
              }}
              className="flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              <RefreshCw size={15} />
              Refresh
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left">
            <thead className="bg-slate-50">
              <tr className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <th className="px-6 py-4">Request ID</th>
                <th className="px-6 py-4">Customer / Asset</th>
                <th className="px-6 py-4">Reported Issue</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Assigned Technician</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-sm text-slate-400">
                    Loading service requests...
                  </td>
                </tr>
              ) : (
                filteredRequests.map((request) => (
                  <tr key={request._id} className="hover:bg-slate-50/70">
                    <td className="px-6 py-4 text-xs font-bold text-violet-700">
                      {request.requestId}
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-xs font-bold text-slate-700">
                        {request.customer?.name || "Unknown Customer"}
                      </p>
                      <p className="mt-1 text-[10px] text-slate-400">
                        {request.asset?.brand}{" "}
                        {request.asset?.model || request.asset?.category}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-xs text-slate-600">
                      {request.reportedSymptom}
                    </td>

                    <td className="px-6 py-4 text-xs text-slate-500">
                      {formatDate(request.createdAt)}
                    </td>

                    <td className="px-6 py-4">
                      <span className={`rounded-full px-3 py-1.5 text-[10px] font-bold ${getPriorityStyle(request.priority)}`}>
                        {request.priority}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`rounded-full px-3 py-1.5 text-[10px] font-bold ${getStatusStyle(request.status)}`}>
                        {request.status}
                      </span>
                    </td>

                    {/* ASSIGNED TECHNICIAN */}
                    <td className="px-6 py-4">
                      {request.assignedTechnician?.name ? (
                        <div>
                          <p className="text-xs font-bold text-slate-700">
                            {request.assignedTechnician.name}
                          </p>
                          <p className="mt-1 text-[10px] text-slate-400">
                            {request.assignedTechnician.email}
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">
                          Not Assigned
                        </span>
                      )}
                    </td>

                    {/* ACTION MENU */}
                    <td className="px-6 py-4">
                      <div className="relative">
                        <button
                          onClick={() =>
                            setOpenMenuId(
                              openMenuId === request._id ? null : request._id
                            )
                          }
                          title={`Actions for ${request.requestId}`}
                          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-violet-600"
                        >
                          <MoreHorizontal size={19} />
                        </button>

                        {openMenuId === request._id && (
                          <div className="absolute right-8 top-0 z-30 w-48 rounded-xl border border-slate-100 bg-white p-2 shadow-xl">
                            <button
                              onClick={() => {
                                setSelectedRequest(request);
                                setShowDetails(true);
                                setOpenMenuId(null);
                              }}
                              className="w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-600 hover:bg-violet-50 hover:text-violet-700"
                            >
                              View Details
                            </button>

                            <button
                              onClick={() => {
                                setSelectedRequest(request);
                                setNewStatus("");
                                setShowStatusModal(true);
                                setOpenMenuId(null);
                              }}
                              className="w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-600 hover:bg-violet-50 hover:text-violet-700"
                            >
                              Update Status
                            </button>

                            <button
                              onClick={() => openAssignModal(request)}
                              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-violet-700 hover:bg-violet-50"
                            >
                              <UserCheck size={15} />
                              Assign Technician
                            </button>
                            {request.status === "Ready for Handover" && (
  <button
    onClick={() => handleGenerateInvoice(request)}
    disabled={generatingInvoice}
    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
  >
    <Receipt size={15} />
    {generatingInvoice ? "Generating..." : "Generate Invoice"}
  </button>
)}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}

              {!loading && filteredRequests.length === 0 && (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-sm text-slate-400">
                    No service requests found. Create your first request.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-100 px-6 py-4 text-xs text-slate-400">
          Showing {filteredRequests.length} of {requests.length} requests
        </div>
      </section>

      {/* CREATE REQUEST MODAL */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-slate-800">
                  Create Service Request
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  Register a new customer repair request.
                </p>
              </div>
              <button onClick={() => setShowForm(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-bold text-slate-600">Customer *</label>
                  <select
                    required
                    value={formData.customer}
                    onChange={(e) => handleCustomerChange(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-violet-500"
                  >
                    <option value="">Select Customer</option>
                    {customers.map((customer) => (
                      <option key={customer._id} value={customer._id}>
                        {customer.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold text-slate-600">Asset *</label>
                  <select
                    required
                    value={formData.asset}
                    onChange={(e) => setFormData({ ...formData, asset: e.target.value })}
                    disabled={!formData.customer}
                    className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-violet-500 disabled:bg-slate-50"
                  >
                    <option value="">Select Asset</option>
                    {filteredAssets.map((asset) => (
                      <option key={asset._id} value={asset._id}>
                        {asset.brand} {asset.model} ({asset.category})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold text-slate-600">Reported Problem *</label>
                <textarea
                  required
                  rows="3"
                  value={formData.reportedSymptom}
                  onChange={(e) => setFormData({ ...formData, reportedSymptom: e.target.value })}
                  placeholder="Describe the customer's repair issue..."
                  className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-violet-500"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-bold text-slate-600">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-violet-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold text-slate-600">Preferred Service Date</label>
                  <input
                    type="date"
                    value={formData.preferredDate}
                    onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold text-slate-600">Service Address</label>
                <input
                  type="text"
                  value={formData.serviceAddress}
                  onChange={(e) => setFormData({ ...formData, serviceAddress: e.target.value })}
                  placeholder="Enter service address"
                  className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-violet-500"
                />
              </div>

              <div className="flex flex-col-reverse gap-3 pt-3 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="rounded-xl bg-violet-600 px-6 py-3 text-sm font-bold text-white hover:bg-violet-700 disabled:opacity-60">
                  {saving ? "Saving..." : "Save Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW DETAILS MODAL */}
      {showDetails && selectedRequest && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Request Details</h2>
                <p className="mt-1 text-sm text-slate-500">{selectedRequest.requestId}</p>
              </div>
              <button onClick={closeDetails} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <DetailItem label="Customer" value={selectedRequest.customer?.name} />
              <DetailItem label="Customer Email" value={selectedRequest.customer?.email} />
              <DetailItem label="Phone" value={selectedRequest.customer?.phone} />
              <DetailItem
                label="Asset"
                value={`${selectedRequest.asset?.brand || ""} ${selectedRequest.asset?.model || selectedRequest.asset?.category || ""}`}
              />
              <DetailItem label="Serial Number" value={selectedRequest.asset?.serialNumber} />
              <DetailItem label="Priority" value={selectedRequest.priority} />
              <DetailItem label="Current Status" value={selectedRequest.status} highlight />
              <DetailItem label="Preferred Date" value={formatDate(selectedRequest.preferredDate)} />
              <DetailItem
                label="Assigned Technician"
                value={selectedRequest.assignedTechnician?.name}
              />
              <DetailItem
                label="Technician Email"
                value={selectedRequest.assignedTechnician?.email}
              />

              <div className="sm:col-span-2">
                <p className="text-xs font-semibold text-slate-400">Reported Symptom</p>
                <p className="mt-2 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
                  {selectedRequest.reportedSymptom || "Not available"}
                </p>
              </div>

              <div className="sm:col-span-2">
                <p className="text-xs font-semibold text-slate-400">Service Address</p>
                <p className="mt-2 text-sm font-semibold text-slate-700">
                  {selectedRequest.serviceAddress || "Not available"}
                </p>
              </div>

              <DetailItem label="Created On" value={formatDate(selectedRequest.createdAt)} />
            </div>

            <div className="mt-7 flex justify-end">
              <button onClick={closeDetails} className="rounded-xl bg-violet-600 px-6 py-3 text-sm font-bold text-white hover:bg-violet-700">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPDATE STATUS MODAL */}
      {showStatusModal && selectedRequest && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Update Request Status</h2>
                <p className="mt-1 text-xs text-slate-500">{selectedRequest.requestId}</p>
              </div>
              <button onClick={closeStatusModal} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
                <X size={20} />
              </button>
            </div>

            <div className="mb-5 rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-400">Current Status</p>
              <p className="mt-2 font-bold text-violet-700">{selectedRequest.status}</p>
            </div>

            {allowedStatuses.length > 0 ? (
              <div>
                <label className="mb-2 block text-xs font-bold text-slate-600">Select New Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-500"
                >
                  <option value="">Select next status</option>
                  {allowedStatuses.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-700">
                No further status transition is available for this request.
              </div>
            )}

            <p className="mt-3 text-xs leading-5 text-slate-400">
              Some status changes require diagnosis, repair log or quality control records to be created first.
            </p>

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button onClick={closeStatusModal} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50">
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                disabled={!newStatus || !allowedStatuses.includes(newStatus) || updatingStatus}
                className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {updatingStatus ? "Updating..." : "Save Status"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ASSIGN TECHNICIAN MODAL */}
      {showAssignModal && selectedRequest && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-xl bg-violet-50 p-2 text-violet-600">
                    <UserCheck size={20} />
                  </span>
                  <h2 className="text-xl font-bold text-slate-800">Assign Technician</h2>
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Request ID: {selectedRequest.requestId}
                </p>
              </div>
              <button onClick={closeAssignModal} disabled={assigning} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
                <X size={20} />
              </button>
            </div>

            <div className="mb-5 rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-400">Customer</p>
              <p className="mt-1 text-sm font-bold text-slate-700">
                {selectedRequest.customer?.name || "Unknown Customer"}
              </p>
              <p className="mt-3 text-xs font-semibold text-slate-400">Reported Issue</p>
              <p className="mt-1 text-sm text-slate-600">{selectedRequest.reportedSymptom}</p>
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold text-slate-600">
                Select Active Technician *
              </label>
              <select
                value={selectedTechnician}
                onChange={(e) => setSelectedTechnician(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-violet-500"
              >
                <option value="">Choose a technician</option>
                {technicians.map((technician) => (
                  <option key={technician._id} value={technician._id}>
                    {technician.name} ({technician.email})
                  </option>
                ))}
              </select>

              {technicians.length === 0 && (
                <p className="mt-2 text-xs text-orange-600">
                  No active technicians found. Please check the Technicians page.
                </p>
              )}
            </div>

            <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-3">
              <p className="text-xs leading-5 text-blue-700">
                An approved quote is required before assigning a technician.
                Only Admin and Service Desk users can perform this action.
              </p>
            </div>

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeAssignModal}
                disabled={assigning}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAssignTechnician}
                disabled={!selectedTechnician || assigning}
                className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <UserCheck size={16} />
                {assigning ? "Assigning..." : "Assign Technician"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailItem({ label, value, highlight = false }) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-400">{label}</p>
      <p className={`mt-2 text-sm font-semibold ${
        highlight ? "text-violet-700" : "text-slate-700"
      }`}>
        {value || "Not available"}
      </p>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }) {
  const styles = {
    violet: "bg-violet-50 text-violet-600",
    orange: "bg-orange-50 text-orange-600",
    blue: "bg-blue-50 text-blue-600",
    green: "bg-emerald-50 text-emerald-600"
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

export default Requests;
