"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { API_BASE_URL, getAuthHeaders } from "@/context/AuthContext";

interface Student {
  id: string;
  name: string;
  rollNumber: string;
  className: string;
  section: string;
  rfidCardId: string;
  status: string;
  parentId?: string | null;
  busId?: string | null;
  parent?: { id: string; user?: { name: string; email: string } };
  bus?: { id: string; busNumber: string; registrationNumber?: string };
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [buses, setBuses] = useState<any[]>([]);
  const [parents, setParents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [classNameFilter, setClassNameFilter] = useState("");

  // Add Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [parentMode, setParentMode] = useState<"SELECT" | "CREATE">("CREATE");

  const [formData, setFormData] = useState({
    name: "",
    rollNumber: "",
    className: "7-A",
    section: "A",
    rfidCardId: "",
    busId: "",
    parentId: "",
    newParentName: "",
    newParentEmail: "",
    newParentPhone: "",
  });

  // Dedicated Quick Edit Modals
  const [activeBusStudent, setActiveBusStudent] = useState<Student | null>(null);
  const [selectedBusId, setSelectedBusId] = useState("");

  const [activeParentStudent, setActiveParentStudent] = useState<Student | null>(null);
  const [selectedParentId, setSelectedParentId] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.append("search", search);
      if (classNameFilter) query.append("className", classNameFilter);

      const res = await fetch(`${API_BASE_URL}/students?${query.toString()}`, {
        headers: getAuthHeaders(),
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setStudents(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBusesAndParents = async () => {
    try {
      const [busRes, parentRes] = await Promise.all([
        fetch(`${API_BASE_URL}/buses`, { headers: getAuthHeaders(), credentials: "include" }),
        fetch(`${API_BASE_URL}/parents`, { headers: getAuthHeaders(), credentials: "include" }),
      ]);
      const busData = await busRes.json();
      const parentData = await parentRes.json();
      if (busData.success) setBuses(busData.data);
      if (parentData.success) setParents(parentData.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchBusesAndParents();
  }, [search, classNameFilter]);

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        rollNumber: formData.rollNumber,
        className: formData.className,
        section: formData.section,
        rfidCardId: formData.rfidCardId,
        busId: formData.busId || null,
        parentId: parentMode === "SELECT" ? formData.parentId || null : null,
        newParentName: parentMode === "CREATE" ? formData.newParentName : "",
        newParentEmail: parentMode === "CREATE" ? formData.newParentEmail : "",
        newParentPhone: parentMode === "CREATE" ? formData.newParentPhone : "",
      };

      const res = await fetch(`${API_BASE_URL}/students`, {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setIsAddModalOpen(false);
        setFormData({
          name: "",
          rollNumber: "",
          className: "7-A",
          section: "A",
          rfidCardId: "",
          busId: "",
          parentId: "",
          newParentName: "",
          newParentEmail: "",
          newParentPhone: "",
        });
        fetchStudents();
        fetchBusesAndParents();
      } else {
        alert(data.message || "Failed to create student");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Open & Save Quick Bus Link
  const openBusModal = (student: Student) => {
    fetchBusesAndParents();
    setActiveBusStudent(student);
    setSelectedBusId(student.bus?.id || student.busId || "");
  };

  const handleSaveBus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBusStudent) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/students/${activeBusStudent.id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify({
          name: activeBusStudent.name,
          rollNumber: activeBusStudent.rollNumber,
          className: activeBusStudent.className,
          section: activeBusStudent.section || "A",
          rfidCardId: activeBusStudent.rfidCardId,
          parentId: activeBusStudent.parent?.id || activeBusStudent.parentId || null,
          busId: selectedBusId || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActiveBusStudent(null);
        fetchStudents();
      } else {
        alert(data.message || "Failed to update bus assignment");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Open & Save Quick Parent Link
  const openParentModal = (student: Student) => {
    fetchBusesAndParents();
    setActiveParentStudent(student);
    setSelectedParentId(student.parent?.id || student.parentId || "");
  };

  const handleSaveParent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeParentStudent) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/students/${activeParentStudent.id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify({
          name: activeParentStudent.name,
          rollNumber: activeParentStudent.rollNumber,
          className: activeParentStudent.className,
          section: activeParentStudent.section || "A",
          rfidCardId: activeParentStudent.rfidCardId,
          busId: activeParentStudent.bus?.id || activeParentStudent.busId || null,
          parentId: selectedParentId || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActiveParentStudent(null);
        fetchStudents();
      } else {
        alert(data.message || "Failed to update parent linkage");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStudent = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to deactivate student ${name}?`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}/students/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        fetchStudents();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Student Directory</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage student records, RFID cards, bus linkages, and parent contacts.
          </p>
        </div>
        <button
          onClick={() => {
            fetchBusesAndParents();
            setIsAddModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white font-medium text-sm shadow-sm transition-all"
        >
          <span>+</span> Add New Student
        </button>
      </div>

      {/* Filters & Search */}
      <div className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Search by student name, roll number, or RFID card ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        </div>
        <select
          value={classNameFilter}
          onChange={(e) => setClassNameFilter(e.target.value)}
          className="w-full sm:w-48 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="">All Classes</option>
          <option value="7-A">Grade 7-A</option>
          <option value="8-B">Grade 8-B</option>
          <option value="9-A">Grade 9-A</option>
          <option value="10-A">Grade 10-A</option>
        </select>
      </div>

      {/* Student Table */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                <th className="px-6 py-3.5">Student Name</th>
                <th className="px-6 py-3.5">Roll No.</th>
                <th className="px-6 py-3.5">Class</th>
                <th className="px-6 py-3.5">RFID Card ID</th>
                <th className="px-6 py-3.5">Bus</th>
                <th className="px-6 py-3.5">Parent Contact</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Loading student records...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    No student records found.
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                      <Link href={`/students/${student.id}`} className="hover:text-brand-500 hover:underline">
                        {student.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300 font-mono text-xs">
                      {student.rollNumber}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                        {student.className}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700">
                        {student.rfidCardId}
                      </span>
                    </td>

                    {/* DIRECT CLICKABLE BUS CELL */}
                    <td className="px-6 py-4">
                      {student.bus?.busNumber ? (
                        <button
                          onClick={() => openBusModal(student)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/30 hover:bg-amber-100 dark:hover:bg-amber-900/50 border border-amber-200 dark:border-amber-800/50 px-2.5 py-1 rounded-md cursor-pointer transition-all hover:scale-105"
                          title="Click to change bus assignment"
                        >
                          🚌 {student.bus.busNumber}
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-normal">✏️</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => openBusModal(student)}
                          className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 hover:underline font-medium cursor-pointer bg-amber-50/60 dark:bg-amber-900/10 border border-dashed border-amber-300 dark:border-amber-800/60 px-2 py-0.5 rounded"
                          title="Click to assign bus"
                        >
                          + Assign Bus
                        </button>
                      )}
                    </td>

                    {/* DIRECT CLICKABLE PARENT CONTACT CELL */}
                    <td className="px-6 py-4">
                      {student.parent?.user?.name ? (
                        <button
                          onClick={() => openParentModal(student)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800/50 px-2.5 py-1 rounded-md cursor-pointer transition-all hover:scale-105"
                          title="Click to change parent link"
                        >
                          👤 {student.parent.user.name}
                          <span className="text-[10px] text-indigo-500 font-normal">✏️</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => openParentModal(student)}
                          className="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium cursor-pointer bg-indigo-50/60 dark:bg-indigo-900/10 border border-dashed border-indigo-300 dark:border-indigo-800/60 px-2 py-0.5 rounded"
                          title="Click to link parent contact"
                        >
                          + Link Parent
                        </button>
                      )}
                    </td>

                    {/* CLEAN ACTIONS COLUMN */}
                    <td className="px-6 py-4 text-right space-x-3">
                      <Link
                        href={`/students/${student.id}`}
                        className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline"
                      >
                        Profile
                      </Link>
                      <button
                        onClick={() => handleDeleteStudent(student.id, student.name)}
                        className="text-xs font-medium text-red-600 hover:text-red-800 dark:text-red-400"
                      >
                        Deactivate
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ALL-IN-ONE SMART ADD STUDENT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 p-6 space-y-4 my-8">
            <div className="flex items-center justify-between border-b pb-3 border-gray-200 dark:border-gray-800">
              <div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">Add New Student & Parent</h3>
                <p className="text-xs text-gray-500">Create student profile and link/create parent in 1 single step</p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">
                ×
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="space-y-4">
              {/* SECTION 1: STUDENT INFO */}
              <div className="space-y-3 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200/80 dark:border-gray-700/60">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 block">
                  1. Student Information
                </span>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Student Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Roll Number</label>
                    <input
                      type="text"
                      required
                      value={formData.rollNumber}
                      onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                      placeholder="e.g. 709"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Class / Grade</label>
                    <select
                      value={formData.className}
                      onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    >
                      <option value="7-A">Grade 7-A</option>
                      <option value="8-B">Grade 8-B</option>
                      <option value="9-A">Grade 9-A</option>
                      <option value="10-A">Grade 10-A</option>
                      <option value="11-A">Grade 11-A</option>
                      <option value="12-A">Grade 12-A</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">RFID Card Tag ID</label>
                    <input
                      type="text"
                      required
                      value={formData.rfidCardId}
                      onChange={(e) => setFormData({ ...formData, rfidCardId: e.target.value })}
                      placeholder="e.g. RFID-10026"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Assigned Bus (Optional)</label>
                    <select
                      value={formData.busId}
                      onChange={(e) => setFormData({ ...formData, busId: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    >
                      <option value="">-- No Bus --</option>
                      {buses.map((bus) => (
                        <option key={bus.id} value={bus.id}>
                          🚌 {bus.busNumber}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 2: PARENT SELECTION TOGGLE */}
              <div className="space-y-3 bg-indigo-50/60 dark:bg-indigo-950/30 p-4 rounded-xl border border-indigo-200/80 dark:border-indigo-800/50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 block">
                    2. Parent Contact Details
                  </span>
                  <div className="inline-flex rounded-lg bg-white dark:bg-gray-900 p-0.5 border border-indigo-200 dark:border-indigo-800">
                    <button
                      type="button"
                      onClick={() => setParentMode("CREATE")}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                        parentMode === "CREATE"
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "text-gray-500 hover:text-gray-900 dark:text-gray-400"
                      }`}
                    >
                      + Create New Parent
                    </button>
                    <button
                      type="button"
                      onClick={() => setParentMode("SELECT")}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                        parentMode === "SELECT"
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "text-gray-500 hover:text-gray-900 dark:text-gray-400"
                      }`}
                    >
                      Select Existing
                    </button>
                  </div>
                </div>

                {parentMode === "CREATE" ? (
                  <div className="space-y-3 pt-1">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Parent Full Name</label>
                      <input
                        type="text"
                        required={parentMode === "CREATE"}
                        value={formData.newParentName}
                        onChange={(e) => setFormData({ ...formData, newParentName: e.target.value })}
                        placeholder="e.g. Vikram Sharma"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Parent Login Email</label>
                        <input
                          type="email"
                          required={parentMode === "CREATE"}
                          value={formData.newParentEmail}
                          onChange={(e) => setFormData({ ...formData, newParentEmail: e.target.value })}
                          placeholder="e.g. vikram.sharma@gmail.com"
                          className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Parent Phone</label>
                        <input
                          type="text"
                          value={formData.newParentPhone}
                          onChange={(e) => setFormData({ ...formData, newParentPhone: e.target.value })}
                          placeholder="e.g. 9876543210"
                          className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                    <p className="text-[11px] text-indigo-600 dark:text-indigo-400 italic">
                      ✨ Parent account automatically creates with login credentials and links to this student.
                    </p>
                  </div>
                ) : (
                  <div className="pt-1">
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Choose Existing Registered Parent</label>
                    <select
                      value={formData.parentId}
                      onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    >
                      <option value="">-- No Parent Linked --</option>
                      {parents.map((p) => (
                        <option key={p.id} value={p.id}>
                          👤 {p.user?.name || "Parent"} ({p.user?.email || p.phone})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
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
                  className="px-5 py-2 text-sm font-semibold bg-brand-500 hover:bg-brand-600 text-white rounded-lg disabled:opacity-50 shadow-sm"
                >
                  {submitting ? "Creating Student & Parent..." : "Create Student & Link Parent"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK DEDICATED BUS LINK MODAL */}
      {activeBusStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-gray-200 dark:border-gray-800">
              <div>
                <h3 className="font-bold text-base text-gray-900 dark:text-white">🚌 Assign / Change Bus</h3>
                <p className="text-xs text-gray-500">Student: {activeBusStudent.name}</p>
              </div>
              <button onClick={() => setActiveBusStudent(null)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">
                ×
              </button>
            </div>
            <form onSubmit={handleSaveBus} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Select School Bus</label>
                <select
                  value={selectedBusId}
                  onChange={(e) => setSelectedBusId(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="">-- Unassigned (No Bus) --</option>
                  {buses.map((bus) => (
                    <option key={bus.id} value={bus.id}>
                      🚌 {bus.busNumber} ({bus.registrationNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveBusStudent(null)}
                  className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white rounded-lg disabled:opacity-50 shadow-sm"
                >
                  {submitting ? "Updating..." : "Save Bus"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK DEDICATED PARENT LINK MODAL */}
      {activeParentStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-gray-200 dark:border-gray-800">
              <div>
                <h3 className="font-bold text-base text-gray-900 dark:text-white">👤 Link / Change Parent</h3>
                <p className="text-xs text-gray-500">Student: {activeParentStudent.name}</p>
              </div>
              <button onClick={() => setActiveParentStudent(null)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">
                ×
              </button>
            </div>
            <form onSubmit={handleSaveParent} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Select Parent Contact</label>
                <select
                  value={selectedParentId}
                  onChange={(e) => setSelectedParentId(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="">-- Not Linked (No Parent) --</option>
                  {parents.map((p) => (
                    <option key={p.id} value={p.id}>
                      👤 {p.user?.name || "Parent"} ({p.user?.email || p.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveParentStudent(null)}
                  className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50 shadow-sm"
                >
                  {submitting ? "Updating..." : "Save Parent"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
