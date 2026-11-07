# Open in ThreadReader

A small Chrome extension (Manifest V3, plain JS, no build step) that lowers the friction of reading Twitter/X threads without visiting Twitter: right-click or option-click any tweet link and the thread opens on ThreadReader instead. Built 2026-09-02.

## How it works

- **Right-click any tweet link** (twitter.com or x.com `/status/` URLs) and pick **"Open in ThreadReader"**.
- **Right-click on a tweet page itself** and pick **"Open this tweet in ThreadReader"**.
- **Option-click (Alt-click)** a tweet link to do the same without a menu. Can be turned off in the options.
- Opens `https://threadreaderapp.com/thread/<tweet id>.html` in a **new tab or a new window**, your choice, in the options.

Mechanism:

- `background.js` is the MV3 service worker. On install and on browser startup it registers two context-menu items, one for links (`targetUrlPatterns` limited to tweet URLs on twitter.com / x.com and their `www.` / `mobile.` hosts) and one for pages (`documentUrlPatterns` with the same list), so the menu only appears where it applies. On click it extracts the tweet id and calls `chrome.tabs.create` (with `openerTabId` so the new tab sits next to the source) or `chrome.windows.create`, depending on the `openIn` setting.
- `content.js` runs on every page (`<all_urls>`, at `document_idle`). It listens for clicks in the **capture phase** so it runs before the page's own handlers (e.g. X's SPA router). An Alt-click with no other modifier on a link whose URL matches a tweet pattern is intercepted (`preventDefault` + `stopImmediatePropagation`) and sent to the service worker as an `open-in-threadreader` message. It mirrors the `altClick` setting from `chrome.storage.sync` and updates live via `chrome.storage.onChanged`.
- `tweet-url.js` holds the shared parser: it accepts `/{user}/status/{id}`, `/{user}/statuses/{id}` and `/i/web/status/{id}`, ignores trailing segments like `/photo/1` and any query string, and returns `null` for anything else. It is loaded into the service worker via `importScripts`; the content script carries an equivalent regex inline because content scripts cannot `importScripts`.
- Settings are `{ openIn: "tab" | "window", altClick: true | false }`, defaulting to tab + enabled, stored in `chrome.storage.sync` and edited from `options.html` / `options.js`. Each control saves on change and flashes "Saved".

## Files

| File | Purpose |
|---|---|
| `manifest.json` | MV3 manifest: permissions `contextMenus`, `storage`; service worker; content script; options page; icons. |
| `background.js` | Registers the context menus and opens the ThreadReader page. |
| `content.js` | Listens for option-click on tweet links. |
| `tweet-url.js` | Shared tweet-ID parsing (used by the service worker). |
| `options.html` / `options.js` | Settings UI (stored in `chrome.storage.sync`). |
| `icons/` | 16 / 48 / 128 px extension icons. |
| `test.js` | Node unit test for `tweet-url.js` (no Chrome needed). |
| `README.md` | This file. |

## Runtime locations

- Installed as an **unpacked** extension loaded straight from this folder; Chrome reads the files in place, so edits take effect after clicking the reload icon on `chrome://extensions`.
- Settings: `chrome.storage.sync` under this extension's id (synced with the Chrome profile). No config files on disk.
- Logs: none on disk. Service-worker errors appear under `chrome://extensions` -> **Details** -> **Inspect views: service worker**; content-script errors in the page's DevTools console.

## Common tasks

### Install (unpacked)

1. Open `chrome://extensions`.
2. Turn on **Developer mode** (top right).
3. Click **Load unpacked** and pick this folder.
4. Optional: click **Details -> Extension options** to choose tab vs. window and toggle option-click.

### Test

```sh
cd /Users/elityre/Documents/agent-coding/twitter-link-to-threadreader

# Unit test of the URL parser (13 cases); exits non-zero on failure
node test.js

# Syntax check every script and the manifest
for f in background.js content.js options.js tweet-url.js test.js; do node --check $f; done
python3 -c "import json; json.load(open('manifest.json'))" && echo manifest ok
```

End-to-end check in Chrome: after loading unpacked, right-click `https://x.com/jack/status/20` anywhere on a page and confirm the menu item opens `https://threadreaderapp.com/thread/20.html`; then Alt-click the same link.

### Reload after editing

`chrome://extensions` -> click the circular reload arrow on the "Open in ThreadReader" card. Context menus are re-registered on reload (`onInstalled`).

## Gotchas learned

- `t.co` short links are not resolved, so they won't get the menu item.
- ThreadReader only has a thread if someone has previously "unrolled" it. For a thread that's never been unrolled, ThreadReader shows a prompt to unroll it.
- Content scripts cannot use `importScripts`, so the tweet-URL regex is duplicated in `content.js`; change both places together (`test.js` only covers `tweet-url.js`).
- The option-click handler must be registered in the capture phase; X's own click handling otherwise swallows the event before the extension sees it.
- When testing `tweet-url.js` in Node's `vm`, the sandbox has no `URL` class and every parse silently returns `null`; `test.js` passes `URL` in explicitly.
