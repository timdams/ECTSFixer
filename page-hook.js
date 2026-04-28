(function () {
  if (window.__ECTSFIXER_HOOKED) return;
  window.__ECTSFIXER_HOOKED = true;
  window.__ECTSFIXER_PENDING_NEW_TAB = false;

  const origPushState = history.pushState.bind(history);

  history.pushState = function (state, title, url) {
    if (window.__ECTSFIXER_PENDING_NEW_TAB && url != null) {
      window.__ECTSFIXER_PENDING_NEW_TAB = false;
      try {
        const full = new URL(url, location.origin).toString();
        // Stuur naar het isolated content script — die opent de tab via
        // chrome.tabs.create met active:false zodat de focus hier blijft.
        window.dispatchEvent(new CustomEvent('ECTSFIXER_OPEN_BG_TAB', { detail: { url: full } }));
      } catch (_) {}

      // Laat pushState toch gebeuren zodat Angular Router intern consistent
      // is, en spring direct terug. Een UI-snapshot/restore in content.js
      // herstelt daarna de open accordions en scrollpositie.
      const ret = origPushState(state, title, url);
      Promise.resolve().then(() => {
        try { history.back(); } catch (_) {}
      });
      return ret;
    }
    return origPushState(state, title, url);
  };

  window.addEventListener('ECTSFIXER_PREP_NEW_TAB', () => {
    window.__ECTSFIXER_PENDING_NEW_TAB = true;
    setTimeout(() => { window.__ECTSFIXER_PENDING_NEW_TAB = false; }, 1500);
  });
})();
