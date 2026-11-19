
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet
} from "react-router-dom";

import Layout from "./components/Layout";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
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
import Settings from "./pages/Settings";

// Protect all dashboard routes
function ProtectedRoute() {
  const token = localStorage.getItem("kaamflow_token");

  if (!token) {
    return <Navigate to="/login" replace />;
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
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/login" element={<PublicRoute />} />

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

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
