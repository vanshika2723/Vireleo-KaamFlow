
# KAAMFLOW – Repair Operations & Outcome Intelligence Platform

KAAMFLOW is a MERN-stack based repair management platform designed to streamline repair business operations, from service request creation to repair completion, quality inspection, invoicing, and customer follow-up.

## 🚀 Features

- User Authentication with JWT
- Role-Based Access Control
- Customer Management
- Asset Management
- Service Request Management
- Technician Assignment
- Diagnosis Management
- Repair Logs
- Quote Creation and Approval
- Quality Control Inspection
- Invoice and Payment Management
- FixLoop Customer Follow-up
- Outcome Analytics
- Responsive Dashboard
- Workspace-Based Data Access

## 🛠️ Technology Stack

### Frontend
- React.js
- Vite
- Tailwind CSS
- JavaScript

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcryptjs

## 👥 User Roles

- **Admin:** Manages users, requests, quotes, invoices, QC and analytics.
- **Service Desk:** Handles customer records, service requests and operational coordination.
- **Technician:** Performs diagnosis, repair work and repair logging.
- **QC Reviewer:** Quality inspection role (current QC creation is Admin-only).
- **Customer:** Customer role is supported in authentication.

## 🔄 Project Workflow

1. Create a service request.
2. Review and accept the request.
3. Perform diagnosis.
4. Create and approve a repair quote.
5. Assign a technician.
6. Record repair work.
7. Complete quality inspection.
8. Generate invoice and update payment.
9. Complete customer handover.
10. Schedule FixLoop follow-up.
11. Review repair outcome analytics.

## 📂 Project Structure

```text
KAAMFLOW/
├── client/
│   └── src/
│       ├── components/
│       ├── pages/
│       └── services/
│
└── server/
    ├── config/
    ├── controllers/
    ├── middleware/
    ├── models/
    ├── routes/
    ├── seed/
    ├── uploads/
    └── server.js
```

## ⚙️ Installation & Setup

### 1. Clone Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd KAAMFLOW
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file inside the server folder:

```env
PORT=5000
MONGODB_URI=YOUR_MONGODB_CONNECTION_STRING
JWT_SECRET=YOUR_SECURE_SECRET
```

Start backend:

```bash
npm run dev
```

### 3. Frontend Setup

Open another terminal:

```bash
cd client
npm install
npm run dev
```

Open the local URL shown by Vite.

## 🔐 Security

- Password hashing using bcryptjs.
- JWT-based authentication.
- Role-based route protection.
- Workspace-based data access.
- Environment variables for sensitive configuration.
- `.env` files excluded from Git.

## 📊 Project Testing

The following workflows have been tested during development:

- Authentication and role-based access.
- Customer and asset management.
- Shared workspace records.
- Diagnosis and quote workflow.
- Technician assignment and repair logs.
- QC inspection.
- Invoice and payment workflow.
- FixLoop follow-up.
- Outcome analytics.
- Responsive UI and form validation.

## 👩‍💻 Developer

**Vanshika Khandelwal**

Full Stack Development  
MERN Stack Project

---

*KAAMFLOW – Making Repair Operations Smarter.*
