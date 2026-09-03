// Option-click (Alt-click) on a tweet link opens it in ThreadReader.
(function () {
  const HOSTS = new Set([
    "twitter.com", "www.twitter.com", "mobile.twitter.com",
    "x.com", "www.x.com", "mobile.x.com",
  ]);
  const STATUS_RE = /^\/(?:[A-Za-z0-9_]{1,15}|i\/web)\/status(?:es)?\/\d+/;

  let altClickEnabled = true;
  chrome.storage.sync.get({ altClick: true }, (items) => {
    altClickEnabled = items.altClick;
  });
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "sync" && changes.altClick) {
      altClickEnabled = changes.altClick.newValue;
    }
  });

  function tweetLinkFrom(target) {
    const a = target && target.closest && target.closest("a[href]");
    if (!a) return null;
    let url;
    try {
      url = new URL(a.href, location.href);
    } catch (e) {
      return null;
    }
    if (!HOSTS.has(url.hostname.toLowerCase())) return null;
    if (!STATUS_RE.test(url.pathname)) return null;
    return url.href;
  }

  function onClick(event) {
    if (!altClickEnabled) return;
    if (!event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.button !== 0) return;
    const href = tweetLinkFrom(event.target);
    if (!href) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    chrome.runtime.sendMessage({ type: "open-in-threadreader", url: href });
  }

  // Capture phase so we run before the page's own handlers (e.g. X's SPA router).
  document.addEventListener("click", onClick, true);
})();
