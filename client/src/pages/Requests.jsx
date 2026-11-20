
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
  UserCheck
} from "lucide-react";

import API from "../services/api";
import RequestWorkflow from "../components/RequestWorkflow";

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

function Requests() {
  const [requests, setRequests] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [assets, setAssets] = useState([]);
  const [technicians, setTechnicians] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showForm, setShowForm] = useState(false);
  const [showWorkflow, setShowWorkflow] = useState(false);

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

      const [requestRes, customerRes, assetRes] =
        await Promise.all([
          API.get("/requests"),
          API.get("/customers"),
          API.get("/assets")
        ]);

      const requestList = requestRes.data.requests || [];

      setRequests(requestList);
      setCustomers(customerRes.data.customers || []);
      setAssets(assetRes.data.assets || []);

      return requestList;
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load service requests. Please check your connection."
      );

      return [];
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

  // FILTER ASSETS BY CUSTOMER
  const filteredAssets = assets.filter(
    (asset) =>
      asset.customer?._id === formData.customer ||
      asset.customer === formData.customer
  );

  // CUSTOMER CHANGE
  const handleCustomerChange = (value) => {
    setFormData((previous) => ({
      ...previous,
      customer: value,
      asset: ""
    }));
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

  // OPEN CENTRAL WORKFLOW
  const openWorkflow = (request) => {
    setSelectedRequest(request);
    setShowWorkflow(true);
    setOpenMenuId(null);
    setError("");
    setSuccess("");
  };

  // CLOSE CENTRAL WORKFLOW
  const closeWorkflow = () => {
    setShowWorkflow(false);
    setSelectedRequest(null);
  };

  // REFRESH REQUEST AND UPDATE SELECTED REQUEST
  const refreshWorkflow = async () => {
    const updatedRequests = await loadData();

    if (selectedRequest) {
      const updatedRequest = updatedRequests.find(
        (item) => item._id === selectedRequest._id
      );

      if (updatedRequest) {
        setSelectedRequest(updatedRequest);
      }
    }
  };

  // SEARCH AND FILTER
  const filteredRequests = requests.filter((request) => {
    const customerName = request.customer?.name || "";

    const assetName = [
      request.asset?.brand,
      request.asset?.model,
      request.asset?.category
    ]
      .filter(Boolean)
      .join(" ");

    const technicianName =
      request.assignedTechnician?.name || "";

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
      statusFilter === "All" ||
      request.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // STATISTICS
  const total = requests.length;

  const needsReview = requests.filter(
    (request) => request.status === "Needs Review"
  ).length;

  const inProgress = requests.filter((request) =>
    [
      "In Diagnosis",
      "Diagnosis Completed",
      "Repair In Progress"
    ].includes(request.status)
  ).length;

  const completed = requests.filter(
    (request) => request.status === "Completed"
  ).length;

  // DATE FORMAT
  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  // PRIORITY STYLE
  const getPriorityStyle = (priority) => {
    if (priority === "Urgent" || priority === "High") {
      return "bg-rose-50 text-rose-600";
    }

    if (priority === "Normal") {
      return "bg-blue-50 text-blue-600";
    }

    return "bg-slate-100 text-slate-500";
  };

  // STATUS STYLE
  const getStatusStyle = (status) => {
    if (
      status === "Completed" ||
      status === "QC Passed"
    ) {
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

    if (
      status === "Declined" ||
      status === "QC Failed"
    ) {
      return "bg-rose-50 text-rose-600";
    }

    return "bg-violet-50 text-violet-600";
  };

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
        <StatCard
          title="Total Requests"
          value={total}
          icon={ClipboardList}
          color="violet"
        />

        <StatCard
          title="Needs Review"
          value={needsReview}
          icon={AlertCircle}
          color="orange"
        />

        <StatCard
          title="In Progress"
          value={inProgress}
          icon={Clock3}
          color="blue"
        />

        <StatCard
          title="Completed"
          value={completed}
          icon={CheckCircle2}
          color="green"
        />
      </div>

      {/* REQUEST TABLE */}
      <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">

        {/* TABLE HEADER */}
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

            {/* SEARCH */}
            <div className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 sm:w-64">
              <Search size={17} className="text-slate-400" />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search requests or technician..."
                className="w-full bg-transparent text-xs outline-none"
              />
            </div>

            {/* STATUS FILTER */}
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

            {/* REFRESH */}
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

        {/* TABLE */}
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
                  <td
                    colSpan="8"
                    className="px-6 py-12 text-center text-sm text-slate-400"
                  >
                    Loading service requests...
                  </td>
                </tr>
              ) : (
                filteredRequests.map((request) => (
                  <tr
                    key={request._id}
                    className="hover:bg-slate-50/70"
                  >
                    {/* REQUEST ID */}
                    <td className="px-6 py-4 text-xs font-bold text-violet-700">
                      {request.requestId || "—"}
                    </td>

                    {/* CUSTOMER / ASSET */}
                    <td className="px-6 py-4">
                      <p className="text-xs font-bold text-slate-700">
                        {request.customer?.name || "Unknown Customer"}
                      </p>

                      <p className="mt-1 text-[10px] text-slate-400">
                        {request.asset?.brand}{" "}
                        {request.asset?.model ||
                          request.asset?.category}
                      </p>
                    </td>

                    {/* REPORTED ISSUE */}
                    <td className="max-w-xs px-6 py-4 text-xs text-slate-600">
                      <p className="line-clamp-2">
                        {request.reportedSymptom || "—"}
                      </p>
                    </td>

                    {/* DATE */}
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {formatDate(request.createdAt)}
                    </td>

                    {/* PRIORITY */}
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1.5 text-[10px] font-bold ${getPriorityStyle(
                          request.priority
                        )}`}
                      >
                        {request.priority || "Normal"}
                      </span>
                    </td>

                    {/* STATUS */}
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1.5 text-[10px] font-bold ${getStatusStyle(
                          request.status
                        )}`}
                      >
                        {request.status}
                      </span>
                    </td>

                    {/* TECHNICIAN */}
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
                              openMenuId === request._id
                                ? null
                                : request._id
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
                              onClick={() => openWorkflow(request)}
                              className="w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-violet-700 hover:bg-violet-50"
                            >
                              Open Request Workflow
                            </button>

                            <button
                              onClick={() => openWorkflow(request)}
                              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-600 hover:bg-slate-50"
                            >
                              <UserCheck size={15} />
                              Manage Request
                            </button>

                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}

              {/* EMPTY STATE */}
              {!loading && filteredRequests.length === 0 && (
                <tr>
                  <td
                    colSpan="8"
                    className="px-6 py-12 text-center text-sm text-slate-400"
                  >
                    No service requests found.
                    Try changing the search or filter.
                  </td>
                </tr>
              )}

            </tbody>
          </table>
        </div>

        {/* TABLE FOOTER */}
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

              <button
                onClick={() => setShowForm(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* CUSTOMER AND ASSET */}
              <div className="grid gap-4 sm:grid-cols-2">

                <div>
                  <label className="mb-2 block text-xs font-bold text-slate-600">
                    Customer *
                  </label>

                  <select
                    required
                    value={formData.customer}
                    onChange={(e) =>
                      handleCustomerChange(e.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-violet-500"
                  >
                    <option value="">Select Customer</option>

                    {customers.map((customer) => (
                      <option
                        key={customer._id}
                        value={customer._id}
                      >
                        {customer.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold text-slate-600">
                    Asset *
                  </label>

                  <select
                    required
                    value={formData.asset}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        asset: e.target.value
                      })
                    }
                    disabled={!formData.customer}
                    className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-violet-500 disabled:bg-slate-50"
                  >
                    <option value="">Select Asset</option>

                    {filteredAssets.map((asset) => (
                      <option
                        key={asset._id}
                        value={asset._id}
                      >
                        {asset.brand} {asset.model} ({asset.category})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* REPORTED PROBLEM */}
              <div>
                <label className="mb-2 block text-xs font-bold text-slate-600">
                  Reported Problem *
                </label>

                <textarea
                  required
                  rows="3"
                  value={formData.reportedSymptom}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      reportedSymptom: e.target.value
                    })
                  }
                  placeholder="Describe the customer's repair issue..."
                  className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-violet-500"
                />
              </div>

              {/* PRIORITY AND DATE */}
              <div className="grid gap-4 sm:grid-cols-2">

                <div>
                  <label className="mb-2 block text-xs font-bold text-slate-600">
                    Priority
                  </label>

                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        priority: e.target.value
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-violet-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold text-slate-600">
                    Preferred Service Date
                  </label>

                  <input
                    type="date"
                    value={formData.preferredDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        preferredDate: e.target.value
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              {/* SERVICE ADDRESS */}
              <div>
                <label className="mb-2 block text-xs font-bold text-slate-600">
                  Service Address
                </label>

                <input
                  type="text"
                  value={formData.serviceAddress}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      serviceAddress: e.target.value
                    })
                  }
                  placeholder="Enter service address"
                  className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-violet-500"
                />
              </div>

              {/* FORM BUTTONS */}
              <div className="flex flex-col-reverse gap-3 pt-3 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-violet-600 px-6 py-3 text-sm font-bold text-white hover:bg-violet-700 disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Request"}
                </button>

              </div>
            </form>
          </div>
        </div>
      )}

      {/* CENTRAL REQUEST WORKFLOW */}
      {showWorkflow && selectedRequest && (
        <RequestWorkflow
          request={selectedRequest}
          technicians={technicians}
          onClose={closeWorkflow}
          onRefresh={refreshWorkflow}
        />
      )}

    </div>
  );
}

// STAT CARD
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

export default Requests;
