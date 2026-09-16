"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getSocket } from "@/hooks/useSocket";

interface IncidentEvent {
  id: string;
  action: string;
  description: string;
  performedBy?: string;
  timestamp: string;
}

interface EmergencyIncident {
  id: string;
  incidentType: string;
  severity: string;
  status: string;
  location: string;
  building?: string;
  busId?: string;
  createdAt: string;
  events?: IncidentEvent[];
}

export default function EmergencyPage() {
  const [incidents, setIncidents] = useState<EmergencyIncident[]>([]);
  const [loading, setLoading] = useState(true);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const fetchIncidents = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/emergency/incidents`, { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        setIncidents(data.data);
      }
    } catch (err) {
      console.error("Error fetching incidents:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();

    const socket = getSocket();
    const handleSOS = (newIncident: EmergencyIncident) => {
      setIncidents((prev) => [newIncident, ...prev.filter((i) => i.id !== newIncident.id)]);
    };

    socket.on("emergency:sos", handleSOS);

    return () => {
      socket.off("emergency:sos", handleSOS);
    };
  }, []);

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case "CRITICAL":
        return "bg-red-600 text-white font-black animate-pulse shadow-md";
      case "HIGH":
        return "bg-orange-500/10 text-orange-600 border border-orange-500/20";
      case "MEDIUM":
        return "bg-amber-500/10 text-amber-600 border border-amber-500/20";
      default:
        return "bg-blue-500/10 text-blue-600 border border-blue-500/20";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "OPEN":
        return "bg-red-500/10 text-red-600 border border-red-500/20 font-bold";
      case "ACKNOWLEDGED":
        return "bg-amber-500/10 text-amber-600 border border-amber-500/20 font-bold";
      case "IN_PROGRESS":
        return "bg-blue-500/10 text-blue-600 border border-blue-500/20 font-bold";
      case "RESOLVED":
        return "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-bold";
      default:
        return "bg-gray-500/10 text-gray-600";
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
              Phase 13 Enterprise
            </span>
            <span className="text-xs text-gray-500">• Emergency Response Protocol</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            Emergency & Safety Management Hub
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Rapid incident reporting, Driver SOS signals, response team dispatch, and complete audit trail.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/incidents"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 rounded-xl transition"
          >
            All Incidents ({incidents.length})
          </Link>
          <Link
            href="/sos"
            className="px-5 py-2.5 text-sm font-black text-white bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 rounded-xl shadow-lg transition flex items-center gap-2 animate-pulse"
          >
            🚨 TRIGGER SOS
          </Link>
        </div>
      </div>

      {/* Incident Status Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 rounded-2xl shadow-sm">
          <span className="text-xs text-red-500 font-bold uppercase tracking-wider">Active Open</span>
          <div className="text-3xl font-black text-gray-900 dark:text-white mt-1">
            {incidents.filter((i) => i.status === "OPEN").length}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 rounded-2xl shadow-sm">
          <span className="text-xs text-amber-500 font-bold uppercase tracking-wider">Acknowledged</span>
          <div className="text-3xl font-black text-gray-900 dark:text-white mt-1">
            {incidents.filter((i) => i.status === "ACKNOWLEDGED").length}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 rounded-2xl shadow-sm">
          <span className="text-xs text-blue-500 font-bold uppercase tracking-wider">In Progress</span>
          <div className="text-3xl font-black text-gray-900 dark:text-white mt-1">
            {incidents.filter((i) => i.status === "IN_PROGRESS").length}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-5 rounded-2xl shadow-sm">
          <span className="text-xs text-emerald-500 font-bold uppercase tracking-wider">Resolved Today</span>
          <div className="text-3xl font-black text-gray-900 dark:text-white mt-1">
            {incidents.filter((i) => i.status === "RESOLVED").length}
          </div>
        </div>
      </div>

      {/* Active Incidents Stream Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
            Realtime Emergency Incident Stream
          </h2>
          <span className="text-xs font-mono text-gray-400">Socket.IO Broadcast Active</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase border-b border-gray-200 dark:border-gray-800">
              <tr>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Incident Type</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-gray-500">
                    Loading emergency incidents...
                  </td>
                </tr>
              ) : incidents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-gray-500">
                    No active emergency incidents logged. All systems clear.
                  </td>
                </tr>
              ) : (
                incidents.map((inc) => (
                  <tr key={inc.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3 text-xs font-mono text-gray-500">
                      {new Date(inc.createdAt).toLocaleTimeString()}
                    </td>
                    <td className="px-4 py-3 font-bold text-gray-900 dark:text-white">
                      {inc.incidentType.replace(/_/g, " ")}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase ${getSeverityBadge(inc.severity)}`}>
                        {inc.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-300">
                      {inc.location}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs ${getStatusBadge(inc.status)}`}>
                        {inc.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/incidents/${inc.id}`}
                        className="text-xs text-red-600 hover:text-red-800 font-bold"
                      >
                        Inspect Timeline →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
