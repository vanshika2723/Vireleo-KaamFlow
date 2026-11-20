require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const customerRoutes = require("./routes/customerRoutes");
const diagnosisRoutes = require("./routes/diagnosisRoutes");
const quoteRoutes = require("./routes/quoteRoutes");
const assetRoutes = require("./routes/assetRoutes");
const requestRoutes = require("./routes/requestRoutes");
const repairRoutes = require("./routes/repairRoutes");
const followUpRoutes = require("./routes/FollowUpRoutes");
const outcomeAnalyticsRoutes = require("./routes/outcomeAnalyticsRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const userRoutes = require("./routes/userRoutes");
const technicianApplicationRoutes = require("./routes/technicianApplicationRoutes");
const qcRoutes = require("./routes/qcRoutes");
const technicianApprovalRoutes = require("./routes/technicianApprovalRoutes");



const app = express();

app.use(cors());
app.use(express.json());
// Serve uploaded diagnosis evidence files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/auth", authRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/diagnosis", diagnosisRoutes);
app.use("/api/repair-logs", repairRoutes);
app.use("/api/quotes", quoteRoutes);
app.use("/api/users", userRoutes);
app.use("/api/outcome-analytics", outcomeAnalyticsRoutes);
app.use("/api/followups", followUpRoutes);
app.use("/api/technician-applications", technicianApplicationRoutes);
app.use("/api/admin/technician-applications", technicianApprovalRoutes);
app.use("/api/qc", qcRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/customers", customerRoutes);
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to KAAMFLOW API"
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "KAAMFLOW Server is running"
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();