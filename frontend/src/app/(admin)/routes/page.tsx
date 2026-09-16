"use client";

import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "@/context/AuthContext";

export default function RoutesPage() {
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    startPoint: "",
    endPoint: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchRoutes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/routes`, { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        setRoutes(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const handleCreateRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/routes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        setFormData({ name: "", startPoint: "", endPoint: "" });
        fetchRoutes();
      } else {
        alert(data.message || "Failed to create route");
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Route Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Define school bus routes, stop sequences, and geographical waypoints.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white font-medium text-sm shadow-sm transition-all"
        >
          <span>+</span> Create New Route
        </button>
      </div>

      {/* Routes List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-full p-8 text-center text-gray-500">Loading route data...</div>
        ) : routes.length === 0 ? (
          <div className="col-span-full p-8 text-center text-gray-500">No routes configured yet.</div>
        ) : (
          routes.map((route) => (
            <div
              key={route.id}
              className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between border-b pb-4 border-gray-100 dark:border-gray-800">
                <div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">{route.name}</h3>
                  <p className="text-xs text-gray-400">
                    {route.startPoint} ➔ {route.endPoint}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                  {route.stops?.length || 0} Stops
                </span>
              </div>

              {/* Bus Stops Sequence */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Bus Stops Sequence
                </h4>
                <div className="space-y-2">
                  {route.stops?.map((stop: any) => (
                    <div
                      key={stop.id}
                      className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-brand-500 text-white font-bold flex items-center justify-center text-[10px]">
                          {stop.sequence}
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-white">{stop.name}</span>
                      </div>
                      <span className="font-mono text-[10px] text-gray-400">
                        {stop.latitude.toFixed(4)}, {stop.longitude.toFixed(4)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 text-xs text-gray-500 flex justify-between items-center border-t border-gray-100 dark:border-gray-800">
                <span>Assigned Buses: {route.buses?.length || 0}</span>
                <span className="text-brand-500 font-semibold cursor-pointer hover:underline">
                  View Route Map 🗺️
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Route Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-gray-200 dark:border-gray-800">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">Create New Route</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">
                ×
              </button>
            </div>
            <form onSubmit={handleCreateRoute} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Route Title</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Route 104 - East Valley Express"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Start Point</label>
                  <input
                    type="text"
                    required
                    value={formData.startPoint}
                    onChange={(e) => setFormData({ ...formData, startPoint: e.target.value })}
                    placeholder="e.g. East Terminal"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">End Point</label>
                  <input
                    type="text"
                    required
                    value={formData.endPoint}
                    onChange={(e) => setFormData({ ...formData, endPoint: e.target.value })}
                    placeholder="e.g. Smart Academy"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
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
                  {submitting ? "Saving..." : "Save Route"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
