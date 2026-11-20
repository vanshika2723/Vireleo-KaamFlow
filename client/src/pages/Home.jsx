
import { Link } from "react-router-dom";
import {
  Wrench,
  ArrowRight,
  ShieldCheck,
  ClipboardList,
  Users,
  Clock,
  CheckCircle
} from "lucide-react";

function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">

      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200">
        <div className="w-full max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12 py-4 flex justify-between items-center">

          <Link to="/" className="flex items-center gap-2">
            <div className="bg-indigo-600 text-white p-2 rounded-xl">
              <Wrench size={23} />
            </div>
            <span className="text-2xl font-extrabold">
              KAAMFLOW
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-semibold">
            <a href="#services">Services</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#technicians">Join as Technician</a>
          </div>

          <Link
            to="/login"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-semibold"
          >
            Staff Login
          </Link>

        </div>
      </nav>

      {/* Hero */}
      <section className="w-full max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12 py-20 md:py-28 grid md:grid-cols-2 gap-14 items-center">

        <div>
          <span className="inline-block bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-bold">
            Smart Repair Management Platform
          </span>

          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mt-7">
            Reliable Repairs.
            <span className="text-indigo-600"> Better Service.</span>
          </h1>

          <p className="text-slate-500 text-lg mt-6 leading-8">
            Book repair services, connect with skilled technicians
            and track your repair journey — all in one place.
          </p>

          <div className="flex flex-wrap gap-4 mt-9">
            <Link
              to="/request-repair"
              className="bg-indigo-600 text-white px-6 py-4 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700"
            >
              Request a Repair <ArrowRight size={19} />
            </Link>

            <Link
              to="/track-service"
              className="bg-white border border-slate-200 px-6 py-4 rounded-xl font-bold hover:border-indigo-500"
            >
              Track Your Service
            </Link>
          </div>

          <div className="flex gap-6 mt-10 text-sm text-slate-500">
            <span className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-green-600" />
              Trusted Service
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle size={18} className="text-green-600" />
              Easy Tracking
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-600 to-violet-800 rounded-3xl p-10 text-white shadow-xl">
          <div className="bg-white/15 rounded-2xl p-6">
            <Wrench size={55} />
            <h2 className="text-3xl font-bold mt-6">
              Your Repair Journey Starts Here
            </h2>
            <p className="text-indigo-100 mt-4 leading-7">
              From service requests to diagnosis, repair and
              quality checks, manage everything with KAAMFLOW.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-white/10 rounded-xl p-4">
              <ClipboardList size={25} />
              <p className="font-semibold mt-3">Service Requests</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <Users size={25} />
              <p className="font-semibold mt-3">Expert Technicians</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <Clock size={25} />
              <p className="font-semibold mt-3">Repair Tracking</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <ShieldCheck size={25} />
              <p className="font-semibold mt-3">Quality Checks</p>
            </div>
          </div>
        </div>

      </section>

      {/* Services */}
      <section id="services" className="bg-white py-20">
        <div className="w-full max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12 text-center">

          <p className="text-indigo-600 font-bold uppercase tracking-widest text-sm">
            What We Offer
          </p>

          <h2 className="text-3xl md:text-4xl font-extrabold mt-3">
            Everything You Need for Better Repairs
          </h2>

          <div className="grid md:grid-cols-3 gap-7 mt-12 text-left">

            {[
              {
                icon: Wrench,
                title: "Repair Services",
                desc: "Submit your appliance or electronics repair request."
              },
              {
                icon: Users,
                title: "Skilled Technicians",
                desc: "Connect with technicians and follow the repair process."
              },
              {
                icon: ClipboardList,
                title: "Service Tracking",
                desc: "Stay informed about your request and repair progress."
              }
            ].map((item, index) => (
              <div key={index} className="border border-slate-200 rounded-2xl p-7 hover:shadow-lg transition">
                <item.icon size={35} className="text-indigo-600" />
                <h3 className="text-xl font-bold mt-5">{item.title}</h3>
                <p className="text-slate-500 mt-3 leading-7">{item.desc}</p>
              </div>
            ))}

          </div>
        </div>
      </section>

      {/* Technician Section */}
      <section id="technicians" className="w-full max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12 py-20">
        <div className="bg-indigo-50 rounded-3xl p-8 md:p-14 flex flex-col md:flex-row justify-between items-center gap-8">

          <div>
            <p className="text-indigo-600 font-bold">FOR PROFESSIONALS</p>
            <h2 className="text-3xl font-extrabold mt-3">
              Are You a Skilled Technician?
            </h2>
            <p className="text-slate-600 mt-4 max-w-xl leading-7">
              Join the KAAMFLOW team. Submit your application
              and get reviewed by our administration team.
            </p>
          </div>

          <Link
            to="/technician-apply"
            className="bg-indigo-600 text-white px-7 py-4 rounded-xl font-bold whitespace-nowrap hover:bg-indigo-700"
          >
            Apply as Technician <ArrowRight size={18} className="inline ml-2" />
          </Link>

        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-8">
        <div className="w-full max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12 flex flex-col md:flex-row justify-between gap-4">
          <p className="font-bold text-white">KAAMFLOW</p>
          <p className="text-sm">
            Repair Operations & Outcome Intelligence Platform
          </p>
          <p className="text-sm">© 2026 KAAMFLOW</p>
        </div>
      </footer>

    </div>
  );
}

export default Home;
