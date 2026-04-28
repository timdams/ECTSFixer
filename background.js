chrome.runtime.onMessage.addListener((msg, sender) => {
  if (!msg || msg.type !== 'OPEN_BG_TAB' || typeof msg.url !== 'string') return;
  const opts = { url: msg.url, active: false };
  if (sender.tab && typeof sender.tab.index === 'number') {
    opts.index = sender.tab.index + 1;
    if (typeof sender.tab.windowId === 'number') opts.windowId = sender.tab.windowId;
  }
  try { chrome.tabs.create(opts); } catch (_) {}
});
