
import { useEffect, useState } from "react";
import {
  Monitor,
  Search,
  Plus,
  Laptop,
  Smartphone,
  Tv,
  Refrigerator,
  MoreHorizontal,
  ArrowUpRight,
  X,
  Loader2,
  MapPin,
  UserRound,
  CalendarDays
} from "lucide-react";
import API from "../services/api";

const initialForm = {
  customer: "",
  category: "",
  brand: "",
  model: "",
  serialNumber: "",
  purchaseDate: "",
  condition: "Not Working",
  description: ""
};

const categories = [
  "Air Conditioner",
  "Refrigerator",
  "Washing Machine",
  "Microwave",
  "Television",
  "UPS/Inverter",
  "Electronics",
  "Other"
];

const conditions = ["Good", "Fair", "Poor", "Not Working"];

function getAssetIcon(category) {
  if (category === "Television") return Tv;
  if (category === "Refrigerator") return Refrigerator;
  if (category === "Electronics") return Smartphone;
  return Laptop;
}

function Assets() {
  const [assets, setAssets] = useState([]);
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
    loadPageData();
  }, []);

 const loadPageData = async (showLoader = true) => {
    try {
     if (showLoader) {
  setLoading(true);
}
      setError("");

      const [assetResponse, customerResponse] = await Promise.all([
        API.get("/assets"),
        API.get("/customers")
      ]);

      const assetResult = assetResponse.data;
      const customerResult = customerResponse.data;

      const assetRecords =
        Array.isArray(assetResult.assets) ? assetResult.assets :
        Array.isArray(assetResult.data?.assets) ? assetResult.data.assets :
        Array.isArray(assetResult) ? assetResult : [];

      const customerRecords =
        Array.isArray(customerResult.customers) ? customerResult.customers :
        Array.isArray(customerResult.data?.customers) ? customerResult.data.customers :
        Array.isArray(customerResult) ? customerResult : [];

      setAssets(assetRecords);
      setCustomers(customerRecords);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load assets or customers. Check your login and backend connection."
      );
    } finally {
    if (showLoader) {
  setLoading(false);
}
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const handleAddAsset = async (e) => {
    e.preventDefault();
    setFormError("");
    setSuccessMessage("");

    if (!formData.customer || !formData.category || !formData.brand.trim()) {
      setFormError("Please select a customer, category and enter the brand.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        ...formData,
        brand: formData.brand.trim(),
        model: formData.model.trim(),
        serialNumber: formData.serialNumber.trim(),
        description: formData.description.trim(),
        purchaseDate: formData.purchaseDate || null
      };

      const response = await API.post("/assets", payload);

      if (response.data.success) {
     setFormData(initialForm);
setShowForm(false);
setSuccessMessage("Asset added successfully!");

// Refresh asset list in background
loadPageData(false);
      }
    } catch (err) {
      setFormError(
        err.response?.data?.message ||
        "Unable to save asset. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const filteredAssets = assets.filter((asset) => {
    const customerName =
      typeof asset.customer === "object"
        ? asset.customer?.name || ""
        : "";

    return `${asset.brand || ""} ${asset.model || ""} ${
      asset.serialNumber || ""
    } ${asset.category || ""} ${customerName}`
      .toLowerCase()
      .includes(search.toLowerCase());
  });

  const notWorkingCount = assets.filter(
    (asset) => asset.condition === "Not Working"
  ).length;

  const goodConditionCount = assets.filter(
    (asset) => asset.condition === "Good"
  ).length;

  const getConditionStyle = (condition) => {
    switch (condition) {
      case "Good":
        return "bg-emerald-50 text-emerald-600";
      case "Fair":
        return "bg-blue-50 text-blue-600";
      case "Poor":
        return "bg-orange-50 text-orange-600";
      default:
        return "bg-red-50 text-red-600";
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-semibold text-slate-400">
            OVERVIEW / ASSETS
          </p>
          <h1 className="mt-2 text-2xl font-extrabold text-slate-800">
            Asset Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Track customer equipment and repair history.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setFormData(initialForm);
            setFormError("");
            setShowForm(true);
          }}
          disabled={customers.length === 0}
          className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus size={18} />
          Add Asset
        </button>
      </div>

      {successMessage && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          {successMessage}
          <button
            type="button"
            onClick={() => setSuccessMessage("")}
            aria-label="Dismiss message"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
          {error}
          <button
            type="button"
            onClick={loadPageData}
            className="ml-3 font-bold underline"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && customers.length === 0 && (
        <div className="rounded-xl border border-orange-100 bg-orange-50 p-4 text-sm text-orange-700">
          Pehle Customers page par kam se kam ek customer add karo. Asset ko
          customer ke saath link karna required hai.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Total Assets
            </span>
            <span className="rounded-xl bg-violet-50 p-3 text-violet-600">
              <Monitor size={20} />
            </span>
          </div>
          <h2 className="mt-4 text-3xl font-extrabold text-slate-800">
            {loading ? "..." : assets.length}
          </h2>
          <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-emerald-600">
            <ArrowUpRight size={14} /> Registered equipment
          </p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Not Working
            </span>
            <span className="rounded-xl bg-orange-50 p-3 text-orange-600">
              <Laptop size={20} />
            </span>
          </div>
          <h2 className="mt-4 text-3xl font-extrabold text-slate-800">
            {loading ? "..." : notWorkingCount}
          </h2>
          <p className="mt-2 text-xs text-slate-400">
            Equipment marked not working
          </p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:col-span-2 xl:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Good Condition
            </span>
            <span className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
              <Monitor size={20} />
            </span>
          </div>
          <h2 className="mt-4 text-3xl font-extrabold text-slate-800">
            {loading ? "..." : goodConditionCount}
          </h2>
          <p className="mt-2 text-xs text-slate-400">
            Equipment in good condition
          </p>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-bold text-slate-800">
              Equipment Directory
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              All registered customer assets
            </p>
          </div>

          <div className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 sm:w-72">
            <Search size={17} className="text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search equipment..."
              className="w-full bg-transparent text-xs outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead className="bg-slate-50">
              <tr className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <th className="px-6 py-4">Equipment</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Serial Number</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Condition</th>
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
                    Loading assets...
                  </td>
                </tr>
              ) : (
                filteredAssets.map((asset) => {
                  const Icon = getAssetIcon(asset.category);
                  const customerName =
                    typeof asset.customer === "object"
                      ? asset.customer?.name || "Unknown customer"
                      : "Unknown customer";

                  return (
                    <tr
                      key={asset._id}
                      className="transition hover:bg-slate-50/70"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="grid h-10 w-10 place-items-center rounded-xl bg-violet-50 text-violet-600">
                            <Icon size={19} />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-700">
                              {asset.brand} {asset.model}
                            </p>
                            <p className="mt-1 text-[10px] text-slate-400">
                              {asset.brand} · {String(asset._id || "").slice(-8)}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-xs text-slate-600">
                        {asset.category}
                      </td>

                      <td className="px-6 py-4 text-xs font-medium text-slate-500">
                        {asset.serialNumber || "—"}
                      </td>

                      <td className="px-6 py-4 text-xs text-slate-600">
                        {customerName}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1.5 text-[10px] font-bold ${getConditionStyle(
                            asset.condition
                          )}`}
                        >
                          {asset.condition || "Not Working"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <button
                          type="button"
                          aria-label={`More actions for ${asset.brand}`}
                          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-violet-600"
                        >
                          <MoreHorizontal size={19} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}

              {!loading && !error && filteredAssets.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-12 text-center text-sm text-slate-400"
                  >
                    No assets found. Click Add Asset to register equipment.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-100 px-6 py-4 text-xs text-slate-400">
          Showing {filteredAssets.length} of {assets.length} assets
        </div>
      </section>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="my-auto w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-5 sm:p-6">
              <div>
                <div className="flex items-center gap-2 text-violet-600">
                  <Monitor size={19} />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Equipment Management
                  </span>
                </div>
                <h2 className="mt-2 text-xl font-extrabold text-slate-800">
                  Register New Asset
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  Add equipment details and link it to a customer.
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

            <form onSubmit={handleAddAsset} className="space-y-4 p-5 sm:p-6">
              {formError && (
                <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600">
                  {formError}
                </div>
              )}

              <div>
                <label className="mb-2 block text-xs font-bold text-slate-600">
                  Select Customer <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <UserRound
                    size={17}
                    className="absolute left-4 top-3.5 text-slate-400"
                  />
                  <select
                    name="customer"
                    value={formData.customer}
                    onChange={handleInputChange}
                    required
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                  >
                    <option value="">Choose a customer</option>
                    {customers.map((customer) => (
                      <option key={customer._id} value={customer._id}>
                        {customer.name} {customer.phone ? `- ${customer.phone}` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-bold text-slate-600">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold text-slate-600">
                    Brand <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    placeholder="e.g. Samsung, LG, Dell"
                    required
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-bold text-slate-600">
                    Model Number
                  </label>
                  <input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleInputChange}
                    placeholder="Enter model"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold text-slate-600">
                    Serial Number
                  </label>
                  <input
                    type="text"
                    name="serialNumber"
                    value={formData.serialNumber}
                    onChange={handleInputChange}
                    placeholder="Enter serial number"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-bold text-slate-600">
                    Purchase Date
                  </label>
                  <div className="relative">
                    <CalendarDays
                      size={17}
                      className="absolute left-4 top-3.5 text-slate-400"
                    />
                    <input
                      type="date"
                      name="purchaseDate"
                      value={formData.purchaseDate}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-3 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold text-slate-600">
                    Current Condition
                  </label>
                  <select
                    name="condition"
                    value={formData.condition}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                  >
                    {conditions.map((condition) => (
                      <option key={condition} value={condition}>
                        {condition}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold text-slate-600">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Enter equipment details or any additional information..."
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
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
                      Save Asset
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

export default Assets;
