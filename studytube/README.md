# 🎓 StudyTube — Smart Data Saver for YouTube Video Lectures

StudyTube is a Manifest V3 Chrome Extension engineered for Indian students on metered 4G/5G mobile data plans or congested hostel Wi-Fi. 

Instead of aggressively degrading video quality to unreadable levels (144p/240p), StudyTube **eliminates the hidden background data waste** (recommendation thumbnail prefetching, autoplay buffers, Shorts preloads, hover previews) while locking in crisp, readable resolutions (**480p** for spoken lectures, **720p HD** for whiteboards, math formulas, and code editors).

---

## 🚀 Key Features

1. **Context-Aware Lecture Modes**:
   - 🗣️ **Talk Mode (480p)**: Conserves ~65% data while keeping faces and slide outlines clear.
   - 📐 **Board Mode (720p)**: Conserves ~45% data while rendering handwritten math, diagrams, and whiteboards sharp.
   - 💻 **Code Mode (720p/1080p)**: Crisp character rendering for programming syntax and terminal sessions.
   - 🎧 **Audio-First Mode**: Hides video rendering, conserving ~85% bandwidth for commute listening and audio recaps.

2. **Zero-Waste Shield**:
   - Blocks background prefetching of sidebar recommendation thumbnails.
   - Prevents auto-buffering of the next video.
   - Suppresses hover previews and background Shorts chunk streaming.

3. **Live In-Page Data Telemetry**:
   - Uses the browser's native `PerformanceObserver` API to track actual bytes transferred across `googlevideo.com` streams.
   - Real-time floating badge displaying MB consumed vs. MB conserved.

4. **Background Tab Auto-Pause**:
   - Halts active streaming when the YouTube tab is switched away or minimized, preventing silent background drain.

---

## 🛠️ Installation & Testing Instructions

1. Open Google Chrome on your computer.
2. Navigate to `chrome://extensions/` in the URL bar.
3. Enable **Developer mode** via the toggle switch in the top-right corner.
4. Click **Load unpacked** in the top-left corner.
5. Select the folder:
   ```
   E:\StudyTube\studytube
   ```
6. The StudyTube icon will appear in your Chrome toolbar. Pin it!
7. Open any YouTube lecture (e.g., an NPTEL lecture, coding tutorial, or Khan Academy video) and observe the in-page data counter and clean distraction-free study environment.

---

## 🧪 Benchmark & Experiment Setup (Empirical Telemetry)

- **Baseline Test**: Play a 10-minute lecture on default YouTube (Auto quality) connected via phone hotspot. Measure data transferred via Chrome DevTools Network Tab.
- **StudyTube Test**: Play the same lecture in Board Mode (720p) with Waste Shield enabled.
- **Audio-First Test**: Play the lecture with Audio-First mode toggled.
- **Report Metrics**: Record MB transferred, buffer time, and student comprehension scores.

