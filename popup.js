// linkedLens popup script
// handles UI interaction and communication with content script

let currentData = null;

/**
 * Send message to content script
 */
function sendMessageToContentScript(message, callback) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length === 0) {
      console.error('[LinkedLens] No active tab found');
      showError('No active tab found. Please open LinkedIn first.');
      return;
    }

    const tab = tabs[0];

    // check if we're on LinkedIn
    if (!tab.url || !tab.url.includes('linkedin.com')) {
      showError('Please navigate to LinkedIn to use this extension.');
      return;
    }

    chrome.tabs.sendMessage(tab.id, message, (response) => {
      if (chrome.runtime.lastError) {
        console.error('[LinkedLens] Message error:', chrome.runtime.lastError);
        showError('Extension not responding. Please refresh the LinkedIn page.');
        return;
      }

      if (callback) callback(response);
    });
  });
}

/**
 * Display dashboard with stats
 */
function displayDashboard(data, stats) {
  const statsContainer = document.getElementById('statsContainer');
  const statsBreakdown = document.getElementById('statsBreakdown');
  const percentageBar = document.getElementById('percentageBar');
  const genuineCount = document.getElementById('genuineCount');
  const baitCount = document.getElementById('baitCount');
  const genuinePercent = document.getElementById('genuinePercent');
  const baitPercent = document.getElementById('baitPercent');
  const barGenuine = document.getElementById('barGenuine');
  const barBait = document.getElementById('barBait');

  if (!stats || stats.total === 0) {
    statsContainer.innerHTML = `
      <p class="empty-state">
        <strong>No posts analyzed yet</strong><br><br>
        To get started:<br>
        1. Visit your LinkedIn feed<br>
        2. Scroll down to load posts<br>
        3. The extension will automatically analyze them<br><br>
        Having trouble? Try clicking "Refresh LinkedIn" or refreshing the page.
      </p>
    `;
    statsBreakdown.style.display = 'none';
    percentageBar.style.display = 'none';
    return;
  }

  // hide loading, show stats
  statsContainer.innerHTML = '';
  statsBreakdown.style.display = 'flex';
  percentageBar.style.display = 'block';

  // update counts
  genuineCount.textContent = stats.genuine;
  baitCount.textContent = stats.bait;

  // calculate percentages
  const genuinePercentValue = stats.total > 0 ? Math.round((stats.genuine / stats.total) * 100) : 0;
  const baitPercentValue = stats.total > 0 ? Math.round((stats.bait / stats.total) * 100) : 0;

  genuinePercent.textContent = `${genuinePercentValue}% Genuine`;
  baitPercent.textContent = `${baitPercentValue}% Bait`;

  // update progress bar
  barGenuine.style.width = `${genuinePercentValue}%`;
  barBait.style.width = `${baitPercentValue}%`;

  // display post list
  displayPostList(data);
}

/**
 * Display list of classified posts
 */
function displayPostList(data) {
  const postListContainer = document.getElementById('postListContainer');

  if (!data || data.length === 0) {
    postListContainer.innerHTML = '<p class="empty-state">No posts to display</p>';
    return;
  }

  postListContainer.innerHTML = '';

  data.forEach(post => {
    const postItem = document.createElement('div');
    postItem.className = `post-item ${post.classification}`;

    const badge = post.classification === 'engagement_bait'
      ? '<span class="badge bait">🎣 Bait</span>'
      : '<span class="badge genuine">✓ Genuine</span>';

    postItem.innerHTML = `
      <div class="post-header">
        <strong>${escapeHtml(post.author)}</strong>
        ${badge}
      </div>
      <div class="post-text">${escapeHtml(post.text)}</div>
    `;

    postListContainer.appendChild(postItem);
  });
}

/**
 * Show error message
 */
