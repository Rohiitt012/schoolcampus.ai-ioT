"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface Camera {
  id: string;
  name: string;
  cameraId: string;
  location: string;
  building: string;
  zone: string;
  cameraType: string;
  streamUrl?: string;
  status: string;
  lastHeartbeat: string;
}

export default function CamerasDirectoryPage() {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("ALL");
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [cameraId, setCameraId] = useState("");
  const [location, setLocation] = useState("");
  const [building, setBuilding] = useState("Main Block");
  const [zone, setZone] = useState("Entrance Gate");
  const [cameraType, setCameraType] = useState("CCTV");
  const [streamUrl, setStreamUrl] = useState("");

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const fetchCameras = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/cameras`, { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        setCameras(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch cameras:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCameras();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/cameras`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name,
          cameraId,
          location,
          building,
          zone,
          cameraType,
          streamUrl,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        setName("");
        setCameraId("");
        setLocation("");
        fetchCameras();
      } else {
        alert(data.error || "Failed to register camera");
      }
    } catch (err) {
      console.error("Error registering camera:", err);
    }
  };

  const filteredCameras = cameras.filter(
    (c) => filterType === "ALL" || c.cameraType === filterType
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Camera Device Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Register and manage CCTV, IP Cameras, and RTSP stream nodes across campus zones.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition"
        >
          + Register New Camera
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-3">
        {["ALL", "CCTV", "IP_CAMERA", "RTSP_CAMERA"].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterType === type
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            {type.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      {/* Camera Directory Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider border-b border-gray-200 dark:border-gray-800">
              <tr>
                <th className="px-6 py-4">Camera Name</th>
                <th className="px-6 py-4">Camera ID</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Location / Zone</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Last Heartbeat</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    Loading registered cameras...
                  </td>
                </tr>
              ) : filteredCameras.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    No cameras registered under selected filter.
                  </td>
                </tr>
              ) : (
                filteredCameras.map((cam) => (
                  <tr key={cam.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition">
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                      {cam.name}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-indigo-600 dark:text-indigo-400">
                      {cam.cameraId}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                        {cam.cameraType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                      {cam.location} <span className="text-xs text-gray-400">({cam.building} - {cam.zone})</span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          cam.status === "ONLINE"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${cam.status === "ONLINE" ? "bg-emerald-500" : "bg-red-500"}`}></span>
                        {cam.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500 font-mono">
                      {new Date(cam.lastHeartbeat).toLocaleTimeString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/cameras/${cam.id}`}
                        className="text-xs text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 font-semibold"
                      >
                        Inspect Stream →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Camera Registration */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Register Camera Device</h2>
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Camera Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. West Perimeter Cam"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Camera ID (Unique)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. WEST-CAM-03"
                  value={cameraId}
                  onChange={(e) => setCameraId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Type</label>
                  <select
                    value={cameraType}
                    onChange={(e) => setCameraType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-sm"
                  >
                    <option value="CCTV">CCTV</option>
                    <option value="IP_CAMERA">IP_CAMERA</option>
                    <option value="RTSP_CAMERA">RTSP_CAMERA</option>
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
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Location & Zone</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. West Field - Perimeter Wall"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Stream URL (Optional)</label>
                <input
                  type="text"
                  placeholder="rtsp://admin:pass@192.168.1.102:554/stream1"
                  value={streamUrl}
                  onChange={(e) => setStreamUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-sm font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow"
                >
                  Save Camera
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
