# AI CCTV & Video Analytics Module

## Overview
The Video Monitoring module (`/video-monitoring`, `/cameras`, `/cameras/[id]`) integrates AI video stream detection pipelines for campus security.

## Camera Management
Supported Camera Types:
- `CCTV`
- `IP_CAMERA`
- `RTSP_CAMERA`

Camera Statuses:
- `ONLINE`
- `OFFLINE`
- `WARNING`

## Detection Event Types
- `PERSON_DETECTED`
- `VEHICLE_DETECTED`
- `CROWD_DETECTED`
- `UNAUTHORIZED_AREA_ACTIVITY`
- `ABANDONED_OBJECT`
- `RESTRICTED_AREA_ENTRY`
- `UNUSUAL_ACTIVITY`

## AI Detection Pipeline Architecture
```
Camera / Stream Node
       ↓
Video Stream (RTSP / IP)
       ↓
Video Analytics Engine (YOLO / OpenCV / Cloud Model Adapter)
       ↓
POST /api/cameras/:id/events
       ↓
Alert Engine & Socket.IO (`camera:event`)
       ↓
Smart Campus Command Center
```

## Local Simulator
The system includes a Video Analytics Simulator (`POST /api/cameras/simulator/trigger`) allowing interactive frame detection simulation without physical GPU infrastructure.
