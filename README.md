# 🔍 LinkedLens

**A Chrome extension that automatically analyzes LinkedIn feeds to classify posts into three categories: "engagement bait," "genuine value," and "neutral."**

Built for Knight Hacks VIII (UCF, Oct 24-26, 2025)

---

## Features

✅ Automatic post extraction from LinkedIn feed
✅ AI-powered classification using **Gemini** or **OpenRouter** APIs
✅ **Three-category classification**: Genuine Value, Neutral, Engagement Bait
✅ Visual labels on posts with confidence scores and reasons
✅ **Infinite scroll support**: Continuously analyzes new posts as you scroll
✅ Dashboard with three-way statistics breakdown and percentage bar
✅ Auto-hide engagement bait posts with live toggling
✅ One-click reanalysis
✅ **Secure API key storage** (chrome.storage.local)
✅ **Multi-provider support** (Gemini & OpenRouter)
✅ **Persistent settings** across browser sessions
✅ **Improved error handling** with popup notifications and rate limit detection
✅ **Automatic retry logic** for network errors
✅ **Processing status indicator** during analysis

---

## Setup Instructions

### 1. Get an API Key

Choose one of the following providers:

#### Option A: Google Gemini (Free)
1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key

#### Option B: OpenRouter (Paid)
1. Go to [OpenRouter](https://openrouter.ai/)
2. Sign up for an account
3. Navigate to [API Keys](https://openrouter.ai/keys)
4. Create a new API key
5. Copy the API key (starts with `sk-or-`)

### 2. Load Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right corner)
3. Click **Load unpacked**
4. Select the `linkedlens` folder (this directory)
5. The extension should now appear in your extensions list

### 3. Configure API Key

1. Click the LinkedLens extension icon in Chrome toolbar
2. In the popup, go to **Settings**
3. Select your API provider (Gemini or OpenRouter)
4. Enter your API key:
   - **Gemini**: Paste your Gemini API key
   - **OpenRouter**: Paste your OpenRouter API key and optionally specify a model (e.g., `anthropic/claude-3-haiku`)
5. Click **Save Key**
6. You'll see "Saved! Please refresh LinkedIn page."

### 4. Add Icons (Optional)

The extension works without custom icons, but if you want to add them:

1. Create or download 3 icon files (16x16, 48x48, 128x128 pixels)
2. Name them: `icon16.png`, `icon48.png`, `icon128.png`
3. Place them in the `icons/` folder
4. See `icons/README.md` for icon creation tips

Alternatively, remove icon references from `manifest.json`:
- Comment out or delete the `"default_icon"` and `"icons"` sections

---

## Usage

### First Time

1. **Configure API key** (see Setup step 3 above)
2. Open [LinkedIn](https://www.linkedin.com)
3. Wait for the feed to load (~2-3 seconds)
4. The extension will automatically analyze visible posts
5. Posts will be labeled with visual indicators:
   - **✓ GENUINE VALUE** (green) - Helpful, educational, or insightful content
   - **🎣 ENGAGEMENT BAIT** (red) - Clickbait or manipulative content
   - **◉ NEUTRAL** (gray) - Announcements, job postings, etc.
6. As you scroll, new posts are automatically analyzed

### Opening the Dashboard

1. Click the LinkedLens extension icon in Chrome toolbar
2. View statistics and classified posts
3. Toggle "Auto-hide bait posts" to filter your feed
4. Click "Reanalyze Feed" to re-classify posts

### Controls

- **Extension ON/OFF**: Enable or disable the extension
- **Auto-hide bait posts**: Automatically hide posts classified as engagement bait
- **Reanalyze Feed**: Re-run classification on current posts
- **API Provider**: Switch between Gemini and OpenRouter
- **API Settings**: Manage API keys securely

---

## How It Works

1. **Content Script** (`content.js`) runs automatically on LinkedIn
2. **Extracts** posts from the DOM using multiple fallback selectors
3. **Monitors** the feed with MutationObserver for new posts as you scroll (infinite scroll support)
4. **Retrieves** API provider and key from secure Chrome storage
5. **Batches** posts and sends to your chosen provider API
6. **AI classifies** each post into three categories: `genuine_value`, `neutral`, or `engagement_bait`
7. **Includes** confidence scores (0.0-1.0) and AI-generated reasoning for each classification
8. **Adds visual labels** to posts with corresponding styling
9. **Popup dashboard** shows three-way statistics with percentage breakdown
10. **Auto-hide** feature can automatically hide engagement bait posts
11. **Settings persist** across browser sessions via chrome.storage.local

---

## File Structure

```
linkedlens/
├── manifest.json          # Extension configuration (Manifest V3)
├── content.js             # Main logic (runs on LinkedIn)
├── popup.html             # Dashboard UI with settings
├── popup.js               # Dashboard logic and API management
├── popup.css              # Dashboard styles
├── icons/                 # Extension icons
│   └── README.md          # Icon instructions
├── CLAUDE.md              # Project architecture/instructions
└── README.md              # This file
```

---

## Classification Criteria

### Genuine Value (✓)
- Helpful insights and actionable advice
- Educational content with substance
- Honest personal stories with lessons learned
- Industry news and analysis
- Thoughtful discussions on meaningful topics
- Specific, data-backed insights

### Engagement Bait (🎣)
- Clickbait headlines ("You won't believe...", "This one trick...")
- Manipulative engagement prompts ("Agree? Comment below!", "Tag someone who...")
- Humble brags or virtue signaling
- Overly promotional content
- Generic motivational quotes with no substance
- Posts designed solely for reactions and engagement

### Neutral (◉)
- Job postings and career announcements
- Company news and announcements
- Personal milestone celebrations
- Simple questions asking for help
- Basic information sharing (no editorial slant)

---

## API Provider Details

### Gemini API
- **Model**: `gemini-2.0-flash` (stable)
- **Cost**: Free tier available
- **Speed**: Very fast
- **Setup**: Simple API key from Google AI Studio
- **Note**: Currently using the stable `gemini-2.0-flash` model for reliability

### OpenRouter API
- **Models**: Configurable (default: `anthropic/claude-3-haiku`)
- **Cost**: Pay-per-use (varies by model)
- **Speed**: Varies by model
- **Setup**: API key from OpenRouter + model selection

Both providers use the same classification prompt and produce identical results.

---

## Troubleshooting

### Extension not working?

1. **Check you're on LinkedIn**: The extension only works on `linkedin.com`
2. **Configure API key**: Open popup → Settings → Enter API key → Save
3. **Refresh the page**: After saving API key, refresh LinkedIn
4. **Check console**: Open DevTools (F12) → Console tab → Look for `[LinkedLens]` messages
5. **Check popup for errors**: Extension shows errors in popup instead of browser alerts

### No posts detected?

1. **Wait for page load**: LinkedIn's feed takes a moment to render
2. **Scroll down**: Make sure posts are visible on the page
3. **Check console**: Look for `[LinkedLens] Found X posts using selector` messages
4. **Check selectors**: LinkedIn may have updated their DOM structure
   - Open DevTools → Inspect a post element
   - Update selectors in `content.js` if needed

### API errors?

1. **Check API key**: Make sure it's valid and saved in extension settings
2. **Check provider selection**: Verify you selected the correct provider
3. **Check quota**: Free tier has rate limits (check provider dashboard)
4. **Check network**: Open DevTools → Network tab → Look for failed requests
5. **OpenRouter users**: Verify model name is correct

### Posts not labeled?

1. **Check popup for errors**: Errors now display in the popup UI
2. **Check console**: Look for `[LinkedLens]` errors in DevTools console
3. **Reanalyze**: Click "Reanalyze Feed" in the popup
4. **Check classification**: API may have returned unexpected format

### Settings not saving?

1. **Check permissions**: Extension needs `storage` permission (already in manifest)
2. **Check console**: Look for storage errors
3. **Try different browser**: Test in fresh Chrome profile

---

## Development Notes

### Testing Locally

1. Make changes to any file
2. Go to `chrome://extensions/`
3. Click the **refresh icon** on LinkedLens card
4. Refresh LinkedIn page
5. Test changes

### LinkedIn DOM Selectors

LinkedIn's DOM structure may change. Current selectors in `content.js`:

```javascript
const POST_SELECTORS = [
  'div[data-id^="urn:li:activity"]',
  'div[data-id^="urn:li:aggregate"]',
  '.feed-shared-update-v2',
  'div.feed-shared-update-v2__description-wrapper'
];
```

If posts aren't detected:
1. Open LinkedIn in Chrome
2. Right-click on a post → Inspect
3. Find the parent container element
4. Update `POST_SELECTORS` array in `content.js`

### API Call Optimization

- Only **1 API call** per page load (batched)
- Analyzes **first 10-15 posts** only
- Does **not** re-analyze on scroll
- Keeps API costs minimal (~1-2 calls per session)

### Storage Keys

The extension uses `chrome.storage.local` with these keys:
- `apiProvider`: Selected provider ('gemini' or 'openrouter')
- `geminiApiKey`: Gemini API key
- `openRouterApiKey`: OpenRouter API key
- `openRouterModel`: OpenRouter model name
- `extensionEnabled`: Extension on/off state
- `autoHide`: Auto-hide bait posts setting

---

## Recent Updates

### v1.2 (Latest - Final Polish)
✅ **Three-category classification** (Genuine Value, Neutral, Engagement Bait)
✅ **Infinite scroll support** with MutationObserver
✅ **Live auto-hide toggling** without page refresh
✅ **Confidence scores and reasoning** from AI for each classification
✅ **Retry logic** with 1-second delay for network errors
✅ **Rate limit detection** for both Gemini and OpenRouter APIs
✅ **Processing status indicator** during analysis
✅ **Enhanced empty state messages** with setup guidance
✅ **Icon references removed** from manifest (uses default Chrome icon)
✅ Model standardized to `gemini-2.0-flash` (stable release)

### v1.1 (Multi-Provider)
✅ Multi-provider support (Gemini + OpenRouter)
✅ Secure API key storage in chrome.storage.local
✅ Persistent toggle settings across sessions
✅ Improved error handling (popup notifications)
✅ Enhanced LinkedIn post selectors for better detection
✅ Provider-specific configuration UI

### v1.0 (Initial)
✅ Basic post classification
✅ Visual labels on posts
✅ Dashboard with statistics
✅ Auto-hide functionality

---

## Known Limitations

- API keys stored locally in Chrome (secure but not synced across devices)
- Classifications are AI-based and may occasionally be inaccurate
- LinkedIn's DOM structure changes may require selector updates
- First load may take 1-2 seconds for posts to be analyzed and labeled

---

## Future Improvements (v2)

- ❌ Sync settings across devices (chrome.storage.sync)
- ❌ Scroll detection for continuous analysis
- ❌ Manual post flagging/feedback
- ❌ Custom classification criteria
- ❌ Training system to improve accuracy
- ❌ Advanced settings and preferences
- ❌ Performance optimizations
- ❌ Export classified posts

---

## Tech Stack

- **Chrome Extension Manifest V3**
- **Vanilla JavaScript** (no frameworks)
- **AI Providers**:
  - Google Gemini 2.0 Flash API
  - OpenRouter API (multi-model support)
- **Chrome APIs**: `runtime`, `tabs`, `scripting`, `storage`
- **Storage**: `chrome.storage.local` for secure key management

---

## Security & Privacy

- API keys stored locally using Chrome's encrypted storage
- No data sent to third parties (only to your chosen AI provider)
- No tracking or analytics
- All processing happens locally in your browser
- API keys never exposed in source code

---

## Demo for DevPost

### Screenshots Needed

1. LinkedIn feed with labeled posts
2. Extension popup dashboard with stats
3. Settings panel with API provider selection
4. Auto-hide feature in action
5. Before/after comparison

### Video Demo Steps

1. Open LinkedIn (show feed)
2. Extension automatically labels posts
3. Click extension icon → show dashboard
4. Explain stats and breakdown
5. Show settings → API provider selection
6. Toggle auto-hide → show bait posts disappearing
7. Click reanalyze → show it working
8. Explain value proposition

---

## License

MIT License - Built for educational purposes (hackathon project)

---

## Credits

Built solo with Claude Code assistance for Knight Hacks VIII
UCF - October 24-26, 2025

---

## Questions?

For issues or questions during the hackathon, check:
1. Extension popup (errors display there now)
2. Console logs (`[LinkedLens]` prefix)
3. Chrome Extensions page (`chrome://extensions/`)
4. This README troubleshooting section

Good luck! 🚀
