"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getSocket } from "@/hooks/useSocket";

interface SensorReading {
  id: string;
  sensorId: string;
  sensorName?: string;
  sensorType: string;
  value: number;
  unit: string;
  location?: string;
  building?: string;
  room?: string;
  timestamp: string;
  status?: string;
}

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

export default function IoTSensorsPage() {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [telemetryStream, setTelemetryStream] = useState<SensorReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const fetchSensorsData = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/iot/sensors`, { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        setSensors(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch sensors:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSensorsData();

    // Socket.IO realtime telemetry listener
    const socket = getSocket();
    const handleTelemetry = (reading: SensorReading) => {
      setTelemetryStream((prev) => [reading, ...prev.slice(0, 24)]);
      // Update sensor latest reading in list
      setSensors((prev) =>
        prev.map((s) =>
          s.sensorId === reading.sensorId
            ? {
                ...s,
                latestReading: `${reading.value}${reading.unit}`,
                status: reading.status || s.status,
                lastHeartbeat: reading.timestamp,
              }
            : s
        )
      );
    };

    socket.on("sensor:telemetry", handleTelemetry);

    return () => {
      socket.off("sensor:telemetry", handleTelemetry);
    };
  }, []);

  const triggerTelemetrySimulator = async (sensorType: string, customVal?: number) => {
    setSimulating(true);
    try {
      const targetSensor = sensors.find((s) => s.sensorType === sensorType) || sensors[0];
      if (!targetSensor) return;

      const res = await fetch(`${API_BASE}/api/iot/telemetry`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-DEVICE-ID": targetSensor.sensorId,
          "X-DEVICE-TOKEN": "devtok_temp_101_secret_key_4432", // Valid seed token fallback
        },
        credentials: "include",
        body: JSON.stringify({
          deviceId: targetSensor.sensorId,
          sensorType: targetSensor.sensorType,
          value: customVal !== undefined ? customVal : (targetSensor.sensorType === "TEMPERATURE" ? 42.5 : 88),
          unit: targetSensor.sensorType === "TEMPERATURE" ? "°C" : "%",
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchSensorsData();
      }
    } catch (err) {
      console.error("Telemetry simulation error:", err);
    } finally {
      setSimulating(false);
    }
  };

  const getSensorTypeColor = (type: string) => {
    switch (type) {
      case "TEMPERATURE":
        return "text-orange-500 bg-orange-500/10 border-orange-500/20";
      case "SMOKE":
        return "text-red-500 bg-red-500/10 border-red-500/20";
      case "AIR_QUALITY":
        return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
      case "WATER_LEVEL":
        return "text-blue-500 bg-blue-500/10 border-blue-500/20";
      default:
        return "text-indigo-500 bg-indigo-500/10 border-indigo-500/20";
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              Phase 12 Enterprise
            </span>
            <span className="text-xs text-gray-500">• Industrial Telemetry Gateway</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            IoT Sensor Telemetry Platform
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Real-time environmental monitoring across classrooms, server rooms, labs, and campus grounds.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/iot/sensors"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 rounded-xl transition"
          >
            Manage Sensors ({sensors.length})
          </Link>
          <Link
            href="/iot/simulator"
            className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition"
          >
            ⚡ Open Telemetry Simulator
          </Link>
        </div>
      </div>

      {/* Simulator Action Quick-Bar */}
      <div className="bg-gradient-to-r from-blue-900/10 via-cyan-900/10 to-gray-900/10 p-4 rounded-xl border border-blue-500/20 flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
          Quick Sensor Threshold Trigger Simulator:
        </span>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => triggerTelemetrySimulator("TEMPERATURE", 42.5)}
            disabled={simulating}
            className="px-3 py-1.5 text-xs font-semibold bg-orange-500 text-white rounded-lg shadow-sm hover:bg-orange-600 transition"
          >
            🔥 High Temp Alert (42.5°C)
          </button>
          <button
            onClick={() => triggerTelemetrySimulator("SMOKE", 1.0)}
            disabled={simulating}
            className="px-3 py-1.5 text-xs font-semibold bg-red-600 text-white rounded-lg shadow-sm hover:bg-red-700 transition"
          >
            🚨 Smoke Trigger
          </button>
          <button
            onClick={() => triggerTelemetrySimulator("AIR_QUALITY", 185)}
            disabled={simulating}
            className="px-3 py-1.5 text-xs font-semibold bg-amber-500 text-white rounded-lg shadow-sm hover:bg-amber-600 transition"
          >
            💨 Unhealthy AQI (185)
          </button>
          <button
            onClick={() => triggerTelemetrySimulator("TEMPERATURE", 24.0)}
            disabled={simulating}
            className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-lg shadow-sm hover:bg-emerald-700 transition"
          >
            ✅ Normal Reading (24°C)
          </button>
        </div>
      </div>

      {/* Sensor Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full text-center py-8 text-gray-500">Loading IoT Sensors...</div>
        ) : (
          sensors.map((sensor) => (
            <div
              key={sensor.id}
              className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm space-y-4 hover:border-blue-500/40 transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getSensorTypeColor(
                      sensor.sensorType
                    )}`}
                  >
                    {sensor.sensorType}
                  </span>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mt-1.5">
                    {sensor.name}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                    ID: {sensor.sensorId}
                  </p>
                </div>

                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    sensor.status === "ONLINE"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-red-500/10 text-red-600 dark:text-red-400"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                  {sensor.status}
                </span>
              </div>

              {/* Latest Reading Value Box */}
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 flex items-center justify-between border border-gray-100 dark:border-gray-800">
                <div>
                  <span className="text-xs text-gray-400 font-medium">Latest Telemetry</span>
                  <div className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                    {sensor.latestReading || "N/A"}
                  </div>
                </div>

                <Link
                  href={`/iot/sensors/${sensor.id}`}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  History →
                </Link>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-1">
                <span>📍 {sensor.building} ({sensor.room})</span>
                <span className="font-mono text-[10px]">
                  {new Date(sensor.lastHeartbeat).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Real-time Telemetry Socket Feed Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
            Live Ingested Telemetry Feed (POST /api/iot/telemetry)
          </h2>
          <span className="text-xs font-mono text-gray-400">Socket.IO Event Stream</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase border-b border-gray-200 dark:border-gray-800">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Sensor ID</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Value</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {telemetryStream.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-gray-500">
                    Waiting for live sensor telemetry stream events...
                  </td>
                </tr>
              ) : (
                telemetryStream.map((t, idx) => (
                  <tr key={t.id || idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">
                      {new Date(t.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="px-4 py-3 font-bold text-gray-900 dark:text-white font-mono">
                      {t.sensorId}
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold text-blue-600 dark:text-blue-400">
                      {t.sensorType}
                    </td>
                    <td className="px-4 py-3 font-black text-gray-900 dark:text-white text-base">
                      {t.value} {t.unit}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {t.location || t.building || "Campus"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          t.status === "WARNING"
                            ? "bg-red-500/10 text-red-600 border border-red-500/20"
                            : "bg-emerald-500/10 text-emerald-600"
                        }`}
                      >
                        {t.status || "OK"}
                      </span>
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
