"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface Incident {
  id: string;
  incidentType: string;
  severity: string;
  status: string;
  location: string;
  assignedResponder?: string;
  createdAt: string;
}

export default function IncidentsListPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  // Status Modal form
  const [newStatus, setNewStatus] = useState("ACKNOWLEDGED");
  const [responder, setResponder] = useState("");
  const [notes, setNotes] = useState("");

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const fetchIncidents = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/emergency/incidents`, { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        setIncidents(data.data);
      }
    } catch (err) {
      console.error("Error fetching incidents:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIncident) return;

    try {
      const res = await fetch(`${API_BASE}/api/emergency/incidents/${selectedIncident.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          status: newStatus,
          responder,
          notes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedIncident(null);
        setNotes("");
        fetchIncidents();
      } else {
        alert(data.error || "Failed to update incident status");
      }
    } catch (err) {
      console.error("Error updating incident status:", err);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Emergency Incident Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Acknowledge, assign response teams, and update lifecycle statuses for emergency events.
          </p>
        </div>

        <Link
          href="/sos"
          className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow transition"
        >
          + Trigger SOS Emergency
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase border-b border-gray-200 dark:border-gray-800">
              <tr>
                <th className="px-6 py-4">Incident ID</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Severity</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Responder</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    Loading incidents...
                  </td>
                </tr>
              ) : incidents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    No emergency incidents logged.
                  </td>
                </tr>
              ) : (
                incidents.map((inc) => (
                  <tr key={inc.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                    <td className="px-6 py-4 font-mono text-xs font-bold text-gray-900 dark:text-white">
                      #{inc.id.substring(0, 8)}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                      {inc.incidentType.replace(/_/g, " ")}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/10 text-red-600 border border-red-500/20">
                        {inc.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300 text-xs">{inc.location}</td>
                    <td className="px-6 py-4 text-xs font-medium text-gray-700 dark:text-gray-300">
                      {inc.assignedResponder || "Unassigned"}
                    </td>
                    <td className="px-6 py-4 font-bold text-xs">
                      {inc.status}
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <button
                        onClick={() => {
                          setSelectedIncident(inc);
                          setNewStatus(inc.status === "OPEN" ? "ACKNOWLEDGED" : inc.status);
                          setResponder(inc.assignedResponder || "Security Team Alpha");
                        }}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                      >
                        Update Status
                      </button>
                      <Link
                        href={`/incidents/${inc.id}`}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                      >
                        Timeline →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedIncident && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Update Incident #{selectedIncident.id.substring(0, 8)}
            </h2>

            <form onSubmit={handleUpdateStatus} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Incident Status Workflow
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-sm font-bold"
                >
                  <option value="OPEN">OPEN</option>
                  <option value="ACKNOWLEDGED">ACKNOWLEDGED</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="RESOLVED">RESOLVED</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Assigned Responder Team
                </label>
                <input
                  type="text"
                  required
                  value={responder}
                  onChange={(e) => setResponder(e.target.value)}
                  placeholder="e.g. Medical Response Unit / Security Alpha"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Timeline Action Log / Notes
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Dispatch team arrived on scene. First aid administered."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedIncident(null)}
                  className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow"
                >
                  Save Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
