# 📈 Product Metrics & Analytics Specification — StudyTube
**Document Type**: Product Management Metrics & Instrumentation Spec  
**Product**: StudyTube v1.0  
**Author**: Krishnamurthi  
**Status**: Approved & Baselined  

---

## 1. Product Metrics Framework & Hierarchy

StudyTube follows a **Google-standard Metrics Hierarchy**, separating the top-level North Star metric from supporting input drivers and quality guardrails:

```
                            [North Star Metric]
                Average Daily Bandwidth Conserved (MB / User / Day)
                                     │
           ┌─────────────────────────┼─────────────────────────┐
           ▼                         ▼                         ▼
   [Adoption & Reach]       [Engagement & Habit]       [Quality Guardrails]
   • Weekly Active Users    • Session Completion Rate  • Text Legibility Score
   • Chrome Store Installs  • Receipt Sharing Ratio    • Page Load Latency
   • Referral Coefficient   • Mode Alignment Accuracy  • User Crash/Error Rate
```

---

## 2. Metric Definitions & Targets

### 2.1 The North Star Metric
* **Metric**: **Average Daily Bandwidth Conserved (MB/user/day)**.
* **Why this metric**: It directly reflects the core value delivered to users. Whether a user is an Indian student on a 1.5GB plan or a digital nomad on a travel eSIM, conserving megabytes without sacrificing learning is the exact reason StudyTube exists.
* **Target (v1.0)**: **≥ 350 MB conserved per active study day**.
* **Measurement Mechanism**: Measured locally via the browser's `PerformanceObserver` API by calculating the differential between uncompressed DASH 1080p baseline streams and actual wire transfer.

---

### 2.2 Supporting Input Metrics

| Metric Name | Calculation | Target | Purpose |
| :--- | :--- | :---: | :--- |
| **Mode Alignment Rate** | % of sessions where the user accepts or matches the Glass-Box AI recommended mode | **> 60%** | Measures accuracy and user trust in content classification. |
| **Zero-Waste Shield Uptime** | % of sessions with Zero-Waste Shield active | **> 85%** | Verifies adoption of background prefetch suppression. |
| **Shareable Receipt Generation** | Total "Copy Savings Receipt" clicks / Total Completed Sessions | **> 12%** | Measures viral advocacy and word-of-mouth distribution loop. |
| **Dormancy Adherence** | Inactive sessions reporting 0 CPU/DOM mutations when master switch is OFF | **100%** | Strict user trust guardrail: ensures zero background drain when paused. |

---

### 2.3 Counter & Guardrail Metrics (Do No Harm)

To ensure that aggressive bandwidth saving does not compromise educational outcomes or platform stability, the following guardrails are enforced:

1. **Text & Diagram Legibility Guardrail**:
   - *Target*: **≥ 90% comprehension retention** on STEM lecture tests (validated via 15-student field benchmark).
   - *Failure Trigger*: If comprehension falls below 80%, 480p is disabled for whiteboard categories, forcing 720p HD as the floor.
2. **Page Injection Latency Guardrail**:
   - *Target*: Total execution latency for `content.js` and `injected-quality.js` must remain **< 50 milliseconds**.
   - *Measurement*: Monitored via `performance.now()` instrumentation during DOM content loaded.
3. **Memory Footprint Ceiling**:
   - *Target*: Total memory overhead of the extension must not exceed **15 MB RAM** per tab.
4. **Crash & Uncaught Error Ceiling**:
   - *Target*: **< 0.05%** uncaught exceptions per 1,000 video sessions.

---

## 3. Privacy-Preserving Telemetry Event Dictionary

> [!IMPORTANT]
> **Zero-Telemetry Principle**: All telemetry events below are processed **100% locally on the client's device sandbox** (`chrome.storage.local`). StudyTube never transmits any identifier, URL, or usage data to any remote server or analytics service.

| Event Name | Trigger | Local Payload Attributes | Purpose |
| :--- | :--- | :--- | :--- |
| `SESSION_START` | Video initiates playback (`video.onplay`) | `timestamp`, `initial_mode`, `is_waste_blocked` | Initialize session stopwatch and byte counter. |
| `BYTE_CHUNK_MEASURED` | Resource entry received from `googlevideo.com` | `transfer_size_bytes`, `duration_ms` | Accumulate real wire transfer size. |
| `RECOMMENDATION_TRIGGERED`| Content classifier heuristic finishes | `detected_category`, `recommended_mode` | Evaluate heuristic classification accuracy. |
| `MODE_APPLIED` | User clicks mode button or applies advice | `previous_mode`, `new_mode`, `source` (manual/advice) | Measure user intent and preference distribution. |
| `SESSION_COMPLETED` | Video ends or tab closes (`beforeunload`) | `watch_seconds`, `consumed_mb`, `saved_mb`, `pct_saved` | Record final session receipt in local history. |
| `RECEIPT_COPIED` | User clicks "Copy Savings Receipt" | `timestamp`, `saved_mb` | Track viral sharing intent. |
| `MASTER_TOGGLE_CHANGED` | User flips master switch ON/OFF | `new_state` (`enabled`/`disabled`) | Ensure strict compliance with user dormancy commands. |

---

## 4. Experimentation & Evaluation Framework

When evaluating new heuristic rules or UI changes (e.g., introducing a new "Lab Code" 1080p peak preset), the following evaluation framework is applied:

```
[Proposed Feature / Rule] 
             │
             ▼
[Local Instrumentation Test (N=30 sessions)]
             │
             ├─► Did Bandwidth Conserved increase by ≥ 10%?
             ├─► Did Video Legibility Score stay ≥ 90%?
             └─► Did Injection Latency stay < 50ms?
             │
             ▼
[Promoted to Production v1.x Release]
```

