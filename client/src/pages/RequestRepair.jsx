
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Wrench,
  ArrowLeft,
  Send,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import API from "../services/api";

function RequestRepair() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    category: "",
    brand: "",
    model: "",
    serialNumber: "",
    reportedSymptom: "",
    preferredDate: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess(null);
    setLoading(true);

    try {
      const response = await API.post("/requests/public", formData);

      setSuccess(response.data);
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        category: "",
        brand: "",
        model: "",
        serialNumber: "",
        reportedSymptom: "",
        preferredDate: ""
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to submit your repair request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition";

  const labelClass =
    "block text-sm font-semibold text-slate-700 mb-2";

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-5 py-12">
        <div className="bg-white w-full max-w-lg rounded-3xl shadow-lg border border-slate-100 p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto">
            <CheckCircle size={36} />
          </div>

          <h1 className="text-2xl font-extrabold text-slate-800 mt-6">
            Request Submitted!
          </h1>

          <p className="text-slate-500 mt-3 leading-7">
            Your repair request has been submitted successfully.
            Our service team will review your request.
          </p>

          <div className="bg-indigo-50 rounded-2xl p-5 mt-6">
            <p className="text-sm text-slate-500 font-medium">
              Your Request ID
            </p>
            <p className="text-2xl font-extrabold text-indigo-700 mt-2">
              {success.requestId}
            </p>
            <p className="text-sm text-slate-600 mt-2">
              Status: {success.status}
            </p>
          </div>

          <button
            onClick={() => navigate("/")}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl mt-7 transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">

      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-5 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-indigo-600 text-white p-2 rounded-xl">
              <Wrench size={22} />
            </div>
            <span className="text-xl font-extrabold">KAAMFLOW</span>
          </Link>

          <Link
            to="/"
            className="text-sm font-semibold text-slate-600 hover:text-indigo-600 flex items-center gap-2"
          >
            <ArrowLeft size={17} />
            Back to Home
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-5 py-12">

        <div className="text-center mb-10">
          <span className="inline-block bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-bold">
            Customer Service Request
          </span>

          <h1 className="text-3xl md:text-4xl font-extrabold mt-5">
            Request a Repair
          </h1>

          <p className="text-slate-500 mt-3">
            Tell us about your appliance and the problem you're facing.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6 md:p-9 space-y-8"
        >

          {/* Customer Details */}
          <section>
            <h2 className="text-xl font-bold mb-5">
              Customer Details
            </h2>

            <div className="grid md:grid-cols-2 gap-5">

              <div>
                <label className={labelClass}>Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="example@email.com"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter 10-digit phone number"
                  pattern="[0-9]{10}"
                  maxLength={10}
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Enter your city"
                  className={inputClass}
                />
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>Service Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter your complete address"
                  rows="3"
                  className={inputClass}
                />
              </div>

            </div>
          </section>

          <div className="border-t border-slate-100" />

          {/* Appliance Details */}
          <section>
            <h2 className="text-xl font-bold mb-5">
              Appliance Details
            </h2>

            <div className="grid md:grid-cols-2 gap-5">

              <div>
                <label className={labelClass}>Appliance Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={inputClass}
                  required
                >
                  <option value="">Select category</option>
                  <option value="Air Conditioner">Air Conditioner</option>
                  <option value="Refrigerator">Refrigerator</option>
                  <option value="Washing Machine">Washing Machine</option>
                  <option value="Microwave">Microwave</option>
                  <option value="Television">Television</option>
                  <option value="UPS/Inverter">UPS/Inverter</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Brand *</label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  placeholder="e.g. Samsung, LG, Whirlpool"
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Model</label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  placeholder="Enter appliance model"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Serial Number</label>
                <input
                  type="text"
                  name="serialNumber"
                  value={formData.serialNumber}
                  onChange={handleChange}
                  placeholder="Enter serial number"
                  className={inputClass}
                />
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>
                  Describe the Problem *
                </label>
                <textarea
                  name="reportedSymptom"
                  value={formData.reportedSymptom}
                  onChange={handleChange}
                  placeholder="Describe the issue you're experiencing..."
                  rows="4"
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>
                  Preferred Service Date
                </label>
                <input
                  type="date"
                  name="preferredDate"
                  value={formData.preferredDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split("T")[0]}
                  className={inputClass}
                />
              </div>

            </div>
          </section>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 flex gap-3 items-start">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition"
          >
            {loading ? (
              "Submitting Request..."
            ) : (
              <>
                Submit Repair Request
                <Send size={18} />
              </>
            )}
          </button>

          <p className="text-xs text-center text-slate-400">
            Fields marked with * are required.
          </p>

        </form>
      </main>
    </div>
  );
}

export default RequestRepair;
