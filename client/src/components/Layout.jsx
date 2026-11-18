
import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const pageTitles = {
  "/dashboard": "Dashboard",
  "/customers": "Customers",
  "/assets": "Assets",
  "/requests": "Service Requests",
  "/diagnosis": "Diagnosis",
  "/quotes": "Quotes",
  "/technicians": "Technicians",
  "/quality-control": "Quality Control",
  "/invoices": "Invoices",
  "/fixloop": "FixLoop Outcomes",
  "/reports": "Reports",
  "/settings": "Settings"
};

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const pageTitle =
    pageTitles[location.pathname] || "Dashboard";

  return (
    <div className="flex min-h-screen bg-[#f6f7fb]">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="min-w-0 flex-1">
        <Topbar
          pageTitle={pageTitle}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="min-h-[calc(100vh-72px)]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
