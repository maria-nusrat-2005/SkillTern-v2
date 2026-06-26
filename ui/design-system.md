# Design System Specification: Skilltern

This document captures the color variables, font structures, spacing scales, and UI assets for the Skilltern frontend.

## 1. Visual Aesthetics & Theme (Premium Dark Mode Default)
Skilltern utilizes a modern, elegant dark theme designed around glassmorphism and subtle glow effects to engage student developers.

- **Primary Brand Color:** HSL Green (`hsl(142.1, 70.6%, 45.3%)`) - Denotes match status, positive success elements, and CTA triggers.
- **Secondary Accent:** Violet (`hsl(262.1, 83.3%, 57.8%)`) - Used for recruiter dashboards and learning recommendations.
- **Backgrounds:** Slate / Gray tones:
  - Dark Primary: `hsl(224, 71.4%, 4.1%)`
  - Dark Card/Surface: `hsl(224, 71.4%, 7.1%)` with optional `backdrop-filter: blur(8px)`.
- **Text Scale:**
  - Foreground Main: `hsl(210, 20%, 98%)`
  - Muted Foreground: `hsl(215.4, 16.3%, 56.9%)`

---

## 2. Shared Classes & Component Styling
- **Card Panel Styles:**
  - `bg-slate-900 border border-slate-800 rounded-xl shadow-lg transition-all duration-300 hover:border-emerald-500/50`
- **Interactive Match Progress Indicator:**
  - Clean SVG circle outline showing stroke dashoffset transitions mapped to match score percentage.
