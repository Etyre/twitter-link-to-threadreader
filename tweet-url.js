// Shared helper: extract a tweet ID from a Twitter/X URL, or return null.
// Works in both the service worker (importScripts) and content scripts.
(function (root) {
  const HOSTS = new Set([
    "twitter.com",
    "www.twitter.com",
    "mobile.twitter.com",
    "x.com",
    "www.x.com",
    "mobile.x.com",
  ]);

  function tweetIdFromUrl(rawUrl) {
    if (!rawUrl) return null;
    let url;
    try {
      url = new URL(rawUrl);
    } catch (e) {
      return null;
    }
    if (!HOSTS.has(url.hostname.toLowerCase())) return null;
    // Matches /{user}/status/{id} and /i/web/status/{id}, ignoring trailing
    // segments like /photo/1 and any query string.
    const m = url.pathname.match(/^\/(?:[A-Za-z0-9_]{1,15}|i\/web)\/status(?:es)?\/(\d+)/);
    return m ? m[1] : null;
  }

  function threadReaderUrl(tweetId) {
    return `https://threadreaderapp.com/thread/${tweetId}.html`;
  }

  root.TweetUrl = { tweetIdFromUrl, threadReaderUrl };
})(typeof self !== "undefined" ? self : this);
