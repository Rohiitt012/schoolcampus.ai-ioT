"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSocket } from "@/context/SocketContext";
import { API_BASE_URL } from "@/context/AuthContext";

export default function SmartSchoolDashboard() {
  const { socket, isConnected } = useSocket();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/dashboard/stats`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Listen to Socket.IO for live bus telemetry & attendance scans
  useEffect(() => {
    if (!socket) return;

    socket.on("bus:location-update", (data: any) => {
      fetchStats();
    });

    socket.on("attendance:scan", () => {
      fetchStats();
    });

    socket.on("alert:new", () => {
      fetchStats();
    });

    return () => {
      socket.off("bus:location-update");
      socket.off("attendance:scan");
      socket.off("alert:new");
    };
  }, [socket]);

  if (loading) {
    return (
      <div className="p-12 text-center text-gray-500 font-medium">
        Loading Smart School IoT Enterprise Dashboard...
      </div>
    );
  }

  const metrics = stats?.metrics || {
    totalStudents: 22,
    presentToday: 19,
    absentToday: 3,
    activeBuses: 2,
    studentsOnBus: 14,
    activeAlerts: 2,
    attendancePercentage: 86,
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 text-white shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white/20">
              Enterprise Dashboard
            </span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded ${isConnected ? "bg-emerald-400/20 text-emerald-200" : "bg-red-400/20 text-red-200"}`}>
              {isConnected ? "🟢 Socket.IO Realtime Active" : "🔴 Disconnected"}
            </span>
          </div>
          <h1 className="text-2xl font-bold">Smart School IoT Control Center</h1>
          <p className="text-xs text-white/80">
            Real-time RFID gate attendance, live GPS fleet tracking, and automated AI anomaly detection.
          </p>
        </div>

        {/* Demo Mode Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Link
            href="/attendance/simulator"
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors backdrop-blur-md border border-white/20 flex items-center gap-1.5"
          >
            <span>💳</span> RFID Simulator
          </Link>
          <Link
            href="/buses/simulator"
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs shadow-md transition-colors flex items-center gap-1.5"
          >
            <span>📡</span> GPS Simulator
          </Link>
        </div>
      </div>

      {/* 6 Core Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Total Students</span>
          <p className="text-2xl font-bold text-gray-900 dark:text-white font-mono">{metrics.totalStudents}</p>
          <span className="text-[11px] text-gray-500">Enrolled Roster</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Present Today</span>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">{metrics.presentToday}</p>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">{metrics.attendancePercentage}% Rate</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Absent Today</span>
          <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 font-mono">{metrics.absentToday}</p>
          <span className="text-[11px] text-gray-500">Gate Check-in Missed</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Active Buses</span>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 font-mono">{metrics.activeBuses}</p>
          <span className="text-[11px] text-gray-500">Units In-Transit</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Students on Bus</span>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 font-mono">{metrics.studentsOnBus}</p>
          <span className="text-[11px] text-gray-500">Transit En-Route</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Active Alerts</span>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400 font-mono">{metrics.activeAlerts}</p>
          <span className="text-[11px] text-red-500 font-semibold">Action Required</span>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live GPS Fleet Tracking Widget */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
              <span>🚌 Live Bus Fleet Tracking</span>
            </h2>
            <Link href="/buses" className="text-xs font-semibold text-brand-500 hover:underline">
              View All Buses →
            </Link>
          </div>

          <div className="space-y-3">
            {stats?.busesWithLocation?.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-xs">No buses broadcasting telemetry.</div>
            ) : (
              stats?.busesWithLocation?.map((bus: any) => {
                const loc = bus.locations?.[0];
                return (
                  <div
                    key={bus.id}
                    className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-gray-900 dark:text-white">{bus.busNumber}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-300">
                          {bus.status}
                        </span>
                      </div>
                      <p className="text-gray-500">Driver: <strong>{bus.driver?.user?.name || "Rajesh Kumar"}</strong> • Route: {bus.route?.name}</p>
                    </div>

                    <div className="text-right font-mono">
                      <span className={`font-bold text-sm ${loc?.speed > bus.maxSpeed ? "text-red-500" : "text-emerald-600"}`}>
                        {loc ? `${loc.speed.toFixed(1)} km/h` : "Stationary"}
                      </span>
                      <p className="text-[10px] text-gray-400">
                        {loc ? `Fix: ${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)}` : "No GPS fix"}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Incident Alerts Feed */}
        <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-lg text-gray-900 dark:text-white">🚨 Active Smart Alerts</h2>
            <Link href="/alerts" className="text-xs font-semibold text-brand-500 hover:underline">
              Alert Center →
            </Link>
          </div>

          <div className="space-y-3">
            {stats?.recentAlerts?.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-xs italic border border-dashed rounded-xl">
                No unresolved safety alerts. Systems nominal.
              </div>
            ) : (
              stats?.recentAlerts?.map((alert: any) => (
                <div
                  key={alert.id}
                  className="p-3.5 rounded-xl border border-red-200 bg-red-50/60 dark:bg-red-900/20 dark:border-red-800 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-red-700 dark:text-red-300 uppercase text-[10px] tracking-wider">
                      ⚠️ {alert.type}
                    </span>
                    <span className="font-mono text-[10px] text-gray-400">
                      {new Date(alert.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-gray-800 dark:text-gray-200">{alert.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
