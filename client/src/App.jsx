
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet
} from "react-router-dom";
import RequestRepair from "./pages/RequestRepair";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import TechnicianApplications from "./pages/TechnicianApplications";
import Dashboard from "./pages/Dashboard";
import TechnicianActivate from "./pages/TechnicianActivate";
import Customers from "./pages/Customers";
import Assets from "./pages/Assets";
import Requests from "./pages/Requests";
import Diagnosis from "./pages/Diagnosis";
import Quotes from "./pages/Quotes";
import Technicians from "./pages/Technicians";
import RepairLogs from "./pages/RepairLogs";
import QualityControl from "./pages/QualityControl";
import Invoices from "./pages/Invoices";
import FixLoop from "./pages/FixLoop";
import Reports from "./pages/Reports";
import TechnicianApply from "./pages/TechnicianApply";
import Settings from "./pages/Settings";
import TrackService from "./pages/TrackService";

// Protect dashboard routes and check user roles
function ProtectedRoute({ allowedRoles }) {
  const token = localStorage.getItem("kaamflow_token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const storedUser = localStorage.getItem("kaamflow_user");

  let user = null;

  try {
    user = storedUser ? JSON.parse(storedUser) : null;
  } catch {
    user = null;
  }

  if (!user || (allowedRoles && !allowedRoles.includes(user.role))) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

// Redirect logged-in users away from Login
function PublicRoute() {
  const token = localStorage.getItem("kaamflow_token");

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Login />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Pages */}
        <Route path="/" element={<Home />} /><Route
  path="/request-repair"
  element={<RequestRepair />}
/>
<Route
  path="/track-service"
  element={<TrackService />}
/>
        <Route path="/login" element={<PublicRoute />} />
        <Route
          path="/technician-apply"
          element={<TechnicianApply />}
        />
        <Route
          path="/technician-activate"
          element={<TechnicianActivate />}
        />

        {/* Protected Dashboard Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>

            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/assets" element={<Assets />} />
            <Route path="/requests" element={<Requests />} />
            <Route path="/diagnosis" element={<Diagnosis />} />
            <Route path="/quotes" element={<Quotes />} />
            <Route path="/technicians" element={<Technicians />} />
            <Route path="/repair-logs" element={<RepairLogs />} />
            <Route path="/quality-control" element={<QualityControl />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/fixloop" element={<FixLoop />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />

          </Route>
        </Route>

        {/* Admin Only Routes */}
        <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
          <Route element={<Layout />}>
            <Route
              path="/technician-applications"
              element={<TechnicianApplications />}
            />
          </Route>
        </Route>

        {/* Fallback */}
        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
