# Testing Guidelines: Skilltern

This document specifies the testing scopes, test coverage metrics, and framework setups.

## 1. Testing Stack
- **Backend:** Jest & Supertest for controller endpoint integrations.
- **Frontend:** React Testing Library for verifying key component mounting.

## 2. Testing Norms
- Implement unit tests for complex service layers (e.g. matching algorithms).
- Mock database layers during service unit testing to avoid cluster traffic.
- Maintain overall code coverage above 80% on core controllers.
