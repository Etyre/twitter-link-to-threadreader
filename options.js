const DEFAULTS = { openIn: "tab", altClick: true };

function showSaved() {
  const el = document.getElementById("status");
  el.textContent = "Saved";
  clearTimeout(showSaved.timer);
  showSaved.timer = setTimeout(() => (el.textContent = ""), 1200);
}

chrome.storage.sync.get(DEFAULTS, (items) => {
  document.querySelector(`input[name="openIn"][value="${items.openIn}"]`).checked = true;
  document.getElementById("altClick").checked = items.altClick;
});

document.querySelectorAll('input[name="openIn"]').forEach((el) => {
  el.addEventListener("change", () => {
    chrome.storage.sync.set({ openIn: el.value }, showSaved);
  });
});

document.getElementById("altClick").addEventListener("change", (e) => {
  chrome.storage.sync.set({ altClick: e.target.checked }, showSaved);
});
