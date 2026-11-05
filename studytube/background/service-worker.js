// StudyTube - Background Service Worker (Manifest V3)

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get([
    'enabled',
    'mode',
    'blockWaste',
    'pauseInBackground',
    'audioFirst',
    'totalSavedMb',
    'totalConsumedMb'
  ], (result) => {
    const defaults = {
      enabled: true,
      mode: 'board', // 720p board mode default for sharp text
      blockWaste: true,
      pauseInBackground: true,
      audioFirst: false,
      totalSavedMb: result.totalSavedMb || 0,
      totalConsumedMb: result.totalConsumedMb || 0
    };

    chrome.storage.local.set(defaults, () => {
      console.log('[StudyTube] Installed with default configuration:', defaults);
    });
  });
});

// Relay messages if needed between popup and content tabs
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'DATA_SAVED_UPDATE') {
    chrome.storage.local.get(['totalSavedMb', 'totalConsumedMb'], (res) => {
      const newSaved = (res.totalSavedMb || 0) + (request.savedMb || 0);
      const newConsumed = (res.totalConsumedMb || 0) + (request.consumedMb || 0);
      chrome.storage.local.set({
        totalSavedMb: Math.round(newSaved * 10) / 10,
        totalConsumedMb: Math.round(newConsumed * 10) / 10
      });
    });
    sendResponse({ status: 'ok' });
  }
  return true;
});

