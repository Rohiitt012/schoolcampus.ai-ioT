"use client";

import React, { useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "../context/AuthContext";
import {
  BoxCubeIcon,
  CalenderIcon,
  GridIcon,
  HorizontaLDots,
  ListIcon,
  PageIcon,
  PieChartIcon,
  PlugInIcon,
  TableIcon,
  UserCircleIcon,
} from "../icons/index";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  roles?: string[];
};

const navItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Command Center",
    path: "/command-center",
    roles: ["SUPER_ADMIN", "ADMIN", "TEACHER", "DRIVER"],
  },
  {
    icon: <GridIcon />,
    name: "Control Dashboard",
    path: "/dashboard",
    roles: ["SUPER_ADMIN", "ADMIN", "TEACHER"],
  },
  {
    icon: <UserCircleIcon />,
    name: "Student Directory",
    path: "/students",
    roles: ["SUPER_ADMIN", "ADMIN", "TEACHER"],
  },
  {
    icon: <ListIcon />,
    name: "RFID Gate Simulator",
    path: "/attendance/simulator",
    roles: ["SUPER_ADMIN", "ADMIN", "TEACHER"],
  },
  {
    icon: <BoxCubeIcon />,
    name: "Bus Fleet Tracking",
    path: "/buses",
    roles: ["SUPER_ADMIN", "ADMIN", "TEACHER", "DRIVER"],
  },
  {
    icon: <PlugInIcon />,
    name: "GPS Telemetry Simulator",
    path: "/buses/simulator",
    roles: ["SUPER_ADMIN", "ADMIN", "DRIVER"],
  },
  {
    icon: <BoxCubeIcon />,
    name: "AI CCTV Analytics",
    path: "/video-monitoring",
    roles: ["SUPER_ADMIN", "ADMIN", "TEACHER"],
  },
  {
    icon: <PlugInIcon />,
    name: "IoT Sensors Hub",
    path: "/iot",
    roles: ["SUPER_ADMIN", "ADMIN", "TEACHER"],
  },
  {
    icon: <PieChartIcon />,
    name: "Emergency & SOS Hub",
    path: "/emergency",
    roles: ["SUPER_ADMIN", "ADMIN", "TEACHER", "DRIVER"],
  },
  {
    icon: <TableIcon />,
    name: "Route Management",
    path: "/routes",
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  {
    icon: <PieChartIcon />,
    name: "Smart Alerts Hub",
    path: "/alerts",
    roles: ["SUPER_ADMIN", "ADMIN", "TEACHER", "DRIVER"],
  },
  {
    icon: <PageIcon />,
    name: "AI Operations Assistant",
    path: "/ai-assistant",
    roles: ["SUPER_ADMIN", "ADMIN", "TEACHER"],
  },
  {
    icon: <PieChartIcon />,
    name: "Transport Analytics",
    path: "/analytics/transport",
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
  {
    icon: <CalenderIcon />,
    name: "Attendance Analytics",
    path: "/analytics/attendance",
    roles: ["SUPER_ADMIN", "ADMIN", "TEACHER"],
  },
  {
    icon: <PlugInIcon />,
    name: "IoT Device Hub",
    path: "/devices",
    roles: ["SUPER_ADMIN", "ADMIN"],
  },
];

const portalItems: NavItem[] = [
  {
    icon: <UserCircleIcon />,
    name: "Parent Portal",
    path: "/parent",
    roles: ["PARENT", "SUPER_ADMIN", "ADMIN"],
  },
  {
    icon: <CalenderIcon />,
    name: "Teacher Portal",
    path: "/teacher",
    roles: ["TEACHER", "SUPER_ADMIN", "ADMIN"],
  },
  {
    icon: <BoxCubeIcon />,
    name: "Driver Portal",
    path: "/driver",
    roles: ["DRIVER", "SUPER_ADMIN", "ADMIN"],
  },
];

import LogoIcon from "@/components/common/LogoIcon";

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const { user } = useAuth();
  const pathname = usePathname();

  const userRole = user?.role || "ADMIN";

  const filterByRole = (items: NavItem[]) => {
    return items.filter(
      (item) => !item.roles || item.roles.includes(userRole)
    );
  };

  const activeMainItems = filterByRole(navItems);
  const activePortalItems = filterByRole(portalItems);

  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-6 flex items-center ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link href="/dashboard" className="flex items-center gap-3">
          <LogoIcon className="w-10 h-10" />
          {(isExpanded || isHovered || isMobileOpen) && (
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-tight tracking-tight text-gray-900 dark:text-white">
                Smart School <span className="text-brand-500">IoT</span>
              </span>
              <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
                AI & IoT Enterprise
              </span>
            </div>
          )}
        </Link>
      </div>

      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400 ${
                  !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Core Platform"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              <ul className="flex flex-col gap-1.5">
                {activeMainItems.map((nav) => (
                  <li key={nav.name}>
                    {nav.path && (
                      <Link
                        href={nav.path}
                        className={`menu-item group ${
                          isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                        }`}
                      >
                        <span
                          className={`${
                            isActive(nav.path)
                              ? "menu-item-icon-active"
                              : "menu-item-icon-inactive"
                          }`}
                        >
                          {nav.icon}
                        </span>
                        {(isExpanded || isHovered || isMobileOpen) && (
                          <span className="menu-item-text font-medium text-xs">{nav.name}</span>
                        )}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {activePortalItems.length > 0 && (
              <div>
                <h2
                  className={`mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400 ${
                    !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                  }`}
                >
                  {isExpanded || isHovered || isMobileOpen ? (
                    "Role Portals"
                  ) : (
                    <HorizontaLDots />
                  )}
                </h2>
                <ul className="flex flex-col gap-1.5">
                  {activePortalItems.map((nav) => (
                    <li key={nav.name}>
                      {nav.path && (
                        <Link
                          href={nav.path}
                          className={`menu-item group ${
                            isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                          }`}
                        >
                          <span
                            className={`${
                              isActive(nav.path)
                                ? "menu-item-icon-active"
                                : "menu-item-icon-inactive"
                            }`}
                          >
                            {nav.icon}
                          </span>
                          {(isExpanded || isHovered || isMobileOpen) && (
                            <span className="menu-item-text font-medium text-xs">{nav.name}</span>
                          )}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
