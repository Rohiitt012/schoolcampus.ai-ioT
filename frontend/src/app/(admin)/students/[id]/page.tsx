"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { API_BASE_URL } from "@/context/AuthContext";

export default function StudentDetailPage() {
  const params = useParams();
  const studentId = params?.id as string;
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) return;
    const fetchStudentDetail = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/students/${studentId}`, {
          credentials: "include",
        });
        const data = await res.json();
        if (data.success) {
          setStudent(data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudentDetail();
  }, [studentId]);

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">Loading student profile...</div>
    );
  }

  if (!student) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-red-500 font-semibold">Student record not found.</p>
        <Link href="/students" className="text-brand-500 hover:underline text-sm">
          ← Back to Student Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/students" className="text-xs font-semibold text-brand-500 hover:underline mb-1 inline-block">
            ← Back to Directory
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{student.name}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Roll No: <span className="font-mono">{student.rollNumber}</span> • Class {student.className} (Sec {student.section})
          </p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
          {student.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 space-y-5 shadow-sm">
          <div className="flex items-center gap-4 border-b border-gray-200 dark:border-gray-800 pb-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white font-bold text-2xl shadow-md">
              {student.name.charAt(0)}
            </div>
            <div>
              <h2 className="font-bold text-lg text-gray-900 dark:text-white">{student.name}</h2>
              <p className="text-xs text-gray-500">Grade {student.className}</p>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div>
              <span className="text-xs font-medium uppercase tracking-wider text-gray-400 block">RFID Tag ID</span>
              <span className="font-mono text-sm px-2.5 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 inline-block mt-0.5 border border-gray-200 dark:border-gray-700">
                🏷️ {student.rfidCardId}
              </span>
            </div>

            <div>
              <span className="text-xs font-medium uppercase tracking-wider text-gray-400 block">Assigned Bus</span>
              {student.bus ? (
                <div className="mt-1 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40">
                  <p className="font-bold text-amber-900 dark:text-amber-200 text-sm">🚌 {student.bus.busNumber}</p>
                  <p className="text-xs text-amber-700 dark:text-amber-400">Route: {student.bus.route?.name || "Assigned"}</p>
                  <p className="text-xs text-amber-700 dark:text-amber-400">Driver: {student.bus.driver?.user?.name || "Assigned"}</p>
                </div>
              ) : (
                <span className="text-gray-400 text-xs italic">No bus assigned</span>
              )}
            </div>

            <div>
              <span className="text-xs font-medium uppercase tracking-wider text-gray-400 block">Parent Contact</span>
              {student.parent ? (
                <div className="mt-1 text-xs space-y-0.5 text-gray-700 dark:text-gray-300">
                  <p className="font-semibold text-gray-900 dark:text-white">{student.parent.user?.name}</p>
                  <p>📧 {student.parent.user?.email}</p>
                  <p>📞 {student.parent.phone}</p>
                  <p>🏠 {student.parent.address}</p>
                </div>
              ) : (
                <span className="text-gray-400 text-xs italic">No parent linked</span>
              )}
            </div>
          </div>
        </div>

        {/* Attendance & Alert History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Attendance History Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center justify-between">
              <span>Recent Attendance History</span>
              <span className="text-xs font-normal text-gray-400">Last 10 Logs</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-400 uppercase font-semibold">
                    <th className="py-2">Date</th>
                    <th className="py-2">Check In</th>
                    <th className="py-2">Check Out</th>
                    <th className="py-2">Device ID</th>
                    <th className="py-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300">
                  {student.attendances?.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-gray-400">No attendance history available.</td>
                    </tr>
                  ) : (
                    student.attendances?.map((att: any) => (
                      <tr key={att.id}>
                        <td className="py-2.5 font-medium">{new Date(att.date).toLocaleDateString()}</td>
                        <td className="py-2.5 font-mono">{att.checkIn ? new Date(att.checkIn).toLocaleTimeString() : "—"}</td>
                        <td className="py-2.5 font-mono">{att.checkOut ? new Date(att.checkOut).toLocaleTimeString() : "—"}</td>
                        <td className="py-2.5 font-mono text-gray-500">{att.deviceId || "GATE-01"}</td>
                        <td className="py-2.5 text-right">
                          <span className={`px-2 py-0.5 rounded font-bold ${
                            att.status === "PRESENT" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                          }`}>
                            {att.status}
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
      </div>
    </div>
  );
}
