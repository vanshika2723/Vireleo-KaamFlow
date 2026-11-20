
import { useEffect, useMemo, useState } from "react";
import {
  FileText,
  Search,
  Plus,
  IndianRupee,
  Clock3,
  CheckCircle2,
  AlertCircle,
  MoreHorizontal,
  X,
  Eye,
  Send,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  Save,
  Trash2
} from "lucide-react";

import API from "../services/api";

const initialForm = {
  serviceRequest: "",
  laborCost: "",
  parts: [{ name: "", quantity: 1, unitPrice: "" }],
  additionalCharges: "0",
  estimatedCompletion: "",
  terms: ""
};

function Quotes() {
  const [quotes, setQuotes] = useState([]);
  const [requests, setRequests] = useState([]);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);

  const [form, setForm] = useState(initialForm);
  const [openMenuId, setOpenMenuId] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [quoteResponse, requestResponse] = await Promise.all([
        API.get("/quotes"),
        API.get("/requests")
      ]);

      setQuotes(quoteResponse.data.quotes || []);
      setRequests(requestResponse.data.requests || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load quotes. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const requestMap = useMemo(() => {
    const map = {};

    requests.forEach((request) => {
      map[request._id] = request;
    });

    return map;
  }, [requests]);

  const eligibleRequests = requests.filter(
    (request) => request.status === "Diagnosis Completed"
  );

  const enrichedQuotes = useMemo(() => {
    return quotes.map((quote) => {
      const requestId =
        typeof quote.serviceRequest === "object"
          ? quote.serviceRequest?._id
          : quote.serviceRequest;

      const request = requestMap[requestId];

      return {
        ...quote,
        requestId: quote.serviceRequest?.requestId || "—",
        customer:
          request?.customer?.name || "Customer",
        service:
          request?.reportedSymptom ||
          quote.serviceRequest?.reportedSymptom ||
          "Repair service",
        assetName: [
          request?.asset?.brand,
          request?.asset?.model || request?.asset?.category
        ].filter(Boolean).join(" ") || "Equipment"
      };
    });
  }, [quotes, requestMap]);

  const filteredQuotes = enrichedQuotes.filter((quote) => {
    const searchText = [
      quote._id,
      quote.requestId,
      quote.customer,
      quote.service,
      quote.assetName
    ].join(" ").toLowerCase();

    const matchesSearch = searchText.includes(search.toLowerCase());

    const matchesFilter =
      filter === "All" || quote.status === filter;

    return matchesSearch && matchesFilter;
  });

  const totalQuotes = quotes.length;

  const awaitingApproval = quotes.filter(
    (quote) => quote.status === "Sent"
  ).length;

  const approvedQuotes = quotes.filter(
    (quote) => quote.status === "Approved"
  ).length;

  const rejectedQuotes = quotes.filter(
    (quote) => quote.status === "Rejected"
  ).length;

  const updateForm = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value
    }));
  };

  const updatePart = (index, field, value) => {
    setForm((previous) => ({
      ...previous,
      parts: previous.parts.map((part, i) =>
        i === index ? { ...part, [field]: value } : part
      )
    }));
  };

  const addPart = () => {
    setForm((previous) => ({
      ...previous,
      parts: [
        ...previous.parts,
        { name: "", quantity: 1, unitPrice: "" }
      ]
    }));
  };

  const removePart = (index) => {
    setForm((previous) => ({
      ...previous,
      parts: previous.parts.filter((_, i) => i !== index)
    }));
  };

  const calculatedTotal =
    Number(form.laborCost || 0) +
    form.parts.reduce(
      (sum, part) =>
        sum +
        Number(part.quantity || 0) *
        Number(part.unitPrice || 0),
      0
    ) +
    Number(form.additionalCharges || 0);

  const openCreateForm = () => {
    setForm({
      ...initialForm,
      serviceRequest: eligibleRequests[0]?._id || ""
    });

    setError("");
    setMessage("");
    setShowForm(true);
  };

  const handleCreateQuote = async (event) => {
    event.preventDefault();

    if (!form.serviceRequest) {
      setError("Please select a completed diagnosis request.");
      return;
    }

    if (
      form.laborCost === "" ||
      Number(form.laborCost) < 0 ||
      Number(form.additionalCharges) < 0
    ) {
      setError("Please enter valid cost values.");
      return;
    }

    const validParts = form.parts
      .filter((part) => part.name.trim())
      .map((part) => ({
        name: part.name.trim(),
        quantity: Math.max(1, Number(part.quantity) || 1),
        unitPrice: Number(part.unitPrice)
      }));

    if (
      validParts.some(
        (part) =>
          !Number.isFinite(part.unitPrice) ||
          part.unitPrice < 0
      )
    ) {
      setError("Please enter valid part prices.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await API.post("/quotes", {
        serviceRequest: form.serviceRequest,
        laborCost: Number(form.laborCost),
        parts: validParts,
        additionalCharges: Number(form.additionalCharges || 0),
        estimatedCompletion: form.estimatedCompletion,
        terms: form.terms
      });

      setShowForm(false);
      setMessage("Quote created successfully!");
      setForm(initialForm);

      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to create quote."
      );
    } finally {
      setSaving(false);
    }
  };


