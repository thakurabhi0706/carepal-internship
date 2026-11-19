
import { useState } from "react";

import {
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";

import { auth } from "../lib/firebase";

import { useAuth } from "../context/AuthContext";

import {
  Heart,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck
} from "lucide-react";

import {
  Link,
  Navigate,
  useNavigate
} from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import LanguageToggle from "../components/LanguageToggle";

export default function AdminLogin() {
  const { t } = useLanguage();
  const { user, loading, isAdmin } = useAuth();

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user && isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setSubmitting(true);

    try {
      const credential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      if (credential.user.uid !== import.meta.env.VITE_ADMIN_UID) {
        await signOut(auth);

        setError("login.denied");

        return;
      }

      navigate("/admin/dashboard", {
        replace: true
      });

    } catch (err) {
      console.error("Login error:", err);

      setError(
        err.code === "auth/invalid-credential"
          ? "login.invalid"
          : "login.failed"
      );

    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7FAF9] flex items-center justify-center p-5">

      <div className="w-full max-w-md relative">

        <Link
          to="/"
          className="flex items-center justify-center gap-2 mb-8"
        >
          <div className="bg-teal-600 text-white p-3 rounded-xl">
            <Heart size={25} />
          </div>

          <span className="text-2xl font-bold text-gray-900">
            TheCarePal
          </span>
        </Link>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8">

          <div className="text-center mb-8">

            <div className="bg-teal-50 text-teal-700 p-4 rounded-full inline-flex mb-4">
              <ShieldCheck size={30} />
            </div>

            <h1 className="text-2xl font-bold text-gray-900">
              {t("login.title")}
            </h1>

            <p className="text-gray-500 mt-2 text-sm">
              {t("login.subtitle")}
            </p>

          </div>

          <form onSubmit={handleLogin} className="space-y-5">

            <div>
              <label className="block text-sm font-semibold mb-2">
                {t("login.email")}
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                {t("login.password")}
              </label>

              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={t("login.passwordPlaceholder")}
                  className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 rounded-lg p-3 text-sm">
                {t(error)}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || loading}
              className="w-full bg-teal-600 text-white rounded-xl py-3.5 font-semibold flex items-center justify-center gap-2 hover:bg-teal-700 disabled:opacity-50"
            >
              {submitting ? t("login.signingIn") : t("login.signIn")}

              {!submitting && <ArrowRight size={18} />}
            </button>

          </form>

          <p className="text-center text-xs text-gray-400 mt-7">
            <ShieldCheck size={14} className="inline mr-1" />
            {t("login.authorized")}
          </p>

        </div>

        <Link
          to="/"
          className="block text-center text-sm text-gray-500 mt-6 hover:text-teal-700"
        >
          {t("login.back")}
        </Link>

      </div>
      <div className="absolute top-5 right-5">
        <LanguageToggle />
      </div>
    </div>
  );
}
