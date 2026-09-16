# System Architecture - Smart School IoT & AI Platform

## Overview
Smart School IoT is an enterprise-grade SaaS platform combining real-time RFID student attendance, GPS bus fleet tracking, smart automated safety alerts, role-specific portals (Super Admin, Admin, Teacher, Driver, Parent), and AI operational analytics powered by Google Gemini.

```
 +-----------------------------------------------------------------------+
 |                            Next.js 16 UI                              |
 |   (App Router + Tailwind CSS + Socket.IO Client + TanStack Query)     |
 +-----------------------------------+-----------------------------------+
                                     |
                                     | HTTP REST / WebSockets
                                     v
 +-----------------------------------------------------------------------+
 |                     Node.js / Express TypeScript API                  |
 |  Auth Middleware | RBAC Guard | GPS Telemetry Engine | Socket Hub    |
 +-------------------+---------------+-------------------+---------------+
                     |               |                   |
                     v               v                   v
              +------------+  +--------------+   +---------------+
              | SQLite DB  |  |  Socket.IO   |   | Google Gemini |
              | (Prisma)   |  | Event Engine |   |   AI Model    |
              +------------+  +--------------+   +---------------+
```

## System Components
1. **Frontend**: Next.js 16, TypeScript, Tailwind CSS, TanStack Query, React Hook Form, Zod, Socket.IO Client.
2. **Backend REST & WebSocket Engine**: Express Server, TypeScript, Prisma ORM, JWT authentication via HTTP-only cookies, Socket.IO realtime server hub.
3. **Database**: SQLite (local development zero-config) / PostgreSQL (production) with Prisma migration scripts.
4. **Smart Alert Evaluator**: Background engine analyzing incoming GPS telemetry against velocity thresholds, geofence corridors, and device heartbeat intervals.
5. **AI Analytics Engine**: Google Gemini API synthesizer aggregating daily attendance percentages and fleet delays into operational recommendations.
