"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface Sensor {
  id: string;
  sensorId: string;
  name: string;
  sensorType: string;
  location: string;
  building: string;
  room: string;
  status: string;
  latestReading?: string;
  lastHeartbeat: string;
}

export default function SensorDirectoryPage() {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form
  const [name, setName] = useState("");
  const [sensorId, setSensorId] = useState("");
  const [sensorType, setSensorType] = useState("TEMPERATURE");
  const [location, setLocation] = useState("");
  const [building, setBuilding] = useState("Tech Center");
  const [room, setRoom] = useState("B-101");

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const fetchSensors = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/iot/sensors`, { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        setSensors(data.data);
      }
    } catch (err) {
      console.error("Error fetching sensors:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSensors();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/iot/sensors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          sensorId,
          name,
          sensorType,
          location,
          building,
          room,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        setName("");
        setSensorId("");
        setLocation("");
        fetchSensors();
      } else {
        alert(data.error || "Failed to register sensor");
      }
    } catch (err) {
      console.error("Error registering sensor:", err);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Sensor Hardware Directory
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            View, configure, and register campus IoT hardware sensors.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow transition"
        >
          + Register Sensor
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase border-b border-gray-200 dark:border-gray-800">
              <tr>
                <th className="px-6 py-4">Sensor Name</th>
                <th className="px-6 py-4">Sensor ID</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Latest Value</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    Loading sensors...
                  </td>
                </tr>
              ) : sensors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    No IoT sensors registered yet.
                  </td>
                </tr>
              ) : (
                sensors.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{s.name}</td>
                    <td className="px-6 py-4 font-mono text-xs text-blue-600 dark:text-blue-400 font-bold">
                      {s.sensorId}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/10 text-blue-600 border border-blue-500/20">
                        {s.sensorType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300 text-xs">
                      {s.location} ({s.building} - {s.room})
                    </td>
                    <td className="px-6 py-4 font-black text-gray-900 dark:text-white">
                      {s.latestReading || "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          s.status === "ONLINE"
                            ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                            : "bg-red-500/10 text-red-600 border border-red-500/20"
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/iot/sensors/${s.id}`}
                        className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        Telemetry History →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Register IoT Sensor</h2>
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Sensor Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Science Lab Smoke Detector"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Sensor ID (Unique)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SMOKE-302"
                  value={sensorId}
                  onChange={(e) => setSensorId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-sm font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Type</label>
                  <select
                    value={sensorType}
                    onChange={(e) => setSensorType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-sm"
                  >
                    <option value="TEMPERATURE">TEMPERATURE</option>
                    <option value="HUMIDITY">HUMIDITY</option>
                    <option value="AIR_QUALITY">AIR_QUALITY</option>
                    <option value="SMOKE">SMOKE</option>
                    <option value="DOOR">DOOR</option>
                    <option value="WATER_LEVEL">WATER_LEVEL</option>
                    <option value="MOTION">MOTION</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Building</label>
                  <input
                    type="text"
                    value={building}
                    onChange={(e) => setBuilding(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Location & Room</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Science Block, Room 204"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow"
                >
                  Save Sensor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
