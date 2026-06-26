# Performance Guidelines: Skilltern

This document specifies API caching rules, response size limits, and query optimizations.

## 1. Database Query Optimization
- Avoid queries that trigger full-collection database scans by establishing compound indexes.
- Utilize MongoDB projection filters (`select('name email')`) to avoid fetching large arrays.

## 2. API Caching
- Cache matching engine calculation outcomes in the `match_records` collection.
- Implement pagination limits (`limit=10`) on job board lists to restrict transmission sizes.
