# 🔒 Security Architecture, Threat Model & Compliance Spec — StudyTube
**Document Type**: Engineering Security & Threat Model  
**Product**: StudyTube v1.0 (Manifest V3)  
**Author**: Krishnamurthi  
**Status**: Certified & Audit Ready  

---

## 1. Executive Summary & Security Philosophy

Browser extensions execute within an exceptionally sensitive user environment: they possess elevated privileges, share execution contexts with web applications, and can inspect document structures. 

StudyTube adheres to three foundational security tenets:
1. **Zero-Telemetry Sandbox**: Zero network connections to third-party servers, zero data exfiltration, and zero telemetry storage outside `chrome.storage.local`.
2. **Minimal Scoped Permissions**: Restricts host permissions strictly to `*://*.youtube.com/*` and avoids broad system APIs (no webRequest, no cookies, no identity, no downloads).
3. **Strict YouTube ToS Compliance**: Strictly avoids intercepting, downloading, or re-encoding media streams, and strictly avoids modifying or suppressing advertisements.

---

## 2. STRIDE Threat Analysis & Mitigations

The STRIDE model was applied to evaluate all attack vectors across StudyTube’s Manifest V3 architecture:

| Threat Vector | Attack Scenario | Risk Level | Architectural Mitigation |
| :--- | :--- | :---: | :--- |
| **Spoofing Identity** | A malicious website attempts to impersonate StudyTube or inject rogue quality commands. | Low | Content script communicates with the main world via typed `window.postMessage` listeners validated against `event.source === window` and structured message payloads. |
| **Tampering with Data** | External scripts inject malicious code into local storage or tamper with recorded MB telemetry. | Low | Telemetry is sandboxed within Chrome's isolated `chrome.storage.local` store, which is inaccessible to external webpage scripts or third-party origins. |
| **Repudiation** | Inability to audit or prove how bandwidth numbers are calculated. | Very Low | Telemetry is based on the standardized W3C Resource Timing API (`performance.getEntriesByType('resource')`). The formula is fully open-source and displayed in the UI audit drawer. |
| **Information Disclosure** | Leakage of the user’s YouTube viewing history, video titles, or Google account details. | **Critical** | **Zero Data Footprint**: StudyTube has zero outbound network endpoints (`fetch`, `XMLHttpRequest`, or `navigator.sendBeacon`). No user data ever leaves the local browser process. |
| **Denial of Service** | A YouTube DOM mutation causes an infinite loop in the observer, freezing the browser tab. | Medium | Disconnects heavy MutationObservers; uses passive `PerformanceObserver` and debounced event listeners (<0.5% CPU overhead). |
| **Elevation of Privilege** | An attacker abuses extension scripts to execute arbitrary code outside the sandbox. | **Critical** | **Strict Manifest V3 CSP**: Disallows `eval()`, `new Function()`, and external CDN script loading. All scripts are packaged locally within the signed `.crx` bundle. |

---

## 3. YouTube Terms of Service & Policy Compliance Audit

| YouTube Policy Clause | Policy Statement | StudyTube Compliance Status | Detailed Compliance Audit |
| :--- | :--- | :---: | :--- |
| **Section 2: Permissions and Restrictions** | *"You are not allowed to access, reproduce, download, distribute, transmit, broadcast, display, sell, license, alter, modify or otherwise use any part of the Service..."* | **COMPLIANT** | StudyTube acts strictly as a **client-side rendering and preference tool** (equivalent to a user manually clicking the settings gear icon or using high-contrast styling). It does not alter or re-broadcast streams. |
| **Stream Downloading / Ripping** | Prohibits downloading or extracting audiovisual streams. | **COMPLIANT** | **Zero Extraction**: StudyTube never downloads, rips, or saves video/audio streams to disk. Media is streamed directly through YouTube's native HTML5 video element. |
| **Advertising Integrity** | Prohibits modifying, suppressing, or blocking advertisements. | **COMPLIANT** | **Zero Ad Interference**: StudyTube strictly excludes all ad elements (`.video-ads`, `.ytp-ad-module`, `#player-ads`) from CSS suppression rules. Ads play in their default state. |
| **Chrome Web Store Single Purpose Policy** | Extensions must have a single, transparent purpose. | **COMPLIANT** | Single purpose: *YouTube educational bandwidth conservation and stream telemetry*. |
| **Chrome Web Store Data Disclosure** | Extensions must declare data collection practices. | **COMPLIANT** | Declared: *Does not collect or transmit user data*. Privacy policy publicly available. |

---

## 4. Manifest V3 Security Boundary & CSP

```json
{
  "manifest_version": 3,
  "content_security_policy": {
    "extension_pages": "script-src 'self'; object-src 'self';"
  }
}
```

* **No Remote Code Execution**: All scripts (`service-worker.js`, `content.js`, `injected-quality.js`, `popup.js`) are bundled within the extension package. Loading code from remote CDNs is architecturally forbidden.
* **Isolated World Context**: `content.js` runs in an isolated JS context, protecting extension logic from webpage prototype pollution.
* **Main World Bridge**: Quality adjustment scripts are injected via local `<script>` elements referencing `web_accessible_resources`, strictly avoiding `eval()` or string injection.

