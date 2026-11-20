
import { useEffect, useState } from "react";
import {
  Users,
  Search,
  Plus,
  Mail,
  Phone,
  MoreHorizontal,
  UserRound,
  ArrowUpRight,
  X,
  MapPin,
  UserPlus,
  Loader2
} from "lucide-react";
import API from "../services/api";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  address: "",
  city: ""
};

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async (showLoader = true) => {
    try {
     if (showLoader) {
  setLoading(true);
}
      setError("");

      const response = await API.get("/customers");
      const result = response.data;

      const records =
        Array.isArray(result) ? result :
        Array.isArray(result.customers) ? result.customers :
        Array.isArray(result.data) ? result.data :
        Array.isArray(result.data?.customers) ? result.data.customers : [];

      setCustomers(records);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load customers. Please check your login and backend connection."
      );
    } finally {
   if (showLoader) {
  setLoading(false);
}
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    setFormError("");
    setSuccessMessage("");

    if (!formData.name.trim() || !formData.phone.trim()) {
      setFormError("Customer name and phone number are required.");
      return;
    }

    try {
      setSaving(true);

      const response = await API.post("/customers", {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        city: formData.city.trim()
      });

      if (response.data.success) {
        setFormData(initialForm);
        setShowForm(false);
        setSuccessMessage("Customer added successfully!");
      fetchCustomers(false);
      }
    } catch (err) {
      setFormError(
        err.response?.data?.message ||
        "Unable to add customer. Please check your connection and try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const filteredCustomers = customers.filter((customer) =>
    `${customer.name || ""} ${customer.email || ""} ${customer.phone || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const activeCount = customers.filter(
    (customer) => customer.isActive !== false
  ).length;

  const newThisMonth = customers.filter((customer) => {
    if (!customer.createdAt) return false;

    const date = new Date(customer.createdAt);
    const now = new Date();

    return (
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  }).length;

  const getCustomerId = (customer) =>
    customer.customerId || customer._id;

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

        <button
          type="button"
          onClick={() => {
            setFormData(initialForm);
            setFormError("");
            setShowForm(true);
          }}
          className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700"
        >
          <Plus size={18} />
          Add Customer
        </button>
      </div>

      {successMessage && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          {successMessage}
          <button
            type="button"
            onClick={() => setSuccessMessage("")}
            aria-label="Dismiss success message"
          >
            <X size={17} />
          </button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Total Customers
            </span>
            <span className="rounded-xl bg-violet-50 p-3 text-violet-600">
              <Users size={20} />
            </span>
          </div>
          <h2 className="mt-4 text-3xl font-extrabold text-slate-800">
            {customers.length}
          </h2>
          <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-emerald-600">
            <ArrowUpRight size={14} /> Customer records
          </p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Active Customers
            </span>
            <span className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
              <UserRound size={20} />
            </span>
          </div>
          <h2 className="mt-4 text-3xl font-extrabold text-slate-800">
            {activeCount}
          </h2>
          <p className="mt-2 text-xs text-slate-400">
            Currently active profiles
          </p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:col-span-2 xl:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              New This Month
            </span>
            <span className="rounded-xl bg-orange-50 p-3 text-orange-600">
              <Plus size={20} />
            </span>
          </div>
          <h2 className="mt-4 text-3xl font-extrabold text-slate-800">
            {newThisMonth}
          </h2>
          <p className="mt-2 text-xs text-slate-400">
            Recently added customers
          </p>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-bold text-slate-800">
              Customer Directory
            </h2>
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

        {error && (
          <div className="m-5 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
            {error}
            <button
              type="button"
              onClick={fetchCustomers}
              className="ml-3 font-bold underline"
            >
              Retry
            </button>
          </div>
        )}

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
              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-12 text-center text-sm text-slate-400"
                  >
                    Loading customers...
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr
                    key={getCustomerId(customer)}
                    className="transition hover:bg-slate-50/70"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-50 text-sm font-bold text-violet-600">
                          {(customer.name || "Customer")
                            .split(" ")
                            .map((word) => word[0])
                            .join("")
                            .toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-700">
                            {customer.name || "Unnamed"}
                          </p>
                          <p className="mt-1 text-[10px] text-slate-400">
                            {customer.customerId ||
                              String(customer._id || "").slice(-8)}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <p className="flex items-center gap-2 text-xs text-slate-600">
                        <Mail size={13} className="text-slate-400" />
                        {customer.email || "—"}
                      </p>
                      <p className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                        <Phone size={13} className="text-slate-400" />
                        {customer.phone || "—"}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-xs text-slate-600">
                      {customer.city || customer.address || "—"}
                    </td>

                    <td className="px-6 py-4">
                      <span className="rounded-lg bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-700">
                        {customer.requests ?? 0}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-bold text-emerald-600">
                        {customer.isActive === false ? "Inactive" : "Active"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <button
                        type="button"
                        aria-label={`More actions for ${customer.name || "customer"}`}
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-violet-600"
                      >
                        <MoreHorizontal size={19} />
                      </button>
                    </td>
                  </tr>
                ))
              )}

              {!loading && !error && filteredCustomers.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-12 text-center text-sm text-slate-400"
                  >
                    No customers found. Click Add Customer to create your first record.
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

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="my-auto w-full max-w-xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-5 sm:p-6">
              <div>
                <div className="flex items-center gap-2 text-violet-600">
                  <UserPlus size={19} />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Customer Management
                  </span>
                </div>
                <h2 className="mt-2 text-xl font-extrabold text-slate-800">
                  Add New Customer
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  Enter customer details below.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close form"
              >
                <X size={21} />
              </button>
            </div>

            <form onSubmit={handleAddCustomer} className="space-y-4 p-5 sm:p-6">
              {formError && (
                <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600">
                  {formError}
                </div>
              )}

              <div>
                <label className="mb-2 block text-xs font-bold text-slate-600">
                  Customer Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter full name"
                  required
                  maxLength={100}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-bold text-slate-600">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="name@example.com"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold text-slate-600">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                    required
                    maxLength={20}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold text-slate-600">
                  Address
                </label>
                <div className="relative">
                  <MapPin
                    size={17}
                    className="absolute left-4 top-3.5 text-slate-400"
                  />
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="House number, street, area"
                    className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold text-slate-600">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="Enter city"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                />
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader2 size={17} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Plus size={17} />
                      Save Customer
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Customers;
