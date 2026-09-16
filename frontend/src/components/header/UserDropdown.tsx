"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Dropdown } from "../ui/dropdown/Dropdown";

export default function UserDropdown() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  function toggleDropdown(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const roleColors: Record<string, string> = {
    SUPER_ADMIN: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
    ADMIN: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    TEACHER: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    DRIVER: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    PARENT: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  };

  const currentRole = user?.role || "ADMIN";
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center text-gray-700 dark:text-gray-400 dropdown-toggle gap-2"
      >
        <span className="flex items-center justify-center rounded-full h-10 w-10 bg-gradient-to-tr from-brand-600 to-indigo-500 text-white font-bold text-sm shadow-sm">
          {userInitial}
        </span>

        <div className="hidden sm:flex flex-col items-start text-left">
          <span className="font-semibold text-sm text-gray-800 dark:text-white leading-tight">
            {user?.name || "Guest User"}
          </span>
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
              roleColors[currentRole] || "bg-gray-100 text-gray-700"
            }`}
          >
            {currentRole}
          </span>
        </div>

        <svg
          className={`stroke-gray-500 dark:stroke-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          width="18"
          height="20"
          viewBox="0 0 18 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-3 flex w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-4 shadow-xl dark:border-gray-800 dark:bg-gray-900 z-50"
      >
        <div className="pb-3 border-b border-gray-200 dark:border-gray-800">
          <span className="block font-semibold text-gray-900 dark:text-white text-sm">
            {user?.name || "Guest User"}
          </span>
          <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400 truncate">
            {user?.email || "not-logged-in"}
          </span>
        </div>

        <ul className="flex flex-col gap-1 py-3 border-b border-gray-200 dark:border-gray-800 text-sm">
          <li>
            <Link
              href={
                currentRole === "PARENT"
                  ? "/parent"
                  : currentRole === "TEACHER"
                  ? "/teacher"
                  : currentRole === "DRIVER"
                  ? "/driver"
                  : "/dashboard"
              }
              onClick={closeDropdown}
              className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Role Dashboard
            </Link>
          </li>
        </ul>

        <button
          onClick={() => {
            closeDropdown();
            logout();
          }}
          className="flex items-center gap-3 px-3 py-2 mt-2 w-full font-medium text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm"
        >
          Sign out
        </button>
      </Dropdown>
    </div>
  );
}
