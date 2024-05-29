chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ profileLinks: [], currentProfileIndex: 0 });
});
