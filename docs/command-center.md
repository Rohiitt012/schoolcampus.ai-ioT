# Smart Campus Command Center Architecture

## Overview
The Smart Campus Command Center (`/command-center`) serves as the primary operations control room for the platform. It provides high-level key operational metrics, a unified interactive Leaflet map displaying live buses, cameras, sensors, and emergency incidents, and zero-refresh real-time Socket.IO stream panels.

## Features & Key Performance Indicators (KPIs)
- **Total Students**: Total enrolled students across tenant schools.
- **Active Buses**: Live buses currently in transit on scheduled routes.
- **Online IoT Devices**: Active environmental telemetry nodes.
- **Cameras Online**: Active AI computer vision camera nodes.
- **Active Alerts**: Unresolved system warnings (OVERSPEED, SENSOR_THRESHOLD, etc.).
- **Open Emergencies**: Active SOS incidents requiring immediate response.

## Real-time Socket.IO Events Supported
- `bus:location-update`: Updates bus positions on Leaflet map in real time.
- `camera:event`: Updates live AI CCTV detection feed.
- `sensor:telemetry`: Updates live environmental sensor readings.
- `emergency:sos`: Instantly broadcasts high-priority emergency incidents.
- `alert:new`: Adds incoming prioritized alerts (CRITICAL, HIGH, MEDIUM, LOW).

## API Endpoints
- `GET /api/command-center/metrics`: Returns consolidated top KPI counts.
- `GET /api/command-center/overview`: Returns map entities (buses, cameras, sensors, emergency incidents, alerts, camera events).
