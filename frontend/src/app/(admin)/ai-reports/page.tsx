"use client";

import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "@/context/AuthContext";

export default function AIReportsPage() {
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAIReport = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/ai/reports`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setReportData(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAIReport();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
              Powered by Google Gemini 2.5 AI
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Operations & Safety Analytics</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Automated operational synthesis of student attendance trends, bus fleet delays, and safety recommendations.
          </p>
        </div>
        <button
          onClick={fetchAIReport}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md transition-all disabled:opacity-50"
        >
          <span>✨</span> {loading ? "Analyzing Data..." : "Re-Generate AI Analysis"}
        </button>
      </div>

      {/* Metrics Banner */}
      {reportData?.metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Attendance Rate</span>
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">{reportData.metrics.attendanceRate}%</span>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Present Students</span>
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400 font-mono">{reportData.metrics.presentCount}</span>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Absent Students</span>
            <span className="text-2xl font-bold text-rose-600 dark:text-rose-400 font-mono">{reportData.metrics.absentCount}</span>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Active Alerts</span>
            <span className="text-2xl font-bold text-amber-600 dark:text-amber-400 font-mono">{reportData.metrics.activeAlertsCount}</span>
          </div>
        </div>
      )}

      {/* Main AI Report Container */}
      <div className="p-8 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b pb-4 border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 flex items-center justify-center font-bold text-xl">
              🤖
            </div>
            <div>
              <h2 className="font-bold text-lg text-gray-900 dark:text-white">Smart Academy Operations AI Synthesis</h2>
              <p className="text-xs text-gray-400">
                Generated at: {reportData?.generatedAt ? new Date(reportData.generatedAt).toLocaleString() : "Just now"}
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
            Gemini 2.5 Flash
          </span>
        </div>

        {loading ? (
          <div className="py-16 text-center space-y-3">
            <div className="inline-block w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-medium text-gray-500">Processing telemetry dataset & querying Google Gemini models...</p>
          </div>
        ) : (
          <div className="prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 leading-relaxed text-sm whitespace-pre-wrap font-sans">
            {reportData?.report}
          </div>
        )}

        <div className="pt-4 border-t border-gray-100 dark:border-gray-800 text-[11px] text-gray-400 italic">
          Disclaimer: This summary report is automatically generated using Google Gemini AI. Operational suggestions should be reviewed by school administrators prior to fleet policy changes.
        </div>
      </div>
    </div>
  );
}
