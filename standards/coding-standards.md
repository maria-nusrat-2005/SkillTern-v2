# Coding Standards: Skilltern

This document specifies the style guidelines and formatting rules for JavaScript code across the Skilltern project.

## General JavaScript Rules
- **Naming Conventions:**
  - Variables and functions: CamelCase (`const studentProfile = {}`).
  - Classes and models: PascalCase (`class MatchingService {}`).
  - Database collection schemas: camelCase / plural nouns.
  - Environment variables: UPPERCASE with underscores (`MONGO_URI`).
- **Formatting:**
  - Use 2 spaces for indentation.
  - Enforce semicolons at the end of statements.
  - Use single quotes for strings unless template literals are required.

## React Code Structure
- Components must be declared as functional components using arrow syntax.
- Group import declarations:
  1. React hooks and core libraries.
  2. Reusable UI components.
  3. Custom hooks.
  4. Styles and constants.
