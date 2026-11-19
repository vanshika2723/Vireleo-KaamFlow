
import { useEffect, useMemo, useState } from "react";
import {
  Receipt,
  Search,
  Download,
  Eye,
  IndianRupee,
  CheckCircle2,
  Clock3,
  AlertCircle,
  RefreshCw,
  X,
  CreditCard
} from "lucide-react";
import API from "../services/api";

const paymentStyles = {
  Paid: "bg-emerald-50 text-emerald-700",
  Unpaid: "bg-rose-50 text-rose-700",
  "Partially Paid": "bg-amber-50 text-amber-700"
};

function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState("Unpaid");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [saving, setSaving] = useState(false);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/invoices");

      setInvoices(response.data.invoices || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load invoices."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const filteredInvoices = useMemo(() => {
    const term = search.toLowerCase();

    return invoices.filter((invoice) => {
      const customerName =
        invoice.customer?.name || "";

      const requestNumber =
        invoice.serviceRequest?.requestId || "";

      return (
        (invoice.invoiceNumber || "").toLowerCase().includes(term) ||
        customerName.toLowerCase().includes(term) ||
        requestNumber.toLowerCase().includes(term)
      );
    });
  }, [invoices, search]);

  const total = invoices.reduce(
    (sum, item) => sum + Number(item.totalAmount || 0),
    0
  );

  const paid = invoices
    .filter((item) => item.paymentStatus === "Paid")
    .reduce((sum, item) => sum + Number(item.totalAmount || 0), 0);

  const pending = total - paid;

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const exportInvoices = () => {
    if (!filteredInvoices.length) {
      alert("No invoices available to export.");
      return;
    }

    const rows = [
      [
        "Invoice Number",
        "Customer",
        "Request ID",
        "Amount",
        "Payment Status",
        "Payment Method",
        "Date"
      ],
      ...filteredInvoices.map((invoice) => [
        invoice.invoiceNumber,
        invoice.customer?.name || "",
        invoice.serviceRequest?.requestId || "",
        invoice.totalAmount || 0,
        invoice.paymentStatus || "Unpaid",
        invoice.paymentMethod || "",
        formatDate(invoice.createdAt)
      ])
    ];

    const csv = rows
      .map((row) =>
        row
          .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "KAAMFLOW-Invoices.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  const openInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setPaymentStatus(invoice.paymentStatus || "Unpaid");
    setPaymentMethod(invoice.paymentMethod || "Cash");
  };

  const updatePayment = async () => {
    try {
      setSaving(true);

      await API.patch(
        `/invoices/${selectedInvoice._id}/payment`,
        {
          paymentStatus,
          paymentMethod
        }
      );

      alert("Payment status updated successfully.");

      setSelectedInvoice(null);
      await fetchInvoices();
    } catch (err) {
      alert(
        err.response?.data?.message ||
        "Unable to update payment status."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 p-5 md:p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Invoices
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage real repair bills and payment records
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={fetchInvoices}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            <RefreshCw size={17} />
            Refresh
          </button>

          <button
            onClick={exportInvoices}
            className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-violet-700"
          >
            <Download size={17} />
            Export Invoices
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-100 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Total Invoices</p>
            <Receipt className="text-violet-600" size={21} />
          </div>
          <h2 className="mt-3 text-2xl font-bold text-slate-800">
            {invoices.length}
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Real generated invoices
          </p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Total Revenue</p>
            <IndianRupee className="text-blue-600" size={21} />
          </div>
          <h2 className="mt-3 text-2xl font-bold text-slate-800">
            ₹{total.toLocaleString("en-IN")}
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Total invoice value
          </p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Collected</p>
            <CheckCircle2 className="text-emerald-600" size={21} />
          </div>
          <h2 className="mt-3 text-2xl font-bold text-slate-800">
            ₹{paid.toLocaleString("en-IN")}
          </h2>
          <p className="mt-1 text-xs text-emerald-600">
            Fully paid invoices
          </p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Pending Amount</p>
            <Clock3 className="text-amber-600" size={21} />
          </div>
          <h2 className="mt-3 text-2xl font-bold text-slate-800">
            ₹{pending.toLocaleString("en-IN")}
          </h2>
          <p className="mt-1 text-xs text-amber-600">
            Awaiting payment
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-5">
        <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-bold text-slate-800">
              Invoice Records
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Recent real billing transactions
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search invoices..."
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-violet-400"
            />
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center text-sm text-slate-500">
            Loading invoices...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-4 py-4 font-semibold">Invoice ID</th>
                  <th className="px-4 py-4 font-semibold">Customer</th>
                  <th className="px-4 py-4 font-semibold">Request</th>
                  <th className="px-4 py-4 font-semibold">Amount</th>
                  <th className="px-4 py-4 font-semibold">Date</th>
                  <th className="px-4 py-4 font-semibold">Payment</th>
                  <th className="px-4 py-4 font-semibold">Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredInvoices.map((invoice) => (
                  <tr
                    key={invoice._id}
                    className="border-b border-slate-50 last:border-0 hover:bg-slate-50/70"
                  >
                    <td className="px-4 py-4 text-sm font-semibold text-violet-700">
                      {invoice.invoiceNumber}
                    </td>

                    <td className="px-4 py-4 text-sm font-medium text-slate-700">
                      {invoice.customer?.name || "Unknown"}
                    </td>

                    <td className="px-4 py-4 text-sm text-slate-500">
                      {invoice.serviceRequest?.requestId || "—"}
                    </td>

                    <td className="px-4 py-4 text-sm font-semibold text-slate-800">
                      ₹{Number(invoice.totalAmount || 0).toLocaleString("en-IN")}
                    </td>

                    <td className="px-4 py-4 text-sm text-slate-500">
                      {formatDate(invoice.createdAt)}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                          paymentStyles[invoice.paymentStatus] ||
                          paymentStyles.Unpaid
                        }`}
                      >
                        {invoice.paymentStatus || "Unpaid"}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <button
                        onClick={() => openInvoice(invoice)}
                        title="View invoice"
                        className="rounded-lg p-2 text-slate-500 hover:bg-violet-50 hover:text-violet-600"
                      >
                        <Eye size={17} />
                      </button>
                    </td>
                  </tr>
                ))}

                {!filteredInvoices.length && (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-4 py-12 text-center text-sm text-slate-500"
                    >
                      {search
                        ? "No matching invoices found."
                        : "No invoices found. Generate an invoice after QC Passed."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
          <AlertCircle size={14} />
          Invoice records are loaded from your authenticated backend API.
        </div>
      </div>

      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Invoice Details
                </h2>
                <p className="text-sm text-slate-500">
                  {selectedInvoice.invoiceNumber}
                </p>
              </div>

              <button
                onClick={() => setSelectedInvoice(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 rounded-xl bg-slate-50 p-4 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-slate-500">Customer</span>
                <span className="font-semibold text-slate-800">
                  {selectedInvoice.customer?.name || "Unknown"}
                </span>
              </div>

              <div className="flex justify-between gap-3">
                <span className="text-slate-500">Request ID</span>
                <span className="font-semibold text-slate-800">
                  {selectedInvoice.serviceRequest?.requestId || "—"}
                </span>
              </div>

              <div className="flex justify-between gap-3">
                <span className="text-slate-500">Labour Cost</span>
                <span className="font-semibold text-slate-800">
                  ₹{Number(selectedInvoice.laborCost || 0).toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex justify-between gap-3">
                <span className="text-slate-500">Parts Cost</span>
                <span className="font-semibold text-slate-800">
                  ₹{Number(selectedInvoice.partsCost || 0).toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex justify-between gap-3">
                <span className="text-slate-500">Additional Charges</span>
                <span className="font-semibold text-slate-800">
                  ₹{Number(selectedInvoice.additionalCharges || 0).toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex justify-between border-t border-slate-200 pt-3">
                <span className="font-bold text-slate-700">Total Amount</span>
                <span className="font-bold text-violet-700">
                  ₹{Number(selectedInvoice.totalAmount || 0).toLocaleString("en-IN")}
                </span>
              </div>

              {selectedInvoice.notes && (
                <p className="border-t border-slate-200 pt-3 text-slate-600">
                  Notes: {selectedInvoice.notes}
                </p>
              )}
            </div>

            <div className="mt-5 space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Payment Status
                </label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-violet-400"
                >
                  <option value="Unpaid">Unpaid</option>
                  <option value="Partially Paid">Partially Paid</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-violet-400"
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="Card">Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setSelectedInvoice(null)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>

              <button
                onClick={updatePayment}
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
              >
                <CreditCard size={16} />
                {saving ? "Saving..." : "Update Payment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Invoices;
