
import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Wrench, CheckCircle } from "lucide-react";
import API from "../services/api";

function TechnicianApply() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    specialization: "",
    experience: "",
    skills: "",
    message: ""
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setSuccess("");
    setError("");

    try {
      const response = await API.post(
        "/technician-applications",
        formData
      );

      setSuccess(
        response.data.message ||
        "Application submitted successfully!"
      );

      setFormData({
        name: "",
        email: "",
        phone: "",
        specialization: "",
        experience: "",
        skills: "",
        message: ""
      });

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to submit application. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-5 py-10 sm:px-8">

      <div className="max-w-3xl mx-auto">

        <Link
          to="/"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-indigo-600 font-medium mb-8"
        >
          <ArrowLeft size={18} />
          Back to Home
        </Link>

        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden">

          <div className="bg-gradient-to-r from-indigo-600 to-violet-700 p-8 sm:p-10 text-white">
            <div className="bg-white/15 w-14 h-14 rounded-2xl flex items-center justify-center">
              <Wrench size={30} />
            </div>

            <h1 className="text-3xl font-extrabold mt-5">
              Join KAAMFLOW
            </h1>

            <p className="text-indigo-100 mt-3 leading-7">
              Apply to become a technician and work with our
              professional repair team.
            </p>
          </div>

          <div className="p-6 sm:p-10">

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-4 mb-6 flex gap-3">
                <CheckCircle className="shrink-0" size={21} />
                <div>
                  <p className="font-bold">Application Submitted!</p>
                  <p className="text-sm mt-1">{success}</p>
                  <p className="text-sm mt-1">
                    Your application is awaiting Admin review.
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">

              <div className="grid sm:grid-cols-2 gap-5">

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="example@email.com"
                    required
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    required
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Specialization *
                  </label>
                  <select
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    required
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select specialization</option>
                    <option value="Laptop Repair">Laptop Repair</option>
                    <option value="Mobile Repair">Mobile Repair</option>
                    <option value="Computer Repair">Computer Repair</option>
                    <option value="Home Appliances">Home Appliances</option>
                    <option value="Electronics Repair">Electronics Repair</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold mb-2">
                    Experience *
                  </label>
                  <input
                    type="text"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    placeholder="Example: 2 years"
                    required
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Skills *
                </label>
                <textarea
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  placeholder="Describe your technical skills..."
                  rows={3}
                  required
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Additional Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us something about yourself..."
                  rows={3}
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold py-4 rounded-xl transition"
              >
                {loading ? "Submitting..." : "Submit Application"}
              </button>

              <p className="text-center text-sm text-slate-500">
                Your application will be reviewed by the KAAMFLOW Admin team.
              </p>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TechnicianApply;
