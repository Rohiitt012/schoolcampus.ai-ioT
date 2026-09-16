"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSocket } from "@/context/SocketContext";
import { API_BASE_URL } from "@/context/AuthContext";

export default function BusDetailPage() {
  const params = useParams();
  const busId = params?.id as string;
  const { socket } = useSocket();

  const [bus, setBus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState<any>(null);

  // Historical Trip Playback State
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackIndex, setPlaybackIndex] = useState(0);
  const playbackTimerRef = useRef<any>(null);

  const fetchBus = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/buses/${busId}`, { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        setBus(data.data);
        if (data.data.locations && data.data.locations.length > 0) {
          setCurrentLocation(data.data.locations[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!busId) return;
    fetchBus();
  }, [busId]);

  // Listen to Socket.IO for live bus location updates
  useEffect(() => {
    if (!socket || !busId) return;

    socket.on("bus:location-update", (data: any) => {
      if (data.busId === busId) {
        setCurrentLocation({
          latitude: data.latitude,
          longitude: data.longitude,
          speed: data.speed,
          timestamp: data.timestamp,
        });
      }
    });

    return () => {
      socket.off("bus:location-update");
    };
  }, [socket, busId]);

  // Playback Loop
  useEffect(() => {
    if (!isPlaying || !bus?.locations || bus.locations.length === 0) {
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
      return;
    }

    playbackTimerRef.current = setInterval(() => {
      setPlaybackIndex((prev) => {
        const next = prev + 1;
        if (next >= bus.locations.length) {
          setIsPlaying(false);
          return prev;
        }
        setCurrentLocation(bus.locations[bus.locations.length - 1 - next]);
        return next;
      });
    }, 1200);

    return () => {
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
    };
  }, [isPlaying, bus]);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading bus telemetry...</div>;
  }

  if (!bus) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-red-500 font-semibold">Bus record not found.</p>
        <Link href="/buses" className="text-brand-500 hover:underline text-sm">
          ← Back to Bus Fleet
        </Link>
      </div>
    );
  }

  const speed = currentLocation?.speed || 0;
  const maxSpeed = bus.maxSpeed || 50;
  const isOverspeeding = speed > maxSpeed;

  // Calculate cumulative distance travelled (km)
  let cumulativeDistance = 0;
  if (bus.locations && bus.locations.length > 1) {
    for (let i = 0; i < bus.locations.length - 1; i++) {
      const p1 = bus.locations[i];
      const p2 = bus.locations[i + 1];
      const dLat = (p2.latitude - p1.latitude) * 111;
      const dLng = (p2.longitude - p1.longitude) * 111;
      cumulativeDistance += Math.sqrt(dLat * dLat + dLng * dLng);
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link href="/buses" className="text-xs font-semibold text-brand-500 hover:underline mb-1 inline-block">
            ← Back to Bus Fleet
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{bus.busNumber}</h1>
            <span className="font-mono text-xs px-2.5 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
              {bus.registrationNumber}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
            bus.status === "IN_TRANSIT" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 animate-pulse" : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
          }`}>
            {bus.status}
          </span>
          <Link
            href="/buses/simulator"
            className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-medium text-xs shadow-sm transition-colors"
          >
            Launch GPS Simulator 📡
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live GPS Telemetry & Interactive Map */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                <span>📍 Live Map Telemetry & Route Polyline</span>
              </h2>
              <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span> Live Socket Feed
              </span>
            </div>

            {/* Interactive Map Visual with Route Polyline & Stops */}
            <div className="relative w-full h-[340px] rounded-xl bg-slate-900 overflow-hidden border border-slate-800 flex items-center justify-center">
              {/* Map background grid simulation */}
              <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:20px_20px] opacity-40"></div>

              {/* Route Polyline Simulation */}
              <div className="absolute w-[82%] h-1.5 bg-gradient-to-r from-brand-500 via-indigo-500 to-amber-500 rounded-full rotate-[-8deg] shadow-lg"></div>

              {/* Bus Stops Markers */}
              {bus.route?.stops?.map((stop: any, idx: number) => {
                const offsetLeft = 15 + idx * 25;
                return (
                  <div
                    key={stop.id}
                    style={{ left: `${offsetLeft}%`, top: `${35 + (idx % 2) * 20}%` }}
                    className="absolute z-10 flex flex-col items-center group cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center border-2 border-white shadow-md">
                      {stop.sequence}
                    </div>
                    <span className="mt-1 text-[10px] font-semibold text-white bg-black/80 px-2 py-0.5 rounded shadow">
                      {stop.name}
                    </span>
                  </div>
                );
              })}

              {/* Live Bus Pin Marker */}
              <div className="relative z-20 flex flex-col items-center animate-bounce">
                <div className={`p-3 rounded-2xl ${isOverspeeding ? "bg-red-500 text-white" : "bg-amber-400 text-gray-900"} font-bold shadow-xl text-xl border-2 border-white`}>
                  🚌
                </div>
                <div className="mt-1 px-2.5 py-1 rounded-lg bg-black/90 text-white text-[11px] font-mono shadow-md font-bold flex items-center gap-1.5">
                  <span>{bus.busNumber}</span>
                  <span className="text-amber-400">| {speed.toFixed(1)} km/h</span>
                </div>
              </div>

              {/* Map Overlay Telemetry Metrics */}
              <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-black/80 backdrop-blur-md border border-white/10 flex justify-between items-center text-white text-xs font-mono">
                <div>
                  <span className="text-gray-400 text-[10px] block font-sans">CURRENT FIX</span>
                  <span>{currentLocation?.latitude ? `${currentLocation.latitude.toFixed(5)}, ${currentLocation.longitude.toFixed(5)}` : "Awaiting fix"}</span>
                </div>
                <div>
                  <span className="text-gray-400 text-[10px] block font-sans">DISTANCE TRAV.</span>
                  <span className="text-amber-400 font-bold">{cumulativeDistance.toFixed(2)} km</span>
                </div>
                <div className="text-right">
                  <span className="text-gray-400 text-[10px] block font-sans">ESTIMATED ETA</span>
                  <span className="text-emerald-400 font-bold">~ 8 Mins</span>
                </div>
              </div>
            </div>

            {/* Historical Trip Playback Controls */}
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-gray-700 dark:text-gray-300">
                <span className="flex items-center gap-2">
                  <span>🎬 Historical Telemetry Replay</span>
                  <span className="text-[10px] font-mono font-normal text-gray-400">({bus.locations?.length || 0} telemetry points)</span>
                </span>
                <span className="font-mono text-xs">{playbackIndex + 1} / {bus.locations?.length || 1}</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`px-4 py-2 rounded-lg font-bold text-xs text-white transition-all shadow-sm ${
                    isPlaying ? "bg-red-500 hover:bg-red-600" : "bg-emerald-600 hover:bg-emerald-700"
                  }`}
                >
                  {isPlaying ? "⏸ PAUSE REPLAY" : "▶ PLAY HISTORICAL TRIP"}
                </button>
                <button
                  onClick={() => {
                    setIsPlaying(false);
                    setPlaybackIndex(0);
                    if (bus.locations?.length > 0) setCurrentLocation(bus.locations[0]);
                  }}
                  className="px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-xs font-medium text-gray-800 dark:text-gray-200"
                >
                  ↺ RESET
                </button>
                <input
                  type="range"
                  min="0"
                  max={(bus.locations?.length || 1) - 1}
                  value={playbackIndex}
                  onChange={(e) => {
                    const idx = Number(e.target.value);
                    setPlaybackIndex(idx);
                    if (bus.locations?.[bus.locations.length - 1 - idx]) {
                      setCurrentLocation(bus.locations[bus.locations.length - 1 - idx]);
                    }
                  }}
                  className="flex-1 accent-brand-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bus Info Sidebar */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">Assigned Operational Info</h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
                <span className="text-gray-400 uppercase tracking-wider font-semibold block text-[10px] mb-1">Driver Details</span>
                <p className="font-bold text-sm text-gray-900 dark:text-white">{bus.driver?.user?.name || "Unassigned"}</p>
                <p className="text-gray-500 font-mono mt-0.5">Lic: {bus.driver?.licenseNumber || "N/A"}</p>
                <p className="text-gray-500 mt-0.5">Phone: {bus.driver?.phone || "N/A"}</p>
              </div>

              <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
                <span className="text-gray-400 uppercase tracking-wider font-semibold block text-[10px] mb-1">Route & Stops</span>
                <p className="font-bold text-sm text-gray-900 dark:text-white">{bus.route?.name || "Unassigned Route"}</p>
                <p className="text-gray-500 mt-0.5">{bus.route?.startPoint} ➔ {bus.route?.endPoint}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
