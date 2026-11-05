// StudyTube - Injected Quality Controller (Runs in YouTube Page Context)
(function() {
  let isEnabled = true;

  const RESOLUTION_LABELS = {
    'talk': '480p',
    'board': '720p',
    'code': '720p',
    'audio': '144p'
  };

  const API_QUALITY_NAMES = {
    'talk': 'large',       // 480p
    'board': 'hd720',      // 720p
    'code': 'hd720',       // 720p
    'audio': 'tiny'        // 144p
  };

  function getPlayer() {
    return document.getElementById('movie_player') || document.querySelector('.html5-video-player');
  }

  // Programmatic Settings UI Interaction
  function setQualityViaUI(targetLabel) {
    if (!isEnabled) return false;
    const settingsBtn = document.querySelector('.ytp-settings-button');
    if (!settingsBtn) return false;

    const isMenuOpen = document.querySelector('.ytp-popup.ytp-settings-menu') && 
                       document.querySelector('.ytp-popup.ytp-settings-menu').style.display !== 'none';

    if (!isMenuOpen) {
      settingsBtn.click();
    }

    setTimeout(() => {
      const menuItems = Array.from(document.querySelectorAll('.ytp-panel-menu .ytp-menuitem'));
      const qualityItem = menuItems.find(el => {
        const text = (el.textContent || '').toLowerCase();
        return text.includes('quality') || text.includes('गुणवत्ता') || text.includes('தரம்') || text.includes('క్వాలిటీ');
      });

      if (qualityItem) {
        qualityItem.click();

        setTimeout(() => {
          const subItems = Array.from(document.querySelectorAll('.ytp-panel-menu .ytp-menuitem'));
          const targetItem = subItems.find(el => (el.textContent || '').includes(targetLabel));

          if (targetItem) {
            targetItem.click();
          } else {
            const availableP = subItems.find(el => (el.textContent || '').includes('p'));
            if (availableP) availableP.click();
          }

          setTimeout(() => {
            const openMenu = document.querySelector('.ytp-popup.ytp-settings-menu');
            if (openMenu && openMenu.style.display !== 'none') {
              settingsBtn.click();
            }
          }, 60);
        }, 80);
      } else {
        settingsBtn.click();
      }
    }, 80);

    return true;
  }

  function applyQuality(mode) {
    if (!isEnabled) return;
    const targetLabel = RESOLUTION_LABELS[mode] || '720p';
    const targetApiQuality = API_QUALITY_NAMES[mode] || 'hd720';
    const player = getPlayer();

    if (player) {
      try {
        if (typeof player.setPlaybackQualityRange === 'function') {
          player.setPlaybackQualityRange(targetApiQuality, targetApiQuality);
        }
        if (typeof player.setPlaybackQuality === 'function') {
          player.setPlaybackQuality(targetApiQuality);
        }
        if (typeof player.setAutonav === 'function') {
          player.setAutonav(false);
        }
      } catch (e) {}
    }

    try {
      localStorage.setItem('yt-player-quality', JSON.stringify({
        data: targetApiQuality,
        expiration: Date.now() + 86400000,
        creation: Date.now()
      }));
    } catch (e) {}

    setTimeout(() => {
      setQualityViaUI(targetLabel);
    }, 200);

    window.postMessage({
      type: 'STUDYTUBE_QUALITY_CHANGED',
      mode: mode,
      targetLabel: targetLabel
    }, '*');
  }

  // Message dispatcher
  window.addEventListener('message', (event) => {
    if (event.source !== window || !event.data) return;

    if (event.data.type === 'STUDYTUBE_DISABLE') {
      isEnabled = false;
      return;
    }

    if (event.data.type === 'STUDYTUBE_SET_MODE') {
      isEnabled = true;
      applyQuality(event.data.mode);
    }

    if (event.data.type === 'STUDYTUBE_PAUSE_BACKGROUND') {
      if (!isEnabled) return;
      const player = getPlayer();
      if (player && typeof player.pauseVideo === 'function') {
        player.pauseVideo();
      }
    }
  });

  window.addEventListener('yt-navigate-finish', () => {
    if (isEnabled) {
      setTimeout(() => {
        window.postMessage({ type: 'STUDYTUBE_REQUEST_CURRENT_MODE' }, '*');
      }, 1200);
    }
  });
})();
