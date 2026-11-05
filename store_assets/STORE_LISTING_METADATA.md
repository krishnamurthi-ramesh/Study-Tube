# StudyTube - Edge Add-ons Store Submission Assets & Text

This folder contains all visual marketing assets and submission copy for publishing **StudyTube** to the Microsoft Edge Add-ons Store.

---

## 1. Visual Assets

| Asset File | Dimensions | Purpose in Partner Center |
| :--- | :--- | :--- |
| `icon300.png` | 300 x 300 px | **Extension logo** (1:1 aspect ratio) |
| `promo_440x280.png` | 440 x 280 px | **Small promotional tile** |
| `screenshot1_1280x800.png` | 1280 x 800 px | **Screenshot 1** (16:10 aspect ratio) |

---

## 2. Store Listing Details (English - United States)

### Description
```text
StudyTube is an intelligent, privacy-first browser extension engineered for students, competitive exam aspirants, and hotspot users who study on limited mobile data caps (1GB - 2GB/day).

StudyTube actively saves up to 82% of YouTube bandwidth while removing visual distractors that break your study flow.

Key Features:
- ⚡ 4 Intelligent Study Modes:
  • Extreme Saver (144p): Saves ~82% bandwidth, perfect for audio podcasts & spoken lectures.
  • Slide Master (240p): Saves ~68% bandwidth, optimized for slide decks & textbook walkthroughs.
  • Smart Balanced (360p): Saves ~52% bandwidth, ideal for whiteboard diagrams & math calculations.
  • Audio Focus: Video disabled for maximum bandwidth savings.
- 🛡️ Triple-Shield Distraction Blocker: Completely hides YouTube comments, replies, and channel avatars to keep you focused.
- 📊 Live Bandwidth Telemetry: Real-time overlay shows estimated megabytes saved and daily quota impact.
- 💬 Community Feedback: Integrated feature suggestion and issue reporting.
- 🔒 100% Client-Side Privacy: Zero user tracking, zero remote servers, zero account sign-in required.
```

### Search Terms (Up to 7 terms)
1. `youtube data saver`
2. `studytube`
3. `save mobile data`
4. `block comments`
5. `lecture study mode`
6. `hotspot data saver`
7. `audio first youtube`

---

## 3. Properties & Links

- **Category**: `Productivity`
- **Website**: `https://github.com/krishnamurthi-ramesh/Study-Tube`
- **Support URL**: `https://github.com/krishnamurthi-ramesh/Study-Tube/issues`
- **Privacy Policy URL**: `https://github.com/krishnamurthi-ramesh/Study-Tube/blob/main/docs/pm/PRIVACY_POLICY.md`

---

## 4. Privacy & Permissions Justifications

- **Single purpose description**:
  ```text
  StudyTube conserves internet bandwidth and removes visual distractions on YouTube for students and hotspot users by dynamically locking video stream resolution (144p-360p) and blocking comments and high-resolution avatars.
  ```

- **storage justification**:
  ```text
  Used strictly locally via chrome.storage.local to persist user preferences (selected study mode, daily data budget target, and comment toggle) and aggregate local bytes saved telemetry. No data is transmitted externally.
  ```

- **activeTab justification**:
  ```text
  Used solely to apply data-saving resolution constraints, display the local bandwidth telemetry overlay, and toggle comment visibility when the user actively interacts with a YouTube tab.
  ```

- **Host permission justification**:
  ```text
  Access to https://www.youtube.com/* is strictly required to monitor the HTML5 video element player state, adjust stream resolution based on the user's selected mode, and suppress distractors on the YouTube interface.
  ```

- **Are you using remote code?**: `No, I am not using remote code`

---

## 5. Notes for Certification (Reviewer Testing Instructions)

```text
StudyTube is an educational browser extension for YouTube.
To test:
1. Install the extension.
2. Open any video on https://www.youtube.com.
3. Click the StudyTube toolbar icon to switch between study modes (144p, 240p, 360p) and toggle comment suppression.
4. Note the live bandwidth saved overlay on the video player. All preferences are stored purely locally via chrome.storage.local with no external server communication.
```
