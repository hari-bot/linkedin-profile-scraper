document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("scrapeProfiles")
    .addEventListener("click", function () {
      const profileLinks = document
        .getElementById("profileLinks")
        .value.split("\n")
        .filter((link) => link.trim() !== "");
      if (profileLinks.length === 0) {
        document.getElementById("status").textContent =
          "Please enter at least one LinkedIn profile link.";
        return;
      }

      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const activeTab = tabs[0];
        chrome.storage.local.set(
          { profileLinks, currentProfileIndex: 0 },
          function () {
            chrome.tabs.create({ url: profileLinks[0] });
          }
        );
      });
    });
});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.type === "profileData") {
    fetch("http://localhost:3000/profiles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message.data),
    })
      .then((response) => response.json())
      .then((data) => {
        chrome.storage.local.get(
          ["profileLinks", "currentProfileIndex"],
          function (result) {
            const { profileLinks, currentProfileIndex } = result;
            const nextProfileIndex = currentProfileIndex + 1;
            if (nextProfileIndex < profileLinks.length) {
              chrome.storage.local.set(
                { currentProfileIndex: nextProfileIndex },
                function () {
                  chrome.tabs.update(sender.tab.id, {
                    url: profileLinks[nextProfileIndex],
                  });
                }
              );
            } else {
              chrome.tabs.remove(sender.tab.id);
              document.getElementById("status").textContent =
                "All profiles processed.";
            }
          }
        );
      });
  }
  sendResponse({ status: "received" });
});
