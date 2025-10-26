// store everything we need here
window.linkedLensData = {
  classifications: [],
  stats: { total: 0, bait: 0, genuine: 0 },
  autoHideEnabled: false,
  extensionEnabled: true,
  isProcessing: false,
  error: null
};

// multiple selectors since LinkedIn changes their DOM structure constantly
const POST_SELECTORS = [
  'div[data-id^="urn:li:activity"]',
  'div[data-id^="urn:li:aggregate"]',
  '.feed-shared-update-v2',
  'div.feed-shared-update-v2__description-wrapper'
];


// extract posts from the page
function extractPostsFromDOM() {
  console.log('[LinkedLens] Extracting posts from DOM...');

  const posts = [];
  let postElements = [];

  // try each selector until one matches
  for (const selector of POST_SELECTORS) {
    postElements = document.querySelectorAll(selector);
    if (postElements.length > 0) {
      console.log(`[LinkedLens] Found ${postElements.length} posts using selector: ${selector}`);
      break;
    }
  }

  if (postElements.length === 0) {
    console.warn('[LinkedLens] No posts found on page');
    return posts;
  }

  // limit to first 15 posts to keep API calls reasonable
  const maxPosts = Math.min(15, postElements.length);

  for (let i = 0; i < maxPosts; i++) {
    const postElement = postElements[i];

    // extract the post text
    const textElement = postElement.querySelector('.feed-shared-update-v2__description, .break-words, .feed-shared-text, .feed-shared-text__text-view');
    const text = textElement ? textElement.textContent.trim() : '';

    // extract the author name
    const authorElement = postElement.querySelector('.update-components-actor__name, .feed-shared-actor__name');
    const author = authorElement ? authorElement.textContent.trim() : 'Unknown';

    if (text.length > 0) {
      posts.push({
        id: i,
        author: author,
        text: text.substring(0, 500), // limit text length for API
        element: postElement,
        classification: null
      });
    }
  }

  console.log(`[LinkedLens] Extracted ${posts.length} posts`);
  return posts;
}


