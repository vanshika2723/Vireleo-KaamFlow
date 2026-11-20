
import { useEffect, useState } from "react";
import {
  X,
  ClipboardList,
  Stethoscope,
  FileText,
  UserCheck,
  Wrench,
  ShieldCheck,
  Receipt,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock3,
  Plus,
  Save,
  IndianRupee
} from "lucide-react";
import API from "../services/api";

const tabs = [
  { id: "overview", label: "Overview", icon: ClipboardList },
  { id: "diagnosis", label: "Diagnosis", icon: Stethoscope },
  { id: "quote", label: "Quote", icon: FileText },
  { id: "technician", label: "Technician", icon: UserCheck },
  { id: "repair", label: "Repair", icon: Wrench },
  { id: "qc", label: "Quality Check", icon: ShieldCheck },
  { id: "invoice", label: "Invoice", icon: Receipt }
];

const defaultChecks = [
  { item: "Reported issue resolved", passed: true, remarks: "" },
  { item: "Repaired components tested", passed: true, remarks: "" },
  { item: "Equipment safety verified", passed: true, remarks: "" },
  { item: "Equipment functionality verified", passed: true, remarks: "" },
  { item: "Equipment ready for handover", passed: true, remarks: "" }
];

const initialDiagnosis = {
  problemFound: "",
  rootCause: "",
  diagnosisNotes: "",
  recommendedSolution: "",
  estimatedRepairTime: "",
  partsRequired: [{ name: "", quantity: 1 }]
};

const initialQuote = {
  laborCost: "",
  parts: [{ name: "", quantity: 1, unitPrice: "" }],
  additionalCharges: "0",
  estimatedCompletion: "",
  terms: ""
};

const transitions = {
  "Needs Review": [
    "Accepted",
    "Needs More Information",
    "Out of Coverage",
    "Declined"
  ],
  Accepted: ["Open"],
  Open: ["In Diagnosis"],
  "In Diagnosis": ["Diagnosis Completed"],
  "Diagnosis Completed": ["Repair In Progress"],
  "Repair In Progress": ["Repair Completed"],
  "Repair Completed": ["QC Passed", "QC Failed"],
  "QC Failed": ["Repair In Progress"],
  "QC Passed": ["Ready for Handover"],
  "Ready for Handover": ["Completed"]
};

function getPayload(response) {
  const body = response?.data;

  if (!body) return null;

  return (
    body.data ??
    body.diagnosis ??
    body.quote ??
    body.invoice ??
    body.repairLogs ??
    body.logs ??
    body.qc ??
    body
  );
}

function getId(value) {
  if (!value) return "";
  return typeof value === "object" ? value._id : value;
}

function formatDate(value) {
  if (!value) return "Not available";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function money(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-slate-600">
        {label}
      </label>
      {children}
    </div>
  );
}

function Input({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${className}`}
    />
  );
}

function Textarea({ className = "", ...props }) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 ${className}`}
    />
  );
}

