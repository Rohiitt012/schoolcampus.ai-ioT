"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { API_BASE_URL } from "@/context/AuthContext";

export default function BusesPage() {
  const [buses, setBuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    busNumber: "",
    registrationNumber: "",
    maxSpeed: "50",
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchBuses = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/buses`, { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        setBuses(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuses();
  }, []);

  const handleCreateBus = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/buses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        setFormData({ busNumber: "", registrationNumber: "", maxSpeed: "50" });
        fetchBuses();
      } else {
        alert(data.message || "Failed to create bus");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">School Bus Fleet</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage school buses, drivers, speed governors, and real-time GPS tracking.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/buses/simulator"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-medium text-sm shadow-sm transition-all"
          >
            <span>📡</span> Open GPS Simulator
          </Link>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white font-medium text-sm shadow-sm transition-all"
          >
            <span>+</span> Add New Bus
          </button>
        </div>
      </div>

      {/* Bus Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full p-8 text-center text-gray-500">Loading bus fleet data...</div>
        ) : buses.length === 0 ? (
          <div className="col-span-full p-8 text-center text-gray-500">No buses registered.</div>
        ) : (
          buses.map((bus) => {
            const lastLoc = bus.locations?.[0];
            return (
              <div
                key={bus.id}
                className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4 hover:border-brand-500 transition-all group"
              >
                <div className="flex items-center justify-between border-b pb-4 border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 flex items-center justify-center font-bold text-xl">
                      🚌
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-brand-500 transition-colors">
                        {bus.busNumber}
                      </h3>
                      <p className="text-xs font-mono text-gray-400">{bus.registrationNumber}</p>
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      bus.status === "IN_TRANSIT"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 animate-pulse"
                        : bus.status === "ACTIVE"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                        : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    }`}
                  >
                    {bus.status}
                  </span>
                </div>

                <div className="space-y-2.5 text-xs text-gray-600 dark:text-gray-300">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Assigned Driver:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {bus.driver?.user?.name || "Unassigned"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Assigned Route:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {bus.route?.name || "Unassigned"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Max Allowed Speed:</span>
                    <span className="font-mono font-semibold text-amber-600 dark:text-amber-400">
                      {bus.maxSpeed} km/h
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Last Telemetry Speed:</span>
                    <span className="font-mono font-bold text-gray-900 dark:text-white">
                      {lastLoc ? `${lastLoc.speed.toFixed(1)} km/h` : "N/A"}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <Link
                    href={`/buses/${bus.id}`}
                    className="flex-1 py-2 px-3 text-center rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-medium text-xs transition-colors"
                  >
                    View Details & Track
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Bus Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-gray-200 dark:border-gray-800">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">Add New Bus</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">
                ×
              </button>
            </div>
            <form onSubmit={handleCreateBus} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Bus Number Code</label>
                <input
                  type="text"
                  required
                  value={formData.busNumber}
                  onChange={(e) => setFormData({ ...formData, busNumber: e.target.value })}
                  placeholder="e.g. BUS-104"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Registration Number</label>
                <input
                  type="text"
                  required
                  value={formData.registrationNumber}
                  onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                  placeholder="e.g. DL-01-GH-1004"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Max Allowed Speed (km/h)</label>
                <input
                  type="number"
                  required
                  value={formData.maxSpeed}
                  onChange={(e) => setFormData({ ...formData, maxSpeed: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium bg-brand-500 hover:bg-brand-600 text-white rounded-lg disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save Bus"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
