# Keep-Alive & Cold-Start Mitigation Guide

This guide details how to keep your backend instance hot and eliminate the 30–60 second cold-start latency on free cloud tiers (such as Render).

---

## ⚠️ Conscious Tradeoff Note
* Pinging your service every 10 minutes (24/7) keeps the container active continuously.
* On Render's free tier, this will consume your monthly free instance hour allowance (~750 hours/month per account).
* This is a deliberate design choice to guarantee instant (<200ms) user experience rather than making visitors wait through 30–60s spin-ups.

---

## 1. Primary Strategy: Free Uptime Monitor (UptimeRobot / BetterStack)

**UptimeRobot** is the most reliable free external pinger with accurate scheduling:

1. Create a free account at [uptimerobot.com](https://uptimerobot.com).
2. Click **+ Add New Monitor**.
3. Configure the monitor:
   * **Monitor Type:** `HTTP(s)`
   * **Friendly Name:** `CareerPilot Backend Health`
   * **URL (or IP):** `https://<your-render-service-name>.onrender.com/health`
   * **Monitoring Interval:** `10 minutes` (or `5 minutes`)
   * **Timeout:** `30 seconds`
4. Click **Create Monitor**.

---

## 2. Backup Strategy: GitHub Actions Scheduled Cron

GitHub Actions can be used as a secondary/backup pinger. 

> [!NOTE]
> GitHub does not guarantee exact cron execution timing during peak load periods (delays of 5–15 minutes can occur), so this serves as a backup to UptimeRobot.

To enable GitHub Actions backup pinging, create `.github/workflows/keep_alive.yml`:

```yaml
name: Backend Keep-Alive

on:
  schedule:
    # Runs every 10 minutes
    - cron: '*/10 * * * *'
  workflow_dispatch:

jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Ping Backend Health Endpoint
        run: |
          curl -s -f --max-time 15 "https://${{ secrets.BACKEND_HOST_URL }}/health" || echo "Ping failed or backend starting up"
```

---

## 3. `/health` Endpoint Specifications

The `/health` endpoint in `backend/app/main.py` is configured with the following characteristics:
* **Route:** `GET /health`
* **Authentication:** None (Public)
* **Rate Limiting:** Exempt (Safe for continuous automated pings)
* **Response Payload:** `{"status": "ok", "db": true}`
* **Security:** No internal stack traces, environment variables, or version numbers are leaked.
