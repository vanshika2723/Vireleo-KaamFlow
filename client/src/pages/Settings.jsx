
import { useEffect, useState } from "react";
import {
  Settings as SettingsIcon,
  User,
  Building2,
  Bell,
  ShieldCheck,
  Save,
  Mail,
  Phone,
  MapPin,
  RefreshCw
} from "lucide-react";
import API from "../services/api";

const defaultNotifications = {
  newRequest: true,
  repairUpdates: true,
  paymentUpdates: true,
  customerFeedback: false
};

function Settings() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    businessName: "",
    businessAddress: ""
  });

  const [notifications, setNotifications] = useState(
    defaultNotifications
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/users/profile");
      const user = response.data.user;

      setProfile({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        businessName: user.businessName || "",
        businessAddress: user.businessAddress || ""
      });

      setNotifications({
        ...defaultNotifications,
        ...(user.notificationPreferences || {})
      });

      // Keep the latest user information in localStorage
      const storedUser = JSON.parse(
        localStorage.getItem("kaamflow_user") || "{}"
      );

      localStorage.setItem(
        "kaamflow_user",
        JSON.stringify({
          ...storedUser,
          ...user
        })
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load profile settings."
      );
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = (event) => {
    const { name, value } = event.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const toggleNotification = (key) => {
    setNotifications((previous) => ({
      ...previous,
      [key]: !previous[key]
    }));
  };

  const handleSave = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await API.put("/users/profile", {
        name: profile.name,
        phone: profile.phone,
        businessName: profile.businessName,
        businessAddress: profile.businessAddress,
        notificationPreferences: notifications
      });

      const updatedUser = response.data.user;

      setProfile({
        name: updatedUser.name || "",
        email: updatedUser.email || "",
        phone: updatedUser.phone || "",
        businessName: updatedUser.businessName || "",
        businessAddress: updatedUser.businessAddress || ""
      });

      setNotifications({
        ...defaultNotifications,
        ...(updatedUser.notificationPreferences || {})
      });

      const storedUser = JSON.parse(
        localStorage.getItem("kaamflow_user") || "{}"
      );

      localStorage.setItem(
        "kaamflow_user",
        JSON.stringify({
          ...storedUser,
          ...updatedUser
        })
      );

      setSuccess(
        response.data.message ||
        "Settings saved successfully!"
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to save settings. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const notificationItems = [
    {
      key: "newRequest",
      title: "New Service Requests",
      description: "Get notified when a new request is created"
    },
    {
      key: "repairUpdates",
      title: "Repair Status Updates",
      description: "Receive updates about repair progress"
    },
    {
      key: "paymentUpdates",
      title: "Payment Notifications",
      description: "Get updates when invoice payments change"
    },
    {
      key: "customerFeedback",
      title: "Customer Feedback",
      description: "Receive FixLoop outcome and feedback updates"
    }
  ];

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
          <RefreshCw size={20} className="animate-spin" />
          Loading settings...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-5 md:p-8">
      <div>
        <div className="flex items-center gap-2">
          <div className="rounded-xl bg-violet-100 p-2.5 text-violet-600">
            <SettingsIcon size={22} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">
            Settings
          </h1>
        </div>

        <p className="mt-2 text-sm text-slate-500">
          Manage your workspace profile and preferences
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* PROFILE INFORMATION */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 md:p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-violet-50 p-3 text-violet-600">
              <User size={21} />
            </div>
            <div>
              <h2 className="font-bold text-slate-800">
                Profile Information
              </h2>
              <p className="text-xs text-slate-500">
                Update your account and business details
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-600">
                Full Name
              </span>
              <input
                name="name"
                value={profile.name}
                onChange={updateProfile}
                required
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-400"
                placeholder="Enter your name"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-600">
                Email Address
              </span>
              <div className="relative">
                <Mail
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="email"
                  value={profile.email}
                  readOnly
                  className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-500 outline-none"
                />
              </div>
              <p className="text-xs text-slate-400">
                Email address cannot be changed here.
              </p>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-600">
                Phone Number
              </span>
              <div className="relative">
                <Phone
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  name="phone"
                  value={profile.phone}
                  onChange={updateProfile}
                  className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-violet-400"
                  placeholder="Enter phone number"
                />
              </div>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-slate-600">
                Business Name
              </span>
              <div className="relative">
                <Building2
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  name="businessName"
                  value={profile.businessName}
                  onChange={updateProfile}
                  className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-violet-400"
                  placeholder="Business name"
                />
              </div>
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="text-sm font-medium text-slate-600">
                Business Address
              </span>
              <div className="relative">
                <MapPin
                  size={17}
                  className="absolute left-3 top-3.5 text-slate-400"
                />
                <textarea
                  name="businessAddress"
                  value={profile.businessAddress}
                  onChange={updateProfile}
                  rows={3}
                  className="w-full resize-none rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-violet-400"
                  placeholder="Enter business address"
                />
              </div>
            </label>
          </div>
        </div>

        {/* NOTIFICATIONS */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 md:p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <Bell size={21} />
            </div>
            <div>
              <h2 className="font-bold text-slate-800">
                Notifications
              </h2>
              <p className="text-xs text-slate-500">
                Choose which notification preferences to save
              </p>
            </div>
          </div>

          <div className="space-y-5">
            {notificationItems.map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between gap-4 border-b border-slate-50 pb-4 last:border-0 last:pb-0"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    {item.title}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {item.description}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => toggleNotification(item.key)}
                  aria-pressed={notifications[item.key]}
                  className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                    notifications[item.key]
                      ? "bg-violet-600"
                      : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                      notifications[item.key]
                        ? "left-6"
                        : "left-1"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* SECURITY */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 md:p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
              <ShieldCheck size={21} />
            </div>
            <div>
              <h2 className="font-bold text-slate-800">
                Security
              </h2>
              <p className="text-xs text-slate-500">
                Account access and security preferences
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-col justify-between gap-3 rounded-xl bg-slate-50 p-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-semibold text-slate-700">
                Account Authentication
              </p>
              <p className="mt-1 text-xs text-slate-500">
                This workspace uses JWT-based authentication
              </p>
            </div>
            <span className="w-fit rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700">
              Enabled in backend
            </span>
          </div>
        </div>

        {/* SAVE BUTTON */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <RefreshCw size={17} className="animate-spin" />
            ) : (
              <Save size={17} />
            )}
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>

      <p className="text-xs text-slate-400">
        Profile and notification preferences are stored in your KAAMFLOW account.
      </p>
    </div>
  );
}

export default Settings;
