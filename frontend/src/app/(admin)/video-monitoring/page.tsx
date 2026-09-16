"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getSocket } from "@/hooks/useSocket";

interface CameraEvent {
  id: string;
  cameraId: string;
  cameraName?: string;
  detectionType: string;
  zone: string;
  confidence: number;
  snapshotUrl?: string;
  timestamp: string;
}

interface Camera {
  id: string;
  name: string;
  cameraId: string;
  location: string;
  building: string;
  zone: string;
  cameraType: string;
  status: string;
  lastHeartbeat: string;
}

export default function VideoMonitoringPage() {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [events, setEvents] = useState<CameraEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [selectedDetection, setSelectedDetection] = useState("PERSON_DETECTED");

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const fetchVideoData = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/cameras`, { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        setCameras(data.data);
        // Extract all events from cameras
        const allEvents: CameraEvent[] = [];
        data.data.forEach((cam: any) => {
          if (cam.events) {
            cam.events.forEach((ev: any) => {
              allEvents.push({
                ...ev,
                cameraName: cam.name,
              });
            });
          }
        });
        allEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setEvents(allEvents);
      }
    } catch (err) {
      console.error("Failed to fetch cameras:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideoData();

    // Listen to real-time Socket.IO camera events
    const socket = getSocket();
    const handleCameraEvent = (newEvent: CameraEvent) => {
      setEvents((prev) => [newEvent, ...prev.slice(0, 19)]);
    };

    socket.on("camera:event", handleCameraEvent);

    return () => {
      socket.off("camera:event", handleCameraEvent);
    };
  }, []);

  const triggerSimulation = async () => {
    setSimulating(true);
    try {
      const res = await fetch(`${API_BASE}/api/cameras/simulator/trigger`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          detectionType: selectedDetection,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEvents((prev) => [data.data, ...prev]);
      }
    } catch (err) {
      console.error("Simulation trigger failed:", err);
    } finally {
      setSimulating(false);
    }
  };

  const getDetectionBadge = (type: string) => {
    switch (type) {
      case "UNAUTHORIZED_AREA_ACTIVITY":
      case "RESTRICTED_AREA_ENTRY":
        return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
      case "UNUSUAL_ACTIVITY":
      case "ABANDONED_OBJECT":
      case "CROWD_DETECTED":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
      default:
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              Phase 11 Enterprise
            </span>
            <span className="text-xs text-gray-500">• AI Computer Vision Pipeline</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            AI CCTV & Video Analytics Engine
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Real-time automated video stream monitoring, object detection, and spatial anomaly alerts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/cameras"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 rounded-xl transition"
          >
            Manage Cameras ({cameras.length})
          </Link>
          <button
            onClick={triggerSimulation}
            disabled={simulating}
            className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition flex items-center gap-2 disabled:opacity-50"
          >
            {simulating ? "Processing AI Frame..." : "⚡ Simulate AI Detection"}
          </button>
        </div>
      </div>

      {/* Simulator Quick Config */}
      <div className="bg-gradient-to-r from-indigo-900/10 via-purple-900/10 to-gray-900/10 p-4 rounded-xl border border-indigo-500/20 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            AI Video Detection Pipeline Simulator:
          </span>
          <select
            value={selectedDetection}
            onChange={(e) => setSelectedDetection(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500"
          >
            <option value="PERSON_DETECTED">Person Detected (Normal)</option>
            <option value="VEHICLE_DETECTED">Vehicle Detected</option>
            <option value="CROWD_DETECTED">Crowd Gathering Alert</option>
            <option value="UNAUTHORIZED_AREA_ACTIVITY">Unauthorized Area Activity</option>
            <option value="RESTRICTED_AREA_ENTRY">Restricted Area Entry</option>
            <option value="ABANDONED_OBJECT">Abandoned Object Detected</option>
            <option value="UNUSUAL_ACTIVITY">Unusual Motion Activity</option>
          </select>
        </div>

        <span className="text-xs text-gray-500 dark:text-gray-400">
          Stream Architecture: RTSP / IP Camera ➔ Analytics Engine ➔ Alert Pipeline ➔ Command Center
        </span>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Camera Live Stream Grid (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Active Camera Streams ({cameras.length})
          </h2>

          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading AI CCTV Streams...</div>
          ) : cameras.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-gray-300 dark:border-gray-800 rounded-2xl">
              No registered cameras found. Click Manage Cameras to register one.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {cameras.map((cam) => (
                <div
                  key={cam.id}
                  className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition group"
                >
                  <div className="relative aspect-video bg-gray-950 flex items-center justify-center overflow-hidden">
                    {/* Simulated Stream View */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 z-10"></div>
                    <img
                      src={`https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=600&auto=format&fit=crop`}
                      alt={cam.name}
                      className="w-full h-full object-cover opacity-75 group-hover:scale-105 transition duration-500"
                    />

                    {/* AI Bounding Box Overlay */}
                    <div className="absolute inset-[25%] border-2 border-dashed border-emerald-400/80 rounded-lg pointer-events-none z-20 flex items-start p-1">
                      <span className="bg-emerald-500 text-black text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                        AI DETECT: PERSON 94%
                      </span>
                    </div>

                    {/* Live Badge */}
                    <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-semibold text-white border border-white/10">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                      {cam.cameraType} LIVE
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between text-white">
                      <div>
                        <h3 className="font-bold text-sm leading-tight">{cam.name}</h3>
                        <p className="text-[11px] text-gray-300">{cam.location} • {cam.zone}</p>
                      </div>
                      <Link
                        href={`/cameras/${cam.id}`}
                        className="text-xs bg-white/20 hover:bg-white/30 backdrop-blur-md px-2.5 py-1 rounded-lg font-medium transition"
                      >
                        Inspect
                      </Link>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>ID: {cam.cameraId}</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                      Status: {cam.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Real-time AI Event Feed (1 col) */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm space-y-4 h-fit">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
              Live Detection Feed
            </h2>
            <span className="text-xs text-gray-400 font-mono">Socket.IO Realtime</span>
          </div>

          <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
            {events.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">No detection events recorded yet.</p>
            ) : (
              events.map((ev, idx) => (
                <div
                  key={ev.id || idx}
                  className="p-3.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/60 space-y-1.5 transition hover:border-indigo-500/30"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span
                      className={`px-2 py-0.5 rounded-md font-bold text-[10px] border ${getDetectionBadge(
                        ev.detectionType
                      )}`}
                    >
                      {ev.detectionType.replace(/_/g, " ")}
                    </span>
                    <span className="text-gray-400 font-mono text-[11px]">
                      {new Date(ev.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    {ev.cameraName || ev.cameraId || "Camera"}
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-1">
                    <span>Zone: <strong className="text-gray-700 dark:text-gray-300">{ev.zone}</strong></span>
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                      Confidence: {ev.confidence.toFixed(1)}%
                    </span>
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
