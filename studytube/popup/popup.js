// StudyTube Popup Controller with Strict Enable/Disable & Accessibility

document.addEventListener('DOMContentLoaded', () => {
  const masterToggle = document.getElementById('masterToggle');
  const blockWasteToggle = document.getElementById('blockWasteToggle');
  const blockCommentsToggle = document.getElementById('blockCommentsToggle');
  const showBadgeToggle = document.getElementById('showBadgeToggle');
  const pauseBackgroundToggle = document.getElementById('pauseBackgroundToggle');
  const dataQuotaSelect = document.getElementById('dataQuotaSelect');
  const quotaCalcExplainer = document.getElementById('quotaCalcExplainer');
  const totalSavedEl = document.getElementById('totalSaved');
  const totalConsumedEl = document.getElementById('totalConsumed');
  const statusBar = document.getElementById('statusBar');
  const disabledNotice = document.getElementById('disabledNotice');
  const mainControlsContainer = document.getElementById('mainControlsContainer');
  const modeButtons = document.querySelectorAll('.mode-btn');

  // Audit Drawer elements
  const auditToggleBtn = document.getElementById('auditToggleBtn');
  const auditDrawer = document.getElementById('auditDrawer');

  // Smart Recommendation elements
  const smartRecommendCard = document.getElementById('smartRecommendCard');
  const detectedCategoryTag = document.getElementById('detectedCategoryTag');
  const recommendReasonText = document.getElementById('recommendReasonText');
  const quickApplyRecommendBtn = document.getElementById('quickApplyRecommendBtn');

  // Recap elements
  const recapTitleEl = document.getElementById('recapTitle');
  const recapModeTagEl = document.getElementById('recapModeTag');
  const recapTimeEl = document.getElementById('recapTime');
  const recapSavedEl = document.getElementById('recapSaved');
  const recapUsedEl = document.getElementById('recapUsed');
  const recapQuotaLabel = document.getElementById('recapQuotaLabel');
  const recapQuotaVal = document.getElementById('recapQuotaVal');
  const copyReceiptBtn = document.getElementById('copyReceiptBtn');
  const viewInPageBtn = document.getElementById('viewInPageBtn');

  let activeSessionData = null;

  let currentSettings = {
    enabled: true,
    mode: 'board',
    blockWaste: true,
    blockComments: true,
    showBadge: true,
    pauseInBackground: true,
    audioFirst: false,
    dataQuotaMb: 1536,
    dataQuotaLabel: '1.5GB/day'
  };

  function updateStatus(text, type) {
    if (!statusBar) return;
    statusBar.textContent = text;
    statusBar.className = 'status-bar ' + (type || '');
  }

  function formatTime(seconds) {
    if (!seconds || seconds <= 0) return '0s';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  }

  // 1. Strict UI State Renderer
  function renderUIState() {
    masterToggle.checked = currentSettings.enabled;

    if (!currentSettings.enabled) {
      updateStatus('⚪ StudyTube is Off (Strictly Inactive)', 'inactive');
      if (disabledNotice) disabledNotice.style.display = 'flex';
      if (mainControlsContainer) mainControlsContainer.classList.add('disabled');
      if (smartRecommendCard) smartRecommendCard.style.display = 'none';
      return;
    }

    // When Enabled:
    if (disabledNotice) disabledNotice.style.display = 'none';
    if (mainControlsContainer) mainControlsContainer.classList.remove('disabled');

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (!activeTab || !activeTab.url || !activeTab.url.includes('youtube.com')) {
        updateStatus('ℹ️ Open a YouTube stream to see live telemetry', '');
        if (smartRecommendCard) smartRecommendCard.style.display = 'none';
      } else {
        updateStatus('🟢 Live stream telemetry active', 'success');
      }
    });
  }

  // Toggle Network Audit Drawer
  if (auditToggleBtn && auditDrawer) {
    auditToggleBtn.addEventListener('click', () => {
      const isOpen = auditDrawer.classList.contains('open');
      if (isOpen) {
        auditDrawer.classList.remove('open');
        auditToggleBtn.querySelector('.toggle-arrow').textContent = '▾';
      } else {
        auditDrawer.classList.add('open');
        auditToggleBtn.querySelector('.toggle-arrow').textContent = '▴';
      }
    });
  }

  // 2. Fetch Active Telemetry & AI Recommendation from Tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    if (!activeTab || !activeTab.url || !activeTab.url.includes('youtube.com')) {
      loadLastSavedSession();
    } else {
      chrome.tabs.sendMessage(activeTab.id, { type: 'GET_ACTIVE_STATS' }, (response) => {
        if (chrome.runtime.lastError || !response) {
          loadLastSavedSession();
        } else {
          activeSessionData = response;
          displaySession(response, true);
          if (currentSettings.enabled) {
            displayRecommendation(response);
          }
        }
      });
    }
  });

  function displayRecommendation(data) {
    if (!data || !data.recommendedMode || !smartRecommendCard || !currentSettings.enabled) return;
    smartRecommendCard.style.display = 'block';
    detectedCategoryTag.textContent = (data.detectedCategory || 'STREAM').toUpperCase();
    recommendReasonText.textContent = data.recommendationReason || 'Optimized for high clarity and minimal data.';

    const modeLabels = {
      'talk': 'Talk Mode (480p)',
      'board': 'Board Mode (720p HD)',
      'code': 'Code Mode (720p/1080p)',
      'audio': 'Audio-First Mode'
    };

    const targetModeLabel = modeLabels[data.recommendedMode] || data.recommendedMode;
    const isAlreadyOnRecommended = (currentSettings.audioFirst && data.recommendedMode === 'audio') || 
                                   (!currentSettings.audioFirst && currentSettings.mode === data.recommendedMode);

    if (isAlreadyOnRecommended) {
      quickApplyRecommendBtn.textContent = `✅ Active: ${targetModeLabel}`;
      quickApplyRecommendBtn.style.background = '#282a2d';
      quickApplyRecommendBtn.style.color = '#34a853';
      quickApplyRecommendBtn.disabled = true;
    } else {
      quickApplyRecommendBtn.textContent = `⚡ Switch to ${targetModeLabel}`;
      quickApplyRecommendBtn.style.background = '#1a73e8';
      quickApplyRecommendBtn.style.color = '#ffffff';
      quickApplyRecommendBtn.disabled = false;

      quickApplyRecommendBtn.onclick = () => {
        if (data.recommendedMode === 'audio') {
          currentSettings.audioFirst = true;
          currentSettings.mode = 'audio';
        } else {
          currentSettings.audioFirst = false;
          currentSettings.mode = data.recommendedMode;
        }

        chrome.storage.local.set({
          audioFirst: currentSettings.audioFirst,
          mode: currentSettings.mode
        }, () => {
          setActiveModeUI(currentSettings.audioFirst ? 'audio' : currentSettings.mode);
          dispatchUpdateToActiveTab();
          quickApplyRecommendBtn.textContent = `✅ Active: ${targetModeLabel}`;
          quickApplyRecommendBtn.style.background = '#282a2d';
          quickApplyRecommendBtn.style.color = '#34a853';
          quickApplyRecommendBtn.disabled = true;
        });
      };
    }
  }

  // 3. Load stored session if no live session is active
  function loadLastSavedSession() {
    chrome.storage.local.get(['lastSession', 'totalSavedMb', 'totalConsumedMb'], (res) => {
      if (res.lastSession && (res.lastSession.watchSeconds > 0 || res.lastSession.savedMb > 0)) {
        activeSessionData = res.lastSession;
        displaySession(res.lastSession, false);
      } else if (res.totalSavedMb > 0) {
        recapTitleEl.textContent = 'Cumulative Stream Telemetry';
        recapModeTagEl.textContent = 'MEASURED';
        recapTimeEl.textContent = 'Active';
        recapSavedEl.textContent = `${res.totalSavedMb} MB`;
        recapUsedEl.textContent = `${res.totalConsumedMb || 0} MB`;
      } else {
        recapTitleEl.textContent = 'Play any YouTube video to record telemetry!';
      }
    });
  }

  function updateQuotaExplainer() {
    if (!quotaCalcExplainer) return;
    const quotaMb = currentSettings.dataQuotaMb;
    if (quotaMb === 'unlimited' || quotaMb === '0') {
      quotaCalcExplainer.innerHTML = `💡 <em>Mode:</em> Broadband Unlimited • Tracking pure MBs saved & carbon efficiency.`;
    } else {
      const num = parseFloat(quotaMb) || 1536;
      quotaCalcExplainer.innerHTML = `💡 <em>Live Formula:</em> <code>(Saved MB ÷ ${num.toLocaleString()} MB) × 100</code> = % of your ${currentSettings.dataQuotaLabel || '1.5GB/day'} quota preserved.`;
    }
  }

  function displaySession(data, isLive) {
    if (!data) return;
    const title = data.videoTitle || data.title || 'YouTube Stream Session';
    const seconds = data.watchSeconds || 0;
    const usedMb = data.consumedMb || 0;
    const savedMb = data.savedMb || 0;
    const mode = data.audioFirst ? 'AUDIO' : (data.mode || 'BOARD').toUpperCase();

    recapTitleEl.textContent = title;
    recapModeTagEl.textContent = isLive ? `LIVE: ${mode}` : `SAVED: ${mode}`;
    recapTimeEl.textContent = formatTime(seconds);
    recapSavedEl.textContent = `${savedMb} MB`;
    recapUsedEl.textContent = `${usedMb} MB`;

    // Dynamic Quota Impact Calculation
    if (recapQuotaVal && recapQuotaLabel) {
      const quotaMb = currentSettings.dataQuotaMb || 1536;
      if (quotaMb === 'unlimited' || quotaMb === '0') {
        const total = (parseFloat(usedMb) + parseFloat(savedMb));
        const pct = total > 0 ? Math.round((parseFloat(savedMb) / total) * 100) : 60;
        recapQuotaLabel.textContent = '🚀 Conserved';
        recapQuotaVal.textContent = `${pct}%`;
      } else {
        const numQuota = parseFloat(quotaMb) || 1536;
        const raw = (parseFloat(savedMb) / numQuota) * 100;
        const disp = raw >= 1 ? raw.toFixed(1) : (raw > 0 ? raw.toFixed(2) : '0');
        recapQuotaLabel.textContent = `🚀 ${currentSettings.dataQuotaLabel || '1.5GB'}`;
        recapQuotaVal.textContent = `${disp}%`;
      }
    }
  }

  // 4. Load General Settings from Storage
  chrome.storage.local.get([
    'enabled',
    'mode',
    'blockWaste',
    'blockComments',
    'showBadge',
    'pauseInBackground',
    'audioFirst',
    'dataQuotaMb',
    'dataQuotaLabel',
    'totalSavedMb',
    'totalConsumedMb'
  ], (res) => {
    currentSettings.enabled = res.enabled !== false;
    currentSettings.blockWaste = res.blockWaste !== false;
    currentSettings.blockComments = res.blockComments !== false;
    currentSettings.showBadge = res.showBadge !== false;
    currentSettings.pauseInBackground = res.pauseInBackground !== false;
    currentSettings.mode = res.mode || 'board';
    currentSettings.audioFirst = res.audioFirst === true;
    currentSettings.dataQuotaMb = res.dataQuotaMb || 1536;
    currentSettings.dataQuotaLabel = res.dataQuotaLabel || '1.5GB/day';

    blockWasteToggle.checked = currentSettings.blockWaste;
    if (blockCommentsToggle) blockCommentsToggle.checked = currentSettings.blockComments;
    if (showBadgeToggle) showBadgeToggle.checked = currentSettings.showBadge;
    pauseBackgroundToggle.checked = currentSettings.pauseInBackground;

    if (dataQuotaSelect) {
      dataQuotaSelect.value = String(currentSettings.dataQuotaMb);
    }
    updateQuotaExplainer();

    totalSavedEl.textContent = `${res.totalSavedMb || 0} MB`;
    totalConsumedEl.textContent = `${res.totalConsumedMb || 0} MB`;

    const activeMode = currentSettings.audioFirst ? 'audio' : currentSettings.mode;
    setActiveModeUI(activeMode);
    renderUIState();
  });

  function setActiveModeUI(mode) {
    modeButtons.forEach(btn => {
      if (btn.dataset.mode === mode) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  // 5. Send update to content script on active tab
  function dispatchUpdateToActiveTab() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (activeTab && activeTab.id && activeTab.url && activeTab.url.includes('youtube.com')) {
        chrome.tabs.sendMessage(activeTab.id, {
          type: 'STUDYTUBE_CONFIG_UPDATE',
          enabled: currentSettings.enabled,
          mode: currentSettings.mode,
          blockWaste: currentSettings.blockWaste,
          blockComments: currentSettings.blockComments,
          showBadge: currentSettings.showBadge,
          pauseInBackground: currentSettings.pauseInBackground,
          audioFirst: currentSettings.audioFirst,
          dataQuotaMb: currentSettings.dataQuotaMb,
          dataQuotaLabel: currentSettings.dataQuotaLabel
        }, (res) => {
          if (!chrome.runtime.lastError && currentSettings.enabled) {
            updateStatus('✅ Applied: ' + (currentSettings.audioFirst ? 'Audio-First' : currentSettings.mode.toUpperCase()), 'success');
          }
        });
      }
    });
  }

  // 6. Mode Selection
  modeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      if (!currentSettings.enabled) return;
      const selectedMode = btn.dataset.mode;
      setActiveModeUI(selectedMode);

      if (selectedMode === 'audio') {
        currentSettings.audioFirst = true;
        currentSettings.mode = 'audio';
      } else {
        currentSettings.audioFirst = false;
        currentSettings.mode = selectedMode;
      }

      chrome.storage.local.set({
        audioFirst: currentSettings.audioFirst,
        mode: currentSettings.mode
      }, () => {
        dispatchUpdateToActiveTab();
      });
    });
  });

  // 7. Master Toggle (Strict Enforcement)
  masterToggle.addEventListener('change', () => {
    currentSettings.enabled = masterToggle.checked;
    renderUIState();
    chrome.storage.local.set({ enabled: currentSettings.enabled }, () => {
      dispatchUpdateToActiveTab();
    });
  });

  // 8. Individual Feature Toggles
  blockWasteToggle.addEventListener('change', () => {
    currentSettings.blockWaste = blockWasteToggle.checked;
    chrome.storage.local.set({ blockWaste: currentSettings.blockWaste }, () => {
      dispatchUpdateToActiveTab();
    });
  });

  if (blockCommentsToggle) {
    blockCommentsToggle.addEventListener('change', () => {
      currentSettings.blockComments = blockCommentsToggle.checked;
      chrome.storage.local.set({ blockComments: currentSettings.blockComments }, () => {
        dispatchUpdateToActiveTab();
      });
    });
  }

  if (showBadgeToggle) {
    showBadgeToggle.addEventListener('change', () => {
      currentSettings.showBadge = showBadgeToggle.checked;
      chrome.storage.local.set({ showBadge: currentSettings.showBadge }, () => {
        dispatchUpdateToActiveTab();
      });
    });
  }

  pauseBackgroundToggle.addEventListener('change', () => {
    currentSettings.pauseInBackground = pauseBackgroundToggle.checked;
    chrome.storage.local.set({ pauseInBackground: currentSettings.pauseInBackground }, () => {
      dispatchUpdateToActiveTab();
    });
  });

  if (dataQuotaSelect) {
    dataQuotaSelect.addEventListener('change', () => {
      const selectedValue = dataQuotaSelect.value;
      const selectedOption = dataQuotaSelect.options[dataQuotaSelect.selectedIndex];
      currentSettings.dataQuotaMb = selectedValue === 'unlimited' ? 'unlimited' : parseInt(selectedValue, 10);
      currentSettings.dataQuotaLabel = selectedOption ? selectedOption.text.split('(')[0].trim() : 'Plan';

      updateQuotaExplainer();
      if (activeSessionData) {
        displaySession(activeSessionData, true);
      }

      chrome.storage.local.set({
        dataQuotaMb: currentSettings.dataQuotaMb,
        dataQuotaLabel: currentSettings.dataQuotaLabel
      }, () => {
        dispatchUpdateToActiveTab();
      });
    });
  }

  // 9. Receipt Actions
  if (copyReceiptBtn) {
    copyReceiptBtn.addEventListener('click', () => {
      const title = recapTitleEl.textContent;
      const time = recapTimeEl.textContent;
      const saved = recapSavedEl.textContent;
      const used = recapUsedEl.textContent;
      const quotaImpact = recapQuotaVal ? recapQuotaVal.textContent : '0%';
      const planName = currentSettings.dataQuotaLabel || '1.5GB/day';

      const receipt = `🎓 StudyTube Stream Receipt:
• Stream: ${title}
• Active Time: ${time}
• Bandwidth Conserved: ${saved}
• Wire Transferred: ${used}
• Quota Preserved: ${quotaImpact} of ${planName}
• Calculation: (${saved} saved / ${currentSettings.dataQuotaMb} MB plan) × 100
🔬 Verified with StudyTube W3C Telemetry for Chrome & Brave`;

      navigator.clipboard.writeText(receipt).then(() => {
        copyReceiptBtn.textContent = '✅ Copied!';
        copyReceiptBtn.style.background = '#34a853';
        setTimeout(() => {
          copyReceiptBtn.textContent = '📋 Copy Receipt';
          copyReceiptBtn.style.background = '#1a73e8';
        }, 2000);
      });
    });
  }

  if (viewInPageBtn) {
    viewInPageBtn.addEventListener('click', () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const activeTab = tabs[0];
        if (activeTab && activeTab.id) {
          chrome.tabs.sendMessage(activeTab.id, { type: 'SHOW_RECAP_MODAL' }, (res) => {
            if (chrome.runtime.lastError) {
              alert('Please open or refresh a YouTube lecture tab first!');
            } else {
              window.close();
            }
          });
        }
      });
    });
  }

  // 10. Community Feedback & Suggestions
  const feedbackIdeaBtn = document.getElementById('feedbackIdeaBtn');
  const feedbackIssueBtn = document.getElementById('feedbackIssueBtn');

  if (feedbackIdeaBtn) {
    feedbackIdeaBtn.addEventListener('click', () => {
      chrome.tabs.create({
        url: 'https://github.com/krishnamurthi-ramesh/Study-Tube/issues/new?title=%5BFeature+Request%5D+&labels=enhancement&body=Feature+Suggestion:%0A%0AWhy+it+helps+learners:'
      });
    });
  }

  if (feedbackIssueBtn) {
    feedbackIssueBtn.addEventListener('click', () => {
      chrome.tabs.create({
        url: 'https://github.com/krishnamurthi-ramesh/Study-Tube/issues/new?title=%5BBug+Report%5D+&labels=bug&body=Description+of+problem:%0A%0AYouTube+Video+URL:%0ABrowser+(Chrome/Brave/Edge):'
      });
    });
  }
});