// retry logic for network requests
async function retryFetch(url, options, maxRetries = 1) {
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[LinkedLens] Fetch attempt ${attempt + 1}/${maxRetries + 1} to ${url.split('?')[0]}`);
      const response = await fetch(url, options);

      // successful response, return it
      if (response.ok) {
        return response;
      }

      // don't retry on client errors (4xx)
      if (response.status >= 400 && response.status < 500) {
        return response; // let caller handle it
      }

      // retry on server errors (5xx)
      if (response.status >= 500 && attempt < maxRetries) {
        console.warn(`[LinkedLens] Server error ${response.status}, retrying in 1 second...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }

      return response;

    } catch (error) {
      lastError = error;

      if (attempt < maxRetries) {
        console.warn(`[LinkedLens] Network error: ${error.message}, retrying...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  throw lastError;
}


// classify posts using AI API
async function callGeminiAPI(posts) {
  console.log('[LinkedLens] Calling AI API...');

  // retrieve settings from chrome.storage.local
  const result = await new Promise((resolve) => {
    chrome.storage.local.get(['apiProvider', 'geminiApiKey', 'openRouterApiKey', 'openRouterModel'], (result) => {
      resolve(result);
    });
  });

  const provider = result.apiProvider || 'gemini';
  console.log('[LinkedLens] Using provider:', provider);

  // prepare posts for classification (without DOM elements)
  const postsForAPI = posts.map(p => ({
    id: p.id,
    author: p.author,
    text: p.text
  }));

  const prompt = `Classify these LinkedIn posts as either 'engagement_bait' or 'genuine_value'.

Engagement bait includes:
- Clickbait tactics ("You won't believe...", "This one trick...")
- Manipulative engagement prompts ("Agree? Comment below!", "Tag someone who...")
- Humble brags or virtue signaling
- Overly promotional content
- Generic motivational quotes with no substance
- Posts designed solely to generate reactions

Genuine value includes:
- Helpful insights and actionable advice
- Educational content with substance
- Honest personal stories with lessons learned
- Industry news and analysis
- Thoughtful discussions on meaningful topics

Respond with ONLY valid JSON in this exact format (no markdown, no code blocks):
[{ "id": 0, "classification": "engagement_bait" }, { "id": 1, "classification": "genuine_value" }]

Posts to classify:
${JSON.stringify(postsForAPI, null, 2)}`;

  try {
    let response, data, responseText;

    if (provider === 'gemini') {
      // Gemini API
      const GEMINI_API_KEY = result.geminiApiKey;
      if (!GEMINI_API_KEY) {
        throw new Error('Gemini API key not set. Please add your key in the extension popup.');
      }

      const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

      response = await retryFetch(GEMINI_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            role: "user",
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.3,
            topK: 1,
            topP: 1,
            maxOutputTokens: 2048,
          }
        })
      });

      if (!response.ok) {
        // check for rate limit errors
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a moment and try again.');
        }
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }

      data = await response.json();
      console.log('[LinkedLens] Gemini API response:', data);

      // check for quota/resource exhausted errors in response
      if (data.error && data.error.code === 429) {
        throw new Error('Rate limit exceeded. Please wait and try again.');
      }
      if (data.error && data.error.message && data.error.message.includes('RESOURCE_EXHAUSTED')) {
        throw new Error('API quota exceeded. Please try again later.');
      }

      responseText = data.candidates[0].content.parts[0].text;

    } else if (provider === 'openrouter') {
      // OpenRouter API
      const OPENROUTER_API_KEY = result.openRouterApiKey;
      const model = result.openRouterModel || 'anthropic/claude-3-haiku';

      if (!OPENROUTER_API_KEY) {
        throw new Error('OpenRouter API key not set. Please add your key in the extension popup.');
      }

      response = await retryFetch('https://openrouter.ai/api/v1/chat/completions', {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: model,
          messages: [{
            role: "user",
            content: prompt
          }],
          temperature: 0.3,
          max_tokens: 2048
        })
      });

      if (!response.ok) {
        // check for rate limit errors
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a moment and try again.');
        }
        throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
      }

      data = await response.json();
      console.log('[LinkedLens] OpenRouter API response:', data);

      // check for quota/rate limit errors in response
      if (data.error && data.error.status === 429) {
        throw new Error('Rate limit exceeded. Please wait and try again.');
      }
      if (data.error && data.error.message && data.error.message.includes('rate limit')) {
        throw new Error('Rate limit exceeded. Please try again in a few moments.');
      }

      responseText = data.choices[0].message.content;
    }

    // clean up response (remove markdown code blocks if present)
    let cleanedResponse = responseText.trim();
    cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');

    const classifications = JSON.parse(cleanedResponse);
    console.log('[LinkedLens] Classifications:', classifications);

    return classifications;

  } catch (error) {
    console.error('[LinkedLens] Error calling AI API:', error);
    throw error;
  }
}

// add visual labels to posts
function addLabelsToDOM(posts) {
  console.log('[LinkedLens] Adding labels to DOM...');

  posts.forEach(post => {
    if (!post.element || !post.classification) return;

    // check if label already exists
    const existingLabel = post.element.querySelector('.linkedlens-label');
    if (existingLabel) {
      existingLabel.remove();
    }

    // create label
    const label = document.createElement('div');
    label.className = 'linkedlens-label';
    label.style.cssText = `
      display: inline-block;
      padding: 4px 8px;
      margin: 8px 0;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
      font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto;
    `;

    if (post.classification === 'engagement_bait') {
      label.textContent = '🎣 ENGAGEMENT BAIT';
      label.style.backgroundColor = '#fee2e2';
      label.style.color = '#991b1b';
      label.style.border = '1px solid #fca5a5';
    } else {
      label.textContent = '✓ GENUINE VALUE';
      label.style.backgroundColor = '#dcfce7';
      label.style.color = '#166534';
      label.style.border = '1px solid #86efac';
    }

    // insert label at the top of the post
    post.element.insertBefore(label, post.element.firstChild);

    // mark element with data attribute
    post.element.setAttribute('data-linkedlens-classification', post.classification);
  });

  console.log('[LinkedLens] Labels added successfully');
}


// hide or show posts based on auto-hide setting
function togglePostVisibility() {
  const posts = window.linkedLensData.classifications;
  const shouldHide = window.linkedLensData.autoHideEnabled;

  console.log(`[LinkedLens] ${shouldHide ? 'Hiding' : 'Showing'} bait posts...`);

  posts.forEach(post => {
    if (post.classification === 'engagement_bait' && post.element) {
      post.element.style.display = shouldHide ? 'none' : '';
    }
  });
}


// calculate statistics

function calculateStats(posts) {
  const total = posts.length;
  const bait = posts.filter(p => p.classification === 'engagement_bait').length;
  const genuine = posts.filter(p => p.classification === 'genuine_value').length;

  return { total, bait, genuine };
}


// main function to analyze posts
async function analyzePosts() {
  if (window.linkedLensData.isProcessing) {
    console.log('[LinkedLens] Already processing...');
    return;
  }

  window.linkedLensData.isProcessing = true;
  window.linkedLensData.error = null;

  try {
    // extract posts
    const posts = extractPostsFromDOM();

    if (posts.length === 0) {
      console.warn('[LinkedLens] No posts to analyze');
      window.linkedLensData.isProcessing = false;
      return;
    }

    // classify posts
    const classifications = await callGeminiAPI(posts);

    // merge classifications with posts
    classifications.forEach(cls => {
      const post = posts.find(p => p.id === cls.id);
      if (post) {
        post.classification = cls.classification;
      }
    });

    // store in global state
    window.linkedLensData.classifications = posts;
    window.linkedLensData.stats = calculateStats(posts);

    // add labels to DOM
    addLabelsToDOM(posts);

    // apply auto-hide if enabled
    if (window.linkedLensData.autoHideEnabled) {
      togglePostVisibility();
    }

    console.log('[LinkedLens] Analysis complete!', window.linkedLensData.stats);

  } catch (error) {
    console.error('[LinkedLens] Error analyzing posts:', error);
    window.linkedLensData.error = error.message;
  } finally {
    window.linkedLensData.isProcessing = false;
  }
}

/**
 * Listen for messages from popup
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[LinkedLens] Received message:', request);

  if (request.action === 'getClassifications') {
    sendResponse({
      success: true,
      data: window.linkedLensData.classifications.map(p => ({
        id: p.id,
        author: p.author,
        text: p.text.substring(0, 100) + '...',
        classification: p.classification
      })),
      stats: window.linkedLensData.stats,
      autoHideEnabled: window.linkedLensData.autoHideEnabled,
      extensionEnabled: window.linkedLensData.extensionEnabled,
      isProcessing: window.linkedLensData.isProcessing,
      error: window.linkedLensData.error
    });
  }

  if (request.action === 'toggleAutoHide') {
    window.linkedLensData.autoHideEnabled = request.payload.autoHide;
    togglePostVisibility();
    sendResponse({ success: true });
  }

  if (request.action === 'toggleExtension') {
    window.linkedLensData.extensionEnabled = request.payload.enabled;

    // if disabling, show all posts
    if (!request.payload.enabled) {
      window.linkedLensData.classifications.forEach(post => {
        if (post.element) {
          post.element.style.display = '';
        }
      });
    } else if (window.linkedLensData.autoHideEnabled) {
      togglePostVisibility();
    }

    sendResponse({ success: true });
  }

  if (request.action === 'reanalyze') {
    analyzePosts().then(() => {
      sendResponse({ success: true });
    });
    return true; // Keep message channel open for async response
  }

  return true;
});

/**
 * Initialize on page load
 */
function init() {
  console.log('[LinkedLens] Extension loaded on LinkedIn');

  // load persisted settings from chrome.storage.local
  chrome.storage.local.get(['extensionEnabled', 'autoHide'], (result) => {
    // set initial state from storage (use defaults if not found)
    window.linkedLensData.extensionEnabled = result.extensionEnabled !== false; // default to true
    window.linkedLensData.autoHideEnabled = result.autoHide || false; // default to false

    console.log('[LinkedLens] Loaded settings:', {
      extensionEnabled: window.linkedLensData.extensionEnabled,
      autoHideEnabled: window.linkedLensData.autoHideEnabled
    });

    // wait for page to be fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(analyzePosts, 2000); // Wait 2s for LinkedIn to render
      });
    } else {
      setTimeout(analyzePosts, 2000); // Wait 2s for LinkedIn to render
    }
  });
}

// start extension
init();
