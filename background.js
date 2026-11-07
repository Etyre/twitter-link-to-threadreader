// Open in ThreadReader: MV3 service worker for the Chrome extension. Registers the
// "Open in ThreadReader" context-menu items (on tweet links and on tweet pages),
// receives option-click messages from content.js, and opens
// https://threadreaderapp.com/thread/<tweet id>.html in a new tab or window.
//
// Settings ({openIn: "tab"|"window", altClick: bool}) live in chrome.storage.sync,
// edited via options.html. There are no files on disk and no log file; errors go to
// the service worker console (chrome://extensions -> Details -> Inspect views).

importScripts("tweet-url.js");

const MENU_LINK = "open-link-in-threadreader";
const MENU_PAGE = "open-page-in-threadreader";

const TWEET_URL_PATTERNS = [
  "*://twitter.com/*/status/*",
  "*://www.twitter.com/*/status/*",
  "*://mobile.twitter.com/*/status/*",
  "*://x.com/*/status/*",
  "*://www.x.com/*/status/*",
  "*://mobile.x.com/*/status/*",
];

const DEFAULT_SETTINGS = { openIn: "tab", altClick: true };

function getSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(DEFAULT_SETTINGS, (items) => resolve(items));
  });
}

async function openInThreadReader(tweetId, openerTabId) {
  const url = TweetUrl.threadReaderUrl(tweetId);
  const { openIn } = await getSettings();
  if (openIn === "window") {
    await chrome.windows.create({ url, focused: true });
  } else {
    const createProps = { url, active: true };
    if (openerTabId !== undefined) createProps.openerTabId = openerTabId;
    await chrome.tabs.create(createProps);
  }
}

function createMenus() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: MENU_LINK,
      title: "Open in ThreadReader",
      contexts: ["link"],
      targetUrlPatterns: TWEET_URL_PATTERNS,
    });
    chrome.contextMenus.create({
      id: MENU_PAGE,
      title: "Open this tweet in ThreadReader",
      contexts: ["page"],
      documentUrlPatterns: TWEET_URL_PATTERNS,
    });
  });
}

chrome.runtime.onInstalled.addListener(createMenus);
chrome.runtime.onStartup.addListener(createMenus);

chrome.contextMenus.onClicked.addListener((info, tab) => {
  const source = info.menuItemId === MENU_LINK ? info.linkUrl : info.pageUrl;
  const tweetId = TweetUrl.tweetIdFromUrl(source);
  if (tweetId) openInThreadReader(tweetId, tab && tab.id);
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg && msg.type === "open-in-threadreader") {
    const tweetId = TweetUrl.tweetIdFromUrl(msg.url);
    if (tweetId) {
      openInThreadReader(tweetId, sender.tab && sender.tab.id).then(
        () => sendResponse({ ok: true }),
        (err) => sendResponse({ ok: false, error: String(err) })
      );
      return true; // keep the channel open for the async response
    }
    sendResponse({ ok: false, error: "not a tweet url" });
  }
});
