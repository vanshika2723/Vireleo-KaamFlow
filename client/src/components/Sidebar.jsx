
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  Monitor,
  ClipboardList,
  Stethoscope,
  FileText,
  Wrench,
  ShieldCheck,
  Receipt,
  RefreshCw,
  BarChart3,
  Settings,
  X,
  ClipboardCheck
} from "lucide-react";

import { NavLink } from "react-router-dom";
import API from "../services/api";

const adminNavigation = [
  {
    title: "OVERVIEW",
    items: [
      { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
      { label: "Customers", path: "/customers", icon: Users },
      { label: "Assets", path: "/assets", icon: Monitor },
      { label: "Service Requests", path: "/requests", icon: ClipboardList }
    ]
  },
  {
    title: "OPERATIONS",
    items: [
      { label: "Diagnosis", path: "/diagnosis", icon: Stethoscope },
      { label: "Quotes", path: "/quotes", icon: FileText },
      { label: "Technicians", path: "/technicians", icon: Wrench },
      { label: "Repair Logs", path: "/repair-logs", icon: ClipboardCheck },
      { label: "Quality Control", path: "/quality-control", icon: ShieldCheck },
      { label: "Invoices", path: "/invoices", icon: Receipt },
      {
  label: "Technician Applications",
  path: "/technician-applications",
  icon: ClipboardList
},
    ]
  },
  {
    title: "INSIGHTS",
    items: [
      { label: "FixLoop Outcomes", path: "/fixloop", icon: RefreshCw },
      { label: "Reports", path: "/reports", icon: BarChart3 }
    ]
  }
];

const navigationByRole = {
 
Technician: [
  {
    title: "MY WORK",
    items: [
      { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
      { label: "Service Requests", path: "/requests", icon: ClipboardList },
      { label: "Diagnosis", path: "/diagnosis", icon: Stethoscope },
      { label: "Repair Logs", path: "/repair-logs", icon: ClipboardCheck },
      { label: "Quality Control", path: "/quality-control", icon: ShieldCheck }
    ]
  }
],


  "Service Desk": [
    {
      title: "WORKSPACE",
      items: [
        { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
        { label: "Customers", path: "/customers", icon: Users },
        { label: "Assets", path: "/assets", icon: Monitor },
        { label: "Service Requests", path: "/requests", icon: ClipboardList }
      ]
    },
   {
  title: "OPERATIONS",
  items: [
    { label: "Diagnosis", path: "/diagnosis", icon: Stethoscope },
    { label: "Quotes", path: "/quotes", icon: FileText },
    { label: "Technicians", path: "/technicians", icon: Wrench },
    { label: "Repair Logs", path: "/repair-logs", icon: ClipboardCheck },
    { label: "Invoices", path: "/invoices", icon: Receipt }
  ]
}
  ],

  "QC Reviewer": [
    {
      title: "QUALITY WORKSPACE",
      items: [
        { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
        { label: "Service Requests", path: "/requests", icon: ClipboardList },
        { label: "Repair Logs", path: "/repair-logs", icon: ClipboardCheck },
        { label: "Quality Control", path: "/quality-control", icon: ShieldCheck }
      ]
    }
  ],

  Customer: [
    {
      title: "MY WORKSPACE",
      items: [
        { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
        { label: "Service Requests", path: "/requests", icon: ClipboardList }
      ]
    }
  ]
};

function Sidebar({ isOpen, onClose }) {
  const [requestCount, setRequestCount] = useState(0);

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("kaamflow_user")) || {};
    } catch {
      return {};
    }
  });

  // Fetch service request count
  useEffect(() => {
    let isMounted = true;

    const fetchRequestCount = async () => {
      try {
        const response = await API.get("/requests");
        const requests = response.data?.requests || [];

        if (isMounted) {
          setRequestCount(requests.length);
        }
      } catch (error) {
        console.error("Unable to fetch service requests:", error);
      }
    };

    fetchRequestCount();

    const interval = setInterval(fetchRequestCount, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Update user information
  useEffect(() => {
    const updateUser = () => {
      try {
        setUser(
          JSON.parse(localStorage.getItem("kaamflow_user")) || {}
        );
      } catch {
        setUser({});
      }
    };

    window.addEventListener("storage", updateUser);

    return () => {
      window.removeEventListener("storage", updateUser);
    };
  }, []);

  const userName = user.name || "Workspace User";
  const userRole = user.role || "User";

  // Select navigation according to role
  const navigation =
    userRole === "Admin"
      ? adminNavigation
      : navigationByRole[userRole] || navigationByRole.Customer;

  const initials = userName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-slate-100 bg-white px-4 py-6 transition-transform duration-300 lg:sticky lg:top-0 lg:z-20 lg:h-screen lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="mb-8 flex items-center justify-between px-1">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-xl font-extrabold text-white shadow-lg shadow-violet-200">
              K
            </div>

            <div>
              <h2 className="text-lg font-extrabold tracking-wide text-slate-800">
                KAAMFLOW
              </h2>
              <p className="text-[9px] font-bold tracking-[1.5px] text-slate-400">
                REPAIR INTELLIGENCE
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={19} />
          </button>
        </div>

        {/* Workspace */}
        <div className="mb-7 flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-violet-100 text-xs font-extrabold text-violet-600">
            KF
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-700">
              Workspace
            </p>
            <p className="mt-1 text-[10px] text-slate-400">
              {userRole} Workspace
            </p>
          </div>

          <span className="text-slate-400">⌄</span>
        </div>

        {/* Role Based Navigation */}
        <nav className="flex-1 space-y-7 overflow-y-auto">
          {navigation.map((group) => (
            <div key={group.title}>
              <p className="mb-3 px-3 text-[9px] font-extrabold tracking-[1.5px] text-slate-400">
                {group.title}
              </p>

              <div className="space-y-1">
                {group.items.map(({ label, path, icon: Icon }) => (
                  <NavLink
                    key={path}
                    to={path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-xl px-3 py-3 text-xs font-semibold transition ${
                        isActive
                          ? "bg-violet-50 text-violet-700 shadow-sm"
                          : "text-slate-500 hover:bg-slate-50 hover:text-violet-600"
                      }`
                    }
                  >
                    <Icon size={18} strokeWidth={1.8} />

                    <span>{label}</span>

                    {label === "Service Requests" && (
                      <span className="ml-auto rounded-full bg-orange-100 px-2 py-1 text-[9px] font-bold text-orange-600">
                        {requestCount > 99 ? "99+" : requestCount}
                      </span>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="mt-5 border-t border-slate-100 pt-4">
          <NavLink
            to="/settings"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-3 text-xs font-semibold ${
                isActive
                  ? "bg-violet-50 text-violet-700"
                  : "text-slate-500 hover:bg-slate-50 hover:text-violet-600"
              }`
            }
          >
            <Settings size={18} />
            Settings
          </NavLink>

          {/* Dynamic User Profile */}
          <div className="mt-4 flex items-center gap-3 border-t border-slate-100 pt-4">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-violet-100 text-xs font-extrabold text-violet-700">
              {initials || "U"}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-slate-700">
                {userName}
              </p>

              <p className="mt-1 truncate text-[10px] text-slate-400">
                {userRole}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
