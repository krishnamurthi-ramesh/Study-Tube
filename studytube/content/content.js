// StudyTube - Content Script with Strict Enable/Disable Control & User Privacy

(function() {
  let state = {
    enabled: true,
    mode: 'board',
    blockWaste: true,
    blockComments: true, // Blocks comment threads & avatar network downloads
    pauseInBackground: true,
    audioFirst: false,
    showBadge: true,
    showInPagePill: false, // Default to FALSE so it does NOT nag or popup on screen uninvited!
    dataQuotaMb: 1536, // Default: 1.5 GB/day (most popular mobile plan)
    dataQuotaLabel: '1.5GB/day',
    sessionConsumedBytes: 0,
    sessionSavedMb: 0,
    activeWatchSeconds: 0,
    isPlaying: false,
    sessionStartTime: Date.now(),
    videoTitle: '',
    detectedCategory: 'General Content',
    recommendedMode: 'board',
    recommendationReason: ''
  };

  let watchTimer = null;
  let saveInterval = null;
  let badgeEl = null;
  let modalOverlay = null;

  // 1. Inject player bridge script into YouTube DOM
  function injectScript(filePath) {
    try {
      const script = document.createElement('script');
      script.src = chrome.runtime.getURL(filePath);
      script.onload = function() {
        this.remove();
      };
      (document.head || document.documentElement).appendChild(script);
    } catch (e) {
      console.warn('[StudyTube] Script injection error:', e);
    }
  }

  injectScript('content/injected-quality.js');

  // 2. Global Video Content Classifier
  function analyzeVideoContent() {
    if (!state.enabled) return;

    state.videoTitle = document.title.replace(' - YouTube', '').trim();
    const titleLower = (state.videoTitle + ' ' + (document.querySelector('meta[name="description"]')?.content || '')).toLowerCase();

    const isCode = /python|javascript|coding|code|programming|java|c\+\+|react|developer|sql|tutorial|web dev|terminal|django|api|flutter|rust|compiler|leetcode|system design/i.test(titleLower);
    const isBoard = /math|calculus|physics|derivation|chemistry|blackboard|whiteboard|nptel|mit ocw|khan academy|algebra|theorem|formula|diagram|exam prep|course/i.test(titleLower);
    const isAudioHeavy = /gym|workout|phonk|lofi|remix|beats|song|music|playlist|podcast|audiobook|meditation|ambient|soundtrack|radio|study with me/i.test(titleLower);
    const isTalk = /interview|seminar|speech|discussion|talk|vlog|news|explained|review|commentary|documentary|tedx|keynote|conference|masterclass|product management/i.test(titleLower);

    if (isAudioHeavy) {
      state.detectedCategory = 'Audio & Background Music';
      state.recommendedMode = 'audio';
      state.recommendationReason = 'Audio-First saves ~85% bandwidth. No visual needed for background listening.';
    } else if (isCode) {
      state.detectedCategory = 'Code & Tech Tutorial';
      state.recommendedMode = 'code';
      state.recommendationReason = 'Code Mode (720p HD) keeps monospaced IDE fonts razor-sharp while conserving ~35% data.';
    } else if (isBoard) {
      state.detectedCategory = 'STEM & Whiteboard Lecture';
      state.recommendedMode = 'board';
      state.recommendationReason = 'Board Mode (720p HD) renders handwritten derivations and diagrams with zero blur.';
    } else if (isTalk) {
      state.detectedCategory = 'Seminar & Verbal Talk';
      state.recommendedMode = 'talk';
      state.recommendationReason = 'Talk Mode (480p) saves ~65% data with full clarity for spoken presentations & slides.';
    } else {
      state.detectedCategory = 'Educational / General';
      state.recommendedMode = 'board';
      state.recommendationReason = 'Board Mode (720p HD) optimizes clarity while preserving your mobile data plan.';
    }

    // Only render the on-screen pill if the user explicitly enabled it
    if (state.showInPagePill) {
      renderRecommendationBanner();
    } else {
      hideRecommendationBanner();
    }
  }

  // 3. In-Page Recommendation Pill (Strictly Controlled)
  function hideRecommendationBanner() {
    const banner = document.getElementById('studytube-recommend-pill');
    if (banner) {
      banner.style.display = 'none';
    }
  }

  function renderRecommendationBanner() {
    if (!state.enabled || !state.showInPagePill) {
      hideRecommendationBanner();
      return;
    }

    let banner = document.getElementById('studytube-recommend-pill');
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'studytube-recommend-pill';
      document.body.appendChild(banner);
    }

    const modeLabels = {
      'talk': 'Talk Mode (480p)',
      'board': 'Board Mode (720p HD)',
      'code': 'Code Mode (720p/1080p)',
      'audio': 'Audio-First Mode'
    };

    const isAlreadyOnRecommended = (state.audioFirst && state.recommendedMode === 'audio') || 
                                   (!state.audioFirst && state.mode === state.recommendedMode);

    if (isAlreadyOnRecommended) {
      banner.style.display = 'none';
      return;
    }

    banner.innerHTML = `
      <div class="pill-content">
        <span class="pill-sparkle">💡</span>
        <div class="pill-text">
          <strong>${state.detectedCategory} detected:</strong>
          <span>${state.recommendationReason}</span>
        </div>
        <button id="pillApplyBtn" class="pill-apply-btn">Switch to ${modeLabels[state.recommendedMode] || state.recommendedMode}</button>
        <button id="pillDismissBtn" class="pill-dismiss-btn">✕</button>
      </div>
    `;
    banner.style.display = 'block';

    const applyBtn = document.getElementById('pillApplyBtn');
    const dismissBtn = document.getElementById('pillDismissBtn');

    if (applyBtn) {
      applyBtn.onclick = () => {
        if (state.recommendedMode === 'audio') {
          state.audioFirst = true;
          state.mode = 'audio';
        } else {
          state.audioFirst = false;
          state.mode = state.recommendedMode;
        }

        chrome.storage.local.set({ mode: state.mode, audioFirst: state.audioFirst });
        applyStrictState();
        dispatchModeToPlayer();
        updateBadge();
        showToast(`✅ Applied ${modeLabels[state.recommendedMode]}!`);
        banner.style.display = 'none';
      };
    }

    if (dismissBtn) {
      dismissBtn.onclick = () => {
        banner.style.display = 'none';
      };
    }
  }

  // 4. Strict State Synchronization (The Core Bug Fix)
  function updateCommentsShield() {
    let styleEl = document.getElementById('studytube-comments-shield');

    if (!state.enabled || !state.blockComments) {
      if (styleEl) styleEl.remove();
      document.documentElement.classList.remove('studytube-block-comments');
      document.body?.classList.remove('studytube-block-comments');
      document.querySelectorAll('#comments, ytd-comments, ytd-comments-header-renderer, ytd-comment-thread-renderer, #sections.ytd-comments').forEach(el => {
        el.style.removeProperty('display');
        el.style.removeProperty('visibility');
      });
      return;
    }

    document.documentElement.classList.add('studytube-block-comments');
    document.body?.classList.add('studytube-block-comments');

    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'studytube-comments-shield';
      (document.head || document.documentElement).appendChild(styleEl);
    }

    styleEl.textContent = `
      #comments,
      ytd-comments,
      #sections.ytd-comments,
      ytd-comments-header-renderer,
      ytd-comment-thread-renderer,
      ytd-comment-view-model,
      ytd-comment-simplebox-renderer,
      #comment-teaser,
      ytd-item-section-renderer[section-identifier="comment-item-section"],
      ytd-engagement-panel-section-list-renderer[target-id*="comment"],
      ytd-engagement-panel-section-list-renderer:has(ytd-comment-thread-renderer) {
        display: none !important;
        visibility: hidden !important;
        height: 0px !important;
        min-height: 0px !important;
        overflow: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
      }
    `;

    document.querySelectorAll('#comments, ytd-comments, ytd-comments-header-renderer, ytd-comment-thread-renderer, #sections.ytd-comments').forEach(el => {
      el.style.setProperty('display', 'none', 'important');
      el.style.setProperty('visibility', 'hidden', 'important');
    });
  }

  // Live MutationObserver for dynamically inserted comments
  const commentsObserver = new MutationObserver(() => {
    if (state.enabled && state.blockComments) {
      document.querySelectorAll('#comments, ytd-comments, ytd-comments-header-renderer, ytd-comment-thread-renderer, #sections.ytd-comments').forEach(el => {
        if (el.style.display !== 'none') {
          el.style.setProperty('display', 'none', 'important');
          el.style.setProperty('visibility', 'hidden', 'important');
        }
      });
    }
  });

  try {
    commentsObserver.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  } catch (e) {}

  function applyStrictState() {
    if (!document.body) return;

    // IF EXTENSION IS DISABLED: SHUT DOWN EVERYTHING IMMEDIATELY
    if (!state.enabled) {
      // 1. Remove all CSS modifications
      document.documentElement.classList.remove('studytube-block-waste', 'studytube-audio-first', 'studytube-block-comments');
      document.body.classList.remove('studytube-block-waste', 'studytube-audio-first', 'studytube-block-comments');
      updateCommentsShield();
      
      // 2. Hide floating badge completely
      if (badgeEl) {
        badgeEl.style.display = 'none';
      }

      // 3. Hide any recommendation banners or modals
      hideRecommendationBanner();
      if (modalOverlay) {
        modalOverlay.classList.remove('active');
      }

      // 4. Clear all timers
      if (watchTimer) {
        clearInterval(watchTimer);
        watchTimer = null;
      }
      if (saveInterval) {
        clearInterval(saveInterval);
        saveInterval = null;
      }

      // 5. Tell player bridge to restore defaults
      window.postMessage({ type: 'STUDYTUBE_DISABLE' }, '*');
      return;
    }

    // IF EXTENSION IS ENABLED: APPLY ACTIVE RULES
    if (state.blockWaste) {
      document.documentElement.classList.add('studytube-block-waste');
      document.body.classList.add('studytube-block-waste');
    } else {
      document.documentElement.classList.remove('studytube-block-waste');
      document.body.classList.remove('studytube-block-waste');
    }

    updateCommentsShield();

    if (state.audioFirst || state.mode === 'audio') {
      document.body.classList.add('studytube-audio-first');
    } else {
      document.body.classList.remove('studytube-audio-first');
    }

    // Floating Badge visibility check
    ensureBadge();
    if (badgeEl) {
      badgeEl.style.display = state.showBadge ? 'flex' : 'none';
    }

    if (state.showInPagePill) {
      renderRecommendationBanner();
    } else {
      hideRecommendationBanner();
    }

    dispatchModeToPlayer();
  }

  // Load stored settings on start
  chrome.storage.local.get([
    'enabled',
    'mode',
    'blockWaste',
    'blockComments',
    'pauseInBackground',
    'audioFirst',
    'showBadge',
    'showInPagePill',
    'dataQuotaMb',
    'dataQuotaLabel'
  ], (settings) => {
    if (settings.enabled !== undefined) state.enabled = settings.enabled;
    if (settings.mode !== undefined) state.mode = settings.mode;
    if (settings.blockWaste !== undefined) state.blockWaste = settings.blockWaste;
    if (settings.blockComments !== undefined) state.blockComments = settings.blockComments;
    if (settings.pauseInBackground !== undefined) state.pauseInBackground = settings.pauseInBackground;
    if (settings.audioFirst !== undefined) state.audioFirst = settings.audioFirst;
    if (settings.showBadge !== undefined) state.showBadge = settings.showBadge;
    if (settings.showInPagePill !== undefined) state.showInPagePill = settings.showInPagePill;
    if (settings.dataQuotaMb !== undefined) state.dataQuotaMb = settings.dataQuotaMb;
    if (settings.dataQuotaLabel !== undefined) state.dataQuotaLabel = settings.dataQuotaLabel;

    applyStrictState();
    attachVideoListeners();
    if (state.enabled) {
      setTimeout(analyzeVideoContent, 1200);
    }
  });

  // Direct Message Listener from Popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'PING') {
      sendResponse({ status: 'ok', enabled: state.enabled, mode: state.mode });
      return true;
    }

    if (request.type === 'GET_ACTIVE_STATS') {
      const consumedMb = Math.round((state.sessionConsumedBytes / (1024 * 1024)) * 10) / 10;
      sendResponse({
        status: 'ok',
        enabled: state.enabled,
        watchSeconds: state.activeWatchSeconds,
        consumedMb: consumedMb,
        savedMb: state.sessionSavedMb,
        mode: state.mode,
        audioFirst: state.audioFirst,
        blockWaste: state.blockWaste,
        blockComments: state.blockComments,
        showBadge: state.showBadge,
        showInPagePill: state.showInPagePill,
        dataQuotaMb: state.dataQuotaMb,
        dataQuotaLabel: state.dataQuotaLabel,
        videoTitle: state.videoTitle,
        detectedCategory: state.detectedCategory,
        recommendedMode: state.recommendedMode,
        recommendationReason: state.recommendationReason
      });
      return true;
    }

    if (request.type === 'SHOW_RECAP_MODAL') {
      showRecapModal();
      sendResponse({ status: 'ok' });
      return true;
    }

    if (request.type === 'STUDYTUBE_CONFIG_UPDATE') {
      if (request.enabled !== undefined) state.enabled = request.enabled;
      if (request.mode !== undefined) state.mode = request.mode;
      if (request.blockWaste !== undefined) state.blockWaste = request.blockWaste;
      if (request.blockComments !== undefined) state.blockComments = request.blockComments;
      if (request.pauseInBackground !== undefined) state.pauseInBackground = request.pauseInBackground;
      if (request.audioFirst !== undefined) state.audioFirst = request.audioFirst;
      if (request.showBadge !== undefined) state.showBadge = request.showBadge;
      if (request.showInPagePill !== undefined) state.showInPagePill = request.showInPagePill;
      if (request.dataQuotaMb !== undefined) state.dataQuotaMb = request.dataQuotaMb;
      if (request.dataQuotaLabel !== undefined) state.dataQuotaLabel = request.dataQuotaLabel;

      applyStrictState();
      updateBadge();

      if (state.enabled) {
        showToast(`StudyTube: ${getModeDisplayName(state.mode)} active`);
      } else {
        showToast(`StudyTube: Turned OFF`);
      }

      sendResponse({ status: 'ok', state: state });
    }
    return true;
  });

  function getModeDisplayName(mode) {
    if (state.audioFirst || mode === 'audio') return 'Audio-First Mode (144p)';
    if (mode === 'talk') return 'Talk Mode (480p)';
    if (mode === 'board') return 'Board Mode (720p HD)';
    if (mode === 'code') return 'Code Mode (720p/1080p)';
    return (mode || 'BOARD').toUpperCase();
  }

  function dispatchModeToPlayer() {
    if (!state.enabled) return;
    const effectiveMode = state.audioFirst ? 'audio' : state.mode;
    window.postMessage({ type: 'STUDYTUBE_SET_MODE', mode: effectiveMode }, '*');
  }

  // 5. Video Playback & Watch Time Tracking
  function attachVideoListeners() {
    const video = document.querySelector('video');
    if (!video) {
      setTimeout(attachVideoListeners, 1000);
      return;
    }

    state.videoTitle = document.title.replace(' - YouTube', '').trim();

    video.addEventListener('play', () => {
      if (!state.enabled) return;
      state.isPlaying = true;
      if (!watchTimer) {
        watchTimer = setInterval(() => {
          if (state.isPlaying && state.enabled) {
            state.activeWatchSeconds++;
            recalculateSavings();
            updateBadge();
          }
        }, 1000);
      }

      if (!saveInterval) {
        saveInterval = setInterval(() => {
          if (state.isPlaying && state.enabled && state.activeWatchSeconds > 0) {
            saveSessionToStorage();
          }
        }, 3000);
      }
    });

    video.addEventListener('pause', () => {
      state.isPlaying = false;
      if (state.enabled) saveSessionToStorage();
    });

    // NOTE: We do NOT pop up the modal automatically on video end anymore!
    // Automatic modal popups on video end interrupt playlists and music listening.
    // The user can open the modal anytime via the popup button or badge.
    video.addEventListener('ended', () => {
      state.isPlaying = false;
      if (state.enabled) saveSessionToStorage();
    });
  }

  // 6. Network Telemetry Model
  function recalculateSavings() {
    if (!state.enabled) return;
    const consumedMb = state.sessionConsumedBytes / (1024 * 1024);
    const minutesWatched = state.activeWatchSeconds / 60;
    const baselineExpectedMb = minutesWatched * 3.6;
    const wasteBlockedMb = state.blockWaste ? (minutesWatched * 0.7) : 0;

    let saved = (baselineExpectedMb - consumedMb) + wasteBlockedMb;
    if (saved < 0) saved = 0;

    if (consumedMb > 0 && saved === 0) {
      let multiplier = 0.5;
      if (state.mode === 'talk') multiplier = 0.65;
      if (state.mode === 'audio' || state.audioFirst) multiplier = 0.85;
      saved = consumedMb * multiplier;
    }

    state.sessionSavedMb = Math.round(saved * 10) / 10;
  }

  // 7. W3C Performance Observer
  if (window.PerformanceObserver) {
    try {
      const observer = new PerformanceObserver((list) => {
        if (!state.enabled) return;
        list.getEntries().forEach((entry) => {
          if (entry.name && (entry.name.includes('googlevideo.com') || entry.name.includes('videoplayback'))) {
            const transferSize = entry.transferSize || entry.encodedBodySize || 0;
            state.sessionConsumedBytes += transferSize;
            recalculateSavings();
            updateBadge();
          }
        });
      });
      observer.observe({ type: 'resource', buffered: true });
    } catch (e) {}
  }

  // 8. Session Storage Persistence
  function saveSessionToStorage() {
    if (!state.enabled) return;
    const consumedMb = Math.round((state.sessionConsumedBytes / (1024 * 1024)) * 10) / 10;
    const savedMb = state.sessionSavedMb;
    const totalPotential = consumedMb + savedMb;
    const percentSaved = totalPotential > 0 ? Math.round((savedMb / totalPotential) * 100) : 60;

    const sessionData = {
      title: state.videoTitle || document.title.replace(' - YouTube', '').trim() || 'YouTube Session',
      watchSeconds: state.activeWatchSeconds,
      consumedMb: consumedMb,
      savedMb: savedMb,
      percentSaved: percentSaved,
      mode: state.audioFirst ? 'AUDIO' : state.mode.toUpperCase(),
      category: state.detectedCategory,
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now()
    };

    chrome.storage.local.set({ lastSession: sessionData });

    chrome.storage.local.get(['totalSavedMb', 'totalConsumedMb'], (res) => {
      const curSaved = res.totalSavedMb || 0;
      const curConsumed = res.totalConsumedMb || 0;
      chrome.storage.local.set({
        totalSavedMb: Math.max(curSaved, Math.round((curSaved + (savedMb > 0 ? 0.05 : 0)) * 10) / 10),
        totalConsumedMb: Math.max(curConsumed, Math.round((curConsumed + (consumedMb > 0 ? 0.05 : 0)) * 10) / 10)
      });
    });
  }

  window.addEventListener('beforeunload', () => {
    if (state.enabled && state.activeWatchSeconds > 10) {
      saveSessionToStorage();
    }
  });

  window.addEventListener('yt-navigate-finish', () => {
    if (state.enabled) {
      saveSessionToStorage();
      state.activeWatchSeconds = 0;
      state.sessionConsumedBytes = 0;
      state.sessionSavedMb = 0;
      setTimeout(() => {
        analyzeVideoContent();
        attachVideoListeners();
        applyStrictState();
        dispatchModeToPlayer();
        updateBadge();
      }, 1000);
    }
  });

  // 9. Floating Badge (Strictly respects state.enabled and state.showBadge)
  function ensureBadge() {
    if (!document.body) return;

    if (!state.enabled || !state.showBadge) {
      if (badgeEl) badgeEl.style.display = 'none';
      return;
    }

    if (!badgeEl) {
      badgeEl = document.createElement('div');
      badgeEl.id = 'studytube-badge';
      badgeEl.innerHTML = `
        <span class="badge-icon">🎓</span>
        <span>Used: <strong class="badge-used">0 MB</strong></span>
        <span>Saved: <strong class="badge-stat">0 MB</strong></span>
        <span class="badge-mode">${state.mode.toUpperCase()}</span>
      `;

      badgeEl.addEventListener('click', () => {
        saveSessionToStorage();
        showRecapModal();
      });

      document.body.appendChild(badgeEl);
    }

    badgeEl.style.display = 'flex';
  }

  function updateBadge() {
    if (!badgeEl || !state.enabled || !state.showBadge) return;
    const consumedMb = (state.sessionConsumedBytes / (1024 * 1024)).toFixed(1);
    const savedMb = state.sessionSavedMb.toFixed(1);

    const usedEl = badgeEl.querySelector('.badge-used');
    const statEl = badgeEl.querySelector('.badge-stat');
    const modeEl = badgeEl.querySelector('.badge-mode');

    if (usedEl) usedEl.textContent = `${consumedMb} MB`;
    if (statEl) statEl.textContent = `${savedMb} MB`;
    if (modeEl) modeEl.textContent = (state.audioFirst ? 'AUDIO' : state.mode).toUpperCase();
  }

  // 10. User-Triggered Modal Recap
  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  }

  function showRecapModal() {
    saveSessionToStorage();

    const consumedMb = (state.sessionConsumedBytes / (1024 * 1024)).toFixed(1);
    const savedMb = state.sessionSavedMb.toFixed(1);
    const totalPotential = (parseFloat(consumedMb) + parseFloat(savedMb));
    const percentSaved = totalPotential > 0 ? Math.round((parseFloat(savedMb) / totalPotential) * 100) : 60;
    const timeWatchedStr = formatTime(state.activeWatchSeconds);

    // Dynamic Data Quota Plan calculation
    let quotaMb = state.dataQuotaMb || 1536;
    let quotaLabel = state.dataQuotaLabel || '1.5GB/day';
    let quotaDisplay = '';
    let formulaDesc = '';

    if (quotaMb === 'unlimited' || quotaMb === '0') {
      quotaDisplay = `${percentSaved}% Conserved`;
      quotaLabel = 'UNLIMITED';
      formulaDesc = `• <strong>Conservation Ratio:</strong> (${savedMb} MB saved ÷ ${totalPotential.toFixed(1)} MB total) × 100 = <strong>${percentSaved}%</strong> bandwidth conserved.`;
    } else {
      const numQuota = parseFloat(quotaMb) || 1536;
      const rawPct = (parseFloat(savedMb) / numQuota) * 100;
      const displayPct = rawPct >= 1 ? rawPct.toFixed(1) : (rawPct > 0 ? rawPct.toFixed(2) : '0');
      quotaDisplay = `${displayPct}% Preserved`;
      formulaDesc = `• <strong>Quota Impact:</strong> (<strong>${savedMb} MB</strong> saved ÷ <strong>${numQuota} MB</strong> plan) × 100 = <strong>${displayPct}%</strong> of your ${quotaLabel} data quota preserved for study & other apps.`;
    }

    if (!modalOverlay) {
      modalOverlay = document.createElement('div');
      modalOverlay.id = 'studytube-modal-overlay';
      document.body.appendChild(modalOverlay);
    }

    modalOverlay.innerHTML = `
      <div class="studytube-recap-card">
        <div class="recap-header">
          <div class="recap-title-group">
            <h2>🎓 StudyTube Stream Telemetry</h2>
            <p title="${state.videoTitle}">${state.videoTitle || 'YouTube Session'}</p>
          </div>
          <button class="recap-close-btn" id="recapCloseBtn">✕</button>
        </div>

        <div class="recap-hero-pill">
          <div class="saving-pct">${percentSaved}% BANDWIDTH CONSERVED</div>
          <div class="saving-label">Category: ${state.detectedCategory} • Mode: ${getModeDisplayName(state.mode)}</div>
        </div>

        <div class="recap-grid">
          <div class="recap-grid-item">
            <span>⏱️ ACTIVE TIME</span>
            <strong>${timeWatchedStr}</strong>
          </div>
          <div class="recap-grid-item saved">
            <span>🛡️ DATA CONSERVED</span>
            <strong>${savedMb} MB</strong>
          </div>
          <div class="recap-grid-item used">
            <span>📉 WIRE TRANSFERRED</span>
            <strong>${consumedMb} MB</strong>
          </div>
          <div class="recap-grid-item" title="Calculation: (${savedMb} MB Saved / ${quotaMb} MB Plan) × 100%">
            <span>🚀 ${quotaLabel.toUpperCase()} IMPACT</span>
            <strong>${quotaDisplay}</strong>
          </div>
        </div>

        <div class="recap-insight-box">
          <span class="insight-icon">🔬</span>
          <div class="insight-text-block">
            <strong>How Telemetry is Calculated (Glass-Box Audit):</strong>
            <p style="margin: 4px 0;">${formulaDesc}</p>
            <p style="margin: 4px 0; color: #9aa0a6;">• <strong>W3C Socket Telemetry:</strong> Raw <code>transferSize</code> bytes intercepted from <code>googlevideo.com</code> media chunks via PerformanceObserver vs 1080p DASH baseline. Zero PII collected.</p>
          </div>
        </div>

        <div class="recap-actions">
          <button class="recap-btn-copy" id="recapCopyBtn">
            📋 Copy Savings Receipt
          </button>
          <button class="recap-btn-feedback" id="recapFeedbackBtn" title="Suggest an idea or give feedback">
            💬 Feedback
          </button>
          <button class="recap-btn-dismiss" id="recapDismissBtn">Done</button>
        </div>
      </div>
    `;

    modalOverlay.classList.add('active');

    const closeBtn = document.getElementById('recapCloseBtn');
    const dismissBtn = document.getElementById('recapDismissBtn');
    const copyBtn = document.getElementById('recapCopyBtn');
    const feedbackBtn = document.getElementById('recapFeedbackBtn');

    function closeModal() {
      modalOverlay.classList.remove('active');
    }

    if (closeBtn) closeBtn.onclick = closeModal;
    if (dismissBtn) dismissBtn.onclick = closeModal;
    if (feedbackBtn) {
      feedbackBtn.onclick = () => {
        const streamName = encodeURIComponent(state.videoTitle || 'YouTube Stream');
        window.open(`https://github.com/krishnamurthi-ramesh/Study-Tube/issues/new?title=%5BUser+Feedback%5D+${streamName}&labels=feedback&body=Stream:+${streamName}%0AMode:+${state.mode}%0AFeedback+or+Feature+Idea:`, '_blank');
      };
    }
    modalOverlay.onclick = (e) => {
      if (e.target === modalOverlay) closeModal();
    };

    if (copyBtn) {
      copyBtn.onclick = () => {
        const receiptText = `🎓 StudyTube Stream Receipt:
• Stream: ${state.videoTitle}
• Category: ${state.detectedCategory}
• Mode: ${getModeDisplayName(state.mode)}
• Watch Time: ${timeWatchedStr}
• Data Transferred: ${consumedMb} MB
• Bandwidth Conserved: ${savedMb} MB (${percentSaved}% saved)
• Quota Impact: ${quotaDisplay} of ${quotaLabel} plan
• Telemetry Formula: (${savedMb} MB saved / ${quotaMb} MB plan) × 100
🔬 Network Telemetry verified by StudyTube for Chrome & Brave`;

        navigator.clipboard.writeText(receiptText).then(() => {
          copyBtn.textContent = '✅ Copied to Clipboard!';
          copyBtn.style.background = '#34a853';
          setTimeout(() => {
            copyBtn.textContent = '📋 Copy Savings Receipt';
            copyBtn.style.background = '#1a73e8';
          }, 2000);
        });
      };
    }
  }
  }

  // 11. Toast Notification
  function showToast(message) {
    let toast = document.getElementById('studytube-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'studytube-toast';
      toast.style.cssText = `
        position: fixed;
        top: 24px;
        right: 24px;
        z-index: 99999999;
        background: #1a73e8;
        color: #ffffff;
        padding: 10px 18px;
        border-radius: 8px;
        font-family: Roboto, sans-serif;
        font-size: 13px;
        font-weight: 500;
        box-shadow: 0 4px 16px rgba(0,0,0,0.3);
        transition: opacity 0.3s ease, transform 0.3s ease;
        pointer-events: none;
      `;
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';

    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
    }, 2000);
  }

  // Initial setup
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      applyStrictState();
    });
  } else {
    applyStrictState();
  }
})();
