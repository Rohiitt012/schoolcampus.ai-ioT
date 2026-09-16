"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { getSocket } from "@/hooks/useSocket";

// Dynamically import Leaflet Map component with ssr: false
const CommandCenterMap = dynamic(() => import("@/components/CommandCenterMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[450px] bg-gray-900 rounded-2xl flex items-center justify-center text-gray-400 font-mono text-sm animate-pulse">
      Loading Command Center Operations Map...
    </div>
  ),
});

interface OverviewMetrics {
  totalStudents: number;
  activeBuses: number;
  onlineDevices: number;
  onlineCameras: number;
  activeAlerts: number;
  openEmergencies: number;
}

export default function CommandCenterPage() {
  const [metrics, setMetrics] = useState<OverviewMetrics>({
    totalStudents: 0,
    activeBuses: 0,
    onlineDevices: 0,
    onlineCameras: 0,
    activeAlerts: 0,
    openEmergencies: 0,
  });

  const [buses, setBuses] = useState<any[]>([]);
  const [cameras, setCameras] = useState<any[]>([]);
  const [sensors, setSensors] = useState<any[]>([]);
  const [incidents, setIncidents] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [cameraEvents, setCameraEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const fetchCommandData = async () => {
    try {
      const [mRes, oRes] = await Promise.all([
        fetch(`${API_BASE}/api/command-center/metrics`, { credentials: "include" }),
        fetch(`${API_BASE}/api/command-center/overview`, { credentials: "include" }),
      ]);

      const mData = await mRes.json();
      const oData = await oRes.json();

      if (mData.success) setMetrics(mData.data);
      if (oData.success) {
        setBuses(oData.data.buses || []);
        setCameras(oData.data.cameras || []);
        setSensors(oData.data.sensors || []);
        setIncidents(oData.data.incidents || []);
        setAlerts(oData.data.alerts || []);
        setCameraEvents(oData.data.cameraEvents || []);
      }
    } catch (err) {
      console.error("Error fetching command center data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommandData();

    // Socket.IO real-time event subscriptions
    const socket = getSocket();

    const handleBusLocation = (data: any) => {
      setBuses((prev) =>
        prev.map((b) => (b.id === data.busId ? { ...b, locations: [data] } : b))
      );
    };

    const handleAlert = (newAlert: any) => {
      setAlerts((prev) => [newAlert, ...prev.slice(0, 9)]);
      setMetrics((prev) => ({ ...prev, activeAlerts: prev.activeAlerts + 1 }));
    };

    const handleCameraEvent = (ev: any) => {
      setCameraEvents((prev) => [ev, ...prev.slice(0, 9)]);
    };

    const handleSensorTelemetry = (reading: any) => {
      setSensors((prev) =>
        prev.map((s) =>
          s.sensorId === reading.sensorId ? { ...s, latestReading: `${reading.value}${reading.unit}` } : s
        )
      );
    };

    const handleEmergencySOS = (newInc: any) => {
      setIncidents((prev) => [newInc, ...prev.filter((i) => i.id !== newInc.id)]);
      setMetrics((prev) => ({ ...prev, openEmergencies: prev.openEmergencies + 1 }));
    };

    socket.on("bus:location-update", handleBusLocation);
    socket.on("alert:new", handleAlert);
    socket.on("camera:event", handleCameraEvent);
    socket.on("sensor:telemetry", handleSensorTelemetry);
    socket.on("emergency:sos", handleEmergencySOS);

    return () => {
      socket.off("bus:location-update", handleBusLocation);
      socket.off("alert:new", handleAlert);
      socket.off("camera:event", handleCameraEvent);
      socket.off("sensor:telemetry", handleSensorTelemetry);
      socket.off("emergency:sos", handleEmergencySOS);
    };
  }, []);

  const getAlertSeverityBadge = (sev: string) => {
    switch (sev) {
      case "CRITICAL":
        return "bg-red-600 text-white font-black animate-pulse px-2 py-0.5 rounded text-[10px]";
      case "HIGH":
        return "bg-orange-500/10 text-orange-500 border border-orange-500/20 px-2 py-0.5 rounded text-[10px] font-bold";
      case "MEDIUM":
        return "bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded text-[10px] font-bold";
      default:
        return "bg-blue-500/10 text-blue-500 border border-blue-500/20 px-2 py-0.5 rounded text-[10px] font-bold";
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto min-h-screen bg-gray-950 text-white rounded-3xl my-2 border border-gray-800">
      {/* Control Room Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-red-600 flex items-center justify-center font-black text-2xl shadow-lg">
            CC
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest font-bold">
                OPERATIONS CONTROL CENTER • LIVE REALTIME
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white mt-0.5">
              Smart Campus Command Center
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/sos"
            className="px-4 py-2 text-xs font-black bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg transition animate-pulse flex items-center gap-1.5"
          >
            🚨 SOS EMERGENCY TRIGGER
          </Link>
          <Link
            href="/ai-assistant"
            className="px-4 py-2 text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 rounded-xl transition"
          >
            🤖 AI Insights Assistant
          </Link>
        </div>
      </div>

      {/* Top 6 KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-gray-900 border border-gray-800 p-4 rounded-2xl space-y-1">
          <span className="text-xs text-gray-400 font-semibold uppercase">Total Students</span>
          <div className="text-2xl font-black text-white">{metrics.totalStudents}</div>
          <span className="text-[10px] text-emerald-400 font-mono">Enrolled Active</span>
        </div>

        <div className="bg-gray-900 border border-gray-800 p-4 rounded-2xl space-y-1">
          <span className="text-xs text-gray-400 font-semibold uppercase">Active Buses</span>
          <div className="text-2xl font-black text-blue-400">{metrics.activeBuses}</div>
          <span className="text-[10px] text-blue-400/80 font-mono">GPS Telemetry Live</span>
        </div>

        <div className="bg-gray-900 border border-gray-800 p-4 rounded-2xl space-y-1">
          <span className="text-xs text-gray-400 font-semibold uppercase">Online IoT Devices</span>
          <div className="text-2xl font-black text-cyan-400">{metrics.onlineDevices}</div>
          <span className="text-[10px] text-cyan-400/80 font-mono">Telemetry Nodes</span>
        </div>

        <div className="bg-gray-900 border border-gray-800 p-4 rounded-2xl space-y-1">
          <span className="text-xs text-gray-400 font-semibold uppercase">Cameras Online</span>
          <div className="text-2xl font-black text-indigo-400">{metrics.onlineCameras}</div>
          <span className="text-[10px] text-indigo-400/80 font-mono">AI Vision Active</span>
        </div>

        <div className="bg-gray-900 border border-gray-800 p-4 rounded-2xl space-y-1">
          <span className="text-xs text-gray-400 font-semibold uppercase">Active Alerts</span>
          <div className="text-2xl font-black text-amber-400">{metrics.activeAlerts}</div>
          <span className="text-[10px] text-amber-400/80 font-mono">Requires Attention</span>
        </div>

        <div className="bg-gray-900 border border-red-900/50 p-4 rounded-2xl space-y-1 bg-gradient-to-b from-red-950/20 to-gray-900">
          <span className="text-xs text-red-400 font-bold uppercase">Open Emergencies</span>
          <div className="text-2xl font-black text-red-500 animate-pulse">{metrics.openEmergencies}</div>
          <span className="text-[10px] text-red-400/80 font-mono">CRITICAL Priority</span>
        </div>
      </div>

      {/* Main Map & Live Feeds Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Unified Map View (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-200 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              Unified Smart Campus Operations Map
            </h2>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span className="flex items-center gap-1">🚌 Buses</span>
              <span className="flex items-center gap-1">📹 Cameras</span>
              <span className="flex items-center gap-1">🌡️ Sensors</span>
              <span className="flex items-center gap-1 text-red-400 font-bold">🚨 Incidents</span>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden border border-gray-800 shadow-2xl">
            <CommandCenterMap buses={buses} cameras={cameras} sensors={sensors} incidents={incidents} />
          </div>
        </div>

        {/* Real-time Feeds Stack (1 Col) */}
        <div className="space-y-4">
          {/* Emergency SOS Incidents Panel */}
          <div className="bg-gray-900 border border-red-900/40 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-gray-800 pb-2">
              <h3 className="text-sm font-bold text-red-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                Emergency SOS Stream
              </h3>
              <Link href="/emergency" className="text-[11px] text-red-400 hover:underline">
                View All →
              </Link>
            </div>

            <div className="space-y-2 max-h-[160px] overflow-y-auto">
              {incidents.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-2">No open emergency incidents.</p>
              ) : (
                incidents.map((inc) => (
                  <div key={inc.id} className="p-2.5 rounded-xl bg-red-950/30 border border-red-900/50 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-red-400">{inc.incidentType.replace(/_/g, " ")}</span>
                      <span className="text-[10px] font-mono text-gray-400">{inc.status}</span>
                    </div>
                    <p className="text-[11px] text-gray-300">📍 {inc.location}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* AI Camera Events Panel */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-gray-800 pb-2">
              <h3 className="text-sm font-bold text-indigo-400 flex items-center gap-2">
                <span>📹 AI Video Detection Events</span>
              </h3>
              <Link href="/video-monitoring" className="text-[11px] text-indigo-400 hover:underline">
                Monitoring →
              </Link>
            </div>

            <div className="space-y-2 max-h-[180px] overflow-y-auto">
              {cameraEvents.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-2">No camera detection events.</p>
              ) : (
                cameraEvents.map((ev, idx) => (
                  <div key={ev.id || idx} className="p-2.5 rounded-xl bg-gray-950 border border-gray-800 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold text-gray-200 block">{ev.detectionType.replace(/_/g, " ")}</span>
                      <span className="text-[10px] text-gray-400">{ev.cameraName || ev.cameraId} • {ev.zone}</span>
                    </div>
                    <span className="font-bold text-indigo-400">{ev.confidence ? `${ev.confidence.toFixed(0)}%` : ""}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Live Alerts Hub Panel */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-gray-800 pb-2">
              <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                <span>⚡ Prioritized Alerts Hub</span>
              </h3>
              <Link href="/alerts" className="text-[11px] text-amber-400 hover:underline">
                Alerts Hub →
              </Link>
            </div>

            <div className="space-y-2 max-h-[180px] overflow-y-auto">
              {alerts.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-2">No active system alerts.</p>
              ) : (
                alerts.map((al, idx) => (
                  <div key={al.id || idx} className="p-2.5 rounded-xl bg-gray-950 border border-gray-800 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className={getAlertSeverityBadge(al.severity)}>{al.severity}</span>
                      <span className="text-[10px] font-mono text-gray-500">{new Date(al.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-gray-300 text-[11px] leading-tight">{al.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
