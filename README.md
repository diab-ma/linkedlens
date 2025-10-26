# LinkedLens

A Chrome extension that analyzes your LinkedIn feed and automatically tells you which posts are worth reading and which ones are just clickbait noise.

Tired of wading through engagement bait? LinkedLens uses AI to filter your feed so you can focus on posts that actually matter.

## What it does

LinkedLens looks at every post on your LinkedIn feed and sorts them into two buckets: posts that are actually valuable, and posts that are just trying to get engagement. It labels them for you and can hide the junk if you want.

Posts get classified as either:

**Genuine Value** — Real insights, educational content, and actual discussions

**Engagement Bait** — Clickbait, manipulation, and low-quality stuff

## Features

Automatic analysis — Posts get labeled as soon as they appear on your feed.

Smart filtering — Hide engagement bait with a toggle to clean up your feed.

Dashboard — See stats and a breakdown of what's on your feed right now.

One-click reanalysis — Re-run the analysis whenever you want.

Multiple AI options — Works with either Google Gemini (free) or OpenRouter (pay-per-use).

Privacy focused — Your API keys stay on your device. No tracking, no data collection.

Remembers your settings — Your preferences stick around between sessions.

---

## Installation

### Step 1: Get the files

Download this repository as a ZIP file and extract it to a folder on your computer.

### Step 2: Load it into Chrome

Open Chrome and go to chrome://extensions/. Turn on Developer mode (toggle in the top-right corner). Click "Load unpacked" and select the linkedlens folder. The extension should now appear in your toolbar.

### Step 3: Set up an API key

LinkedLens needs an API key to work. You can pick either of these options:

**Option A: Google Gemini**

Go to Google AI Studio and create an API key. Then click the LinkedLens icon in your toolbar, go to Settings, select Gemini, paste the key, and click Save.

**Option B: OpenRouter**

Sign up at OpenRouter, get an API key, then do the same thing but select OpenRouter in the settings.

### Step 4: Start using it

Open LinkedIn and wait a few seconds. LinkedLens will automatically analyze your feed and label the posts. That's it.

---

## How to use it

### The Dashboard

Click the LinkedLens icon in your toolbar to see the dashboard. You'll get a quick look at your feed stats — how many genuine posts vs engagement bait. You can see which posts got classified and reanalyze anytime you want.

### Controls

Toggle the extension on and off if you want to disable it.

Toggle "Auto-hide bait posts" to automatically hide the junk.

Click "Reanalyze Feed" to run the analysis again.

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

## AI providers

You need to pick one to use LinkedLens. Both work the same way classification-wise, so it just comes down to what you prefer.

**Google Gemini**

Free tier available. Fast. Simple to set up. Get an API key from Google and you're done. Best if you don't want to pay anything.

**OpenRouter**

Pay-per-use, so you'll be charged based on what you use. You can pick which AI model you want to run. Best if you want more flexibility or want to try different models.

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

Your API keys live on your device in Chrome's encrypted storage — they're not sent anywhere else. The extension doesn't send your data to any LinkedLens servers (we don't have any). Only the AI provider you pick gets to see the post content. There's no tracking, analytics, or any of that stuff.

Everything happens in your browser. Your API keys never end up in logs or source code. Requests to the AI provider are encrypted.

---

## FAQ

**Is this free?**

The extension itself is free. Google Gemini's free tier is free (with limits). OpenRouter you have to pay for.

**Does this work on other sites?**

Nope, just LinkedIn right now. Maybe we'll add other sites later.

**How accurate is it?**

Pretty good, but it's not perfect. AI sometimes gets confused about posts that are kind of in the middle. Use it as a helpful guide, not the final word.

**Do I need to keep developer mode on?**

No. You only need it to install the thing. Turn it off whenever you want after that.

**Can I use a different AI model?**

With OpenRouter you can. Otherwise you get what the provider offers.

---

## Things to know

API keys don't sync across devices — they stay on the machine you set them up on.

AI classification isn't perfect. Sometimes it gets things wrong.

LinkedIn changes their site structure pretty often, which sometimes breaks the extension. We'll fix it when that happens.

The first time you load a page, it takes a second or two to analyze everything.

## How it's built

Chrome Extension Manifest V3. Vanilla JavaScript with no frameworks. Works with Google Gemini 2.0 Flash or OpenRouter APIs. Uses Chrome's storage API to keep your settings safe.

## Contributing

Find a bug? Have an idea? Open an issue or send a PR. We're open to contributions.

## License

MIT. Use it however you want.

## Need help?

Check the troubleshooting section above. Open your browser console (F12) to see detailed logs. Open an issue on GitHub if you need more help.

Made to help you take back your LinkedIn feed.