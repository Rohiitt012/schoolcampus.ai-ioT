"use client";

import React, { useState, useEffect } from "react";
import { useSocket } from "@/context/SocketContext";
import { API_BASE_URL } from "@/context/AuthContext";

export default function SmartAlertsPage() {
  const { socket } = useSocket();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (filterStatus === "active") query.append("resolved", "false");
      if (filterStatus === "resolved") query.append("resolved", "true");
      if (filterSeverity !== "all") query.append("severity", filterSeverity);

      const res = await fetch(`${API_BASE_URL}/alerts?${query.toString()}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setAlerts(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [filterStatus, filterSeverity]);

  // Real-time Socket listener for new alerts
  useEffect(() => {
    if (!socket) return;

    socket.on("alert:new", (newAlert: any) => {
      setAlerts((prev) => [newAlert, ...prev]);
    });

    return () => {
      socket.off("alert:new");
    };
  }, [socket]);

  const handleResolve = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/alerts/${id}/resolve`, {
        method: "PUT",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        fetchAlerts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
      case "HIGH":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200";
      case "MEDIUM":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200";
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Smart IoT Alert Hub</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Real-time automated incident detection for speed violations, route deviations, and offline telemetry.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-xs font-semibold text-gray-900 dark:text-white"
          >
            <option value="all">All Alerts</option>
            <option value="active">Active Unresolved</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Severity:</span>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-xs font-semibold text-gray-900 dark:text-white"
          >
            <option value="all">All Severities</option>
            <option value="HIGH">High / Critical</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                <th className="px-6 py-3.5">Alert Type</th>
                <th className="px-6 py-3.5">Severity</th>
                <th className="px-6 py-3.5">Message / Details</th>
                <th className="px-6 py-3.5">Target Unit</th>
                <th className="px-6 py-3.5">Logged Time</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Loading smart alert logs...</td>
                </tr>
              ) : alerts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No alert records match current filters.</td>
                </tr>
              ) : (
                alerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-bold text-xs px-2.5 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700">
                        🚨 {alert.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getSeverityBadge(alert.severity)}`}>
                        {alert.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-800 dark:text-gray-200 text-xs max-w-md">
                      {alert.message}
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-gray-600 dark:text-gray-300">
                      {alert.bus?.busNumber ? `Bus ${alert.bus.busNumber}` : alert.student?.name || "System"}
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-gray-400">
                      {new Date(alert.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {alert.resolved ? (
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center justify-end gap-1">
                          ✓ Resolved
                        </span>
                      ) : (
                        <button
                          onClick={() => handleResolve(alert.id)}
                          className="px-3 py-1 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
                        >
                          Mark Resolved
                        </button>
                      )}
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
