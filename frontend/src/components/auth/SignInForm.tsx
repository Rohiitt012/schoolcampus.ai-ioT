"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { EyeCloseIcon, EyeIcon } from "@/icons";

export default function SignInForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState("admin@smartschool.com");
  const [password, setPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedRole, setSelectedRole] = useState("ADMIN");

  const handleQuickFill = (role: string, demoEmail: string) => {
    setSelectedRole(role);
    setEmail(demoEmail);
    setPassword("password123");
    setErrorMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    const res = await login(email, password);
    setLoading(false);

    if (!res.success) {
      setErrorMessage(res.message || "Failed to sign in. Please verify your credentials.");
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-5/12 w-full justify-center px-6 py-12 lg:px-14 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto space-y-6">
        {/* Brand Header */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-indigo-700 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-indigo-500/20 ring-4 ring-indigo-500/10">
              S
            </div>
            <div>
              <span className="font-black text-2xl tracking-tight text-slate-900 dark:text-white block leading-tight">
                Smart Campus <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">IoT</span>
              </span>
              <span className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-bold block">
                AI & Enterprise Control Platform
              </span>
            </div>
          </div>

          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Sign In to Platform
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Access Command Center, Bus Fleet, IoT Sensors & AI Assistant.
          </p>
        </div>

        {/* Demo Role Selector Card */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-md shadow-slate-200/50 dark:shadow-none">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
              <span>⚡ Demo Role Switcher</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">1-Click Auto Fill</span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            {[
              { id: "SUPER_ADMIN", label: "Super", email: "superadmin@smartschool.com" },
              { id: "ADMIN", label: "Admin", email: "admin@smartschool.com" },
              { id: "TEACHER", label: "Teacher", email: "teacher@smartschool.com" },
              { id: "DRIVER", label: "Driver", email: "driver@smartschool.com" },
              { id: "PARENT", label: "Parent", email: "parent@smartschool.com" },
            ].map((role) => (
              <button
                key={role.id}
                type="button"
                onClick={() => handleQuickFill(role.id, role.email)}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all text-center ${
                  selectedRole === role.id
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-900"
                }`}
              >
                {role.label}
              </button>
            ))}
          </div>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2">
            <span>⚠️</span> {errorMessage}
          </div>
        )}

        {/* Login Form Container */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/60 dark:shadow-none space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@smartschool.com"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-600 focus:outline-none text-sm font-medium transition-all shadow-inner"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-600 focus:outline-none text-sm font-mono transition-all shadow-inner pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                >
                  {showPassword ? <EyeIcon className="w-5 h-5 fill-current" /> : <EyeCloseIcon className="w-5 h-5 fill-current" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 transition-all duration-200 disabled:opacity-50 text-sm tracking-wide transform active:scale-[0.99]"
            >
              {loading ? "Authenticating Session..." : "Sign In to Platform →"}
            </button>
          </form>
        </div>

        {/* Security & Multi-tenant Badge */}
        <div className="pt-2 text-center text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span>🔒 Multi-School Tenancy</span>
          <span>⚡ JWT HTTP-Only Encryption</span>
        </div>
      </div>
    </div>
  );
}
