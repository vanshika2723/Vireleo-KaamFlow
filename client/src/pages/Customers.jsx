
import { useState } from "react";
import {
  Users,
  Search,
  Plus,
  Mail,
  Phone,
  MoreHorizontal,
  UserRound,
  ArrowUpRight
} from "lucide-react";

const customers = [
  {
    id: "CUS-001",
    name: "Aarav Sharma",
    email: "aarav@example.com",
    phone: "+91 98765 43210",
    location: "Jaipur",
    requests: 8,
    status: "Active"
  },
  {
    id: "CUS-002",
    name: "Priya Verma",
    email: "priya@example.com",
    phone: "+91 98765 12345",
    location: "Alwar",
    requests: 5,
    status: "Active"
  },
  {
    id: "CUS-003",
    name: "Rahul Mehta",
    email: "rahul@example.com",
    phone: "+91 91234 56780",
    location: "Delhi",
    requests: 3,
    status: "Active"
  },
  {
    id: "CUS-004",
    name: "Sneha Gupta",
    email: "sneha@example.com",
    phone: "+91 99887 76655",
    location: "Gurugram",
    requests: 2,
    status: "Inactive"
  }
];

function Customers() {
  const [search, setSearch] = useState("");

  const filteredCustomers = customers.filter((customer) =>
    `${customer.name} ${customer.email} ${customer.phone}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-semibold text-slate-400">
            OVERVIEW / CUSTOMERS
          </p>
          <h1 className="mt-2 text-2xl font-extrabold text-slate-800">
            Customers
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage customer profiles and service history.
          </p>
        </div>

        <button className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700">
          <Plus size={18} />
          Add Customer
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Customers</span>
            <span className="rounded-xl bg-violet-50 p-3 text-violet-600">
              <Users size={20} />
            </span>
          </div>
          <h2 className="mt-4 text-3xl font-extrabold text-slate-800">248</h2>
          <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-emerald-600">
            <ArrowUpRight size={14} /> Customer records
          </p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Active Customers</span>
            <span className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
              <UserRound size={20} />
            </span>
          </div>
          <h2 className="mt-4 text-3xl font-extrabold text-slate-800">216</h2>
          <p className="mt-2 text-xs text-slate-400">Currently active profiles</p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:col-span-2 xl:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">New This Month</span>
            <span className="rounded-xl bg-orange-50 p-3 text-orange-600">
              <Plus size={20} />
            </span>
          </div>
          <h2 className="mt-4 text-3xl font-extrabold text-slate-800">32</h2>
          <p className="mt-2 text-xs text-slate-400">Recently added customers</p>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-bold text-slate-800">Customer Directory</h2>
            <p className="mt-1 text-xs text-slate-400">
              View and manage registered customers
            </p>
          </div>

          <div className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 sm:w-72">
            <Search size={17} className="text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customers..."
              className="w-full bg-transparent text-xs outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead className="bg-slate-50">
              <tr className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Requests</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="transition hover:bg-slate-50/70">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-50 text-sm font-bold text-violet-600">
                        {customer.name.split(" ").map((word) => word[0]).join("")}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-700">{customer.name}</p>
                        <p className="mt-1 text-[10px] text-slate-400">{customer.id}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <p className="flex items-center gap-2 text-xs text-slate-600">
                      <Mail size={13} className="text-slate-400" />
                      {customer.email}
                    </p>
                    <p className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                      <Phone size={13} className="text-slate-400" />
                      {customer.phone}
                    </p>
                  </td>

                  <td className="px-6 py-4 text-xs text-slate-600">
                    {customer.location}
                  </td>

                  <td className="px-6 py-4">
                    <span className="rounded-lg bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-700">
                      {customer.requests}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span className={`rounded-full px-3 py-1.5 text-[10px] font-bold ${
                      customer.status === "Active"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-slate-100 text-slate-500"
                    }`}>
                      {customer.status}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <button
                      aria-label={`More actions for ${customer.name}`}
                      className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-violet-600"
                    >
                      <MoreHorizontal size={19} />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-sm text-slate-400">
                    No customers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-100 px-6 py-4 text-xs text-slate-400">
          Showing {filteredCustomers.length} of {customers.length} customers
        </div>
      </section>
    </div>
  );
}

export default Customers;
