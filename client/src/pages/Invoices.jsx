
import {
  Receipt,
  Search,
  Download,
  Eye,
  IndianRupee,
  CheckCircle2,
  Clock3,
  AlertCircle
} from "lucide-react";

const invoices = [
  {
    id: "INV-2026-001",
    customer: "Rahul Sharma",
    service: "Washing Machine Repair",
    amount: 2450,
    date: "18 Nov 2026",
    payment: "Paid"
  },
  {
    id: "INV-2026-002",
    customer: "Priya Verma",
    service: "Microwave Repair",
    amount: 1800,
    date: "17 Nov 2026",
    payment: "Unpaid"
  },
  {
    id: "INV-2026-003",
    customer: "Amit Gupta",
    service: "Refrigerator Repair",
    amount: 3200,
    date: "16 Nov 2026",
    payment: "Partially Paid"
  },
  {
    id: "INV-2026-004",
    customer: "Neha Singh",
    service: "Air Conditioner Repair",
    amount: 4500,
    date: "15 Nov 2026",
    payment: "Paid"
  }
];

const paymentStyles = {
  Paid: "bg-emerald-50 text-emerald-700",
  Unpaid: "bg-rose-50 text-rose-700",
  "Partially Paid": "bg-amber-50 text-amber-700"
};

function Invoices() {
  const total = invoices.reduce((sum, item) => sum + item.amount, 0);
  const paid = invoices
    .filter((item) => item.payment === "Paid")
    .reduce((sum, item) => sum + item.amount, 0);
  const pending = invoices
    .filter((item) => item.payment !== "Paid")
    .reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="space-y-6 p-5 md:p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Invoices</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage repair bills and payment records
          </p>
        </div>

        <button className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-violet-700">
          <Download size={17} />
          Export Invoices
        </button>
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
          <p className="mt-1 text-xs text-slate-400">Generated invoices</p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Total Revenue</p>
            <IndianRupee className="text-blue-600" size={21} />
          </div>
          <h2 className="mt-3 text-2xl font-bold text-slate-800">
            ₹{total.toLocaleString("en-IN")}
          </h2>
          <p className="mt-1 text-xs text-slate-400">Invoice value</p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Collected</p>
            <CheckCircle2 className="text-emerald-600" size={21} />
          </div>
          <h2 className="mt-3 text-2xl font-bold text-slate-800">
            ₹{paid.toLocaleString("en-IN")}
          </h2>
          <p className="mt-1 text-xs text-emerald-600">Fully paid invoices</p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Pending Amount</p>
            <Clock3 className="text-amber-600" size={21} />
          </div>
          <h2 className="mt-3 text-2xl font-bold text-slate-800">
            ₹{pending.toLocaleString("en-IN")}
          </h2>
          <p className="mt-1 text-xs text-amber-600">Awaiting payment</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-5">
        <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-bold text-slate-800">Invoice Records</h2>
            <p className="mt-1 text-sm text-slate-500">
              Recent billing transactions
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search invoices..."
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-violet-400"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px] text-left">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                <th className="px-4 py-4 font-semibold">Invoice ID</th>
                <th className="px-4 py-4 font-semibold">Customer</th>
                <th className="px-4 py-4 font-semibold">Service</th>
                <th className="px-4 py-4 font-semibold">Amount</th>
                <th className="px-4 py-4 font-semibold">Date</th>
                <th className="px-4 py-4 font-semibold">Payment</th>
                <th className="px-4 py-4 font-semibold">Action</th>
              </tr>
            </thead>

            <tbody>
              {invoices.map((invoice) => (
                <tr
                  key={invoice.id}
                  className="border-b border-slate-50 last:border-0 hover:bg-slate-50/70"
                >
                  <td className="px-4 py-4 text-sm font-semibold text-violet-700">
                    {invoice.id}
                  </td>
                  <td className="px-4 py-4 text-sm font-medium text-slate-700">
                    {invoice.customer}
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-500">
                    {invoice.service}
                  </td>
                  <td className="px-4 py-4 text-sm font-semibold text-slate-800">
                    ₹{invoice.amount.toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-500">
                    {invoice.date}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold ${paymentStyles[invoice.payment]}`}
                    >
                      {invoice.payment}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <button
                      title="View invoice"
                      className="rounded-lg p-2 text-slate-500 hover:bg-violet-50 hover:text-violet-600"
                    >
                      <Eye size={17} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
          <AlertCircle size={14} />
          Sample invoice data — backend integration will be done later.
        </div>
      </div>
    </div>
  );
}

export default Invoices;
