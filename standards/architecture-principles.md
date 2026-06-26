# Architecture Principles: Skilltern

This document specifies the structural boundaries, separation of concerns, and data flows.

## 1. Directory Structure
All code additions must respect the defined boundaries:
- `/server`: Core Express backend.
  - `/routes`: Endpoint maps.
  - `/controllers`: HTTP handling.
  - `/services`: Core business logic.
  - `/models`: Database schemas.
- `/client`: Core React client.
  - `/src/pages`: Main page components.
  - `/src/layouts`: Dashboard and Auth shells.
  - `/src/hooks`: Custom hooks and Zustand stores.

## 2. Separation Rules
- **Thin Controllers:** Controllers must limit logic to parameter parsing and HTTP status codes, routing heavy processes to the Services layer.
- **Independent Services:** Services must not contain Express `req` or `res` object references, facilitating independent unit testing.
