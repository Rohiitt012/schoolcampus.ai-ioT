"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function SOSPanicPage() {
  const { user } = useAuth();
  const [incidentType, setIncidentType] = useState("BUS_EMERGENCY");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [successResult, setSuccessResult] = useState<any>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const handleTriggerSOS = async () => {
    setLoading(true);
    setSuccessResult(null);
    try {
      const res = await fetch(`${API_BASE}/api/emergency/sos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          incidentType,
          location: location || undefined,
          description: description || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessResult(data.data);
      } else {
        alert(data.error || "Failed to broadcast SOS emergency");
      }
    } catch (err) {
      console.error("SOS trigger error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/emergency" className="text-xs text-red-600 dark:text-red-400 font-semibold">
          ← Back to Emergency Hub
        </Link>
        <span className="text-xs font-mono text-gray-400">
          User: {user?.name || "Staff"} ({user?.role})
        </span>
      </div>

      <div className="bg-white dark:bg-gray-900 border-2 border-red-500/30 rounded-3xl p-8 shadow-2xl text-center space-y-6">
        <div>
          <span className="px-3 py-1 rounded-full text-xs font-black bg-red-600 text-white uppercase tracking-wider animate-pulse">
            🚨 1-TAP EMERGENCY SOS SYSTEM
          </span>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white mt-3">
            DRIVER & STAFF PANIC BUTTON
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Pressing the button below instantly creates a CRITICAL incident, broadcasts Socket.IO emergency alerts, and dispatches command center notifications.
          </p>
        </div>

        {/* Big Red SOS Button */}
        <div className="py-4">
          <button
            onClick={handleTriggerSOS}
            disabled={loading}
            className="w-48 h-48 rounded-full bg-gradient-to-tr from-red-700 via-red-600 to-rose-500 text-white font-black text-4xl shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 border-8 border-red-950/40 flex flex-col items-center justify-center mx-auto ring-8 ring-red-500/20 disabled:opacity-50"
          >
            {loading ? (
              <span className="text-lg">BROADCASTING...</span>
            ) : (
              <>
                <span>SOS</span>
                <span className="text-xs font-sans tracking-widest font-normal opacity-90 mt-1">PRESS NOW</span>
              </>
            )}
          </button>
        </div>

        {/* Emergency Type Selection */}
        <div className="space-y-3 text-left pt-4 border-t border-gray-100 dark:border-gray-800">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              Select Emergency Category
            </label>
            <select
              value={incidentType}
              onChange={(e) => setIncidentType(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-sm font-bold"
            >
              <option value="BUS_EMERGENCY">BUS EMERGENCY (Collision / Breakdown / Distress)</option>
              <option value="STUDENT_EMERGENCY">STUDENT EMERGENCY (Missing / Medical / Distress)</option>
              <option value="FIRE">FIRE / SMOKE EMERGENCY</option>
              <option value="MEDICAL_EMERGENCY">MEDICAL EMERGENCY</option>
              <option value="SECURITY_INCIDENT">SECURITY INCIDENT</option>
              <option value="UNAUTHORIZED_ACCESS">UNAUTHORIZED ACCESS</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              Location Override (Optional - Defaults to assigned Bus/Campus location)
            </label>
            <input
              type="text"
              placeholder="e.g. Sector 15 Highway near Oakwood Park"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              Additional Details (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Engine smoke detected on Bus 101."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Confirmation Toast */}
      {successResult && (
        <div className="bg-emerald-950 text-emerald-300 p-6 rounded-2xl border border-emerald-800 space-y-2 shadow-lg">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base flex items-center gap-2">
              <span>✅ EMERGENCY SOS BROADCAST SUCCESSFUL</span>
            </h3>
            <span className="text-xs font-mono">Incident #{successResult.id.substring(0, 8)}</span>
          </div>
          <p className="text-xs text-emerald-200">
            Emergency dispatched at {new Date(successResult.createdAt).toLocaleTimeString()}. Command center operators and response teams have received real-time Socket.IO notifications.
          </p>
          <div className="pt-2">
            <Link
              href={`/incidents/${successResult.id}`}
              className="text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-600 px-4 py-2 rounded-lg inline-block"
            >
              Open Incident Command Center →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
