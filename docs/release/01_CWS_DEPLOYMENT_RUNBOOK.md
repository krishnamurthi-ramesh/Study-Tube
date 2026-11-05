# 🚀 Chrome Web Store & Brave Deployment Runbook — StudyTube
**Document Type**: Release Engineering Standard Operating Procedure (SOP)  
**Product**: StudyTube v1.0  
**Author**: Krishnamurthi  
**Target Stores**: Chrome Web Store (CWS) & Brave Browser Web Store  

---

## 1. Pre-Submission Package Verification Checklist

Before uploading `studytube-v1.0.0.zip` to the Google Chrome Web Store Developer Dashboard, verify that the package satisfies every item:

* [x] **Manifest V3 Specification**: `manifest_version: 3` declared; service worker configured under `background.service_worker`.
* [x] **Zero Unnecessary Permissions**: Only `storage` and `activeTab` requested. Broad permissions (`webRequest`, `cookies`, `<all_urls>`) strictly excluded.
* [x] **Strict Host Permissions**: Scoped strictly to `*://*.youtube.com/*`.
* [x] **Asset Bundling**: Icons present in 16x16, 48x48, and 128x128 PNG formats.
* [x] **No External Script Injections**: All scripts packaged locally; zero external CDN `<script>` references.
* [x] **No File System Bloat**: Package stripped of `.git`, `.DS_Store`, markdown docs, test CSVs, and temporary files.

---

## 2. Chrome Web Store Submission Steps

### Step 1: Access Developer Console
1. Navigate to the **Chrome Web Store Developer Dashboard**: [chrome.google.com/webstore/devconsole](https://chrome.google.com/webstore/devconsole).
2. Sign in with the primary developer Google account.

### Step 2: Upload Package
1. Click **Add new item**.
2. Select the verified distribution zip archive:
   ```
   E:\StudyTube\dist\studytube-v1.0.0.zip
   ```
3. Await automated Manifest schema validation.

### Step 3: Populate Store Listing Details
1. **Title**: `StudyTube: Global Data Saver & Stream Intelligence`
2. **Short Description** (132 chars):
   `Save 50-85% bandwidth on YouTube. Block hidden prefetch waste, lock crisp 720p/480p quality, and track verifiable stream telemetry.`
3. **Detailed Description**: Copy exact content from:
   [`docs/release/02_STORE_LISTING_METADATA.md`](file:///e:/The%20Hinglish%20gap%20Test/docs/release/02_STORE_LISTING_METADATA.md).
4. **Category**: `Productivity` (Secondary: `Education & Tools`).
5. **Language**: `English (United States)` / `English (Global)`.

### Step 4: Privacy & Permissions Justification Form
Under the **Privacy** tab of the CWS dashboard, answer the required compliance questions:

* **Single Purpose Description**:  
  *"StudyTube optimizes YouTube video lecture streaming for students and remote workers on metered bandwidth by blocking unrequested background thumbnail prefetching and providing context-aware playback resolution locking."*
* **Permission Justifications**:
  - `storage`: *"Required solely to store user mode preferences and cumulative local megabytes saved on the device. Data never leaves the browser."*
  - `activeTab`: *"Used to send quality adjustment signals to the active YouTube player tab when the user clicks mode buttons in the extension popup."*
  - `*://*.youtube.com/*`: *"Required to inject the client-side stylesheet that suppresses sidebar recommendations and to monitor the W3C PerformanceObserver for media stream bytes."*
* **Data Usage Declarations**:
  - Select: *"I certify that this extension does NOT collect, store, transmit, or sell any user personal information, cookies, browsing history, or identifiers."*

---

## 3. Official Reviewer Notes Script (For Google CWS Review Team)

Paste the following message in the **Reviewer Guidance / Notes to Reviewer** text area:

> *"Hello Chrome Web Store Review Team,
> 
> StudyTube is an open-source educational bandwidth conservation extension built for students and remote workers on metered mobile hotspots and travel eSIMs.
> 
> • Single Purpose: Optimizing YouTube playback bandwidth by blocking background thumbnail prefetching and locking legible resolutions (720p/480p).
> • Security & Privacy: 100% client-side execution. Zero third-party analytics, zero tracking beacons, zero PII collection. All data is kept locally in chrome.storage.local.
> • YouTube Policy: Does NOT download, rip, or intercept video/audio streams. Does NOT modify or block YouTube advertisements.
> • Instructions for Testing: Open any YouTube video (e.g. an NPTEL or MIT lecture), click the StudyTube icon in the toolbar, and observe that switching modes (Talk 480p, Board 720p, Audio-First) updates playback cleanly.
> 
> Source code and comprehensive documentation are open-source and auditable. Thank you for your review!"*

---

## 4. Rollback & Hotfix Standard Operating Procedure (SOP)

If YouTube modifies internal HTML5 player selectors or DOM structures in a manner that degrades StudyTube:

1. **Hotfix Branch**: Create branch `hotfix/v1.0.1` immediately.
2. **Update Selector**: Update class bindings in `content/studytube.css` or `content/injected-quality.js`.
3. **Automated Package Build**: Run `python dist/package_build.py` to bump version to `1.0.1` and produce fresh zip.
4. **CWS Expedited Submission**: Submit updated `.zip` to CWS Developer Dashboard with release notes highlighting selector maintenance.

