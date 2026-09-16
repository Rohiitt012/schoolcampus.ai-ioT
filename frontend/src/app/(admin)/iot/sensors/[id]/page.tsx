"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface Reading {
  id: string;
  sensorType: string;
  value: number;
  unit: string;
  timestamp: string;
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
  readings: Reading[];
}

export default function SensorDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [sensor, setSensor] = useState<Sensor | null>(null);
  const [loading, setLoading] = useState(true);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    if (!id) return;
    fetch(`${API_BASE}/api/iot/sensors/${id}`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSensor(data.data);
        }
      })
      .catch((err) => console.error("Error fetching sensor:", err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading sensor telemetry...</div>;
  }

  if (!sensor) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-red-500 font-semibold">Sensor device not found.</p>
        <Link href="/iot/sensors" className="text-blue-600 underline text-sm">
          ← Back to Sensors Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Link href="/iot" className="hover:text-blue-600">
          IoT Platform
        </Link>
        <span>/</span>
        <Link href="/iot/sensors" className="hover:text-blue-600">
          Sensors
        </Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white font-semibold">{sensor.name}</span>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{sensor.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                {sensor.status}
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Sensor ID: <strong className="font-mono text-blue-600">{sensor.sensorId}</strong> | Type: {sensor.sensorType} | Room: {sensor.room} ({sensor.building})
            </p>
          </div>

          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-right">
            <span className="text-xs text-gray-400 font-medium">Current Telemetry</span>
            <div className="text-3xl font-black text-gray-900 dark:text-white">
              {sensor.latestReading || "N/A"}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          Historical Reading Telemetry Log ({sensor.readings?.length || 0})
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase border-b border-gray-200 dark:border-gray-800">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Recorded Value</th>
                <th className="px-4 py-3">Unit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {!sensor.readings || sensor.readings.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-6 text-gray-500">
                    No historical readings stored for this sensor.
                  </td>
                </tr>
              ) : (
                sensor.readings.map((r) => (
                  <tr key={r.id}>
                    <td className="px-4 py-3 text-xs font-mono text-gray-500">
                      {new Date(r.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold text-blue-600">{r.sensorType}</td>
                    <td className="px-4 py-3 font-bold text-gray-900 dark:text-white">{r.value}</td>
                    <td className="px-4 py-3 text-gray-500">{r.unit}</td>
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
