# IoT Sensor Platform Architecture

## Overview
The IoT Sensor Platform (`/iot`, `/iot/sensors`, `/iot/sensors/[id]`, `/iot/simulator`) provides industrial telemetry ingestion and automated alert rule evaluation for campus environmental monitoring.

## Supported Sensor Types
- `TEMPERATURE` (e.g. °C / °F)
- `HUMIDITY` (e.g. %)
- `AIR_QUALITY` (e.g. AQI)
- `SMOKE` (NORMAL / DETECTED)
- `DOOR` (CLOSED / UNLOCKED_UNEXPECTED)
- `WATER_LEVEL` (e.g. %)
- `MOTION` (NORMAL / MOTION_DETECTED)

## Telemetry API Ingestion (`POST /api/iot/telemetry`)
Hardware devices send telemetry JSON payloads authenticated using header credentials:
- `X-DEVICE-ID`: Registered sensor hardware identifier (e.g. `TEMP-101`)
- `X-DEVICE-TOKEN`: Secret token matching database `DeviceCredential`

Payload Example:
```json
{
  "deviceId": "TEMP-101",
  "sensorType": "TEMPERATURE",
  "value": 42.5,
  "unit": "°C"
}
```

## Alert Rule Engine
1. **High Temperature**: Value > 38.0°C ➔ Generates `SENSOR_THRESHOLD` High Alert.
2. **Smoke Detection**: Value > 0 or "DETECTED" ➔ Generates `SENSOR_THRESHOLD` CRITICAL Alert.
3. **Unhealthy Air Quality**: AQI > 150 ➔ Generates `SENSOR_THRESHOLD` Alert.
4. **Low Water Level**: Tank level < 15% ➔ Generates Alert.
5. **Unexpected Door Access**: Status "UNLOCKED_UNEXPECTED" ➔ Generates Security Alert.

All readings are stored in `SensorReading`, update `Sensor.latestReading` & `lastHeartbeat`, and emit `sensor:telemetry` Socket.IO events to the Command Center.
