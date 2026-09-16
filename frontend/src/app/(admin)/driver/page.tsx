"use client";

import React, { useState, useEffect } from "react";
import { useAuth, API_BASE_URL } from "@/context/AuthContext";

export default function DriverPortalPage() {
  const { user } = useAuth();
  const [bus, setBus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tripActive, setTripActive] = useState(false);

  const fetchDriverBus = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/drivers/my-bus`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setBus(data.data);
        setTripActive(data.data.status === "IN_TRANSIT");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDriverBus();
  }, []);

  const handleToggleTrip = async () => {
    if (!bus) return;
    const newStatus = tripActive ? "ACTIVE" : "IN_TRANSIT";

    try {
      const res = await fetch(`${API_BASE_URL}/buses/${bus.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setTripActive(!tripActive);
        setBus({ ...bus, status: newStatus });
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading Driver Portal...</div>;
  }

  if (!bus) {
    return (
      <div className="p-8 text-center space-y-3 bg-white dark:bg-gray-900 rounded-2xl border">
        <p className="text-red-500 font-bold text-lg">No Bus Assigned</p>
        <p className="text-xs text-gray-500">You are currently not assigned to any active school bus unit.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg space-y-2">
        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/20">
          Mobile Driver Interface
        </span>
        <h1 className="text-2xl font-bold">Welcome, {user?.name}!</h1>
        <p className="text-xs text-white/80">
          Assigned Unit: <span className="font-bold">{bus.busNumber}</span> ({bus.registrationNumber})
        </p>
      </div>

      {/* Start / End Trip Action Button */}
      <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm text-center space-y-4">
        <h2 className="font-bold text-lg text-gray-900 dark:text-white">Trip Controls</h2>

        <button
          onClick={handleToggleTrip}
          className={`w-full py-4 px-6 rounded-2xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-3 text-white ${
            tripActive
              ? "bg-red-500 hover:bg-red-600 animate-pulse"
              : "bg-emerald-600 hover:bg-emerald-700"
          }`}
        >
          <span>🚌</span> {tripActive ? "END CURRENT BUS TRIP" : "START NEW BUS TRIP"}
        </button>

        <p className="text-xs text-gray-400">
          Status: <span className="font-bold uppercase text-amber-600">{bus.status}</span> • Speed Limit: {bus.maxSpeed} km/h
        </p>
      </div>

      {/* Route Stops List */}
      <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
        <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center justify-between">
          <span>Assigned Route Stops</span>
          <span className="text-xs text-gray-400">{bus.route?.name}</span>
        </h3>

        <div className="space-y-2">
          {bus.route?.stops?.map((stop: any) => (
            <div
              key={stop.id}
              className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center text-xs">
                  {stop.sequence}
                </span>
                <span className="font-bold text-gray-900 dark:text-white">{stop.name}</span>
              </div>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                Stop #{stop.sequence}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
