# AeroJet Operations Guide

This document outlines the manual and automated operational procedures for the AeroJet team.

## Operational Pipeline

1. **Lead Qualification**: `Inquiry` received -> Scored by AI -> Assigned to Broker.
2. **Quoting**: Broker sends `Quote` -> Client accepts.
3. **Booking**: Client pays deposit -> `Booking` created -> `OperationalTask` list auto-generated.
4. **Ops Execution**: Team/AI completes tasks (Catering, FBO, Documents).
5. **Flight Day**: All tasks marked `COMPLETED` -> Flight Departs.

## Task Management

Tasks are visible in the `/dashboard/operations` dashboard.
- **Urgent (P0)**: Requires immediate action (usually < 24h to departure).
- **High (P1)**: Must be completed within 4-8 hours of booking.
- **Normal (P2)**: Standard logistics.

## Dashboard Features
- **Booking Overview**: Real-time status of all flights.
- **Task Kanban**: Drag-and-drop task management.
- **AI Alerts**: Proactive notifications for missing documents or catering delays.

## Contact
- **Operations Support**: ops@aerojet.app
- **AI System Admin**: tech@aerojet.app
