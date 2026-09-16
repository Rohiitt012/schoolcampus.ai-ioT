"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function IoTSimulatorPage() {
  const [sensorId, setSensorId] = useState("TEMP-101");
  const [sensorType, setSensorType] = useState("TEMPERATURE");
  const [value, setValue] = useState(24.5);
  const [unit, setUnit] = useState("°C");
  const [deviceToken, setDeviceToken] = useState("devtok_temp_101_secret_key_4432");
  const [lastResponse, setLastResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const handleSubmitTelemetry = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/iot/telemetry`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-DEVICE-ID": sensorId,
          "X-DEVICE-TOKEN": deviceToken,
        },
        credentials: "include",
        body: JSON.stringify({
          deviceId: sensorId,
          sensorType,
          value: Number(value),
          unit,
        }),
      });
      const data = await res.json();
      setLastResponse(data);
    } catch (err: any) {
      setLastResponse({ success: false, error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const setPreset = (preset: string) => {
    if (preset === "TEMP_HIGH") {
      setSensorId("TEMP-101");
      setSensorType("TEMPERATURE");
      setValue(42.8);
      setUnit("°C");
      setDeviceToken("devtok_temp_101_secret_key_4432");
    } else if (preset === "SMOKE_ALERT") {
      setSensorId("SMOKE-201");
      setSensorType("SMOKE");
      setValue(1);
      setUnit("ALERT");
      setDeviceToken("devtok_temp_101_secret_key_4432");
    } else if (preset === "AQI_BAD") {
      setSensorId("AIR-301");
      setSensorType("AIR_QUALITY");
      setValue(190);
      setUnit("AQI");
      setDeviceToken("devtok_temp_101_secret_key_4432");
    } else if (preset === "TEMP_NORMAL") {
      setSensorId("TEMP-101");
      setSensorType("TEMPERATURE");
      setValue(24.5);
      setUnit("°C");
      setDeviceToken("devtok_temp_101_secret_key_4432");
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Link href="/iot" className="hover:text-blue-600">
          IoT Platform
        </Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white font-semibold">Simulator</span>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            IoT Hardware Telemetry Simulator
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Simulate physical ESP32 / NodeMCU sensor data packets sent to <code className="text-blue-600 font-mono">POST /api/iot/telemetry</code> using device header authentication.
          </p>
        </div>

        {/* Presets */}
        <div className="flex items-center gap-2 flex-wrap pt-2">
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Quick Test Presets:</span>
          <button
            type="button"
            onClick={() => setPreset("TEMP_HIGH")}
            className="px-3 py-1 bg-orange-500/10 text-orange-600 border border-orange-500/20 text-xs font-semibold rounded-lg hover:bg-orange-500/20"
          >
            🔥 High Temp Trigger (42.8°C)
          </button>
          <button
            type="button"
            onClick={() => setPreset("SMOKE_ALERT")}
            className="px-3 py-1 bg-red-500/10 text-red-600 border border-red-500/20 text-xs font-semibold rounded-lg hover:bg-red-500/20"
          >
            🚨 Smoke Incident
          </button>
          <button
            type="button"
            onClick={() => setPreset("AQI_BAD")}
            className="px-3 py-1 bg-amber-500/10 text-amber-600 border border-amber-500/20 text-xs font-semibold rounded-lg hover:bg-amber-500/20"
          >
            💨 Unhealthy Air Quality
          </button>
          <button
            type="button"
            onClick={() => setPreset("TEMP_NORMAL")}
            className="px-3 py-1 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-semibold rounded-lg hover:bg-emerald-500/20"
          >
            ✅ Normal (24.5°C)
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmitTelemetry} className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Header: X-DEVICE-ID
              </label>
              <input
                type="text"
                required
                value={sensorId}
                onChange={(e) => setSensorId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Header: X-DEVICE-TOKEN
              </label>
              <input
                type="text"
                required
                value={deviceToken}
                onChange={(e) => setDeviceToken(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Sensor Type
              </label>
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
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Numeric Value & Unit
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  required
                  value={value}
                  onChange={(e) => setValue(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-sm font-bold"
                />
                <input
                  type="text"
                  required
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-sm font-mono text-center"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow transition"
          >
            {loading ? "Transmitting Packet..." : "🚀 Transmit Telemetry Packet"}
          </button>
        </form>
      </div>

      {/* Response Display */}
      {lastResponse && (
        <div className="bg-gray-950 text-emerald-400 p-5 rounded-2xl border border-gray-800 font-mono text-xs space-y-2 shadow-inner">
          <div className="flex items-center justify-between border-b border-gray-800 pb-2 text-gray-400">
            <span>Server Response (Socket.IO + Alert Rule Evaluated)</span>
            <span>Status: {lastResponse.success ? "201 CREATED" : "ERROR"}</span>
          </div>
          <pre className="overflow-x-auto whitespace-pre-wrap">
            {JSON.stringify(lastResponse, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
