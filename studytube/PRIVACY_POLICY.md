# Privacy Policy for StudyTube Chrome Extension

**Last Updated: November 2, 2026**

StudyTube ("we", "our", or "the extension") is an open-source productivity and bandwidth conservation extension designed for students studying via video lectures on YouTube. 

We take your privacy seriously. StudyTube is built with a **zero-telemetry, client-side only** architecture.

---

### 1. What Data We Collect
**StudyTube does NOT collect, store, transmit, or sell any personal information or identifiable data.**

Specifically:
- **No Personal Data**: We do not collect your name, email, Google account info, browsing history, IP address, or passwords.
- **No Video Interception or Audio Ripping**: We never download, rip, or transmit video or audio files from YouTube.
- **No Ad Blocking**: StudyTube does not modify or interfere with YouTube advertisements.

### 2. Local Storage Usage
StudyTube utilizes Chrome's local storage API (`chrome.storage.local`) exclusively on your device to remember your playback preferences:
- `mode`: Selected lecture preference (e.g., Talk Mode, Board Mode, Code Mode).
- `blockWaste`: Boolean flag indicating whether background recommendation thumbnail loading is hidden.
- `pauseInBackground`: Boolean flag to pause video streaming when the YouTube tab is minimized.
- `totalSavedMb` & `totalConsumedMb`: Cumulative MB metrics tracked locally via the browser's native `PerformanceObserver` API to show your data conservation in the extension popup.

**This data never leaves your computer.** It is stored strictly within your browser's local sandbox and is deleted when the extension is uninstalled.

### 3. Permissions Justification
- `storage`: Required solely to persist user mode choices and cumulative local MB savings on your device.
- `activeTab`: Used to communicate with the active YouTube video tab to apply the selected playback mode.
- Host permissions (`*://*.youtube.com/*`): Required to adjust local DOM styling (hiding sidebar recommendation thumbnails) and communicating with the YouTube HTML5 player to lock resolution.

### 4. Third-Party Services
StudyTube connects to **zero third-party servers, analytics APIs, or advertising tracking networks**.

### 5. Contact & Open Source
StudyTube is maintained as an educational product study. For questions or inspection of the client-side code, visit the repository or contact kiccha1703@gmail.com.

