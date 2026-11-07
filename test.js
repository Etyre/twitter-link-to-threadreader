// Unit test for tweet-url.js, runnable without Chrome:  node test.js
// Exercises the URL parsing that both the service worker and the context menus rely on.
const vm = require("vm");
const fs = require("fs");
const path = require("path");

const sandbox = { URL };  // the parser uses the WHATWG URL class
sandbox.self = sandbox;
vm.runInNewContext(fs.readFileSync(path.join(__dirname, "tweet-url.js"), "utf8"), sandbox);
const { tweetIdFromUrl, threadReaderUrl } = sandbox.TweetUrl;

const cases = [
  ["https://twitter.com/jack/status/20", "20"],
  ["https://x.com/jack/status/20?s=20&t=abc", "20"],
  ["https://www.x.com/jack/status/20/photo/1", "20"],
  ["https://mobile.twitter.com/jack/statuses/20", "20"],
  ["https://twitter.com/i/web/status/1234567890123456789", "1234567890123456789"],
  ["https://x.com/jack", null],
  ["https://x.com/jack/likes", null],
  ["https://t.co/abcdef", null],
  ["https://example.com/jack/status/20", null],
  ["not a url", null],
  ["", null],
  [null, null],
];

let failed = 0;
for (const [input, expected] of cases) {
  const got = tweetIdFromUrl(input);
  const ok = got === expected;
  if (!ok) failed++;
  console.log(`${ok ? "ok  " : "FAIL"} ${JSON.stringify(input)} -> ${JSON.stringify(got)}${ok ? "" : " (expected " + JSON.stringify(expected) + ")"}`);
}
const tr = threadReaderUrl("20");
const trOk = tr === "https://threadreaderapp.com/thread/20.html";
if (!trOk) failed++;
console.log(`${trOk ? "ok  " : "FAIL"} threadReaderUrl("20") -> ${tr}`);

console.log(failed ? `\n${failed} failure(s)` : "\nall passed");
process.exit(failed ? 1 : 0);
