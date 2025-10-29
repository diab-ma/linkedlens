# LinkedLens
This project was originally built for Knighthacks 2025 hackathon.
https://devpost.com/software/linkedlens?ref_content=user-portfolio&ref_feature=in_progress

## What it does

linkedlens is a chrome extension to filter slop from your linkedin feed



Posts get classified as either:

**Genuine Value** — Real insights, educational content, and actual discussions

**Bait** — Clickbait, manipulation, low-quality stuff

---

## Installation

### Step 1: Get the files

Download this repository as a ZIP file and extract it to a folder on your computer.

### Step 2: Load it into Chrome

Open Chrome and go to chrome://extensions
Turn on Developer mode 
Click "Load unpacked" and select your linkedlens folder
The extension should now appear in your toolbar

### Step 3: Set up an API key

LinkedLens needs an API key to work. You can pick either of these options:

** A: Google Gemini**
Go to Google AI Studio and create an API key. Then click the LinkedLens icon in your toolbar, go to Settings, select Gemini, paste the key, and click Save.

** B: OpenRouter**

Sign up at OpenRouter, get an API key, then do the same thing but select OpenRouter in the settings.

### Step 4: Start using it

Open LinkedIn and wait a few seconds. LinkedLens will automatically analyze your feed and label the posts

---

## How to use it

### The Dashboard

Click the LinkedLens icon in your toolbar to see the dashboard. You'll get a quick look at your feed stats — how many genuine posts vs engagement bait. You can see which posts got classified and reanalyze anytime you want.

### Controls
Includes:

A toggle the extension on and off if you want to disable it.

A toggle "Auto-hide bait posts" to automatically hide posts labled as bait.

A click "Reanalyze Feed" to run the analysis again.

### Settings

Pick which AI provider you want to use (Gemini or OpenRouter).

Save your API key securely.

If you're using OpenRouter, you can pick which model you want to run.

---

## What counts as what

**Genuine Value**

These are posts that actually have something useful to say:
- Real insights and advice you can actually use
- Content that teaches you something
- Honest stories where you learn a lesson
- News and analysis from your industry
- Specific data and research-backed claims
- Conversations that feel real and thoughtful

**Engagement Bait**

These are posts trying to game the algorithm and waste your time:
- Clickbait headlines like "You won't believe what happens next"
- Posts begging you to comment or tag someone
- Fake humble brags and self-congratulations
- Overly promotional or salesy garbage
- Motivational quotes with zero substance
- Posts that exist just to farm reactions

---

## Troubleshooting

**Extension not working?**

Make sure you're on LinkedIn. Check that you've saved an API key in the settings. Try refreshing the page after you save the key. If you're still stuck, open the browser console (F12) and look for any error messages starting with [LinkedLens].

**No posts showing up?**

Wait a few seconds when you load LinkedIn, it takes a moment to analyze everything. Make sure posts are actually visible on the page. Try scrolling down. If nothing shows, refresh the page.

**Getting API errors?**

Make sure your API key is actually valid and not expired. Check if you've hit your quota on the provider's site. Make sure you picked the right provider in settings. For OpenRouter users, double-check that the model name is spelled correctly.

**Settings aren't saving?**

Check that your browser allows Chrome extensions to use storage. Try opening a new Chrome profile and testing it there. Clear your browser cache and try again.

---

## Privacy

Your API keys live on your device in Chrome's encrypted storage and are not sent anywhere else. The extension does not send your data to any LinkedLens servers (because we don't have any). Only the AI provider you pick gets to see the post content. There's no tracking, analytics, or anything else because I don't care about your linked in.

Everything happens in your browser. Your API keys never end up in logs or source code. Requests to the AI provider are encrypted.

---

## FAQ

**Is this free?**

The extension itself is free. API calls with your API key may or may not be free, depending on what model you use.

**Does this work on other sites?**

No, just LinkedIn right now. Maybe I'll add other sites later.

**How accurate is it?**

Decent, but it's not perfect. AI sometimes gets confused about posts that are kind of in the middle. Use it as a helpful guide, not the final word.

**Do I need to keep developer mode on?**

No, only needed to install the extenion. Turn it off whenever you want after that.

**Can I use a different AI model other than Gemini?**

With OpenRouter you can.

---

## Things to know

API keys don't sync across devices — they stay on the machine you set them up on.

AI classification isn't perfect. Sometimes it gets things wrong. The prompt is not perfect.

LinkedIn changes their site structure pretty often, which will sometimes breaks the extension. I'll try to fix it when that happens.

The first time you load a page, it takes a few seconds analyze everything.

## How it's built

Chrome Extension Manifest V3. Vanilla JavaScript with no frameworks. Works with Google Gemini 2.5 Flash or OpenRouter APIs. Uses Chrome's storage API to keep your settings safe.

## Contributing

Find a bug? Have an idea? Open an issue or send a PR. Open to contributions.

## License

MIT. Use however you want.

## Need help?

Check the troubleshooting section above. Open your browser console (F12) to see detailed logs. Open an issue on GitHub if you need more help.

