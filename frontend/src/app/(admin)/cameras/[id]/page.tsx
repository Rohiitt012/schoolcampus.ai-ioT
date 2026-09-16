"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface CameraEvent {
  id: string;
  detectionType: string;
  zone: string;
  confidence: number;
  snapshotUrl?: string;
  timestamp: string;
  metadata?: string;
}

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
  events: CameraEvent[];
}

export default function CameraDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [camera, setCamera] = useState<Camera | null>(null);
  const [loading, setLoading] = useState(true);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    if (!id) return;
    fetch(`${API_BASE}/api/cameras/${id}`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCamera(data.data);
        }
      })
      .catch((err) => console.error("Error fetching camera:", err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading camera details...</div>;
  }

  if (!camera) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-red-500 font-semibold">Camera device not found.</p>
        <Link href="/cameras" className="text-indigo-600 underline text-sm">
          ← Back to Cameras Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Link href="/video-monitoring" className="hover:text-indigo-600">
          Video Monitoring
        </Link>
        <span>/</span>
        <Link href="/cameras" className="hover:text-indigo-600">
          Cameras
        </Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white font-semibold">{camera.name}</span>
      </div>

      {/* Main Details Banner */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{camera.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                {camera.status}
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Camera ID: <strong className="text-gray-700 dark:text-gray-300 font-mono">{camera.cameraId}</strong> | Zone: {camera.zone} | Building: {camera.building}
            </p>
          </div>

          <div className="text-right text-xs text-gray-500 font-mono">
            Last Heartbeat: {new Date(camera.lastHeartbeat).toLocaleString()}
          </div>
        </div>

        {/* Video Frame */}
        <div className="relative aspect-video max-h-[480px] bg-black rounded-xl overflow-hidden flex items-center justify-center">
          <img
            src="https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=1000&auto=format&fit=crop"
            alt={camera.name}
            className="w-full h-full object-cover opacity-80"
          />

          <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs text-white font-mono flex items-center gap-2 border border-white/10">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            STREAM: {camera.cameraType} ({camera.streamUrl || "RTSP Simulated Feed"})
          </div>
        </div>
      </div>

      {/* Detection Event Logs */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          Detection Analytics Log History ({camera.events?.length || 0})
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase border-b border-gray-200 dark:border-gray-800">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Detection Type</th>
                <th className="px-4 py-3">Zone</th>
                <th className="px-4 py-3">Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {!camera.events || camera.events.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-6 text-gray-500">
                    No detections recorded for this camera yet.
                  </td>
                </tr>
              ) : (
                camera.events.map((ev) => (
                  <tr key={ev.id}>
                    <td className="px-4 py-3 text-xs font-mono text-gray-500">
                      {new Date(ev.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                      {ev.detectionType.replace(/_/g, " ")}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{ev.zone}</td>
                    <td className="px-4 py-3 text-indigo-600 font-bold">{ev.confidence.toFixed(1)}%</td>
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
