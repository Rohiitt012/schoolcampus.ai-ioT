# Real Hardware Integration Architecture

## Overview
The platform features a production-ready hardware interface layer supporting physical IoT devices, ESP32 microcontrollers, RFID Readers, GPS Trackers, and CCTV Gateways alongside realistic software simulators.

## Supported Device Categories
- `RFID_READER`: Gate entry & attendance scanners.
- `GPS_TRACKER`: Bus location telemetry devices.
- `ESP32`: NodeMCU microcontrollers for sensor interfacing.
- `IOT_SENSOR`: Environmental telemetry units.
- `CCTV_CAMERA`: RTSP/IP AI computer vision video nodes.

## Device Authentication Architecture
Physical devices do NOT use human JWT tokens. Instead, devices authenticate using hardware credentials stored in the `DeviceCredential` database model:

Headers:
- `X-DEVICE-ID`: Unique hardware device ID (e.g. `GPS-BUS-101`)
- `X-DEVICE-TOKEN`: Secret authentication API key token (e.g. `devtok_gps_101_secret_key_8923`)

Validated via `deviceAuth.ts` middleware.

## Device Heartbeat API (`POST /api/devices/heartbeat`)
Devices post periodic health checks:
```json
{
  "deviceId": "GPS-BUS-101",
  "status": "ONLINE",
  "battery": 92,
  "firmwareVersion": "1.0.4"
}
```

Updates `Device.lastSeen`, `DeviceCredential.lastSeen`, `firmwareVersion`, and `metadata`.

## Hardware Modular Adapter Interfaces
```
hardware/
  interfaces/
    RFIDAdapter.ts
    GPSAdapter.ts
    SensorAdapter.ts
    CameraAdapter.ts
  adapters/
    SimulatorAdapter.ts
    PhysicalESP32Adapter.ts
```
The architecture uses dependency injection so real hardware adapters can be plugged in without modifying application business logic.