function showError(message) {
  const statsContainer = document.getElementById('statsContainer');
  statsContainer.innerHTML = `<p class="error">${message}</p>`;

  const statsBreakdown = document.getElementById('statsBreakdown');
  const percentageBar = document.getElementById('percentageBar');
  statsBreakdown.style.display = 'none';
  percentageBar.style.display = 'none';
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Load data from content script
 */
function loadData() {
  // first, load toggle states from chrome.storage.local
  chrome.storage.local.get(['extensionEnabled', 'autoHide'], (result) => {
    const autoHideToggle = document.getElementById('autoHideToggle');
    const extensionToggle = document.getElementById('extensionToggle');

    // set toggle states from storage (use defaults if not found)
    extensionToggle.checked = result.extensionEnabled !== false; // default to true
    autoHideToggle.checked = result.autoHide || false; // default to false

    // then load classification data from content script
    sendMessageToContentScript({ action: 'getClassifications' }, (response) => {
      if (response && response.success) {
        // check if still processing
        if (response.isProcessing) {
          const statsContainer = document.getElementById('statsContainer');
          statsContainer.innerHTML = '<p class="loading">⏳ Analyzing feed... Please wait a moment.</p>';
          const statsBreakdown = document.getElementById('statsBreakdown');
          const percentageBar = document.getElementById('percentageBar');
          statsBreakdown.style.display = 'none';
          percentageBar.style.display = 'none';
          return;
        }

        // check if there's an error from the content script
        if (response.error) {
          showError(response.error);
          return;
        }

        currentData = response;
        displayDashboard(response.data, response.stats);
      } else {
        showError('Failed to load data from extension');
      }
    });
  });
}

/**
 * Handle extension toggle
 */
function handleExtensionToggle() {
  const extensionToggle = document.getElementById('extensionToggle');
  const enabled = extensionToggle.checked;

  // save to chrome.storage.local
  chrome.storage.local.set({ extensionEnabled: enabled }, () => {
    if (chrome.runtime.lastError) {
      console.error('[LinkedLens] Error saving extensionEnabled:', chrome.runtime.lastError);
      return;
    }

    sendMessageToContentScript({
      action: 'toggleExtension',
      payload: { enabled: enabled }
    }, (response) => {
      if (response && response.success) {
        console.log('[LinkedLens] Extension toggled:', enabled);
      }
    });
  });
}

/**
 * Handle auto-hide toggle
 */
function handleAutoHideToggle() {
  const autoHideToggle = document.getElementById('autoHideToggle');
  const autoHide = autoHideToggle.checked;

  // save to chrome.storage.local
  chrome.storage.local.set({ autoHide: autoHide }, () => {
    if (chrome.runtime.lastError) {
      console.error('[LinkedLens] Error saving autoHide:', chrome.runtime.lastError);
      return;
    }

    sendMessageToContentScript({
      action: 'toggleAutoHide',
      payload: { autoHide: autoHide }
    }, (response) => {
      if (response && response.success) {
        console.log('[LinkedLens] Auto-hide toggled:', autoHide);
      }
    });
  });
}

/**
 * Handle reanalyze button
 */
function handleReanalyze() {
  const reanalyzeBtn = document.getElementById('reanalyzeBtn');
  const statsContainer = document.getElementById('statsContainer');

  // show loading state
  statsContainer.innerHTML = '<p class="loading">Reanalyzing feed... This may take a moment.</p>';
  reanalyzeBtn.disabled = true;
  reanalyzeBtn.textContent = '⏳ Analyzing...';

  sendMessageToContentScript({ action: 'reanalyze' }, (response) => {
    if (response && response.success) {
      // reload data after analysis
      setTimeout(() => {
        loadData();
        reanalyzeBtn.disabled = false;
        reanalyzeBtn.textContent = '🔄 Reanalyze Feed';
      }, 1000);
    } else {
      showError('Failed to reanalyze feed');
      reanalyzeBtn.disabled = false;
      reanalyzeBtn.textContent = '🔄 Reanalyze Feed';
    }
  });
}

/**
 * Handle API provider selection change
 */
function handleProviderChange() {
  const provider = document.getElementById('apiProviderSelect').value;
  const geminiSettings = document.getElementById('geminiSettings');
  const openRouterSettings = document.getElementById('openRouterSettings');

  // save provider selection
  chrome.storage.local.set({ apiProvider: provider });

  // show/hide appropriate settings
  if (provider === 'gemini') {
    geminiSettings.style.display = 'block';
    openRouterSettings.style.display = 'none';
  } else {
    geminiSettings.style.display = 'none';
    openRouterSettings.style.display = 'block';
  }
}

/**
 * Load saved API keys and settings
 */
function loadApiSettings() {
  chrome.storage.local.get(['apiProvider', 'geminiApiKey', 'openRouterApiKey', 'openRouterModel'], (result) => {
    // load provider selection
    const providerSelect = document.getElementById('apiProviderSelect');
    if (result.apiProvider) {
      providerSelect.value = result.apiProvider;
      handleProviderChange();
    }

    // load Gemini API key
    if (result.geminiApiKey) {
      const geminiInput = document.getElementById('geminiApiKeyInput');
      const maskedKey = result.geminiApiKey.substring(0, 4) + '*'.repeat(Math.max(0, result.geminiApiKey.length - 8)) + result.geminiApiKey.substring(result.geminiApiKey.length - 4);
      geminiInput.value = maskedKey;
      geminiInput.setAttribute('data-saved', 'true');

      const saveStatus = document.getElementById('saveGeminiStatus');
      saveStatus.textContent = 'API key is set';
      saveStatus.style.color = '#166534';
    }

    // load OpenRouter API key
    if (result.openRouterApiKey) {
      const openRouterInput = document.getElementById('openRouterApiKeyInput');
      const maskedKey = result.openRouterApiKey.substring(0, 6) + '*'.repeat(Math.max(0, result.openRouterApiKey.length - 10)) + result.openRouterApiKey.substring(result.openRouterApiKey.length - 4);
      openRouterInput.value = maskedKey;
      openRouterInput.setAttribute('data-saved', 'true');

      const saveStatus = document.getElementById('saveOpenRouterStatus');
      saveStatus.textContent = 'API key is set';
      saveStatus.style.color = '#166534';
    }

    // load OpenRouter model
    if (result.openRouterModel) {
      document.getElementById('openRouterModelInput').value = result.openRouterModel;
    }
  });
}

/**
 * Save Gemini API key
 */
function handleSaveGeminiKey() {
  const apiKeyInput = document.getElementById('geminiApiKeyInput');
  const saveStatus = document.getElementById('saveGeminiStatus');
  const apiKey = apiKeyInput.value.trim();

  if (!apiKey) {
    saveStatus.textContent = 'Please enter an API key';
    saveStatus.style.color = '#991b1b';
    return;
  }

  chrome.storage.local.set({ geminiApiKey: apiKey }, () => {
    if (chrome.runtime.lastError) {
      saveStatus.textContent = 'Error: ' + chrome.runtime.lastError.message;
      saveStatus.style.color = '#991b1b';
    } else {
      saveStatus.textContent = 'Saved! Please refresh LinkedIn page.';
      saveStatus.style.color = '#166534';
      apiKeyInput.setAttribute('data-saved', 'true');

      setTimeout(() => { saveStatus.textContent = ''; }, 3000);
    }
  });
}

/**
 * Save OpenRouter API key and model
 */
function handleSaveOpenRouterKey() {
  const apiKeyInput = document.getElementById('openRouterApiKeyInput');
  const modelInput = document.getElementById('openRouterModelInput');
  const saveStatus = document.getElementById('saveOpenRouterStatus');
  const apiKey = apiKeyInput.value.trim();
  const model = modelInput.value.trim();

  if (!apiKey) {
    saveStatus.textContent = 'Please enter an API key';
    saveStatus.style.color = '#991b1b';
    return;
  }

  chrome.storage.local.set({ openRouterApiKey: apiKey, openRouterModel: model }, () => {
    if (chrome.runtime.lastError) {
      saveStatus.textContent = 'Error: ' + chrome.runtime.lastError.message;
      saveStatus.style.color = '#991b1b';
    } else {
      saveStatus.textContent = 'Saved! Please refresh LinkedIn page.';
      saveStatus.style.color = '#166534';
      apiKeyInput.setAttribute('data-saved', 'true');

      setTimeout(() => { saveStatus.textContent = ''; }, 3000);
    }
  });
}

/**
 * Initialize popup
 */
function init() {
  console.log('[LinkedLens] Popup opened');

  // show initial loading message
  const statsContainer = document.getElementById('statsContainer');
  statsContainer.innerHTML = '<p class="loading">🔍 Loading your feed analysis...</p>';

  // load saved API settings
  loadApiSettings();

  // load data from content script
  loadData();

  // set up event listeners
  const extensionToggle = document.getElementById('extensionToggle');
  const autoHideToggle = document.getElementById('autoHideToggle');
  const reanalyzeBtn = document.getElementById('reanalyzeBtn');
  const apiProviderSelect = document.getElementById('apiProviderSelect');
  const saveGeminiKeyBtn = document.getElementById('saveGeminiKeyBtn');
  const saveOpenRouterKeyBtn = document.getElementById('saveOpenRouterKeyBtn');

  extensionToggle.addEventListener('change', handleExtensionToggle);
  autoHideToggle.addEventListener('change', handleAutoHideToggle);
  reanalyzeBtn.addEventListener('click', handleReanalyze);
  apiProviderSelect.addEventListener('change', handleProviderChange);
  saveGeminiKeyBtn.addEventListener('click', handleSaveGeminiKey);
  saveOpenRouterKeyBtn.addEventListener('click', handleSaveOpenRouterKey);
}

// fire it up when the html is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
