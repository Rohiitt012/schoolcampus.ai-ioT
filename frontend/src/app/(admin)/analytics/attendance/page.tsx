"use client";

import React, { useState } from "react";

export default function AttendanceAnalyticsPage() {
  const [selectedClass, setSelectedClass] = useState("all");

  const classData = [
    { name: "Grade 7-A", total: 7, present: 7, percentage: 100, status: "Excellent" },
    { name: "Grade 8-B", total: 5, present: 4, percentage: 80, status: "Needs Improvement" },
    { name: "Grade 9-A", total: 4, present: 4, percentage: 100, status: "Excellent" },
    { name: "Grade 10-A", total: 6, present: 5, percentage: 83.3, status: "Good" },
  ];

  const filteredClassData =
    selectedClass === "all"
      ? classData
      : classData.filter((c) => c.name.toLowerCase().includes(selectedClass.toLowerCase()));

  const handleExportCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Class,Total Enrolled,Present Today,Attendance Rate (%)\n" +
      classData.map((c) => `${c.name},${c.total},${c.present},${c.percentage}%`).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `attendance_analytics.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Student Attendance Analytics</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Punctuality trends, absenteeism distribution, class-wise performance, and downloadable reports.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-semibold text-gray-900 dark:text-white"
          >
            <option value="all">All Classes</option>
            <option value="7-A">Grade 7-A</option>
            <option value="8-B">Grade 8-B</option>
            <option value="9-A">Grade 9-A</option>
            <option value="10-A">Grade 10-A</option>
          </select>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors flex items-center gap-1.5"
          >
            📥 Export CSV Report
          </button>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Overall Attendance</span>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">91.3%</p>
          <span className="text-[11px] text-emerald-600 font-semibold">+1.8% vs last month</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Punctuality Rate</span>
          <p className="text-2xl font-bold text-brand-500 font-mono">95.4%</p>
          <span className="text-[11px] text-gray-500">Before 8:15 AM check-in</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Highest Punctuality</span>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 font-mono">Grade 7-A</p>
          <span className="text-[11px] text-purple-600 font-semibold">100% Present Today</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Chronic Absentees</span>
          <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 font-mono">2</p>
          <span className="text-[11px] text-gray-500">&gt; 3 absences this month</span>
        </div>
      </div>

      {/* Class Attendance Roster Table */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm space-y-4 p-6">
        <h2 className="font-bold text-lg text-gray-900 dark:text-white">Class-Wise Attendance & Punctuality Breakdown</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 text-xs font-semibold uppercase tracking-wider text-gray-400">
                <th className="py-3">Class Name</th>
                <th className="py-3">Total Enrolled</th>
                <th className="py-3">Present Today</th>
                <th className="py-3">Attendance Rate</th>
                <th className="py-3 text-right">Performance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
              {filteredClassData.map((c) => (
                <tr key={c.name}>
                  <td className="py-3.5 font-bold text-gray-900 dark:text-white">{c.name}</td>
                  <td className="py-3.5 font-mono text-xs">{c.total}</td>
                  <td className="py-3.5 font-mono text-xs font-bold text-emerald-600">{c.present}</td>
                  <td className="py-3.5 font-mono text-xs font-bold">{c.percentage}%</td>
                  <td className="py-3.5 text-right">
                    <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                      c.percentage === 100
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                    }`}>
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
