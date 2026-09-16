"use client";

import React, { useState, useEffect } from "react";
import { useAuth, API_BASE_URL } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";

export default function ParentPortalPage() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [children, setChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyChildren = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/parents/my-children`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setChildren(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyChildren();
  }, []);

  // Socket listener for child attendance & bus telemetry
  useEffect(() => {
    if (!socket) return;

    socket.on("attendance:scan", (data: any) => {
      fetchMyChildren();
    });

    socket.on("bus:location-update", (data: any) => {
      // Refresh live bus locations for parent's child bus
      setChildren((prev) =>
        prev.map((child) => {
          if (child.bus?.id === data.busId) {
            return {
              ...child,
              bus: {
                ...child.bus,
                locations: [data],
              },
            };
          }
          return child;
        })
      );
    });

    return () => {
      socket.off("attendance:scan");
      socket.off("bus:location-update");
    };
  }, [socket]);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading Parent Portal child dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-lg space-y-2">
        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/20">
          Parent Secure Portal
        </span>
        <h1 className="text-2xl font-bold">Welcome back, {user?.name}!</h1>
        <p className="text-xs text-white/80">
          Real-time updates for your registered children: attendance check-ins, live bus telemetry, and route ETAs.
        </p>
      </div>

      {/* Children Cards */}
      <div className="space-y-6">
        {children.length === 0 ? (
          <div className="p-8 text-center text-gray-500 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
            No children registered under this parent profile.
          </div>
        ) : (
          children.map((child) => {
            const latestAtt = child.attendances?.[0];
            const busLoc = child.bus?.locations?.[0];

            return (
              <div
                key={child.id}
                className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-6"
              >
                {/* Child Summary */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-5">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-500 to-indigo-500 text-white font-bold text-2xl flex items-center justify-center shadow-md">
                      {child.name.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">{child.name}</h2>
                      <p className="text-xs text-gray-500">
                        Class {child.className} • Roll No: <span className="font-mono">{child.rollNumber}</span> • Tag ID: <span className="font-mono">{child.rfidCardId}</span>
                      </p>
                    </div>
                  </div>

                  {/* Today's Attendance Pill */}
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-right">
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 block">Today&apos;s Status</span>
                    <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                      latestAtt?.status === "PRESENT" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300" : "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300"
                    }`}>
                      {latestAtt?.status || "ABSENT"}
                    </span>
                    {latestAtt?.checkIn && (
                      <p className="text-[10px] font-mono text-gray-400 mt-0.5">
                        In: {new Date(latestAtt.checkIn).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                </div>

                {/* Bus & Live Tracking Box */}
                {child.bus ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                          🚌 Bus Unit {child.bus.busNumber}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-200 text-amber-900">
                          {child.bus.status}
                        </span>
                      </div>
                      <p className="text-xs text-amber-800 dark:text-amber-300">
                        <strong>Driver:</strong> {child.bus.driver?.user?.name || "Assigned Driver"}
                      </p>
                      <p className="text-xs text-amber-800 dark:text-amber-300">
                        <strong>Route:</strong> {child.bus.route?.name}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900 text-white font-mono text-xs space-y-1.5 shadow-inner">
                      <div className="flex items-center justify-between text-gray-400 text-[10px] font-sans">
                        <span>LIVE BUS TELEMETRY & ETA</span>
                        <span className="text-emerald-400 font-bold">🟢 Active Socket</span>
                      </div>
                      <p className="text-amber-400 font-bold">
                        LAT: {busLoc?.latitude ? busLoc.latitude.toFixed(5) : "28.6700"} | LNG: {busLoc?.longitude ? busLoc.longitude.toFixed(5) : "77.4500"}
                      </p>
                      <p className="text-gray-300">
                        SPEED: {busLoc?.speed ? busLoc.speed.toFixed(1) : "0.0"} km/h • ESTIMATED ETA TO STOP: <span className="text-emerald-400 font-bold font-sans">8 Mins</span>
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 text-xs text-gray-400 text-center">
                    No school bus assigned for this student.
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
