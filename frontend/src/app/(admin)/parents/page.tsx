"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { API_BASE_URL, getAuthHeaders } from "@/context/AuthContext";

interface ParentRecord {
  id: string;
  phone: string;
  address?: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  students?: Array<{ id: string; name: string; className: string }>;
}

export default function ParentsDirectoryPage() {
  const [parents, setParents] = useState<ParentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "password123",
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchParents = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/parents`, {
        headers: getAuthHeaders(),
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setParents(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParents();
  }, []);

  const handleCreateParent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/parents`, {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setIsAddModalOpen(false);
        setFormData({
          name: "",
          email: "",
          phone: "",
          address: "",
          password: "password123",
        });
        fetchParents();
      } else {
        alert(data.message || "Failed to create parent account");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredParents = parents.filter((p) => {
    const term = search.toLowerCase();
    return (
      p.user?.name.toLowerCase().includes(term) ||
      p.user?.email.toLowerCase().includes(term) ||
      p.phone.includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Parent Directory</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Register parent accounts, manage contact details, and view student connections.
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white font-medium text-sm shadow-sm transition-all"
        >
          <span>+</span> Add New Parent
        </button>
      </div>

      {/* Search */}
      <div className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Search parents by name, email, or phone number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        </div>
      </div>

      {/* Parent Table */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                <th className="px-6 py-3.5">Parent Name</th>
                <th className="px-6 py-3.5">Login Email</th>
                <th className="px-6 py-3.5">Phone Contact</th>
                <th className="px-6 py-3.5">Residential Address</th>
                <th className="px-6 py-3.5">Linked Children</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Loading parent accounts...
                  </td>
                </tr>
              ) : filteredParents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No parent accounts found. Click &quot;+ Add New Parent&quot; to create one.
                  </td>
                </tr>
              ) : (
                filteredParents.map((parent) => (
                  <tr key={parent.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-xs">
                        👤
                      </div>
                      {parent.user?.name || "Parent User"}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-600 dark:text-gray-300">
                      {parent.user?.email || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300 font-mono text-xs">
                      {parent.phone}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300 text-xs">
                      {parent.address || "Main Campus Region"}
                    </td>
                    <td className="px-6 py-4">
                      {parent.students && parent.students.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {parent.students.map((st) => (
                            <span
                              key={st.id}
                              className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-medium"
                            >
                              🎓 {st.name} ({st.className})
                            </span>
                          ))}
                        </div>
                      ) : (
                        <Link
                          href="/students"
                          className="text-xs text-brand-600 dark:text-brand-400 hover:underline font-medium"
                        >
                          + Link Student in Directory
                        </Link>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Parent Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-gray-200 dark:border-gray-800">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">Register New Parent</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">
                ×
              </button>
            </div>
            <form onSubmit={handleCreateParent} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Parent Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Vikram Sharma"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Login Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. parent.sharma@smartschool.com"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Contact</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. 9876543210"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Default Password</label>
                  <input
                    type="text"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Address (Optional)</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="e.g. 102 Green Park Ave, Suburb City"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-medium bg-brand-500 hover:bg-brand-600 text-white rounded-lg disabled:opacity-50"
                >
                  {submitting ? "Registering..." : "Create Parent Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
