# Database Guidelines: Skilltern

This document specifies the MongoDB schema design principles, transaction scopes, and indexing rules.

## 1. Schema Design
- **NoSQL Flexibility vs Type Safety:** Enforce Mongoose validation schemas with defined property types, required checks, and string trims.
- **Reference Management:** Use `mongoose.Schema.Types.ObjectId` with `ref` keys to enable population queries.

## 2. Integrity & Hook Hooks
- Implement Mongoose pre-save middleware hooks to automatically hash user passwords.
- Implement cascading delete logic within pre-remove hooks to prevent orphaned documents.
- Always configure indexes (single-field and compound indexes) for fields that appear regularly inside queries.