const updateQuoteStatus = async (quote, status) => {
  const actionMessages = {
    Sent: "Send this quote?",
    Approved: "Approve this quote?",
    Rejected: "Reject this quote?"
  };

  if (!window.confirm(actionMessages[status])) {
    return;
  }

  try {
    setError("");
    setMessage("");

    const response = await API.patch(`/quotes/${quote._id}/status`, {
      status
    });

    // Update only the selected quote locally
    setQuotes((previousQuotes) =>
      previousQuotes.map((item) =>
        item._id === quote._id
          ? {
              ...item,
              ...response.data.quote,
              status: response.data.quote?.status || status
            }
          : item
      )
    );

    setMessage(`Quote ${status.toLowerCase()} successfully!`);
    setOpenMenuId(null);

  } catch (err) {
    setError(
      err.response?.data?.message ||
      "Unable to update quote status."
    );
  }
};


  const openQuoteDetails = (quote) => {
    setSelectedQuote(quote);
    setShowDetails(true);
    setOpenMenuId(null);
  };

  const getStatusStyle = (status) => {
    const styles = {
      Approved: "bg-emerald-50 text-emerald-600",
      Rejected: "bg-rose-50 text-rose-600",
      Sent: "bg-orange-50 text-orange-600",
      Draft: "bg-slate-100 text-slate-500",
      Expired: "bg-red-50 text-red-600"
    };

    return styles[status] || styles.Draft;
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-semibold text-slate-400">
            OPERATIONS / QUOTES
          </p>

          <h1 className="mt-2 text-2xl font-extrabold text-slate-800">
            Repair Quotes
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Prepare and manage repair estimates and approvals.
          </p>
        </div>

        <button
          onClick={openCreateForm}
          className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-violet-200 hover:bg-violet-700"
        >
          <Plus size={18} />
          Create Quote
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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Quotes"
          value={totalQuotes}
          icon={FileText}
          color="violet"
        />

        <StatCard
          title="Awaiting Approval"
          value={awaitingApproval}
          icon={Clock3}
          color="orange"
        />

        <StatCard
          title="Approved"
          value={approvedQuotes}
          icon={CheckCircle2}
          color="green"
        />

        <StatCard
          title="Rejected"
          value={rejectedQuotes}
          icon={AlertCircle}
          color="rose"
        />
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center">
          <div>
            <h2 className="font-bold text-slate-800">
              Quote Directory
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Review estimates and their approval status
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 sm:w-64">
              <Search size={17} className="text-slate-400" />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search quotes..."
                className="w-full bg-transparent text-xs outline-none"
              />
            </div>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-600 outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Sent">Sent</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Expired">Expired</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">
            <thead className="bg-slate-50">
              <tr className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <th className="px-6 py-4">Quote ID</th>
                <th className="px-6 py-4">Customer / Request</th>
                <th className="px-6 py-4">Repair Service</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <Loader2 className="mx-auto animate-spin text-violet-600" />
                    <p className="mt-2 text-sm text-slate-400">
                      Loading quotes...
                    </p>
                  </td>
                </tr>
              ) : filteredQuotes.map((quote) => (
                <tr key={quote._id} className="hover:bg-slate-50/70">
                  <td className="px-6 py-4 text-xs font-bold text-violet-700">
                    Q-{quote._id.slice(-6).toUpperCase()}
                    <p className="mt-1 text-[10px] font-normal text-slate-400">
                      Version {quote.version}
                    </p>
                  </td>

                  <td className="px-6 py-4">
                    <p className="text-xs font-bold text-slate-700">
                      {quote.customer}
                    </p>
                    <p className="mt-1 text-[10px] text-slate-400">
                      {quote.requestId}
                    </p>
                  </td>

                  <td className="px-6 py-4">
                    <p className="text-xs text-slate-600">
                      {quote.assetName}
                    </p>
                    <p className="mt-1 max-w-xs text-[10px] text-slate-400">
                      {quote.service}
                    </p>
                  </td>

                  <td className="px-6 py-4">
                    <span className="flex items-center gap-1 text-xs font-bold text-slate-700">
                      <IndianRupee size={13} />
                      {Number(quote.totalAmount).toLocaleString("en-IN")}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-xs text-slate-500">
                    {new Date(quote.createdAt).toLocaleDateString("en-IN")}
                  </td>

                  <td className="px-6 py-4">
                    <span className={`rounded-full px-3 py-1.5 text-[10px] font-bold ${getStatusStyle(quote.status)}`}>
                      {quote.status}
                    </span>
                  </td>

                  <td className="relative px-6 py-4">
                    <button
                      onClick={() =>
                        setOpenMenuId(
                          openMenuId === quote._id ? null : quote._id
                        )
                      }
                      aria-label={`More actions for quote ${quote._id}`}
                      className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-violet-600"
                    >
                      <MoreHorizontal size={19} />
                    </button>

                    {openMenuId === quote._id && (
                      <div className="absolute right-8 top-12 z-20 w-48 rounded-xl border border-slate-100 bg-white p-2 shadow-xl">

                        <button
                          onClick={() => openQuoteDetails(quote)}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs font-medium text-slate-600 hover:bg-violet-50 hover:text-violet-700"
                        >
                          <Eye size={15} />
                          View Details
                        </button>

                        {quote.status === "Draft" && (
                          <button
                            onClick={() =>
                              updateQuoteStatus(quote, "Sent")
                            }
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs font-medium text-blue-600 hover:bg-blue-50"
                          >
                            <Send size={15} />
                            Send Quote
                          </button>
                        )}

                        {quote.status === "Sent" && (
                          <>
                            <button
                              onClick={() =>
                                updateQuoteStatus(quote, "Approved")
                              }
                              className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs font-medium text-emerald-600 hover:bg-emerald-50"
                            >
                              <ThumbsUp size={15} />
                              Approve Quote
                            </button>

                            <button
                              onClick={() =>
                                updateQuoteStatus(quote, "Rejected")
                              }
                              className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs font-medium text-rose-600 hover:bg-rose-50"
                            >
                              <ThumbsDown size={15} />
                              Reject Quote
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}

              {!loading && filteredQuotes.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-sm text-slate-400">
                    No quotes found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-100 px-6 py-4 text-xs text-slate-400">
          Showing {filteredQuotes.length} of {quotes.length} quotes
        </div>
      </section>

      {/* CREATE QUOTE MODAL */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/40 p-4">
          <div className="my-6 w-full max-w-2xl rounded-2xl bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <h2 className="text-lg font-extrabold text-slate-800">
                  Create Repair Quote
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  Prepare an estimate for a completed diagnosis
                </p>
              </div>

              <button
                onClick={() => setShowForm(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateQuote} className="space-y-4 p-5">

              {error && (
                <div className="rounded-xl bg-red-50 p-3 text-xs text-red-600">
                  {error}
                </div>
              )}

              <FormField label="Service Request *">
                <select
                  required
                  value={form.serviceRequest}
                  onChange={(e) =>
                    updateForm("serviceRequest", e.target.value)
                  }
                  className="form-input"
                >
                  <option value="">Select completed request</option>

                  {eligibleRequests.map((request) => (
                    <option key={request._id} value={request._id}>
                      {request.requestId} - {request.customer?.name || "Customer"}
                    </option>
                  ))}
                </select>

                {eligibleRequests.length === 0 && (
                  <p className="mt-2 text-xs text-orange-600">
                    No Diagnosis Completed requests available. Complete a diagnosis first.
                  </p>
                )}
              </FormField>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Labour Cost (₹) *">
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.laborCost}
                    onChange={(e) =>
                      updateForm("laborCost", e.target.value)
                    }
                    placeholder="Example: 1500"
                    className="form-input"
                  />
                </FormField>

                <FormField label="Additional Charges (₹)">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.additionalCharges}
                    onChange={(e) =>
                      updateForm("additionalCharges", e.target.value)
                    }
                    className="form-input"
                  />
                </FormField>
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">
                    Parts & Material Costs
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

                <div className="space-y-3">
                  {form.parts.map((part, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-12 gap-2"
                    >
                      <input
                        value={part.name}
                        onChange={(e) =>
                          updatePart(index, "name", e.target.value)
                        }
                        placeholder="Part name"
                        className="form-input col-span-5"
                      />

                      <input
                        type="number"
                        min="1"
                        value={part.quantity}
                        onChange={(e) =>
                          updatePart(index, "quantity", e.target.value)
                        }
                        placeholder="Qty"
                        className="form-input col-span-2"
                      />

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={part.unitPrice}
                        onChange={(e) =>
                          updatePart(index, "unitPrice", e.target.value)
                        }
                        placeholder="Price"
                        className="form-input col-span-4"
                      />

                      <button
                        type="button"
                        onClick={() => removePart(index)}
                        disabled={form.parts.length === 1}
                        className="col-span-1 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50 disabled:opacity-30"
                        aria-label="Remove part"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Estimated Completion">
                  <input
                    value={form.estimatedCompletion}
                    onChange={(e) =>
                      updateForm("estimatedCompletion", e.target.value)
                    }
                    placeholder="Example: 2 working days"
                    className="form-input"
                  />
                </FormField>

                <div className="rounded-xl bg-violet-50 p-4">
                  <p className="text-xs font-semibold text-violet-600">
                    Estimated Total Amount
                  </p>
                  <p className="mt-2 flex items-center text-2xl font-extrabold text-violet-700">
                    <IndianRupee size={20} />
                    {calculatedTotal.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              <FormField label="Terms & Conditions">
                <textarea
                  rows="3"
                  value={form.terms}
                  onChange={(e) =>
                    updateForm("terms", e.target.value)
                  }
                  placeholder="Enter warranty, payment or repair terms..."
                  className="form-input"
                />
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
                  disabled={saving || eligibleRequests.length === 0}
                  className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-xs font-bold text-white hover:bg-violet-700 disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}
                  {saving ? "Creating..." : "Create Quote"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUOTE DETAILS MODAL */}
      {showDetails && selectedQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/40 p-4">
          <div className="my-6 w-full max-w-xl rounded-2xl bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <h2 className="text-lg font-extrabold text-slate-800">
                  Quote Details
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  Q-{selectedQuote._id.slice(-6).toUpperCase()} · Version {selectedQuote.version}
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
              <Detail label="Customer" value={selectedQuote.customer} />
              <Detail label="Request ID" value={selectedQuote.requestId} />
              <Detail label="Equipment" value={selectedQuote.assetName} />
              <Detail label="Repair Service" value={selectedQuote.service} />
              <Detail label="Labour Cost" value={`₹${Number(selectedQuote.laborCost).toLocaleString("en-IN")}`} />

              <div>
                <p className="text-[10px] font-bold uppercase text-slate-400">
                  Parts
                </p>

                {selectedQuote.parts?.length ? (
                  <div className="mt-2 space-y-2">
                    {selectedQuote.parts.map((part, index) => (
                      <div
                        key={index}
                        className="flex justify-between rounded-lg bg-slate-50 p-3 text-xs"
                      >
                        <span className="text-slate-600">
                          {part.name} × {part.quantity}
                        </span>
                        <span className="font-bold text-slate-700">
                          ₹{(part.quantity * part.unitPrice).toLocaleString("en-IN")}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-1 text-xs text-slate-400">
                    No parts included.
                  </p>
                )}
              </div>

              <Detail
                label="Additional Charges"
                value={`₹${Number(selectedQuote.additionalCharges || 0).toLocaleString("en-IN")}`}
              />

              <div className="rounded-xl bg-violet-50 p-4">
                <p className="text-xs font-semibold text-violet-600">
                  Total Quote Amount
                </p>
                <p className="mt-1 text-2xl font-extrabold text-violet-700">
                  ₹{Number(selectedQuote.totalAmount).toLocaleString("en-IN")}
                </p>
              </div>

              <Detail
                label="Estimated Completion"
                value={selectedQuote.estimatedCompletion}
              />

              <Detail label="Terms & Conditions" value={selectedQuote.terms} />

              <Detail label="Status" value={selectedQuote.status} />
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
    green: "bg-emerald-50 text-emerald-600",
    rose: "bg-rose-50 text-rose-600"
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

export default Quotes;
