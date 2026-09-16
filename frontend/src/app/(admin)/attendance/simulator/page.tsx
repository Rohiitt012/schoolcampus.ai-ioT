"use client";

import React, { useState, useEffect } from "react";
import { useSocket } from "@/context/SocketContext";
import { API_BASE_URL } from "@/context/AuthContext";

export default function RFIDSimulatorPage() {
  const { socket, isConnected } = useSocket();
  const [rfidCardId, setRfidCardId] = useState("RFID-10001");
  const [deviceId, setDeviceId] = useState("GATE-01");
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [errorResult, setErrorResult] = useState<string>("");
  const [scanLogs, setScanLogs] = useState<any[]>([]);

  // Quick preset cards
  const presetCards = [
    { card: "RFID-10001", name: "Rahul Sharma (Grade 7-A)" },
    { card: "RFID-10002", name: "Ananya Patel (Grade 7-A)" },
    { card: "RFID-10003", name: "Aarav Patel (Grade 8-B)" },
    { card: "RFID-10004", name: "Rohan Verma (Grade 7-A)" },
    { card: "RFID-99999", name: "Invalid Card (Trigger Error)" },
  ];

  useEffect(() => {
    if (!socket) return;

    socket.on("attendance:scan", (data: any) => {
      setScanLogs((prev) => [data, ...prev.slice(0, 19)]);
    });

    return () => {
      socket.off("attendance:scan");
    };
  }, [socket]);

  const handleScan = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!rfidCardId) return;

    setLoading(true);
    setScanResult(null);
    setErrorResult("");

    try {
      const res = await fetch(`${API_BASE_URL}/attendance/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rfidCardId, deviceId }),
      });

      const data = await res.json();
      if (data.success) {
        setScanResult(data);
      } else {
        setErrorResult(data.message || "RFID Scan failed.");
      }
    } catch (err: any) {
      setErrorResult(err.message || "Network error submitting RFID scan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
            IoT Simulator
          </span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded ${isConnected ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {isConnected ? "🟢 Realtime Hub Connected" : "🔴 Disconnected"}
          </span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">RFID Attendance Gate Simulator</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Simulate real hardware RFID readers scanning student smart cards at school entry gates.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Simulator Control Panel */}
        <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-5">
          <h2 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
            <span>💳 Tap RFID Smart Card</span>
          </h2>

          {/* Quick Preset Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              Select Demo Student Card
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {presetCards.map((p) => (
                <button
                  key={p.card}
                  type="button"
                  onClick={() => setRfidCardId(p.card)}
                  className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all ${
                    rfidCardId === p.card
                      ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300 font-bold shadow-sm"
                      : "border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <span className="block font-mono text-[11px] text-gray-400">{p.card}</span>
                  <span>{p.name}</span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleScan} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                RFID Card ID
              </label>
              <input
                type="text"
                required
                value={rfidCardId}
                onChange={(e) => setRfidCardId(e.target.value)}
                placeholder="e.g. RFID-10001"
                className="w-full px-4 py-2.5 font-mono text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                IoT Gate Reader Device ID
              </label>
              <select
                value={deviceId}
                onChange={(e) => setDeviceId(e.target.value)}
                className="w-full px-4 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="GATE-01">Main Gate 01 (Entry)</option>
                <option value="GATE-02">Secondary Gate 02 (Exit)</option>
                <option value="BUS-READER-101">Bus 101 Onboard Reader</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 text-sm flex items-center justify-center gap-2"
            >
              <span>💳</span> {loading ? "Processing Card Tap..." : "SCAN CARD NOW"}
            </button>
          </form>

          {/* Scan Feedback Result Card */}
          {scanResult && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 animate-fade-in space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm">
                <span>✅ Attendance Recorded Successfully!</span>
              </div>
              <div className="text-xs space-y-1">
                <p><strong>Student:</strong> {scanResult.student?.name} (Class {scanResult.student?.className})</p>
                <p><strong>Device:</strong> {deviceId}</p>
                <p><strong>Time:</strong> {new Date().toLocaleTimeString()}</p>
                <p><strong>Status:</strong> <span className="font-bold">{scanResult.attendance?.status}</span></p>
              </div>
            </div>
          )}

          {errorResult && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800 text-red-900 dark:text-red-200 text-xs font-semibold">
              ❌ {errorResult}
            </div>
          )}
        </div>

        {/* Live Scan Log Stream */}
        <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
          <h2 className="font-bold text-lg text-gray-900 dark:text-white flex items-center justify-between">
            <span>📡 Live WebSocket Gate Scan Logs</span>
            <span className="text-xs font-mono font-normal text-gray-400">Stream active</span>
          </h2>

          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {scanLogs.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-xs italic border border-dashed rounded-xl">
                No card scans recorded yet in this session. Click &quot;SCAN CARD NOW&quot; to test.
              </div>
            ) : (
              scanLogs.map((log, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/60 flex items-center justify-between text-xs transition-all hover:bg-gray-100"
                >
                  <div className="space-y-0.5">
                    <p className="font-bold text-gray-900 dark:text-white">{log.studentName}</p>
                    <p className="text-gray-500">Grade {log.className} • Device <span className="font-mono">{log.deviceId}</span></p>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                      {log.status}
                    </span>
                    <p className="font-mono text-[10px] text-gray-400 mt-1">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
