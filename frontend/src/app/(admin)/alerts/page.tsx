"use client";

import React, { useState, useEffect } from "react";
import { useSocket } from "@/context/SocketContext";
import { API_BASE_URL, getAuthHeaders } from "@/context/AuthContext";

export default function SmartAlertsPage() {
  const { socket } = useSocket();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [waLogs, setWaLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"ALERTS" | "WHATSAPP">("WHATSAPP");

  // Alert Filters
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");

  // WhatsApp Test State
  const [testPhone, setTestPhone] = useState("+91 98765 43210");
  const [testParentName, setTestParentName] = useState("Vikram Sharma");
  const [testStudentName, setTestStudentName] = useState("Rahul Sharma");
  const [testType, setTestType] = useState("GATE_ENTRY");
  const [sendingWa, setSendingWa] = useState(false);
  const [lastSentWa, setLastSentWa] = useState<any>(null);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (filterStatus === "active") query.append("resolved", "false");
      if (filterStatus === "resolved") query.append("resolved", "true");
      if (filterSeverity !== "all") query.append("severity", filterSeverity);

      const res = await fetch(`${API_BASE_URL}/alerts?${query.toString()}`, {
        headers: getAuthHeaders(),
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

  const fetchWaLogs = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/whatsapp/logs`, {
        headers: getAuthHeaders(),
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setWaLogs(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAlerts();
    fetchWaLogs();
  }, [filterStatus, filterSeverity]);

  // Real-time Socket listener for new alerts & attendance WhatsApp dispatches
  useEffect(() => {
    if (!socket) return;

    socket.on("alert:new", (newAlert: any) => {
      setAlerts((prev) => [newAlert, ...prev]);
    });

    socket.on("attendance:scan", (data: any) => {
      if (data.whatsappLog) {
        setWaLogs((prev) => [data.whatsappLog, ...prev]);
      }
    });

    return () => {
      socket.off("alert:new");
      socket.off("attendance:scan");
    };
  }, [socket]);

  const handleResolve = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/alerts/${id}/resolve`, {
        method: "PUT",
        headers: getAuthHeaders(),
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

  const handleSendTestWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingWa(true);
    try {
      const res = await fetch(`${API_BASE_URL}/whatsapp/send-test`, {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify({
          toPhone: testPhone,
          parentName: testParentName,
          studentName: testStudentName,
          messageType: testType,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setLastSentWa(data.log);
        fetchWaLogs();
      } else {
        alert(data.message || "Failed to dispatch WhatsApp alert");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSendingWa(false);
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span>💬</span> WhatsApp Instant Alerts & Security Hub
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Real-time WhatsApp notifications dispatched to parents for RFID Gate Scans, Bus Tracking & Emergency SOS.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="inline-flex rounded-xl bg-gray-100 dark:bg-gray-800 p-1 border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab("WHATSAPP")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === "WHATSAPP"
                ? "bg-emerald-600 text-white shadow-md"
                : "text-gray-600 dark:text-gray-300 hover:text-gray-900"
            }`}
          >
            <span>💬</span> WhatsApp Dispatch Hub ({waLogs.length})
          </button>
          <button
            onClick={() => setActiveTab("ALERTS")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === "ALERTS"
                ? "bg-brand-600 text-white shadow-md"
                : "text-gray-600 dark:text-gray-300 hover:text-gray-900"
            }`}
          >
            <span>🚨</span> Safety Alerts ({alerts.filter((a) => !a.resolved).length})
          </button>
        </div>
      </div>

      {activeTab === "WHATSAPP" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Dispatch Tester Panel */}
          <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <span className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
                <span className="text-emerald-500">📱</span> WhatsApp Instant Dispatcher
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                🟢 Live API Connected
              </span>
            </div>

            <form onSubmit={handleSendTestWhatsApp} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Parent Phone Number</label>
                <input
                  type="text"
                  required
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Parent Name</label>
                  <input
                    type="text"
                    required
                    value={testParentName}
                    onChange={(e) => setTestParentName(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Student Name</label>
                  <input
                    type="text"
                    required
                    value={testStudentName}
                    onChange={(e) => setTestStudentName(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Alert Template</label>
                <select
                  value={testType}
                  onChange={(e) => setTestType(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="GATE_ENTRY">🎒 Gate Entry Scan Alert</option>
                  <option value="GATE_EXIT">👋 Gate Departure Scan Alert</option>
                  <option value="BUS_BOARDED">🚌 Bus Boarded Alert</option>
                  <option value="EMERGENCY_SOS">🚨 High Priority Emergency SOS Alert</option>
                  <option value="CUSTOM_TEST">🔔 Custom System Test Alert</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={sendingWa}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>🚀</span> {sendingWa ? "Sending WhatsApp..." : "Send Test WhatsApp Alert"}
              </button>
            </form>

            {/* Live Message Preview Bubble */}
            {lastSentWa && (
              <div className="pt-3 border-t border-gray-100 dark:border-gray-800 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                  Last WhatsApp Sent Preview
                </span>
                <div className="p-3.5 rounded-2xl bg-emerald-950 text-emerald-100 border border-emerald-800/60 font-sans text-xs space-y-1 shadow-inner relative">
                  <div className="flex items-center justify-between text-[10px] text-emerald-400 font-mono border-b border-emerald-900 pb-1">
                    <span>TO: {lastSentWa.toPhone}</span>
                    <span className="text-emerald-300">✅ DELIVERED</span>
                  </div>
                  <p className="whitespace-pre-line leading-relaxed pt-1 text-xs">
                    {lastSentWa.content}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* WhatsApp Sent Audit Logs */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <span className="font-bold text-base text-gray-900 dark:text-white">
                📊 Dispatched WhatsApp Logs Audit
              </span>
              <span className="text-xs text-gray-400 font-mono">
                {waLogs.length} Records Logged
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800 text-xs font-semibold uppercase text-gray-400">
                    <th className="py-2 px-3">Recipient</th>
                    <th className="py-2 px-3">Phone Number</th>
                    <th className="py-2 px-3">Type</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3 text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-xs">
                  {waLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-400">
                        No WhatsApp messages dispatched yet. Tap an RFID card in the Simulator to trigger automated WhatsApp alerts!
                      </td>
                    </tr>
                  ) : (
                    waLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                        <td className="py-3 px-3 font-semibold text-gray-900 dark:text-white">
                          👤 {log.recipientName}
                        </td>
                        <td className="py-3 px-3 font-mono text-gray-600 dark:text-gray-300">
                          {log.toPhone}
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 font-bold">
                            {log.messageType}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="inline-flex items-center gap-1 font-bold text-[10px] text-emerald-600 dark:text-emerald-400">
                            ✅ {log.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-gray-400">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* SAFETY ALERTS TAB */
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500">Filter Status:</span>
              <button
                onClick={() => setFilterStatus("all")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  filterStatus === "all" ? "bg-brand-500 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                }`}
              >
                All Alerts
              </button>
              <button
                onClick={() => setFilterStatus("active")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  filterStatus === "active" ? "bg-red-500 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                }`}
              >
                Active Only
              </button>
              <button
                onClick={() => setFilterStatus("resolved")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  filterStatus === "resolved" ? "bg-emerald-500 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                }`}
              >
                Resolved
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="p-8 text-center text-gray-500 bg-white dark:bg-gray-900 rounded-xl">Loading security alerts...</div>
            ) : alerts.length === 0 ? (
              <div className="p-8 text-center text-gray-500 bg-white dark:bg-gray-900 rounded-xl">No security alerts found.</div>
            ) : (
              alerts.map((alertItem) => (
                <div
                  key={alertItem.id}
                  className={`p-4 rounded-xl bg-white dark:bg-gray-900 border flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm ${
                    alertItem.resolved ? "opacity-60 border-gray-200 dark:border-gray-800" : "border-red-200 dark:border-red-900/40"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase border ${getSeverityBadge(alertItem.severity)}`}>
                      {alertItem.type}
                    </span>
                    <div>
                      <p className="font-semibold text-sm text-gray-900 dark:text-white">{alertItem.message}</p>
                      <p className="text-xs text-gray-400 font-mono mt-0.5">
                        {new Date(alertItem.createdAt).toLocaleString()} • Bus: {alertItem.bus?.busNumber || "General"}
                      </p>
                    </div>
                  </div>

                  {!alertItem.resolved && (
                    <button
                      onClick={() => handleResolve(alertItem.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