function StatusBadge({ status }) {
  const colors = {
    Accepted: "bg-blue-50 text-blue-700",
    Open: "bg-blue-50 text-blue-700",
    "In Diagnosis": "bg-violet-50 text-violet-700",
    "Diagnosis Completed": "bg-indigo-50 text-indigo-700",
    "Repair In Progress": "bg-amber-50 text-amber-700",
    "Repair Completed": "bg-emerald-50 text-emerald-700",
    "QC Passed": "bg-emerald-50 text-emerald-700",
    "QC Failed": "bg-red-50 text-red-700",
    "Ready for Handover": "bg-cyan-50 text-cyan-700",
    Completed: "bg-green-50 text-green-700",
    "Needs Review": "bg-orange-50 text-orange-700",
    "Needs More Information": "bg-yellow-50 text-yellow-700",
    Declined: "bg-red-50 text-red-700",
    "Out of Coverage": "bg-red-50 text-red-700"
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        colors[status] || "bg-slate-100 text-slate-600"
      }`}
    >
      {status || "Unknown"}
    </span>
  );
}

function SectionTitle({ title, description }) {
  return (
    <div className="mb-5">
      <h3 className="text-lg font-bold text-slate-800">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      )}
    </div>
  );
}

function RequestWorkflow({
  request,
  technicians = [],
  onClose,
  onRefresh
}) {
  const [activeTab, setActiveTab] = useState("overview");

  const [diagnosis, setDiagnosis] = useState(null);
  const [quotes, setQuotes] = useState([]);
  const [repairLogs, setRepairLogs] = useState([]);
  const [qc, setQc] = useState(null);
  const [invoice, setInvoice] = useState(null);

  const [diagnosisForm, setDiagnosisForm] = useState(initialDiagnosis);
  const [quoteForm, setQuoteForm] = useState(initialQuote);
  const [checks, setChecks] = useState(defaultChecks);
  const [overallNotes, setOverallNotes] = useState("");

  const [selectedTechnician, setSelectedTechnician] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("Unpaid");
  const [paymentMethod, setPaymentMethod] = useState("Cash");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const requestId = request?._id;

  const latestQuote = quotes[0] || null;
  const nextStatuses = transitions[request?.status] || [];

  const approvedQuote = quotes.find(
    (item) => item.status === "Approved"
  );

  const hasDiagnosis = Boolean(diagnosis?._id);

  const loadWorkflow = async () => {
    if (!requestId) return;

    setLoading(true);
    setError("");

    const results = await Promise.allSettled([
      API.get(`/diagnosis/request/${requestId}`),
      API.get("/quotes"),
      API.get(`/repair-logs/${requestId}`),
      API.get(`/qc/${requestId}`),
      API.get(`/invoices/request/${requestId}`)
    ]);

    const diagnosisResult = results[0];
    const quoteResult = results[1];
    const repairResult = results[2];
    const qcResult = results[3];
    const invoiceResult = results[4];
    console.log("INVOICE API RESPONSE:", invoiceResult.value?.data);

    if (diagnosisResult.status === "fulfilled") {
      const data = getPayload(diagnosisResult.value);
      setDiagnosis(data?._id ? data : null);

      if (data?._id) {
        setDiagnosisForm({
          problemFound: data.problemFound || "",
          rootCause: data.rootCause || "",
          diagnosisNotes: data.diagnosisNotes || "",
          recommendedSolution: data.recommendedSolution || "",
          estimatedRepairTime: data.estimatedRepairTime || "",
          partsRequired:
            data.partsRequired?.length > 0
              ? data.partsRequired
              : [{ name: "", quantity: 1 }]
        });
      }
    } else {
      setDiagnosis(null);
    }

    if (quoteResult.status === "fulfilled") {
      const data = getPayload(quoteResult.value);
      const list = Array.isArray(data)
        ? data
        : data?.quotes || [];

      const filtered = list
        .filter(
          (item) => getId(item.serviceRequest) === requestId
        )
        .sort((a, b) => (b.version || 0) - (a.version || 0));

      setQuotes(filtered);
    } else {
      setQuotes([]);
    }

    if (repairResult.status === "fulfilled") {
      const data = getPayload(repairResult.value);
      setRepairLogs(
        Array.isArray(data)
          ? data
          : data?.logs || []
      );
    } else {
      setRepairLogs([]);
    }

    if (qcResult.status === "fulfilled") {
      const data = getPayload(qcResult.value);
      setQc(data?._id ? data : null);

      if (data?._id) {
        setChecks(
          data.checks?.length ? data.checks : defaultChecks
        );
        setOverallNotes(data.overallNotes || "");
      } else {
        setChecks(defaultChecks);
        setOverallNotes("");
      }
    } else {
      setQc(null);
      setChecks(defaultChecks);
      setOverallNotes("");
    }

   if (invoiceResult.status === "fulfilled") {
  const responseData = invoiceResult.value?.data;

  const data =
    responseData?.invoice ||
    responseData?.data?.invoice ||
    responseData?.data ||
    responseData;

  setInvoice(data?._id ? data : null);

  if (data?._id) {
    setPaymentStatus(data.paymentStatus || "Unpaid");
    setPaymentMethod(data.paymentMethod || "Cash");
  }
} else {
  setInvoice(null);
}

    setLoading(false);
  };

  useEffect(() => {
    loadWorkflow();
  }, [requestId]);

  const runAction = async (action, successMessage) => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await action();

      setSuccess(successMessage);
      await loadWorkflow();

      if (onRefresh) {
        await onRefresh();
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Something went wrong. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };


const updateRequestStatus = async (status) => {
  try {
    setSaving(true);
    setError("");
    setSuccess("");

    const response = await API.patch(
      `/requests/${requestId}/status`,
      { status }
    );

    setSuccess(
      response.data?.message ||
      `Request status updated to ${status}.`
    );

    // Parent list ko background mein refresh karo
    if (onRefresh) {
      Promise.resolve(onRefresh()).catch(console.error);
    }

  } catch (err) {
    setError(
      err.response?.data?.message ||
      "Unable to update request status."
    );
  } finally {
    setSaving(false);
  }
};


  const saveDiagnosis = async (event) => {
    event.preventDefault();

    if (!diagnosisForm.problemFound.trim()) {
      setError("Please enter the problem found.");
      return;
    }

    const cleanedParts = diagnosisForm.partsRequired.filter(
      (part) => part.name?.trim()
    );

    const payload = {
      ...diagnosisForm,
      partsRequired: cleanedParts,
      ...(diagnosis ? {} : { serviceRequest: requestId })
    };

    await runAction(
      async () => {
        if (diagnosis?._id) {
          await API.put(`/diagnosis/${diagnosis._id}`, payload);
        } else {
          await API.post("/diagnosis", payload);
        }
      },
      diagnosis
        ? "Diagnosis updated successfully."
        : "Diagnosis created successfully."
    );
  };

  const uploadDiagnosisEvidence = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!diagnosis?._id) {
      setError("Save the diagnosis before uploading evidence.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be 5 MB or less.");
      event.target.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("evidence", file);

    await runAction(
      () =>
        API.post(
          `/diagnosis/request/${requestId}/evidence`,
          formData
        ),
      "Evidence uploaded successfully."
    );

    event.target.value = "";
  };

  const addDiagnosisPart = () => {
    setDiagnosisForm((previous) => ({
      ...previous,
      partsRequired: [
        ...previous.partsRequired,
        { name: "", quantity: 1 }
      ]
    }));
  };

  const updateDiagnosisPart = (index, key, value) => {
    setDiagnosisForm((previous) => ({
      ...previous,
      partsRequired: previous.partsRequired.map((part, i) =>
        i === index ? { ...part, [key]: value } : part
      )
    }));
  };

  const saveQuote = async (event) => {
    event.preventDefault();

    if (!diagnosis) {
      setError("Complete diagnosis before creating a quote.");
      return;
    }

    if (quoteForm.laborCost === "" || Number(quoteForm.laborCost) < 0) {
      setError("Enter a valid labor cost.");
      return;
    }

    const parts = quoteForm.parts
      .filter((part) => part.name.trim())
      .map((part) => ({
        ...part,
        quantity: Number(part.quantity),
        unitPrice: Number(part.unitPrice)
      }));

    await runAction(
      () =>
        API.post("/quotes", {
          ...quoteForm,
          serviceRequest: requestId,
          laborCost: Number(quoteForm.laborCost),
          additionalCharges: Number(
            quoteForm.additionalCharges || 0
          ),
          parts
        }),
      "Quote created successfully."
    );

    setQuoteForm(initialQuote);
  };

  const updateQuoteStatus = async (quoteId, status) => {
    await runAction(
      () =>
        API.patch(`/quotes/${quoteId}/status`, {
          status
        }),
      `Quote ${status.toLowerCase()} successfully.`
    );
  };

  const addQuotePart = () => {
    setQuoteForm((previous) => ({
      ...previous,
      parts: [
        ...previous.parts,
        { name: "", quantity: 1, unitPrice: "" }
      ]
    }));
  };

  const updateQuotePart = (index, key, value) => {
    setQuoteForm((previous) => ({
      ...previous,
      parts: previous.parts.map((part, i) =>
        i === index ? { ...part, [key]: value } : part
      )
    }));
  };

  const assignTechnician = async () => {
    if (!selectedTechnician) {
      setError("Please select a technician.");
      return;
    }

    await runAction(
      () =>
        API.patch(`/requests/${requestId}/assign`, {
          technicianId: selectedTechnician
        }),
      "Technician assigned successfully."
    );
  };

  const saveQC = async (event) => {
    event.preventDefault();

    if (request.status !== "Repair Completed") {
      setError("QC can only be performed after repair completion.");
      return;
    }

    if (!repairLogs.length) {
      setError("A repair log is required before QC.");
      return;
    }

    const latestRepairLog = repairLogs[0];

    await runAction(async () => {
      const response = await API.post(`/qc/${requestId}`, {
        checks,
        overallNotes
      });

      const result = getPayload(response);
      const qcResult = result?.result;

      if (!qcResult) {
        throw new Error("QC result was not returned by the server.");
      }

      await API.patch(`/requests/${requestId}/status`, {
        status: qcResult === "Passed" ? "QC Passed" : "QC Failed"
      });
    }, "Quality check submitted successfully.");
  };

  const updateCheck = (index, key, value) => {
    setChecks((previous) =>
      previous.map((check, i) =>
        i === index ? { ...check, [key]: value } : check
      )
    );
  };

  const generateInvoice = async () => {
    await runAction(
      () => API.post(`/invoices/${requestId}`),
      "Invoice generated successfully."
    );
  };

  const updatePayment = async (event) => {
    event.preventDefault();

    if (!invoice?._id) return;

    await runAction(
      () =>
        API.patch(`/invoices/${invoice._id}/payment`, {
          paymentStatus,
          paymentMethod
        }),
      "Payment information updated."
    );
  };

  const getCustomerName = () =>
    request.customer?.name || "Customer";

  const getAssetName = () => {
    const asset = request.asset;

    if (!asset) return "Asset information unavailable";

    return [
      asset.brand,
      asset.category,
      asset.model
    ]
      .filter(Boolean)
      .join(" ") || "Asset";
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <InfoCard
          label="Customer"
          value={getCustomerName()}
          icon={UserCheck}
        />
        <InfoCard
          label="Asset"
          value={getAssetName()}
          icon={Wrench}
        />
        <InfoCard
          label="Priority"
          value={request.priority || "Normal"}
          icon={AlertCircle}
        />
        <InfoCard
          label="Request Date"
          value={formatDate(request.createdAt)}
          icon={Clock3}
        />
        <InfoCard
          label="Technician"
          value={
            request.assignedTechnician?.name || "Not assigned"
          }
          icon={UserCheck}
        />
        <InfoCard
          label="Current Status"
          value={request.status}
          icon={CheckCircle2}
        />
      </div>

      <div className="rounded-2xl border border-slate-200 p-5">
        <h4 className="font-semibold text-slate-800">
          Reported Problem
        </h4>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
          {request.symptomDescription ||
            request.description ||
            "No problem description available."}
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 p-5">
        <h4 className="mb-3 font-semibold text-slate-800">
          Update Request Status
        </h4>

        {nextStatuses.length ? (
          <div className="flex flex-wrap gap-2">
            {nextStatuses.map((status) => (
              <button
                key={status}
                onClick={() => updateRequestStatus(status)}
                disabled={saving}
                className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
              >
                {status}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            No further status transition is available.
          </p>
        )}

        <p className="mt-3 text-xs text-slate-400">
          Only valid workflow transitions will be accepted by the server.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 p-5">
        <h4 className="mb-3 font-semibold text-slate-800">
          Workflow Progress
        </h4>

        <div className="space-y-3">
          {tabs.slice(1).map((tab, index) => {
            const complete = [
              hasDiagnosis,
              quotes.length > 0,
              Boolean(request.assignedTechnician),
              repairLogs.length > 0,
              Boolean(qc),
              Boolean(invoice)
            ][index];

            return (
              <div
                key={tab.id}
                className="flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      complete
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {complete ? (
                      <CheckCircle2 size={17} />
                    ) : (
                      <span className="text-xs font-semibold">
                        {index + 1}
                      </span>
                    )}
                  </span>
                  <span className="text-sm font-medium text-slate-700">
                    {tab.label}
                  </span>
                </div>

                <span
                  className={`text-xs font-semibold ${
                    complete ? "text-emerald-600" : "text-slate-400"
                  }`}
                >
                  {complete ? "Available" : "Pending"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderDiagnosis = () => (
    <div>
      <SectionTitle
        title="Diagnosis Details"
        description="Record the problem, root cause and recommended solution."
      />

      {diagnosis && (
        <div className="mb-5 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">
          Existing diagnosis found. You can update its details.
        </div>
      )}

      <form onSubmit={saveDiagnosis} className="space-y-4">
        <Field label="Problem Found *">
          <Textarea
            rows={3}
            value={diagnosisForm.problemFound}
            onChange={(e) =>
              setDiagnosisForm({
                ...diagnosisForm,
                problemFound: e.target.value
              })
            }
            placeholder="Describe the problem found during inspection"
            required
          />
        </Field>

        <Field label="Root Cause">
          <Textarea
            rows={2}
            value={diagnosisForm.rootCause}
            onChange={(e) =>
              setDiagnosisForm({
                ...diagnosisForm,
                rootCause: e.target.value
              })
            }
            placeholder="What caused the issue?"
          />
        </Field>

        <Field label="Diagnosis Notes">
          <Textarea
            rows={3}
            value={diagnosisForm.diagnosisNotes}
            onChange={(e) =>
              setDiagnosisForm({
                ...diagnosisForm,
                diagnosisNotes: e.target.value
              })
            }
            placeholder="Additional inspection notes"
          />
        </Field>

        <Field label="Recommended Solution">
          <Textarea
            rows={2}
            value={diagnosisForm.recommendedSolution}
            onChange={(e) =>
              setDiagnosisForm({
                ...diagnosisForm,
                recommendedSolution: e.target.value
              })
            }
            placeholder="Recommended repair or solution"
          />
        </Field>

        <Field label="Estimated Repair Time">
          <Input
            value={diagnosisForm.estimatedRepairTime}
            onChange={(e) =>
              setDiagnosisForm({
                ...diagnosisForm,
                estimatedRepairTime: e.target.value
              })
            }
            placeholder="Example: 2 days"
          />
        </Field>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-700">
              Parts Required
            </label>
            <button
              type="button"
              onClick={addDiagnosisPart}
              className="flex items-center gap-1 text-sm font-semibold text-blue-600"
            >
              <Plus size={15} /> Add Part
            </button>
          </div>

          {diagnosisForm.partsRequired.map((part, index) => (
            <div
              key={index}
              className="mb-2 grid grid-cols-2 gap-2"
            >
              <Input
                value={part.name}
                onChange={(e) =>
                  updateDiagnosisPart(index, "name", e.target.value)
                }
                placeholder="Part name"
              />
              <Input
                type="number"
                min="1"
                value={part.quantity}
                onChange={(e) =>
                  updateDiagnosisPart(
                    index,
                    "quantity",
                    Number(e.target.value)
                  )
                }
                placeholder="Quantity"
              />
            </div>
          ))}
        </div>

        <Field label="Upload Diagnosis Evidence (Optional, max 5 MB)">
          <Input
            type="file"
            accept="image/*,.pdf"
            onChange={uploadDiagnosisEvidence}
          />
        </Field>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          <Save size={16} />
          {diagnosis ? "Update Diagnosis" : "Save Diagnosis"}
        </button>
      </form>

      {diagnosis && request.status === "In Diagnosis" && (
        <div className="mt-6 border-t border-slate-200 pt-5">
          <button
            onClick={() =>
              updateRequestStatus("Diagnosis Completed")
            }
            disabled={saving}
            className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            Mark Diagnosis Completed
          </button>
        </div>
      )}
    </div>
  );

  const renderQuote = () => (
    <div className="space-y-6">
      <SectionTitle
        title="Service Quote"
        description="Create a quote after diagnosis and manage its approval."
      />

      {quotes.map((quote) => (
        <div
          key={quote._id}
          className="rounded-2xl border border-slate-200 p-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-slate-800">
                Quote Version {quote.version || 1}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Created {formatDate(quote.createdAt)}
              </p>
            </div>
            <StatusBadge status={quote.status} />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-slate-500">Labor Cost</p>
              <p className="font-semibold">
                {money(quote.laborCost)}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Additional Charges</p>
              <p className="font-semibold">
                {money(quote.additionalCharges)}
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {quote.status === "Draft" && (
              <button
                onClick={() =>
                  updateQuoteStatus(quote._id, "Sent")
                }
                disabled={saving}
                className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white"
              >
                Send Quote
              </button>
            )}

            {quote.status === "Sent" && (
              <>
                <button
                  onClick={() =>
                    updateQuoteStatus(quote._id, "Approved")
                  }
                  disabled={saving}
                  className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white"
                >
                  Mark Approved
                </button>
                <button
                  onClick={() =>
                    updateQuoteStatus(quote._id, "Rejected")
                  }
                  disabled={saving}
                  className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white"
                >
                  Mark Rejected
                </button>
              </>
            )}
          </div>
        </div>
      ))}

      {request.status === "Diagnosis Completed" && !approvedQuote && (
        <form
          onSubmit={saveQuote}
          className="space-y-4 rounded-2xl border border-slate-200 p-5"
        >
          <h4 className="font-semibold text-slate-800">
            Create New Quote
          </h4>

          <Field label="Labor Cost (₹) *">
            <Input
              type="number"
              min="0"
              value={quoteForm.laborCost}
              onChange={(e) =>
                setQuoteForm({
                  ...quoteForm,
                  laborCost: e.target.value
                })
              }
              required
            />
          </Field>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-700">
                Parts
              </label>
              <button
                type="button"
                onClick={addQuotePart}
                className="text-sm font-semibold text-blue-600"
              >
                + Add Part
              </button>
            </div>

            {quoteForm.parts.map((part, index) => (
              <div
                key={index}
                className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-3"
              >
                <Input
                  value={part.name}
                  onChange={(e) =>
                    updateQuotePart(index, "name", e.target.value)
                  }
                  placeholder="Part name"
                />
                <Input
                  type="number"
                  min="1"
                  value={part.quantity}
                  onChange={(e) =>
                    updateQuotePart(
                      index,
                      "quantity",
                      e.target.value
                    )
                  }
                  placeholder="Quantity"
                />
                <Input
                  type="number"
                  min="0"
                  value={part.unitPrice}
                  onChange={(e) =>
                    updateQuotePart(
                      index,
                      "unitPrice",
                      e.target.value
                    )
                  }
                  placeholder="Unit price"
                />
              </div>
            ))}
          </div>

          <Field label="Additional Charges (₹)">
            <Input
              type="number"
              min="0"
              value={quoteForm.additionalCharges}
              onChange={(e) =>
                setQuoteForm({
                  ...quoteForm,
                  additionalCharges: e.target.value
                })
              }
            />
          </Field>

          <Field label="Estimated Completion">
            <Input
              type="date"
              value={quoteForm.estimatedCompletion}
              onChange={(e) =>
                setQuoteForm({
                  ...quoteForm,
                  estimatedCompletion: e.target.value
                })
              }
            />
          </Field>

          <Field label="Terms and Conditions">
            <Textarea
              rows={3}
              value={quoteForm.terms}
              onChange={(e) =>
                setQuoteForm({
                  ...quoteForm,
                  terms: e.target.value
                })
              }
            />
          </Field>

          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Create Quote
          </button>
        </form>
      )}

      {approvedQuote && (
        <div className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700">
          An approved quote is available. Technician assignment can proceed.
        </div>
      )}

      {!quotes.length && request.status !== "Diagnosis Completed" && (
        <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
          Complete diagnosis before creating a quote.
        </p>
      )}
    </div>
  );

  const renderTechnician = () => (
    <div>
      <SectionTitle
        title="Technician Assignment"
        description="Assign a technician after quote approval."
      />

      {request.assignedTechnician ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <UserCheck size={20} />
            </div>
            <div>
              <p className="font-semibold text-slate-800">
                {request.assignedTechnician.name}
              </p>
              <p className="text-sm text-slate-500">
                {request.assignedTechnician.email || ""}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-xl space-y-4">
          {!approvedQuote ? (
            <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-700">
              An approved quote is required before assigning a technician.
            </p>
          ) : (
            <>
              <Field label="Select Technician">
                <select
                  value={selectedTechnician}
                  onChange={(e) =>
                    setSelectedTechnician(e.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-blue-500"
                >
                  <option value="">Choose technician</option>
                  {technicians.map((technician) => (
                    <option
                      key={technician._id}
                      value={technician._id}
                    >
                      {technician.name}
                    </option>
                  ))}
                </select>
              </Field>

              <button
                onClick={assignTechnician}
                disabled={saving || !selectedTechnician}
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                Assign Technician
              </button>
            </>
          )}
        </div>
      )}

      {request.status === "Diagnosis Completed" &&
        request.assignedTechnician && (
          <div className="mt-6 border-t border-slate-200 pt-5">
            <p className="mb-3 text-sm text-slate-600">
              The approved quote and technician are ready.
            </p>
            <button
              onClick={() =>
                updateRequestStatus("Repair In Progress")
              }
              disabled={saving}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white"
            >
              Start Repair
            </button>
          </div>
        )}
    </div>
  );

  const renderRepair = () => (
    <div>
      <SectionTitle
        title="Repair History"
        description="Admin can view repair logs submitted by the assigned technician."
      />

      {repairLogs.length ? (
        <div className="space-y-4">
          {repairLogs.map((log) => (
            <div
              key={log._id}
              className="rounded-2xl border border-slate-200 p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-slate-800">
                  {log.technician?.name || "Technician"}
                </p>
                <span className="text-xs text-slate-500">
                  {formatDate(log.createdAt)}
                </span>
              </div>

              <div className="mt-4">
                <p className="text-xs font-semibold uppercase text-slate-400">
                  Work Performed
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
                  {log.workPerformed}
                </p>
              </div>

              {log.technicianNotes && (
                <div className="mt-3">
                  <p className="text-xs font-semibold uppercase text-slate-400">
                    Technician Notes
                  </p>
                  <p className="mt-1 text-sm text-slate-700">
                    {log.technicianNotes}
                  </p>
                </div>
              )}

              <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-500">
                <span>
                  Time spent: {log.timeSpent || 0}
                </span>
              </div>

              {log.partsUsed?.length > 0 && (
                <div className="mt-4">
                  <p className="mb-2 text-xs font-semibold uppercase text-slate-400">
                    Parts Used
                  </p>
                  {log.partsUsed.map((part, index) => (
                    <p key={index} className="text-sm text-slate-600">
                      {part.name} — Qty: {part.quantity} —{" "}
                      {money(part.unitCost)}
                    </p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl bg-slate-50 p-6 text-center">
          <Wrench className="mx-auto mb-2 text-slate-400" size={26} />
          <p className="text-sm text-slate-600">
            No repair logs have been submitted yet.
          </p>
        </div>
      )}

      {request.status === "Repair In Progress" && repairLogs.length > 0 && (
        <div className="mt-6 border-t border-slate-200 pt-5">
          <p className="mb-3 text-sm text-slate-600">
            Review the technician's latest repair log before completing the repair.
          </p>
          <button
            onClick={() =>
              updateRequestStatus("Repair Completed")
            }
            disabled={saving}
            className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white"
          >
            Mark Repair Completed
          </button>
        </div>
      )}

      {request.status === "QC Failed" && (
        <div className="mt-6 border-t border-slate-200 pt-5">
          <p className="mb-3 text-sm text-amber-700">
            QC failed. Move the request back to repair so the technician can rework it.
          </p>
          <button
            onClick={() =>
              updateRequestStatus("Repair In Progress")
            }
            disabled={saving}
            className="rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white"
          >
            Send Back for Rework
          </button>
        </div>
      )}
    </div>
  );

  const renderQC = () => (
    <div>
      <SectionTitle
        title="Quality Control"
        description="Check the repaired equipment before handover."
      />

      {qc && (
        <div className="mb-5 rounded-xl bg-slate-50 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="font-semibold text-slate-800">
              Latest QC Result
            </p>
            <StatusBadge
              status={qc.result === "Passed" ? "QC Passed" : "QC Failed"}
            />
          </div>
          {qc.overallNotes && (
            <p className="mt-3 text-sm text-slate-600">
              {qc.overallNotes}
            </p>
          )}
        </div>
      )}

      {request.status === "Repair Completed" ? (
        <form onSubmit={saveQC} className="space-y-4">
          <div className="space-y-3">
            {checks.map((check, index) => (
              <div
                key={index}
                className="rounded-xl border border-slate-200 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-medium text-slate-700">
                    {check.item}
                  </p>

                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={Boolean(check.passed)}
                      onChange={(e) =>
                        updateCheck(index, "passed", e.target.checked)
                      }
                      className="h-4 w-4 accent-blue-600"
                    />
                    Passed
                  </label>
                </div>

                <Input
                  className="mt-3"
                  value={check.remarks || ""}
                  onChange={(e) =>
                    updateCheck(index, "remarks", e.target.value)
                  }
                  placeholder="Remarks (optional)"
                />
              </div>
            ))}
          </div>

          <Field label="Overall Notes">
            <Textarea
              rows={3}
              value={overallNotes}
              onChange={(e) => setOverallNotes(e.target.value)}
              placeholder="Add overall QC observations"
            />
          </Field>

          <button
            type="submit"
            disabled={saving || !repairLogs.length}
            className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            Submit Quality Check
          </button>
        </form>
      ) : (
        <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
          Quality Check becomes available after the repair is marked completed.
        </p>
      )}

      {request.status === "QC Passed" && (
        <div className="mt-5 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700">
          Quality Check passed. The request can now be prepared for handover.
          <button
            onClick={() =>
              updateRequestStatus("Ready for Handover")
            }
            disabled={saving}
            className="mt-3 block rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white"
          >
            Mark Ready for Handover
          </button>
        </div>
      )}
    </div>
  );

  const renderInvoice = () => (
    <div>
      <SectionTitle
        title="Invoice & Handover"
        description="Generate the invoice and update payment information."
      />

      {!invoice ? (
        <div className="rounded-2xl border border-slate-200 p-5">
          <Receipt className="mb-3 text-slate-400" size={30} />

          {request.status === "Ready for Handover" ? (
            <>
              <p className="mb-4 text-sm text-slate-600">
                The request is ready for handover. Generate its invoice.
              </p>
              <button
                onClick={generateInvoice}
                disabled={saving}
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                Generate Invoice
              </button>
            </>
          ) : (
            <p className="text-sm text-slate-500">
              Invoice generation is available after QC passes and the request is marked Ready for Handover.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-200 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-slate-500">Invoice</p>
                <h4 className="text-lg font-bold text-slate-800">
                  {invoice.invoiceNumber || invoice._id}
                </h4>
              </div>
              <Receipt className="text-blue-600" size={28} />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500">Total Amount</p>
                <p className="mt-1 text-xl font-bold text-slate-800">
                  {money(invoice.totalAmount)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Payment Status</p>
                <p className="mt-1 font-semibold text-slate-800">
                  {invoice.paymentStatus || "Unpaid"}
                </p>
              </div>
            </div>
          </div>

          <form
            onSubmit={updatePayment}
            className="rounded-2xl border border-slate-200 p-5"
          >
            <h4 className="mb-4 font-semibold text-slate-800">
              Update Payment
            </h4>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Payment Status">
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                >
                  <option value="Unpaid">Unpaid</option>
                  <option value="Partially Paid">Partially Paid</option>
                  <option value="Paid">Paid</option>
                </select>
              </Field>

              <Field label="Payment Method">
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Card">Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Other">Other</option>
                </select>
              </Field>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="mt-4 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              Update Payment
            </button>
          </form>

          {request.status === "Ready for Handover" && (
            <div className="rounded-xl bg-emerald-50 p-4">
              <p className="text-sm text-emerald-700">
                When the handover is complete, mark this request as completed.
              </p>
              <button
                onClick={() => updateRequestStatus("Completed")}
                disabled={saving}
                className="mt-3 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
              >
                Mark Request Completed
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview();
      case "diagnosis":
        return renderDiagnosis();
      case "quote":
        return renderQuote();
      case "technician":
        return renderTechnician();
      case "repair":
        return renderRepair();
      case "qc":
        return renderQC();
      case "invoice":
        return renderInvoice();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-2 backdrop-blur-sm sm:p-5">
      <div className="flex max-h-[95vh] w-full max-w-7xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-7">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-xl font-bold text-slate-800">
                Request Details
              </h2>
              <StatusBadge status={request.status} />
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Request ID: {request._id}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={loadWorkflow}
              disabled={loading}
              title="Refresh workflow"
              className="rounded-xl border border-slate-200 p-2.5 text-slate-500 hover:bg-slate-50"
            >
              <RefreshCw
                size={18}
                className={loading ? "animate-spin" : ""}
              />
            </button>

            <button
              onClick={onClose}
              className="rounded-xl border border-slate-200 p-2.5 text-slate-500 hover:bg-slate-50"
            >
              <X size={19} />
            </button>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          <aside className="border-b border-slate-200 bg-slate-50 md:w-56 md:shrink-0 md:border-b-0 md:border-r">
            <nav className="flex gap-1 overflow-x-auto p-2 md:flex-col md:p-3">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setError("");
                      setSuccess("");
                    }}
                    className={`flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition md:w-full ${
                      active
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-600 hover:bg-white hover:text-slate-900"
                    }`}
                  >
                    <Icon size={17} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          <main className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-7">
            {error && (
              <div className="mb-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle className="mt-0.5 shrink-0" size={17} />
                {error}
              </div>
            )}

            {success && (
              <div className="mb-5 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                <CheckCircle2 className="mt-0.5 shrink-0" size={17} />
                {success}
              </div>
            )}

            {loading ? (
              <div className="flex min-h-64 items-center justify-center">
                <div className="text-center">
                  <RefreshCw
                    className="mx-auto animate-spin text-blue-600"
                    size={28}
                  />
                  <p className="mt-3 text-sm text-slate-500">
                    Loading request workflow...
                  </p>
                </div>
              </div>
            ) : (
              renderActiveTab()
            )}
          </main>
        </div>

        {saving && (
          <div className="border-t border-slate-100 bg-slate-50 px-5 py-2 text-xs text-slate-500">
            Saving changes...
          </div>
        )}
      </div>
    </div>
  );
}

function InfoCard({ label, value, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <div className="flex items-center gap-2 text-slate-400">
        <Icon size={16} />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="mt-2 break-words text-sm font-semibold text-slate-800">
        {value || "Not available"}
      </p>
    </div>
  );
}

export default RequestWorkflow;
