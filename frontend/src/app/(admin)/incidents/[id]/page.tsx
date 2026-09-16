"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface IncidentEvent {
  id: string;
  action: string;
  description: string;
  performedBy?: string;
  timestamp: string;
}

interface Incident {
  id: string;
  incidentType: string;
  severity: string;
  status: string;
  location: string;
  building?: string;
  assignedResponder?: string;
  createdAt: string;
  events: IncidentEvent[];
}

export default function IncidentDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState("");

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const fetchIncident = async () => {
    if (!id) return;
    try {
      const res = await fetch(`${API_BASE}/api/emergency/incidents/${id}`, { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        setIncident(data.data);
      }
    } catch (err) {
      console.error("Error fetching incident:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncident();
  }, [id]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    try {
      const res = await fetch(`${API_BASE}/api/emergency/incidents/${id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ note: newNote }),
      });
      const data = await res.json();
      if (data.success) {
        setNewNote("");
        fetchIncident();
      }
    } catch (err) {
      console.error("Error adding note:", err);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading incident details...</div>;
  }

  if (!incident) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-red-500 font-semibold">Emergency Incident not found.</p>
        <Link href="/emergency" className="text-red-600 underline text-sm">
          ← Back to Emergency Hub
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Link href="/emergency" className="hover:text-red-600">
          Emergency Hub
        </Link>
        <span>/</span>
        <Link href="/incidents" className="hover:text-red-600">
          Incidents
        </Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white font-semibold">
          #{incident.id.substring(0, 8)}
        </span>
      </div>

      {/* Header Info Card */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-0.5 rounded text-xs font-black bg-red-600 text-white animate-pulse">
                {incident.severity}
              </span>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {incident.incidentType.replace(/_/g, " ")}
              </h1>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Location: <strong>{incident.location}</strong> | Incident ID: <span className="font-mono">{incident.id}</span>
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-gray-400 font-medium">Status</span>
            <div className="text-xl font-black text-indigo-600 dark:text-indigo-400">
              {incident.status}
            </div>
            <span className="text-xs text-gray-500">
              Responder: {incident.assignedResponder || "Unassigned"}
            </span>
          </div>
        </div>
      </div>

      {/* Timeline Audit History */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span>📜 Emergency Event Audit Timeline</span>
        </h2>

        <div className="relative pl-6 border-l-2 border-red-500/40 space-y-6">
          {incident.events?.map((ev, idx) => (
            <div key={ev.id || idx} className="relative group">
              {/* Timeline Bullet Dot */}
              <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-red-600 border-2 border-white dark:border-gray-900 shadow"></div>

              <div className="bg-gray-50 dark:bg-gray-800/60 p-4 rounded-xl border border-gray-100 dark:border-gray-800 space-y-1">
                <div className="flex items-center justify-between text-xs text-gray-400 font-mono">
                  <span>{new Date(ev.timestamp).toLocaleTimeString()} • {new Date(ev.timestamp).toLocaleDateString()}</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">{ev.performedBy || "System"}</span>
                </div>
                <div className="text-sm font-bold text-gray-900 dark:text-white">
                  {ev.action.replace(/_/g, " ")}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  {ev.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Add Note Form */}
        <form onSubmit={handleAddNote} className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center gap-3">
          <input
            type="text"
            required
            placeholder="Add note or response update to timeline..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-sm"
          />
          <button
            type="submit"
            className="px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow transition"
          >
            Add Note
          </button>
        </form>
      </div>
    </div>
  );
}
