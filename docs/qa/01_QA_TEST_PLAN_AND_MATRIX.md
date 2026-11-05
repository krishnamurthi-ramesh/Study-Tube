# 🧪 QA Master Test Plan & Testing Matrix — StudyTube
**Document Type**: Quality Assurance & Verification Spec  
**Product**: StudyTube v1.0  
**Author**: Krishnamurthi  
**Status**: Ready for Release Certification  

---

## 1. Test Strategy Overview

The testing strategy for StudyTube validates both **functional accuracy** (mode switching, telemetry calculation, UI responsiveness) and **non-functional reliability** (zero memory leaks, strict kill-switch compliance, YouTube single-page navigation resilience).

```
                      [Quality Verification Suite]
                                   │
      ┌────────────────────────────┼────────────────────────────┐
      ▼                            ▼                            ▼
[Functional Testing]     [Compatibility Matrix]       [Non-Functional QA]
• Master Kill-Switch     • Chrome 115+                • Memory Leak Profiling (<15MB)
• Mode Switching         • Brave Browser 1.50+        • Injection Latency (<50ms)
• Zero-Waste DOM Shield  • Microsoft Edge 115+        • Zero-Telemetry Verification
• Live Telemetry Math    • Windows, macOS, Linux      • Network Throttle Resilience
```

---

## 2. Browser & Device Compatibility Matrix

| Operating System | Google Chrome (v115+) | Brave Browser (v1.50+) | Microsoft Edge (v115+) | Test Verdict |
| :--- | :---: | :---: | :---: | :---: |
| **Windows 11 / 10** | ✅ Verified | ✅ Verified | ✅ Verified | **PASS (Production Ready)** |
| **macOS (Sonoma / Ventura)** | ✅ Verified | ✅ Verified | ✅ Verified | **PASS (Production Ready)** |
| **Ubuntu / Debian Linux** | ✅ Verified | ✅ Verified | ✅ Verified | **PASS (Production Ready)** |
| **ChromeOS** | ✅ Verified | N/A | N/A | **PASS (Production Ready)** |

---

## 3. Network Simulation Matrix

To certify that StudyTube operates reliably under adverse network conditions, testing was performed under simulated network throttles via Chrome DevTools Network conditions:

| Network Profile | Download | Upload | RTT Latency | Expected Behavior | Actual Result |
| :--- | :---: | :---: | :---: | :--- | :---: |
| **Fast 4G / Fiber** | 30 Mbps | 15 Mbps | 20 ms | Smooth 720p/480p streaming; zero prefetch waste. | **PASS** |
| **Metered 4G Hotspot** | 4 Mbps | 1 Mbps | 80 ms | No buffering stalls; Board Mode (720p) locks cleanly. | **PASS** |
| **Throttled 3G / Congested**| 750 Kbps | 250 Kbps | 250 ms | Talk Mode (480p) or Audio-First maintains playback without stalling. | **PASS** |
| **Network Disconnection** | 0 Kbps | 0 Kbps | $\infty$ | Preserves accumulated telemetry in local storage; zero console crashes. | **PASS** |

---

## 4. Regression & Release Quality Gates

Before any production zip bundle is released, the build must pass **100% of the following Release Gates**:

1. **Gate 1 (Strict Kill-Switch)**: Turning master toggle OFF must remove all on-screen DOM elements and cease all timer executions within 100ms.
2. **Gate 2 (Zero Unwanted Popups)**: Video ending (`ended` event) must NOT trigger automatic full-screen modal takeovers.
3. **Gate 3 (W3C Math Audit)**: Intercepted byte count must match Chrome DevTools Network Tab `transferSize` within $\pm 2\%$.
4. **Gate 4 (Ad Integrity)**: Pre-roll and mid-roll advertisements must play unhindered without DOM errors.
5. **Gate 5 (Memory Profile)**: 3-hour continuous playlist run must maintain heap memory delta $< 5\text{ MB}$.

