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
        window.open(full, '_blank', 'noopener');
      } catch (_) {}

      // Push wel door zodat Angular Router intern consistent blijft,
      // en haal de extra entry direct weer weg via popstate. Angular
      // Router luistert naar popstate en navigeert terug naar de
      // huidige route — dat herstelt ook de view in deze tab.
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
