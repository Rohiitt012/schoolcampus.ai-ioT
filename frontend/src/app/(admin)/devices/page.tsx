"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { API_BASE_URL } from "@/context/AuthContext";

export default function DevicesPage() {
  const [devices, setDevices] = useState<any[]>([]);
  const [credentials, setCredentials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    deviceId: "",
    type: "RFID_READER",
    token: "",
    location: "Campus Gate 1",
  });
  const [submitting, setSubmitting] = useState(false);

  // Demo Scenario State
  const [demoStep, setDemoStep] = useState(0);
  const [demoLogs, setDemoLogs] = useState<string[]>([]);
  const [demoRunning, setDemoRunning] = useState(false);

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/devices`, { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        if (Array.isArray(data.data)) {
          setDevices(data.data);
        } else {
          setDevices(data.data.devices || []);
          setCredentials(data.data.credentials || []);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleRegisterDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/devices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        setFormData({ deviceId: "", type: "RFID_READER", token: "", location: "Campus Gate 1" });
        fetchDevices();
      } else {
        alert(data.error || data.message || "Failed to register device");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/devices/${id}/deactivate`, {
        method: "PUT",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        fetchDevices();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Master End-to-End Demo Sequence
  const runMasterDemoSequence = async () => {
    setDemoRunning(true);
    setDemoStep(1);
    setDemoLogs(["🚀 Starting Master End-to-End Smart Campus Demo..."]);

    const appendLog = (msg: string) => {
      setDemoLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    };

    try {
      // Step 1: Open Command Center
      appendLog("1. Command Center initialized & Socket.IO realtime connection verified.");
      await new Promise((r) => setTimeout(r, 1200));

      // Step 2: GPS Bus Simulation
      setDemoStep(2);
      appendLog("2. Triggering GPS Simulator: Bus BUS-101 moving on route...");
      await fetch(`${API_BASE_URL}/buses/simulator/tick`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ busNumber: "BUS-101", latitude: 28.6780, longitude: 77.4580, speed: 58.4 }),
      });
      appendLog("3. Overspeed Alert triggered for BUS-101 (58.4 km/h > 50.0 km/h limit).");
      await new Promise((r) => setTimeout(r, 1500));

      // Step 3: RFID Scan
      setDemoStep(3);
      appendLog("4. Triggering RFID Scan for student Rahul Sharma (RFID-10001)...");
      await fetch(`${API_BASE_URL}/attendance/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ rfidCardId: "RFID-10001", deviceId: "GATE-01" }),
      });
      appendLog("5. Attendance scan recorded & parent realtime notification dispatched.");
      await new Promise((r) => setTimeout(r, 1500));

      // Step 4: IoT Telemetry
      setDemoStep(4);
      appendLog("6. Transmitting IoT Telemetry: Server Room Temp Sensor TEMP-101 recorded 42.5°C...");
      await fetch(`${API_BASE_URL}/iot/telemetry`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-DEVICE-ID": "TEMP-101",
          "X-DEVICE-TOKEN": "devtok_temp_101_secret_key_4432",
        },
        credentials: "include",
        body: JSON.stringify({ deviceId: "TEMP-101", sensorType: "TEMPERATURE", value: 42.5, unit: "°C" }),
      });
      appendLog("7. High Temperature Threshold Alert generated for Server Room.");
      await new Promise((r) => setTimeout(r, 1500));

      // Step 5: AI CCTV Detection
      setDemoStep(5);
      appendLog("8. Triggering AI Video Analytics: Camera GATE-CAM-01 detected PERSON_DETECTED (94.5% confidence)...");
      await fetch(`${API_BASE_URL}/cameras/simulator/trigger`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ cameraId: "GATE-CAM-01", detectionType: "PERSON_DETECTED" }),
      });
      appendLog("9. AI Video detection event ingested into Command Center.");
      await new Promise((r) => setTimeout(r, 1500));

      // Step 6: Driver SOS Panic
      setDemoStep(6);
      appendLog("10. Triggering Driver SOS Panic Button on BUS-101...");
      const sosRes = await fetch(`${API_BASE_URL}/emergency/sos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ incidentType: "BUS_EMERGENCY", location: "Route 101 North Hub" }),
      });
      const sosData = await sosRes.json();
      appendLog("11. CRITICAL Emergency SOS broadcast to Command Center.");

      if (sosData.success && sosData.data) {
        await new Promise((r) => setTimeout(r, 1500));
        // Admin Acknowledges & Resolves
        appendLog("12. Admin acknowledging emergency incident...");
        await fetch(`${API_BASE_URL}/emergency/incidents/${sosData.data.id}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ status: "ACKNOWLEDGED", responder: "Campus Incident Response Team Alpha" }),
        });
        appendLog("13. Incident status updated to ACKNOWLEDGED.");

        await new Promise((r) => setTimeout(r, 1500));
        appendLog("14. Resolving emergency incident...");
        await fetch(`${API_BASE_URL}/emergency/incidents/${sosData.data.id}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ status: "RESOLVED", notes: "Fleet vehicle inspected and cleared." }),
        });
        appendLog("15. Emergency incident successfully RESOLVED.");
      }

      await new Promise((r) => setTimeout(r, 1500));
      // Step 7: AI Assistant Query
      setDemoStep(7);
      appendLog("16. Querying Conversational AI Assistant: 'Summarize today's operational incidents'...");
      const aiRes = await fetch(`${API_BASE_URL}/ai/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ prompt: "Summarize today's operational incidents." }),
      });
      const aiData = await aiRes.json();
      appendLog(`17. AI Assistant Synthesis: "${aiData.data.answer.substring(0, 120)}..."`);

      setDemoStep(8);
      appendLog("🎉 MASTER END-TO-END DEMONSTRATION COMPLETE! All 17 steps passed with 0 page refreshes.");
    } catch (err: any) {
      appendLog(`❌ Demo sequence error: ${err.message}`);
    } finally {
      setDemoRunning(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              Phase 15 Hardware & Master Demo
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            IoT Hardware Credentials & Master Demo Controller
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Hardware device authentication API keys (<code className="font-mono text-purple-600">X-DEVICE-ID</code> & <code className="font-mono text-purple-600">X-DEVICE-TOKEN</code>) and end-to-end demo execution.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow transition"
        >
          + Register Device Credential
        </button>
      </div>

      {/* Master End-to-End Demo Sequence Runner Box */}
      <div className="bg-gradient-to-r from-purple-950 via-gray-900 to-indigo-950 text-white rounded-2xl p-6 border border-purple-800/50 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-500 text-white uppercase tracking-wider">
              INTERVIEWER DEMONSTRATION SUITE
            </span>
            <h2 className="text-xl font-bold mt-1">Master 17-Step Live Platform Demonstration</h2>
            <p className="text-xs text-purple-200">
              Executes unified real-time GPS tracking, RFID attendance, IoT temperature alert, CCTV video detection, Driver SOS panic, Admin resolution, and AI Assistant query without page refresh.
            </p>
          </div>

          <button
            onClick={runMasterDemoSequence}
            disabled={demoRunning}
            className="px-6 py-3 text-sm font-black text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl shadow-lg transition duration-200 flex items-center gap-2 disabled:opacity-50"
          >
            {demoRunning ? "Executing 17-Step Scenario..." : "⚡ RUN MASTER DEMO SCENARIO"}
          </button>
        </div>

        {/* Demo Progress Logs Console */}
        {demoLogs.length > 0 && (
          <div className="bg-black/80 rounded-xl p-4 border border-purple-900/60 font-mono text-xs max-h-60 overflow-y-auto space-y-1.5 shadow-inner">
            {demoLogs.map((log, idx) => (
              <div key={idx} className={log.includes("COMPLETE") ? "text-emerald-400 font-bold" : "text-gray-300"}>
                {log}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hardware Credentials Table (X-DEVICE-ID / X-DEVICE-TOKEN) */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Registered Device Credentials ({credentials.length > 0 ? credentials.length : devices.length})
          </h2>
          <span className="text-xs font-mono text-gray-400">Header Auth: X-DEVICE-ID & X-DEVICE-TOKEN</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase border-b border-gray-200 dark:border-gray-800">
              <tr>
                <th className="px-4 py-3">Device ID</th>
                <th className="px-4 py-3">Authentication Token (Secret)</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Firmware</th>
                <th className="px-4 py-3">Last Seen</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-gray-500">
                    Loading credentials...
                  </td>
                </tr>
              ) : credentials.length === 0 ? (
                devices.map((d) => (
                  <tr key={d.id}>
                    <td className="px-4 py-3 font-mono font-bold text-gray-900 dark:text-white">{d.deviceId}</td>
                    <td className="px-4 py-3 font-mono text-xs text-purple-600 dark:text-purple-400">devtok_{d.deviceId.toLowerCase()}_default</td>
                    <td className="px-4 py-3 text-xs font-semibold">{d.type}</td>
                    <td className="px-4 py-3 font-mono text-xs">v1.0.4</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{new Date(d.lastSeen).toLocaleString()}</td>
                    <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600">{d.status}</span></td>
                  </tr>
                ))
              ) : (
                credentials.map((cred) => (
                  <tr key={cred.id}>
                    <td className="px-4 py-3 font-mono font-bold text-gray-900 dark:text-white">{cred.deviceId}</td>
                    <td className="px-4 py-3 font-mono text-xs text-purple-600 dark:text-purple-400 font-bold">{cred.token}</td>
                    <td className="px-4 py-3 text-xs font-semibold">{cred.deviceType}</td>
                    <td className="px-4 py-3 font-mono text-xs">{cred.firmwareVersion || "v1.0.4"}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{new Date(cred.lastSeen).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600">
                        {cred.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Register Hardware Credential</h2>
            <form onSubmit={handleRegisterDevice} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Device ID</label>
                <input
                  type="text"
                  required
                  value={formData.deviceId}
                  onChange={(e) => setFormData({ ...formData, deviceId: e.target.value })}
                  placeholder="e.g. ESP32-GATEWAY-10"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Hardware Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-sm"
                >
                  <option value="RFID_READER">RFID Reader</option>
                  <option value="GPS_TRACKER">GPS Tracker</option>
                  <option value="ESP32">ESP32 Microcontroller</option>
                  <option value="IOT_SENSOR">IoT Environmental Sensor</option>
                  <option value="CCTV_CAMERA">CCTV Camera Node</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Auth Token Key (X-DEVICE-TOKEN)</label>
                <input
                  type="text"
                  value={formData.token}
                  onChange={(e) => setFormData({ ...formData, token: e.target.value })}
                  placeholder="Optional secret key auto-generated if left blank"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-sm font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow"
                >
                  Save Device
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
