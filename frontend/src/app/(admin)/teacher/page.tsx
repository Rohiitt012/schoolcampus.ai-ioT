"use client";

import React, { useState, useEffect } from "react";
import { useAuth, API_BASE_URL } from "@/context/AuthContext";

export default function TeacherPortalPage() {
  const { user } = useAuth();
  const [assignedClass, setAssignedClass] = useState("7-A");
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClassStudents = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/teachers/my-class`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setAssignedClass(data.assignedClass);
        setStudents(data.students);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassStudents();
  }, []);

  const presentCount = students.filter(
    (s) => s.attendances?.[0]?.status === "PRESENT"
  ).length;
  const attendancePercentage =
    students.length > 0
      ? Math.round((presentCount / students.length) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg space-y-2">
        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/20">
          Teacher Portal • Grade {assignedClass}
        </span>
        <h1 className="text-2xl font-bold">Welcome, {user?.name}!</h1>
        <p className="text-xs text-white/80">
          Manage classroom roll call, verify RFID check-in status, and monitor daily punctuality.
        </p>
      </div>

      {/* Class Punctuality Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total Enrolled</span>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{students.length} Students</p>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Present Today</span>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{presentCount} Present</p>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Class Attendance Rate</span>
          <p className="text-2xl font-bold text-brand-500">{attendancePercentage}%</p>
        </div>
      </div>

      {/* Student Roll Call Table */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm space-y-4 p-6">
        <h2 className="font-bold text-lg text-gray-900 dark:text-white">
          Grade {assignedClass} Roll Call & Attendance Verification
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 text-xs font-semibold uppercase tracking-wider text-gray-400">
                <th className="py-3">Roll No.</th>
                <th className="py-3">Student Name</th>
                <th className="py-3">RFID Card Tag</th>
                <th className="py-3 text-right">Attendance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-400">Loading classroom roster...</td>
                </tr>
              ) : (
                students.map((student) => {
                  const status = student.attendances?.[0]?.status || "ABSENT";

                  return (
                    <tr key={student.id}>
                      <td className="py-3.5 font-mono text-xs text-gray-500">{student.rollNumber}</td>
                      <td className="py-3.5 font-semibold text-gray-900 dark:text-white">{student.name}</td>
                      <td className="py-3.5 font-mono text-xs text-gray-400">🏷️ {student.rfidCardId}</td>
                      <td className="py-3.5 text-right">
                        <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                          status === "PRESENT"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                        }`}>
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
