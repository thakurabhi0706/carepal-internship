
import {
  Routes,
  Route,
  Link,
  Navigate
} from "react-router-dom";

import {
  Heart,
  ShieldCheck,
  Clock,
  ArrowRight,
  LockKeyhole
} from "lucide-react";

import Calculator from "./pages/Calculator";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

function Home() {
  const services = [
    ["Elderly Care", "Daily assistance for senior citizens."],
    ["Dementia Care", "Specialized memory care support."],
    ["Baby Care", "Reliable care for babies."],
    ["Recovery Care", "Support during post-surgery recovery."]
  ];

  return (
    <div className="min-h-screen bg-[#F7FAF9]">

      {/* Navigation */}
      <nav className="flex justify-between items-center px-5 sm:px-6 md:px-16 py-5 bg-white border-b">

        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <Heart className="text-teal-600" size={25} />
          <span className="text-xl font-bold">
            TheCarePal
          </span>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center gap-3 sm:gap-6">

          <a
            href="#services"
            className="text-xs sm:text-sm font-semibold text-gray-700 hover:text-teal-600 transition whitespace-nowrap"
          >
            Our Services
          </a>

          <Link
            to="/admin/login"
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 rounded-lg border border-teal-600 text-teal-700 text-xs sm:text-sm font-semibold hover:bg-teal-50 transition whitespace-nowrap"
          >
            <LockKeyhole size={15} />
            Admin Login
          </Link>

        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-20 md:py-28">

        {/* Hero Section */}
        <div className="max-w-3xl mx-auto text-center">

          <span className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 rounded-full px-4 py-2 text-sm">
            <ShieldCheck size={17} />
            Trusted Home Healthcare
          </span>

          <h1 className="text-4xl md:text-6xl font-bold mt-8 leading-tight">
            Quality care at home,
            <span className="text-teal-600">
              {" "}made simple.
            </span>
          </h1>

          <p className="text-gray-500 mt-6 text-lg">
            Find the right care for your loved ones.
            Build a personalized care plan and get an instant price estimate.
          </p>

          <Link
            to="/calculator"
            className="inline-flex items-center gap-3 mt-9 bg-teal-600 text-white px-7 py-4 rounded-xl font-semibold hover:bg-teal-700 transition"
          >
            Build Your Care Plan
            <ArrowRight size={19} />
          </Link>

          {/* Trust Indicators */}
          <div className="flex justify-center flex-wrap gap-8 mt-14 text-sm text-gray-500">

            <span className="flex gap-2 items-center">
              <ShieldCheck className="text-teal-600" size={18} />
              Trained Caregivers
            </span>

            <span className="flex gap-2 items-center">
              <Clock className="text-teal-600" size={18} />
              Flexible Care Plans
            </span>

          </div>
        </div>

        {/* Services Section */}
        <div
          id="services"
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-24"
        >

          {services.map(([title, description]) => (
            <div
              key={title}
              className="bg-white p-6 rounded-2xl border border-gray-100"
            >
              <Heart
                className="text-teal-600 mb-5"
                size={24}
              />

              <h3 className="font-bold">
                {title}
              </h3>

              <p className="text-sm text-gray-500 mt-2">
                {description}
              </p>
            </div>
          ))}

        </div>

      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>

        {/* Public Routes */}
        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/calculator"
          element={<Calculator />}
        />

        {/* Admin Login */}
        <Route
          path="/admin/login"
          element={<AdminLogin />}
        />

        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoute />}>

          <Route
            path="/admin/dashboard"
            element={<AdminDashboard />}
          />

        </Route>

        {/* Fallback */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </AuthProvider>
  );
}
