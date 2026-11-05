# 👥 User Research, Personas & JTBD Synthesis — StudyTube
**Document Type**: Product Management Discovery & Synthesis  
**Product**: StudyTube (Global Bandwidth Optimization Engine)  
**Author**: Krishnamurthi  
**Status**: Approved & Baselined for v1.0  

---

## 1. Executive Summary & Research Methodology

To design StudyTube as a globally viable product rather than a localized academic experiment, user discovery was conducted across **two distinct research cohorts**:
1. **Primary Research (Emerging Market Higher-Ed)**: In-depth interviews with 8 STEM college students and field trials with 15 active learners studying via YouTube on metered 4G/5G mobile hotspots in India.
2. **Secondary Research & Adjacent User Discovery**: Analysis of user behavior in commercial public venues (gyms, salons, cafes in Chennai and Bengaluru running continuous desktop background music over dongles) and global bandwidth discussions on developer forums (`r/digitalnomad`, `r/Starlink`, `r/learnprogramming`).

---

## 2. Core Pain Point Taxonomy: The Two Traps

Across all user cohorts, current video streaming technology forces users into one of two systemic traps:

```
                          [The User's Dilemma]
                                    │
           ┌────────────────────────┴────────────────────────┐
           ▼                                                 ▼
[The Over-Consumption Trap]                        [The Degradation Trap]
• YouTube Auto forces 1080p/4K                     • Native Data Saver forces 144p/240p
• Silent prefetch downloads 250MB+                 • Formulas & text become blurry
  of unrequested recommendation thumbnails         • Code syntax is impossible to read
• Burns 1.5GB daily plan in 40 minutes             • Student suffers cognitive fatigue
• Result: Daily Quota Exhaustion                   • Result: Lecture Abandonment
```

---

## 3. Detailed Global User Personas

### Persona 1: Arjun — The Tier-2 STEM College Student
* **Demographics**: 21 years old, 3rd year B.Tech Computer Science, IIITDM Kurnool.
* **Environment**: College hostel with congested evening Wi-Fi; tethers his laptop to his phone hotspot.
* **Plan & Hardware**: 1.5GB/day Jio prepaid plan (₹239/month), budget Windows laptop.
* **Behavior**: Watches 2–3 hours of NPTEL, Gate Smashers, and Chai aur Code lectures daily between 8:00 PM and 11:30 PM.
* **Critical Moment of Pain**:
  > *"I was watching a 90-minute lecture on Graph Algorithms. 40 minutes in, my internet cut out. Jio sent an SMS saying 100% of my daily 1.5GB was consumed. I couldn't submit my assignment, and my phone had zero data for UPI or WhatsApp until midnight."*
* **What Arjun Needs**: Sharp 720p resolution so he can read small code and terminal output, with all recommendation prefetching blocked so his 1.5GB lasts the entire night.

---

### Persona 2: Elena — The Digital Nomad & Remote Engineer
* **Demographics**: 28 years old, freelance frontend engineer, currently working across Lisbon and Berlin.
* **Environment**: Trains, cafes, airport lounges, and short-term Airbnbs.
* **Plan & Hardware**: 5GB international travel eSIM (Airalo @ $18/GB), MacBook Air on Brave Browser.
* **Behavior**: Follows technical system design deep dives, Google I/O recorded sessions, and React architecture workshops.
* **Critical Moment of Pain**:
  > *"When tethered to my travel eSIM on a 3-hour train ride, YouTube automatically streamed two technical talks at 1080p 60fps. That burned through 3GB of my $25 eSIM before I even reached my destination."*
* **What Elena Needs**: Predictable, locked 480p/720p streams with verifiable megabyte tracking, ensuring travel data is strictly conserved.

---

### Persona 3: Vikram — The Commercial Gym Manager
* **Demographics**: 34 years old, manager at a high-intensity fitness club in Chennai.
* **Environment**: Desktop PC at the front desk connected to an amplifier and 6 gym speakers.
* **Plan & Hardware**: 4G commercial dongle (3GB/day), Brave browser running continuous YouTube workout playlists.
* **Behavior**: Streams 10 to 12 hours of uninterrupted phonk, EDM, and workout music mixes daily.
* **Critical Moment of Pain**:
  > *"Around 3:00 PM every day, our music would buffer and die. Worse, our digital UPI soundbox and QR billing machine stopped working because the dongle SIM ran out of data. We were streaming 1080p music videos that nobody was even looking at."*
* **What Vikram Needs**: An "Audio-First" toggle that strips out video rendering, saving 85% data so music plays all day while payment terminals stay online 100% of the time.

---

### Persona 4: Mateo — The Rural Satellite Internet Learner
* **Demographics**: 19 years old, aspiring self-taught developer in Minas Gerais, Brazil.
* **Environment**: Rural home connected via satellite broadband with peak-hour fair-use limits.
* **Plan & Hardware**: Satellite connection with 50GB monthly priority data; heavy throttling during peak evening hours (6 PM – 11 PM).
* **Behavior**: Studying Python and Web Development tutorials on YouTube.
* **Critical Moment of Pain**:
  > *"If someone in my family streams a video during peak hours, our speed drops to 1 Mbps and my coding videos buffer every 20 seconds."*
* **What Mateo Needs**: A "Zero-Waste Shield" that eliminates heavy recommendation feeds and pre-buffered chunks, allowing smooth playback on low-bandwidth streams.

---

## 4. Jobs-to-Be-Done (JTBD) Framework

| Job Component | Arjun (Student) | Vikram (Gym Manager) | Elena (Digital Nomad) |
| :--- | :--- | :--- | :--- |
| **Core Job** | Master complex engineering concepts on YouTube. | Provide high-energy background audio for gym members. | Upskill on software architecture during travel. |
| **Trigger** | Exam preparation or coding assignment deadline. | Opening the gym at 6:00 AM. | Long train journey on metered travel eSIM. |
| **Constraints** | 1.5GB daily hotspot cap; text must remain legible. | 3GB dongle shared with payment soundbox; zero visual need. | Expensive eSIM per-gigabyte costs; variable latency. |
| **Emotional Job** | Confidence that daily connectivity won't be cut off. | Peace of mind that billing operations won't fail during rush hour. | Freedom to work and learn anywhere without bill shock. |
| **Success Metric** | 65%+ data saved; zero blur in whiteboard/IDE text. | 85%+ data saved; 10+ hours continuous playback. | Verifiable receipt of exact megabytes streamed. |

---

## 5. Key Research Insights Applied to StudyTube Architecture

1. **Insight 1: Resolution isn't the primary enemy — background waste is.**
   - User interviews confirmed that students don't mind spending 150MB on an important 30-minute lecture. What enrages them is YouTube spending an additional 300MB on sidebar recommendations, hover previews, and Shorts pre-streaming that they never watch.
   - *Design Response*: StudyTube built the **Zero-Waste Shield** as a foundational layer.

2. **Insight 2: Text readability is a binary threshold.**
   - Below 480p (at 144p or 240p), math exponents, variable names, and semicolons turn into mush. Students reported that unreadable text causes immediate cognitive fatigue.
   - *Design Response*: StudyTube instituted the **"Readability Floor"**: 480p for spoken talks, 720p HD for whiteboards and code. Sub-360p is strictly rejected for video viewing.

3. **Insight 3: Users want verifiable proof, not claims.**
   - Bandwidth savers that don't show real numbers are viewed with suspicion.
   - *Design Response*: Integrated **W3C Resource Timing Telemetry** with 1-click shareable receipts.

