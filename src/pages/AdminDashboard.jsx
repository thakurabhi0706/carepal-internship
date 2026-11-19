
import { useEffect, useMemo, useState } from "react";

import {
  collection,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  doc
} from "firebase/firestore";

import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import LanguageToggle from "../components/LanguageToggle";

import {
  Heart,
  LayoutDashboard,
  Users,
  Clock,
  CheckCircle,
  Search,
  LogOut,
  MapPin,
  Phone,
  Mail,
  CalendarDays,
  X,
  RefreshCw,
  Download
} from "lucide-react";

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
  }).format(Number(value) || 0);

const statuses = [
  "new",
  "contacted",
  "converted",
  "rejected"
];

const statusStyle = {
  new: "bg-blue-50 text-blue-700",
  contacted: "bg-amber-50 text-amber-700",
  converted: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-700"
};

function StatCard({ title, value, icon: Icon, color }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-3 sm:p-5 min-w-0">
      <div className="flex justify-between items-center gap-2">
        <div className="min-w-0">
          <p className="text-xs sm:text-sm text-gray-500">
            {title}
          </p>

          <h3 className="text-2xl sm:text-3xl font-bold mt-1 sm:mt-2 text-gray-900">
            {value}
          </h3>
        </div>

        <div className={`p-2 sm:p-3 rounded-xl shrink-0 ${color}`}>
          <Icon size={19} className="sm:hidden" />
          <Icon size={24} className="hidden sm:block" />
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  const statusLabel = status => ({
    new: t("admin.statusNew"),
    contacted: t("admin.statusContacted"),
    converted: t("admin.statusConverted"),
    rejected: t("admin.statusRejected")
  }[status] || status);

  const careTypeLabel = careType => ({
    elderly: t("common.elderlyCare"),
    dementia: t("common.dementiaCare"),
    baby: t("common.babyCare"),
    recovery: t("common.recoveryCare")
  }[careType] || careType || "-");

  const callbackLabel = value => ({
    Anytime: t("common.anytime"),
    Morning: t("common.morning"),
    Afternoon: t("common.afternoon"),
    Evening: t("common.evening")
  }[value] || value);

  const shiftLabel = value => ({
    day: t("common.dayShift"),
    "live-in": t("common.liveInCare")
  }[value] || value || "-");

  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedLead, setSelectedLead] = useState(null);
  const [updating, setUpdating] = useState(false);

  // Fetch enquiries from Firestore
  useEffect(() => {
    const q = query(
      collection(db, "careLeads"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const records = snapshot.docs.map(item => ({
          id: item.id,
          ...item.data()
        }));

        setLeads(records);
        setLoading(false);
        setError("");
      },
      (err) => {
        console.error("Firestore error:", err);

        setError(
          "admin.loadError"
        );

        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  // Search and filter enquiries
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const customer = lead.customer || {};
      const carePlan = lead.carePlan || {};

      const text = search.toLowerCase();

      const matchesSearch =
        (customer.name || "").toLowerCase().includes(text) ||
        (customer.phone || "").includes(text) ||
        (carePlan.city || "").toLowerCase().includes(text);

      const matchesStatus =
        filter === "all" || lead.status === filter;

      return matchesSearch && matchesStatus;
    });
  }, [leads, search, filter]);

  // Export filtered enquiries as CSV
  const exportCSV = () => {
    if (filteredLeads.length === 0) {
      alert(t("admin.noExport"));
      return;
    }

    const headers = [
      "Customer Name",
      "Phone",
      "Email",
      "Care Type",
      "City",
      "Daily Hours",
      "Shift",
      "Duration (Days)",
      "Estimated Total",
      "Status",
      "Callback Time",
      "Submitted At"
    ];

    const escapeCSV = (value) => {
      let text = String(value ?? "");

      // Prevent spreadsheet formula injection
      if (/^[=+\-@\t\r]/.test(text)) {
        text = "'" + text;
      }

      return `"${text.replace(/"/g, '""')}"`;
    };

    const rows = filteredLeads.map(lead => [
      lead.customer?.name,
      lead.customer?.phone,
      lead.customer?.email,
      lead.carePlan?.careType,
      lead.carePlan?.city,
      lead.carePlan?.hoursPerDay,
      lead.carePlan?.shift,
      lead.carePlan?.durationDays,
      lead.pricing?.total,
      lead.status,
      lead.customer?.callbackTime,
      lead.createdAt?.toDate
        ? lead.createdAt.toDate().toLocaleString("en-IN")
        : ""
    ]);

    const csvContent = [
      headers.map(escapeCSV).join(","),
      ...rows.map(row => row.map(escapeCSV).join(","))
    ].join("\r\n");

    const blob = new Blob(
      ["\uFEFF" + csvContent],
      { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;

    link.download = `TheCarePal_Enquiries_${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  // Dashboard statistics
  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === "new").length,
    contacted: leads.filter(l => l.status === "contacted").length,
    converted: leads.filter(l => l.status === "converted").length
  };

  // Update enquiry status
  const changeStatus = async (leadId, newStatus) => {
    try {
      setUpdating(true);

      await updateDoc(
        doc(db, "careLeads", leadId),
        { status: newStatus }
      );

      setSelectedLead(prev =>
        prev?.id === leadId
          ? { ...prev, status: newStatus }
          : prev
      );

    } catch (err) {
      console.error("Status update error:", err);
      alert(t("admin.updateError"));

    } finally {
      setUpdating(false);
    }
  };

  // Format Firestore timestamp
  const formatDate = (timestamp) => {
    if (!timestamp?.toDate) return t("common.pending");

    return timestamp.toDate().toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short"
    });
  };

  // Admin logout
  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7FAF9] flex">

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r border-gray-100 flex-col fixed inset-y-0 z-20">

        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <div className="bg-teal-600 text-white p-2 rounded-xl">
            <Heart size={23} />
          </div>

          <span className="font-bold text-xl">
            TheCarePal
          </span>
        </div>

        <div className="p-5">
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-4">
            {t("admin.management")}
          </p>

          <div className="flex items-center gap-3 bg-teal-50 text-teal-700 rounded-xl p-3 font-semibold">
            <LayoutDashboard size={19} />
            {t("admin.dashboard")}
          </div>

          <div className="flex items-center gap-3 text-gray-500 rounded-xl p-3 mt-2">
            <Users size={19} />
            {t("admin.enquiries")}
          </div>
        </div>

        <div className="mt-auto p-5 border-t border-gray-100">
          <p className="text-xs text-gray-400 mb-2">
            {t("admin.loggedIn")}
          </p>

          <p className="text-sm font-semibold truncate">
            {user?.email}
          </p>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-red-500 mt-5 text-sm font-semibold hover:text-red-700"
          >
            <LogOut size={18} />
            {t("admin.logout")}
          </button>
        </div>

      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 md:ml-64 p-4 sm:p-5 md:p-9">

        {/* Header */}
        <header className="flex justify-between items-start gap-3 mb-6 md:mb-8">

          <div className="min-w-0">

            {/* Mobile Branding */}
            <div className="flex items-center gap-2 mb-3 md:hidden">
              <div className="bg-teal-600 text-white p-1.5 rounded-lg">
                <Heart size={18} />
              </div>

              <span className="font-bold text-lg">
                TheCarePal
              </span>
            </div>

            <p className="text-xs sm:text-sm text-gray-500">
              {t("admin.breadcrumb")}
            </p>

            <h1 className="text-2xl sm:text-3xl font-bold mt-1">
              {t("admin.dashboard")}
            </h1>

            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              {t("admin.dashboardSubtitle")}
            </p>

          </div>

          <div className="flex items-center gap-2 shrink-0">
            <LanguageToggle />

            {/* Mobile Logout */}
            <button
              onClick={handleLogout}
              className="md:hidden shrink-0 p-2.5 bg-white rounded-xl border border-gray-200 text-red-500"
              aria-label={t("admin.logout")}
            >
              <LogOut size={19} />
            </button>

            {/* Desktop Active Status */}
            <div className="hidden md:flex items-center gap-2 bg-white border rounded-xl px-4 py-3">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm text-gray-600">
                {t("admin.active")}
              </span>
            </div>
          </div>

        </header>

        {/* Statistics */}
        <section className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 mb-6 md:mb-8">

          <StatCard
            title={t("admin.total")}
            value={stats.total}
            icon={Users}
            color="bg-blue-50 text-blue-600"
          />

          <StatCard
            title={t("admin.new")}
            value={stats.new}
            icon={Clock}
            color="bg-amber-50 text-amber-600"
          />

          <StatCard
            title={t("admin.contacted")}
            value={stats.contacted}
            icon={RefreshCw}
            color="bg-purple-50 text-purple-600"
          />

          <StatCard
            title={t("admin.converted")}
            value={stats.converted}
            icon={CheckCircle}
            color="bg-green-50 text-green-600"
          />

        </section>

        {/* Leads Section */}
        <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden">

          <div className="p-4 sm:p-5 md:p-6 border-b border-gray-100">

            {/* Search and CSV Export */}
            <div className="flex flex-col sm:flex-row gap-3">

              <div className="relative flex-1 min-w-0">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={t("admin.search")}
                  className="border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm w-full sm:w-72 outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <button
                onClick={exportCSV}
                disabled={filteredLeads.length === 0}
                className="flex items-center justify-center gap-2 bg-teal-600 text-white px-5 py-3 rounded-xl text-sm font-semibold hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition w-full sm:w-auto"
              >
                <Download size={18} />
                {t("admin.export")}
              </button>

            </div>

            {/* Status Filters */}
            <div className="flex gap-2 overflow-x-auto mt-5 pb-2">

              {["all", ...statuses].map(status => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize whitespace-nowrap shrink-0 ${
                    filter === status
                      ? "bg-teal-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {status === "all" ? t("admin.statusAll") : statusLabel(status)}
                </button>
              ))}

            </div>

          </div>

          {/* Error */}
          {error && (
            <div className="p-5 text-red-600 bg-red-50 text-sm">
              {error}
            </div>
          )}

          {/* Loading / Empty / Leads */}
          {loading ? (

            <div className="p-16 text-center text-gray-500">
              <RefreshCw className="animate-spin mx-auto mb-3" />
              {t("admin.loading")}
            </div>

          ) : filteredLeads.length === 0 ? (

            <div className="p-10 sm:p-16 text-center">
              <Users className="mx-auto text-gray-300 mb-3" size={40} />

              <p className="font-semibold text-gray-700">
                {t("admin.noResults")}
              </p>

              <p className="text-sm text-gray-400 mt-2">
                {t("admin.emptyHint")}
              </p>
            </div>

          ) : (

            <>
              {/* -------------------------------- */}
              {/* Mobile Enquiry Cards */}
              {/* -------------------------------- */}
              <div className="md:hidden divide-y divide-gray-100">

                {filteredLeads.map(lead => (

                  <div
                    key={lead.id}
                    className="p-4 space-y-3"
                  >

                    <div className="flex justify-between items-start gap-3">

                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 truncate">
                          {lead.customer?.name || t("common.unknown")}
                        </p>

                        <p className="text-xs text-gray-500 mt-1">
                          {lead.customer?.phone}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                          statusStyle[lead.status] ||
                          "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {statusLabel(lead.status)}
                      </span>

                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">

                      <div>
                        <p className="text-xs text-gray-400">
                          {t("common.careType")}
                        </p>

                        <p className="font-medium capitalize">
                          {careTypeLabel(lead.carePlan?.careType)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-400">
                          {t("common.city")}
                        </p>

                        <p className="font-medium">
                          {lead.carePlan?.city || "-"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-400">
                          {t("admin.estimate")}
                        </p>

                        <p className="font-semibold text-teal-700">
                          {money(lead.pricing?.total)}
                        </p>
                      </div>

                    </div>

                    <button
                      onClick={() => setSelectedLead(lead)}
                      className="w-full border border-teal-600 text-teal-700 rounded-lg py-2.5 text-sm font-semibold hover:bg-teal-50 transition"
                    >
                      {t("admin.viewDetails")}
                    </button>

                  </div>

                ))}

              </div>

              {/* -------------------------------- */}
              {/* Desktop Enquiry Table */}
              {/* -------------------------------- */}
              <div className="hidden md:block overflow-x-auto">

                <table className="w-full text-left min-w-[750px]">

                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                    <tr>
                      <th className="px-6 py-4">{t("admin.customer")}</th>
                      <th className="px-6 py-4">{t("common.careType")}</th>
                      <th className="px-6 py-4">{t("common.city")}</th>
                      <th className="px-6 py-4">{t("admin.estimate")}</th>
                      <th className="px-6 py-4">{t("admin.status")}</th>
                      <th className="px-6 py-4">{t("admin.action")}</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">

                    {filteredLeads.map(lead => (

                      <tr
                        key={lead.id}
                        className="hover:bg-gray-50"
                      >

                        <td className="px-6 py-4">
                          <p className="font-semibold text-gray-900">
                            {lead.customer?.name || t("common.unknown")}
                          </p>

                          <p className="text-xs text-gray-400 mt-1">
                            {lead.customer?.phone}
                          </p>
                        </td>

                        <td className="px-6 py-4 capitalize text-sm">
                          {careTypeLabel(lead.carePlan?.careType)}
                        </td>

                        <td className="px-6 py-4 text-sm">
                          {lead.carePlan?.city || "-"}
                        </td>

                        <td className="px-6 py-4 font-semibold text-sm">
                          {money(lead.pricing?.total)}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize ${
                              statusStyle[lead.status] ||
                              "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {statusLabel(lead.status)}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <button
                            onClick={() => setSelectedLead(lead)}
                            className="text-teal-700 font-semibold text-sm hover:underline"
                          >
                            {t("admin.viewDetails")}
                          </button>
                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>
            </>

          )}

        </section>

        <p className="text-center text-xs text-gray-400 mt-6">
          {t("admin.system")}
        </p>

      </main>

      {/* ------------------------------------------ */}
      {/* Lead Details Modal */}
      {/* ------------------------------------------ */}

      {selectedLead && (

        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setSelectedLead(null)}
        >

          <div
            className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-2xl max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >

            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b flex justify-between items-center gap-3">

              <div className="min-w-0">
                <h2 className="text-lg sm:text-xl font-bold">
                  {t("admin.detailsTitle")}
                </h2>

                <p className="text-xs text-gray-400 mt-1 break-all">
                  {t("admin.recordId")}: {selectedLead.id}
                </p>
              </div>

              <button
                onClick={() => setSelectedLead(null)}
                className="p-2 rounded-lg hover:bg-gray-100 shrink-0"
                aria-label={t("admin.closeDetails")}
              >
                <X size={21} />
              </button>

            </div>

            <div className="p-4 sm:p-6 space-y-6 sm:space-y-7">

              {/* Customer Information */}
              <div>
                <h3 className="font-bold mb-4">
                  {t("admin.customerInfo")}
                </h3>

                <div className="space-y-3 text-sm">

                  <p className="flex gap-3 items-center min-w-0">
                    <Users size={17} className="text-teal-600 shrink-0" />
                    <span className="break-words">
                      {selectedLead.customer?.name}
                    </span>
                  </p>

                  <p className="flex gap-3 items-center">
                    <Phone size={17} className="text-teal-600 shrink-0" />
                    {selectedLead.customer?.phone}
                  </p>

                  <p className="flex gap-3 items-center min-w-0">
                    <Mail size={17} className="text-teal-600 shrink-0" />
                    <span className="break-all">
                      {selectedLead.customer?.email}
                    </span>
                  </p>

                  <p className="flex gap-3 items-center">
                    <Clock size={17} className="text-teal-600 shrink-0" />
                    <span>
                      {t("admin.callback")}: {callbackLabel(selectedLead.customer?.callbackTime)}
                    </span>
                  </p>

                </div>
              </div>

              {/* Care Plan Information */}
              <div className="border-t pt-6">

                <h3 className="font-bold mb-4">
                  {t("admin.carePlanInfo")}
                </h3>

                <div className="grid grid-cols-2 gap-4 sm:gap-5 text-sm">

                  <div>
                    <p className="text-gray-400">{t("common.careType")}</p>

                    <p className="font-semibold capitalize">
                      {careTypeLabel(selectedLead.carePlan?.careType)}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-400">{t("common.city")}</p>

                    <p className="font-semibold flex items-center gap-1">
                      <MapPin size={14} />
                      {selectedLead.carePlan?.city}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-400">{t("common.dailyHours")}</p>

                    <p className="font-semibold">
                      {selectedLead.carePlan?.hoursPerDay} {t("common.hours")}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-400">{t("common.shift")}</p>

                    <p className="font-semibold capitalize">
                      {shiftLabel(selectedLead.carePlan?.shift)}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-400">{t("common.duration")}</p>

                    <p className="font-semibold">
                      {selectedLead.carePlan?.durationDays} {t("common.days")}
                    </p>
                  </div>

                </div>

                {/* Additional Services */}
                <div className="mt-5">

                  <p className="text-gray-400 text-sm mb-2">
                    {t("admin.additionalServices")}
                  </p>

                  <div className="flex flex-wrap gap-2">

                    {Object.entries(
                      selectedLead.carePlan?.addons || {}
                    )
                      .filter(([, quantity]) => Number(quantity) > 0)
                      .map(([name, quantity]) => (

                        <span
                          key={name}
                          className="bg-teal-50 text-teal-700 px-3 py-2 rounded-lg text-xs font-semibold capitalize"
                        >
                          {name === "physiotherapy" ? t("common.physiotherapy") : name}: {quantity}
                        </span>

                      ))}

                    {Object.values(
                      selectedLead.carePlan?.addons || {}
                    ).every(q => Number(q) === 0) && (

                      <span className="text-sm text-gray-400">
                        {t("admin.noServices")}
                      </span>

                    )}

                  </div>

                </div>

              </div>

              {/* Pricing Breakdown */}
              <div className="border-t pt-6">

                <h3 className="font-bold mb-4">
                  {t("admin.pricingBreakdown")}
                </h3>

                {selectedLead.pricing ? (

                  <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-5">

                    {/* Base Care Calculation */}
                    <p className="font-semibold text-gray-800 mb-3">
                      {t("admin.careCharges")}
                    </p>

                    <div className="space-y-3 text-sm">

                      <div className="flex justify-between gap-3">
                        <span className="text-gray-500">
                          {t("admin.baseDaily")}
                        </span>

                        <span className="font-medium text-gray-800 text-right">
                          {money(selectedLead.pricing.baseRate)}
                        </span>
                      </div>

                      <div className="flex justify-between gap-3">
                        <span className="text-gray-500">
                          {t("admin.hoursMultiplier")}
                        </span>

                        <span className="font-medium text-gray-800">
                          × {selectedLead.pricing.hoursMultiplier}
                        </span>
                      </div>

                      <div className="flex justify-between gap-3">
                        <span className="text-gray-500">
                          {t("admin.dailyCost")}
                        </span>

                        <span className="font-medium text-gray-800 text-right">
                          {money(selectedLead.pricing.dailyCareCost)}
                        </span>
                      </div>

                      <div className="flex justify-between gap-3">
                        <span className="text-gray-500">
                          {t("admin.durationDays", { days: selectedLead.carePlan?.durationDays })}
                        </span>

                        <span className="font-semibold text-gray-800 text-right">
                          {money(selectedLead.pricing.careCost)}
                        </span>
                      </div>

                    </div>

                    {/* Add-on Breakdown */}
                    <div className="border-t border-gray-100 mt-5 pt-4">

                      <p className="font-semibold text-gray-800 mb-3">
                        {t("admin.additionalServices")}
                      </p>

                      {selectedLead.pricing.addons?.length > 0 ? (

                        <div className="space-y-3">

                          {selectedLead.pricing.addons.map((addon, index) => (

                            <div
                              key={addon.key || index}
                              className="flex justify-between gap-3 text-sm"
                            >

                              <div className="min-w-0">
                                <p className="font-medium text-gray-700">
                                  {addon.key === "physiotherapy" ? t("common.physiotherapy") : addon.name}
                                </p>

                                <p className="text-xs text-gray-400 mt-1">
                                  {addon.quantity} {addon.key === "physiotherapy" ? t("common.visit") : addon.unit}
                                  {addon.quantity > 1 && addon.key !== "physiotherapy" ? "s" : ""} × {money(addon.unitPrice)}
                                </p>
                              </div>

                              <span className="font-medium text-gray-800 text-right shrink-0">
                                {money(addon.total)}
                              </span>

                            </div>

                          ))}

                        </div>

                      ) : (

                        <p className="text-sm text-gray-400">
                          {t("admin.noServiceCharges")}
                        </p>

                      )}

                    </div>

                    {/* Final Calculation */}
                    <div className="border-t border-gray-200 mt-5 pt-4 space-y-3 text-sm">

                      <div className="flex justify-between gap-3">
                        <span className="text-gray-600">
                          {t("admin.careCharges")}
                        </span>

                        <span className="text-right">
                          {money(selectedLead.pricing.careCost)}
                        </span>
                      </div>

                      <div className="flex justify-between gap-3">
                        <span className="text-gray-600">
                          {t("admin.addOnTotal")}
                        </span>

                        <span className="text-right">
                          {money(selectedLead.pricing.addonTotal)}
                        </span>
                      </div>

                      <div className="flex justify-between gap-3 font-semibold">
                        <span>{t("estimate.subtotal")}</span>

                        <span className="text-right">
                          {money(selectedLead.pricing.subtotal)}
                        </span>
                      </div>

                      <div className="flex justify-between gap-3">
                        <span className="text-gray-600">
                          {t("estimate.gst", { percentage: selectedLead.pricing.gstPercentage })}
                        </span>

                        <span className="text-right">
                          {money(selectedLead.pricing.gstAmount)}
                        </span>
                      </div>

                    </div>

                    {/* Final Total */}
                    <div className="flex justify-between items-center bg-teal-50 rounded-xl p-3 sm:p-4 mt-5 gap-3">

                      <div>
                        <p className="font-bold text-teal-900">
                          {t("admin.finalEstimate")}
                        </p>

                        <p className="text-xs text-teal-700 mt-1">
                          {t("admin.inclusiveGst")}
                        </p>
                      </div>

                      <p className="text-lg sm:text-2xl font-bold text-teal-800 text-right">
                        {money(selectedLead.pricing.total)}
                      </p>

                    </div>

                  </div>

                ) : (

                  <div className="bg-gray-50 rounded-xl p-5">
                    <p className="text-sm text-gray-500">
                      {t("admin.pricingUnavailable")}
                    </p>
                  </div>

                )}

              </div>

              {/* Update Enquiry Status */}
              <div className="border-t pt-6">

                <h3 className="font-bold mb-3">
                  {t("admin.updateStatus")}
                </h3>

                <select
                  value={selectedLead.status || "new"}
                  disabled={updating}
                  onChange={e =>
                    changeStatus(selectedLead.id, e.target.value)
                  }
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-teal-500 capitalize"
                >

                  {statuses.map(status => (

                    <option key={status} value={status}>
                      {statusLabel(status)}
                    </option>

                  ))}

                </select>

                {updating && (
                  <p className="text-xs text-gray-400 mt-2">
                    {t("admin.updating")}
                  </p>
                )}

              </div>

              {/* Submission Date */}
              <div className="text-xs text-gray-400 flex gap-2 items-center">
                <CalendarDays size={15} />
                {t("admin.submitted")}: {formatDate(selectedLead.createdAt)}
              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}
