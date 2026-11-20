
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Wrench,
  ArrowLeft,
  Search,
  ClipboardList,
  User,
  Phone,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  Package
} from "lucide-react";
import API from "../services/api";

function TrackService() {
  const [formData, setFormData] = useState({
    requestId: "",
    phone: ""
  });

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTrack = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setRequest(null);

    try {
      const response = await API.post("/requests/track", {
        requestId: formData.requestId.trim(),
        phone: formData.phone.trim()
      });

      setRequest(response.data.request);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to find your service request. Please check your details."
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition";

  const statusColors = {
    "Needs Review": "bg-amber-100 text-amber-700",
    "Needs More Information": "bg-orange-100 text-orange-700",
    "Accepted": "bg-blue-100 text-blue-700",
    "Open": "bg-blue-100 text-blue-700",
    "In Diagnosis": "bg-indigo-100 text-indigo-700",
    "Diagnosis Completed": "bg-indigo-100 text-indigo-700",
    "Repair In Progress": "bg-violet-100 text-violet-700",
    "Repair Completed": "bg-teal-100 text-teal-700",
    "QC Passed": "bg-green-100 text-green-700",
    "QC Failed": "bg-red-100 text-red-700",
    "Ready for Handover": "bg-green-100 text-green-700",
    "Completed": "bg-green-100 text-green-700",
    "Declined": "bg-red-100 text-red-700",
    "Out of Coverage": "bg-red-100 text-red-700"
  };

  const statusClass =
    statusColors[request?.status] || "bg-slate-100 text-slate-700";

  const formatDate = (date) => {
    if (!date) return "Not specified";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };
  const formatDateTime = (date) => {
    if (!date) return null;

    return new Date(date).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">

      {/* Navbar */}
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

      <main className="max-w-3xl mx-auto px-5 py-12">

        {/* Heading */}
        <div className="text-center mb-10">
          <span className="inline-block bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-bold">
            Customer Service Tracking
          </span>

          <h1 className="text-3xl md:text-4xl font-extrabold mt-5">
            Track Your Service
          </h1>

          <p className="text-slate-500 mt-3">
            Enter your repair request ID and registered phone number.
          </p>
        </div>

        {/* Tracking Form */}
        <form
          onSubmit={handleTrack}
          className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6 md:p-8"
        >
          <div className="space-y-5">

            <div>
              <label className="block text-sm font-semibold mb-2">
                Repair Request ID
              </label>

              <input
                type="text"
                name="requestId"
                value={formData.requestId}
                onChange={handleChange}
                placeholder="e.g. KF-1795161733041"
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Registered Phone Number
              </label>

              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your 10-digit phone number"
                pattern="[0-9]{10}"
                maxLength={10}
                className={inputClass}
                required
              />
            </div>

          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mt-5 flex gap-3 items-start">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 mt-7 transition"
          >
            {loading ? (
              "Checking Request..."
            ) : (
              <>
                Track My Request
                <Search size={19} />
              </>
            )}
          </button>
        </form>

        {/* Request Details */}
        {request && (
          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6 md:p-8 mt-8">

            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div>
                <p className="text-sm text-slate-500 font-medium">
                  Repair Request
                </p>

                <h2 className="text-xl font-extrabold mt-1">
                  {request.requestId}
                </h2>
              </div>

              <div>
                <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${statusClass}`}>
                  {request.status}
                </span>
              </div>
            </div>

            <div className="border-t border-slate-100 my-6" />

            <h3 className="font-bold text-lg mb-5">
              Request Details
            </h3>

            <div className="grid sm:grid-cols-2 gap-5">

              <div className="flex gap-3">
                <User className="text-indigo-600 shrink-0" />
                <div>
                  <p className="text-xs text-slate-400">Customer</p>
                  <p className="font-semibold">{request.customer}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Package className="text-indigo-600 shrink-0" />
                <div>
                  <p className="text-xs text-slate-400">Appliance</p>
                  <p className="font-semibold">
                    {request.appliance?.category || "Not available"}
                  </p>
                  <p className="text-sm text-slate-500">
                    {request.appliance?.brand || ""}
                    {request.appliance?.model
                      ? ` - ${request.appliance.model}`
                      : ""}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <ClipboardList className="text-indigo-600 shrink-0" />
                <div>
                  <p className="text-xs text-slate-400">Problem Reported</p>
                  <p className="font-semibold">
                    {request.reportedSymptom}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Clock className="text-indigo-600 shrink-0" />
                <div>
                  <p className="text-xs text-slate-400">Priority</p>
                  <p className="font-semibold">{request.priority}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Calendar className="text-indigo-600 shrink-0" />
                <div>
                  <p className="text-xs text-slate-400">Preferred Date</p>
                  <p className="font-semibold">
                    {formatDate(request.preferredDate)}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <User className="text-indigo-600 shrink-0" />
                <div>
                  <p className="text-xs text-slate-400">
                    Assigned Technician
                  </p>
                  <p className="font-semibold">
                    {request.assignedTechnician || "Not assigned yet"}
                  </p>
                </div>
              </div>

            </div>
            {/* Repair Progress Timeline */}
            <div className="border-t border-slate-100 mt-8 pt-7">
              <h3 className="text-lg font-extrabold mb-6">
                Repair Progress Timeline
              </h3>

              <div className="space-y-6">
                {(request.progressTimeline || []).map((stage, index) => (
                  <div key={index} className="flex gap-4 items-start">

                    <div className="flex flex-col items-center">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center ${
                          stage.status === "Completed"
                            ? "bg-green-100 text-green-600"
                            : stage.status === "Current"
                              ? "bg-indigo-600 text-white"
                              : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {stage.status === "Completed" ? (
                          <CheckCircle size={19} />
                        ) : stage.status === "Current" ? (
                          <Clock size={19} />
                        ) : (
                          <span className="text-sm font-bold">
                            {index + 1}
                          </span>
                        )}
                      </div>

                      {index !== request.progressTimeline.length - 1 && (
                        <div
                          className={`w-0.5 h-8 ${
                            stage.status === "Completed"
                              ? "bg-green-300"
                              : "bg-slate-200"
                          }`}
                        />
                      )}
                    </div>

                    <div className="pt-1">
                      <p className="font-bold text-slate-800">
                        {stage.title}
                      </p>

                      <p
                        className={`text-xs font-semibold mt-1 ${
                          stage.status === "Completed"
                            ? "text-green-600"
                            : stage.status === "Current"
                              ? "text-indigo-600"
                              : "text-slate-400"
                        }`}
                      >
                        {stage.status}
                      </p>
                                            {(() => {
                        const timestampFields = {
                          "Request Received": "requestReceivedAt",
                          "Diagnosis": "diagnosisCompletedAt",
                          "Quote & Approval": "approvedAt",
                          "Repair": "repairCompletedAt",
                          "Quality Check": "qcPassedAt",
                          "Handover": "completedAt"
                        };

                        const timestampKey = timestampFields[stage.title];
                        const stageDate = request.stageTimestamps?.[timestampKey];

                        return stageDate ? (
                          <p className="text-xs text-slate-500 mt-2">
                            <Calendar size={13} className="inline mr-1" />
                            {formatDateTime(stageDate)}
                          </p>
                        ) : null;
                      })()}
                    </div>

                  </div>
                ))}
              </div>
            </div>
            <div className="bg-indigo-50 rounded-2xl p-5 mt-7">
              <div className="flex items-center gap-2 text-indigo-700 font-bold">
                <CheckCircle size={19} />
                Latest Service Status
              </div>

              <p className="text-slate-600 text-sm mt-2">
                Your current repair request status is{" "}
                <strong>{request.status}</strong>.
                {request.status === "Completed"
                  ? " Your repair service has been completed."
                  : " Our service team is processing your request."}
              </p>
            </div>

          </div>
        )}

        <p className="text-center text-sm text-slate-400 mt-8">
          Need help? Contact our service team for assistance.
        </p>

      </main>
    </div>
  );
}

export default TrackService;
