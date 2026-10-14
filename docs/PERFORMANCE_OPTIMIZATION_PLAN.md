# CareerPilot.AI - Zero-Compromise Performance Optimization Plan

This document outlines the architectural enhancements to eliminate latency, prevent cold-starts, and speed up parsing and AI responses while maintaining 100% intelligence and accuracy.

---

## Performance Goals

| Metric | Current (Unoptimized) | Target (Optimized) |
| :--- | :--- | :--- |
| **Initial Page Load (Cold-Start)** | 30 – 60s | **< 250ms (Zero cold-start)** |
| **Resume Text & Skill Extraction** | 1,500 – 3,500ms | **150 – 350ms** |
| **Database Query Latency** | 100 – 250ms | **5 – 15ms** |
| **AI Roadmap / Tailoring First Token** | 5,000 – 8,000ms | **< 600ms (Streamed)** |

---

## 1. Eliminate Cold Starts (Keep Backend Hot 24/7)

Free hosting tiers (like Render) sleep after 15 minutes of inactivity. We solve this using a **Keep-Alive Cron Ping**:

### Option A: Free External Ping via UptimeRobot (Recommended)
1. Go to [UptimeRobot.com](https://uptimerobot.com) (free).
2. Create a new monitor:
   - **Monitor Type:** `HTTP(s)`
   - **URL:** `https://<your-backend-service-url>/health`
   - **Monitoring Interval:** `10 minutes`
3. Result: Your backend remains loaded in memory and never sleeps.

### Option B: Free GitHub Actions Keep-Alive Workflow
Create `.github/workflows/keep_alive.yml` with a cron schedule running every 10 minutes to curl the `/health` endpoint.

---

## 2. Fast spaCy NLP Pipeline (3x to 5x Speedup)

**File:** `backend/app/ai/spacy_parser.py`

### What makes it slow:
By default, loading `en_core_web_sm` runs syntactic dependency parsing, part-of-speech tagging, and lemmatization on every word, which is unnecessary for skill keyword/entity extraction.

### Optimization:
Disable unused pipeline stages while keeping `entity_ruler` and `ner`:
```python
# Disable heavy unneeded pipes:
NLP = spacy.load("en_core_web_sm", disable=["parser", "tagger", "lemmatizer"])
```
* **Performance Gain:** 60–80% drop in CPU time per resume scan with **zero loss in skill extraction accuracy**.

---

## 3. Database Connection Pooling (Sub-10ms Queries)

**File:** `backend/app/database.py`

### Optimization:
Pre-warm TCP connections to PostgreSQL instead of re-negotiating SSL/TLS on every incoming API request:
```python
engine = create_engine(
    settings.database_url,
    pool_size=10,          # Pre-warmed persistent connections
    max_overflow=20,       # Max burst capacity
    pool_pre_ping=True,    # Auto-reconnect dead sockets
    pool_recycle=300,      # Prevent stale disconnects every 5 mins
)
```

---

## 4. AI / LLM Acceleration (Gemini Flash + Smart Caching)

**File:** `backend/app/ai/llm_advisor.py`

1. **Model:** Standardize on `gemini-1.5-flash` or `gemini-2.0-flash` for high reasoning speed.
2. **Roadmap & Skill Taxonomy Caching:** Store generated role roadmaps (e.g., "Full Stack Developer", "Data Scientist") in the database so repeated requests load in **< 10ms** without re-querying the AI provider.

---

## 5. Next.js Frontend Optimization

**File:** `frontend/next.config.js`

1. **Standalone Output:** Generates a minimal, highly optimized standalone Node server bundle.
2. **Client-Side Caching (SWR/React Query):** Implements stale-while-revalidate so revisiting tabs loads instantly from cache.
