# AI System Architecture & Predictive Analytics

## Overview
The Smart Campus platform features three AI capabilities:
1. **AI Operations Assistant**: Natural language query engine powered by Google Gemini API with database ground truth context fallback.
2. **AI Video Analytics**: Automated video detection event processing.
3. **AI Predictive Analytics**: Predictive fleet maintenance and environmental anomaly risk assessment.

## AI Control Principles
- **Database Ground Truth Isolation**: AI models never directly modify critical database records. All operational records (Attendance, Incidents, Alerts) remain authoritative in Prisma DB.
- **Recommendations Only**: AI provides summaries, risk scores, anomaly explanations, and suggested operational actions.
- **Prediction Ground Truth Safeguard**: If there is insufficient historical data (e.g. less than 30 days of baseline sensor/fleet telemetry), the AI engine explicitly reports:
  > *"Insufficient historical data for reliable prediction."*

## Endpoints
- `GET /api/ai/reports`: Generates structured executive operations report.
- `POST /api/ai/query`: Conversational AI query endpoint for natural language operational Q&A.
