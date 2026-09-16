"use client";

import React, { useState } from "react";

export default function TransportAnalyticsPage() {
  const [timeRange, setTimeRange] = useState("month");

  const analyticsData = {
    dailyTrips: 18,
    weeklyTrips: 126,
    monthlyTrips: 540,
    averageDelayMins: 4.2,
    fleetUtilization: 88.5,
    overspeedIncidents: 6,
    routeDeviations: 2,
    deviceUptime: 99.4,
    avgTripDuration: "34 Mins",
    totalDistanceCovered: "1,240 km",
  };

  const handleExportCSV = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Metric,Value\n" +
      `Daily Trips,${analyticsData.dailyTrips}\n` +
      `Weekly Trips,${analyticsData.weeklyTrips}\n` +
      `Monthly Trips,${analyticsData.monthlyTrips}\n` +
      `Average Delay (Mins),${analyticsData.averageDelayMins}\n` +
      `Fleet Utilization (%),${analyticsData.fleetUtilization}%\n` +
      `Overspeed Incidents,${analyticsData.overspeedIncidents}\n` +
      `Route Deviations,${analyticsData.routeDeviations}\n` +
      `Device Uptime (%),${analyticsData.deviceUptime}%\n` +
      `Average Trip Duration,${analyticsData.avgTripDuration}\n` +
      `Total Distance Covered,${analyticsData.totalDistanceCovered}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `transport_analytics_${timeRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transport Fleet Analytics</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Performance metrics, route delay distribution, speed violation analytics, and CSV exports.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-semibold text-gray-900 dark:text-white"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors flex items-center gap-1.5"
          >
            📥 Export CSV Report
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Trips Completed</span>
          <p className="text-2xl font-bold text-gray-900 dark:text-white font-mono">{analyticsData.monthlyTrips}</p>
          <span className="text-[11px] text-emerald-600 font-semibold">98.2% On-Time Completion</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Avg Route Delay</span>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 font-mono">{analyticsData.averageDelayMins} Mins</p>
          <span className="text-[11px] text-gray-500">-1.1 min from last month</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Fleet Utilization</span>
          <p className="text-2xl font-bold text-brand-500 font-mono">{analyticsData.fleetUtilization}%</p>
          <span className="text-[11px] text-gray-500">3 Buses active in fleet</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Overspeed Violations</span>
          <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 font-mono">{analyticsData.overspeedIncidents}</p>
          <span className="text-[11px] text-rose-500 font-semibold">Flagged for driver review</span>
        </div>
      </div>

      {/* Analytics Breakdown Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm space-y-4">
        <h2 className="font-bold text-lg text-gray-900 dark:text-white">Route Performance & Telemetry Summary</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 space-y-1">
            <span className="text-gray-400 uppercase font-semibold text-[10px]">Route 101 (North Express)</span>
            <p className="font-bold text-sm text-gray-900 dark:text-white">Avg Delay: 3.5 Mins</p>
            <p className="text-gray-500">Distance: 14.2 km • Stops: 4</p>
          </div>
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 space-y-1">
            <span className="text-gray-400 uppercase font-semibold text-[10px]">Route 102 (South Hills)</span>
            <p className="font-bold text-sm text-gray-900 dark:text-white">Avg Delay: 5.1 Mins</p>
            <p className="text-gray-500">Distance: 18.5 km • Stops: 4</p>
          </div>
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 space-y-1">
            <span className="text-gray-400 uppercase font-semibold text-[10px]">Route 103 (West Shuttle)</span>
            <p className="font-bold text-sm text-gray-900 dark:text-white">Avg Delay: 2.1 Mins</p>
            <p className="text-gray-500">Distance: 10.8 km • Stops: 3</p>
          </div>
        </div>
      </div>
    </div>
  );
}
