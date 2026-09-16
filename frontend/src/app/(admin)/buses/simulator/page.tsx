"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSocket } from "@/context/SocketContext";
import { API_BASE_URL } from "@/context/AuthContext";

export default function GPSSimulatorPage() {
  const { socket, isConnected } = useSocket();
  const [buses, setBuses] = useState<any[]>([]);
  const [selectedBusId, setSelectedBusId] = useState<string>("");
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentSpeed, setCurrentSpeed] = useState<number>(35);
  const [triggerOverspeed, setTriggerOverspeed] = useState(false);

  // Simulated telemetry state
  const [telemetry, setTelemetry] = useState<{
    latitude: number;
    longitude: number;
    speed: number;
    timestamp?: string;
  }>({
    latitude: 28.6700,
    longitude: 77.4500,
    speed: 35,
  });

  const [locationLogs, setLocationLogs] = useState<any[]>([]);
  const timerRef = useRef<any>(null);

  // Load available buses
  useEffect(() => {
    const fetchBuses = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/buses`, { credentials: "include" });
        const data = await res.json();
        if (data.success && data.data.length > 0) {
          setBuses(data.data);
          setSelectedBusId(data.data[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchBuses();
  }, []);

  // Listen to Socket.IO bus location events
  useEffect(() => {
    if (!socket) return;

    socket.on("bus:location-update", (data: any) => {
      setLocationLogs((prev) => [data, ...prev.slice(0, 19)]);
    });

    return () => {
      socket.off("bus:location-update");
    };
  }, [socket]);

  // Telemetry loop
  useEffect(() => {
    if (!isSimulating || !selectedBusId) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    let lat = telemetry.latitude;
    let lng = telemetry.longitude;

    timerRef.current = setInterval(async () => {
      // Waypoint increment simulation
      lat += (Math.random() - 0.2) * 0.002;
      lng += (Math.random() - 0.2) * 0.002;

      const effectiveSpeed = triggerOverspeed ? 65.5 : currentSpeed + Math.floor(Math.random() * 5);

      const payload = {
        latitude: lat,
        longitude: lng,
        speed: effectiveSpeed,
      };

      setTelemetry(payload);

      try {
        await fetch(`${API_BASE_URL}/buses/${selectedBusId}/location`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch (err) {
        console.error("GPS post failed", err);
      }
    }, 2500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isSimulating, selectedBusId, currentSpeed, triggerOverspeed]);

  const selectedBus = buses.find((b) => b.id === selectedBusId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
            GPS Device Telemetry Simulator
          </span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded ${isConnected ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {isConnected ? "🟢 Realtime Socket Hub Active" : "🔴 Disconnected"}
          </span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">GPS Bus Movement Simulator</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Simulate real hardware IoT GPS trackers transmitting latitude, longitude, and speed telemetry every 2.5s.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-5">
          <h2 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
            <span>📡 Telemetry Controls</span>
          </h2>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
              Select Bus Unit
            </label>
            <select
              value={selectedBusId}
              onChange={(e) => setSelectedBusId(e.target.value)}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-semibold"
            >
              {buses.map((b) => (
                <option key={b.id} value={b.id}>
                  🚌 {b.busNumber} ({b.registrationNumber}) — Max: {b.maxSpeed} km/h
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-gray-700 dark:text-gray-300">Target Velocity:</span>
              <span className="font-mono font-bold text-amber-600 text-sm">{currentSpeed} km/h</span>
            </div>
            <input
              type="range"
              min="10"
              max="90"
              value={currentSpeed}
              onChange={(e) => setCurrentSpeed(Number(e.target.value))}
              className="w-full accent-amber-500"
            />

            <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              <input
                type="checkbox"
                id="overspeed"
                checked={triggerOverspeed}
                onChange={(e) => setTriggerOverspeed(e.target.checked)}
                className="w-4 h-4 text-red-600 rounded accent-red-600"
              />
              <label htmlFor="overspeed" className="text-xs font-bold text-red-600 dark:text-red-400 cursor-pointer">
                ⚠️ Force Overspeed Violation (&gt; 50 km/h) to Trigger Smart Alert
              </label>
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              onClick={() => setIsSimulating(!isSimulating)}
              className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 text-white ${
                isSimulating
                  ? "bg-red-500 hover:bg-red-600 animate-pulse"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              <span>{isSimulating ? "🛑 STOP SIMULATOR" : "🚀 START GPS SIMULATION"}</span>
            </button>
          </div>

          {/* Current Live Marker Telemetry Box */}
          <div className="p-4 rounded-xl bg-slate-900 text-white font-mono text-xs space-y-1.5 shadow-inner">
            <p className="text-gray-400 font-sans text-[10px] uppercase tracking-wider font-bold">
              Current Simulated Lat/Lng Fix:
            </p>
            <p className="text-amber-400 font-bold text-sm">
              LAT: {telemetry.latitude.toFixed(6)} | LNG: {telemetry.longitude.toFixed(6)}
            </p>
            <p className="text-gray-300">
              SPEED: <span className={telemetry.speed > (selectedBus?.maxSpeed || 50) ? "text-red-400 font-bold" : "text-emerald-400"}>{telemetry.speed} km/h</span>
            </p>
            <p className="text-gray-500 text-[10px]">
              Status: {isSimulating ? "Transmitting via HTTP POST ➔ Express ➔ Socket.IO..." : "Idle"}
            </p>
          </div>
        </div>

        {/* Live Broadcast Telemetry Feed */}
        <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
          <h2 className="font-bold text-lg text-gray-900 dark:text-white flex items-center justify-between">
            <span>📡 Socket.IO Realtime Telemetry Broadcasts</span>
            <span className="text-xs font-mono font-normal text-gray-400">bus:location-update</span>
          </h2>

          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {locationLogs.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-xs italic border border-dashed rounded-xl">
                No location broadcasts received yet. Start the GPS simulator to begin streaming data.
              </div>
            ) : (
              locationLogs.map((log, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/60 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-gray-900 dark:text-white">Bus {log.busNumber}</span>
                    <p className="font-mono text-gray-500 text-[11px]">
                      {log.latitude?.toFixed(5)}, {log.longitude?.toFixed(5)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`font-mono font-bold text-xs ${log.speed > 50 ? "text-red-500" : "text-emerald-600"}`}>
                      {log.speed?.toFixed(1)} km/h
                    </span>
                    <p className="font-mono text-[10px] text-gray-400">
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
