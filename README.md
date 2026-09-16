# 🏢 Smart Campus & Smart City IoT & AI Platform (Enterprise Edition)

A production-quality full-stack SaaS platform evolving Smart School IoT into a broad Smart Campus & Smart City IoT & AI Platform.

---

## 🌟 Key Features

### 📊 Phase 14 — Smart Campus Command Center
- Operations control room dashboard (`/command-center`).
- Top 6 KPI Metric Cards (Students, Active Buses, Online IoT Devices, Cameras Online, Active Alerts, Open Emergencies).
- Unified interactive Leaflet Map displaying live bus telemetry, AI CCTV cameras, IoT environmental sensors, and emergency incidents.
- Zero-page-refresh real-time Socket.IO stream panels.

### 📹 Phase 11 — AI CCTV & Video Analytics Engine
- Camera management (`/video-monitoring`, `/cameras`, `/cameras/[id]`).
- Supports `CCTV`, `IP_CAMERA`, `RTSP_CAMERA`.
- Video analytics simulator for detection events (`PERSON_DETECTED`, `UNAUTHORIZED_AREA_ACTIVITY`, `CROWD_DETECTED`, `RESTRICTED_AREA_ENTRY`, etc.).

### 🌡️ Phase 12 — IoT Sensor Telemetry Platform
- Environmental telemetry hub (`/iot`, `/iot/sensors`, `/iot/simulator`).
- Supports Temperature, Humidity, Air Quality, Smoke, Door, Water Level, Motion.
- Industrial Telemetry API (`POST /api/iot/telemetry`) with `X-DEVICE-ID` / `X-DEVICE-TOKEN` header auth.
- Threshold alert engine (Temp > 38°C, Smoke detected, AQI > 150, Low water level).

### 🚨 Phase 13 — Emergency & Safety System (SOS)
- 1-Tap SOS Panic Button for Drivers & Staff (`/sos`).
- Emergency Incident lifecycle management (`/emergency`, `/incidents`, `/incidents/[id]`).
- Status workflow (`OPEN` ➔ `ACKNOWLEDGED` ➔ `IN_PROGRESS` ➔ `RESOLVED`) with immutable audit timeline logs.

### 🔌 Phase 15 — Real Hardware Architecture & Master Demo
- Hardware device credential authentication (`DeviceCredential` model, `deviceAuth.ts` middleware).
- Modular hardware adapter pattern ready for physical ESP32, RFID Readers, GPS Trackers, and CCTV cameras.
- Master 17-Step End-to-End Demo Controller on `/devices`.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js v18+
- npm v9+

### 1. Backend Server Setup
```bash
cd backend
npm install
npx prisma db push
npx prisma db seed
npm run dev
```
Backend API will be running on `http://localhost:5000`.

### 2. Frontend App Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend App will be running on `http://localhost:3000`.

---

## 🔑 Demo Login Credentials

| Role | Email | Password | Access Scope |
|---|---|---|---|
| **Super Admin** | `superadmin@smartschool.com` | `password123` | Full Multi-tenant Access |
| **Admin** | `admin@smartschool.com` | `password123` | Smart Academy Campus Admin |
| **Teacher** | `teacher@smartschool.com` | `password123` | Teacher Portal & Attendance |
| **Driver** | `driver@smartschool.com` | `password123` | Driver Portal, Bus Telemetry & SOS |
| **Parent** | `parent@smartschool.com` | `password123` | Parent Portal & Child Tracking |

---

## 📜 Technical Documentation
- [Command Center Architecture](docs/command-center.md)
- [Video Analytics Architecture](docs/video-analytics.md)
- [IoT Sensors Architecture](docs/iot-sensors.md)
- [Emergency System Architecture](docs/emergency-system.md)
- [Hardware Integration Architecture](docs/hardware-integration.md)
- [AI System Architecture](docs/ai-architecture.md)
