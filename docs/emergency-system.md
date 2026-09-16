# Emergency & Safety System Architecture (SOS)

## Overview
The Emergency & Safety System (`/emergency`, `/incidents`, `/sos`) provides instant 1-tap SOS panic triggering for drivers and authorized staff, emergency incident lifecycle tracking (`OPEN` ➔ `ACKNOWLEDGED` ➔ `IN_PROGRESS` ➔ `RESOLVED`), and complete audit trail event logging.

## Emergency Incident Categories
- `BUS_EMERGENCY`: Fleet vehicle breakdown, collision, or driver distress.
- `STUDENT_EMERGENCY`: Missing student alert, classroom medical emergency.
- `FIRE`: Fire or smoke alarm trigger.
- `MEDICAL_EMERGENCY`: First aid / ambulance dispatch requirement.
- `SECURITY_INCIDENT`: Campus intrusion or perimeter breach.
- `UNAUTHORIZED_ACCESS`: Restricted building door force.
- `IOT_SAFETY_ALERT`: Critical sensor threshold breach.

## SOS Trigger Flow (`POST /api/emergency/sos`)
```
Driver / User 1-Tap SOS Button (/sos)
       ↓
POST /api/emergency/sos
       ↓
Backend creates EmergencyIncident (Severity: CRITICAL)
       ↓
Initial IncidentEvent created (SOS_TRIGGERED)
       ↓
High Severity System Alert generated
       ↓
Socket.IO Broadcast (`emergency:sos` & `alert:new`)
       ↓
Smart Campus Command Center Operations Control Room
```

## Lifecycle Management
Operators can acknowledge incidents (`ACKNOWLEDGED`), assign response teams (e.g. `Medical Response Unit Alpha`), update progress notes (`IN_PROGRESS`), and mark resolved (`RESOLVED`), preserving a immutable event history log (`IncidentEvent`).
