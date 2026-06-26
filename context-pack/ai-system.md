# AI-Native Engine & Recommendations: Skilltern

This document describes the design of the matching formula, the gap analysis parser, and the long-term AI-native roadmap.

## 1. Smart Matching Engine Formula (Current MVP)

To minimize latency and support serverless database execution, matching logic runs asynchronously or on-demand on standard controller requests:

$$\text{Match Score} = (\text{Skill Match} \times 0.50) + (\text{Interest Match} \times 0.30) + (\text{Experience Match} \times 0.20)$$

- **Skill Match (50%):**
  $$\text{Score} = \frac{|\text{Student Skills} \cap \text{Internship Required Skills}|}{|\text{Internship Required Skills}|} \times 100$$
- **Interest Match (30%):**
  $$\text{Score} = \frac{|\text{Student Interests} \cap \text{Internship Category/Role Tags}|}{|\text{Internship Category/Role Tags}|} \times 100$$
- **Experience Match (20%):**
  - Score calculated by comparing technology strings inside student projects/work experiences against required skills.
  - Matches receive full points, partial description keyword matches receive fractional points.

---

## 2. Skill Gap Analysis Algorithm
When a student views an internship, the system performs a difference set comparison:

$$\text{Missing Skills} = \text{Internship Required Skills} \setminus \text{Student Skills}$$

For each missing skill, the system queries the `Categories` database or a static mapping file to recommend resources:
- E.g. Missing `Docker` ➔ Suggests "Learn Docker containers on YouTube" or "Complete Docker path on Coursera".
- Calculates potential score improvement:
  $$\text{Potential Improvement} = \frac{1}{|\text{Internship Required Skills}|} \times 0.50 \times 100$$

---

## 3. Future AI Roadmap (Phase 4)
As data grows, we transition from rule-based calculations to semantic machine learning models:
1. **Resume Parsing Pipeline:**
   - User uploads CV ➔ Server sends PDF stream to OpenAI/Claude API or a local NLP model ➔ Extracts name, university, skills list, and past experiences ➔ Auto-populates forms.
2. **Vector Embedding Search:**
   - Convert student profile text and internship descriptions into 1536-dimension embeddings using OpenAI `text-embedding-3-small`.
   - Store vectors in MongoDB Atlas Vector Search index.
   - Run cosine-similarity queries to return relevant postings.
3. **AI Mock Interviewer:**
   - Provide interactive chat interface using GPT-4o configured with internship details to run dynamic system mock interviews.
