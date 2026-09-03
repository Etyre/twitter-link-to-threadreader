# Open in ThreadReader

A small Chrome extension that lowers the friction of reading Twitter/X threads
without visiting Twitter.

## What it does

- **Right-click any tweet link** (twitter.com or x.com `/status/` URLs) and pick
  **"Open in ThreadReader"**.
- **Right-click on a tweet page itself** and pick **"Open this tweet in ThreadReader"**.
- **Option-click (Alt-click)** a tweet link to do the same without a menu.
  Can be turned off in the options.
- Opens `https://threadreaderapp.com/thread/<tweet id>.html` in a **new tab or a
  new window**, your choice, in the options.

## Install (unpacked)

1. Open `chrome://extensions`.
2. Turn on **Developer mode** (top right).
3. Click **Load unpacked** and pick this folder.
4. Optional: click **Details → Extension options** to choose tab vs. window and
   toggle option-click.

## Files

- `manifest.json` – MV3 manifest.
- `background.js` – registers the context menus and opens the ThreadReader page.
- `content.js` – listens for option-click on tweet links.
- `tweet-url.js` – shared tweet-ID parsing (used by the service worker).
- `options.html` / `options.js` – settings UI (stored in `chrome.storage.sync`).

## Notes

- `t.co` short links are not resolved, so they won't get the menu item.
- ThreadReader only has a thread if someone has previously "unrolled" it. For a
  thread that's never been unrolled, ThreadReader shows a prompt to unroll it.
