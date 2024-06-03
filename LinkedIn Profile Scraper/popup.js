document.addEventListener("DOMContentLoaded", function () {
  const profileLinksInput = document.getElementById("profileLinks");
  const interactionCountInput = document.getElementById("interactionCount");
  const scrapeProfilesButton = document.getElementById("scrapeProfiles");
  const automateLikeCommentButton = document.getElementById(
    "automateLikeComment"
  );

  const updateButtonState = () => {
    scrapeProfilesButton.disabled = !profileLinksInput.value.trim();
    automateLikeCommentButton.disabled = !interactionCountInput.value.trim();
  };

  profileLinksInput.addEventListener("input", updateButtonState);
  interactionCountInput.addEventListener("input", updateButtonState);

  scrapeProfilesButton.addEventListener("click", function () {
    const profileLinks = profileLinksInput.value
      .split("\n")
      .filter((link) => link.trim() !== "");

    if (profileLinks.length === 0) {
      document.getElementById("status").textContent =
        "Please enter valid profile links.";
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

  automateLikeCommentButton.addEventListener("click", function () {
    const interactionCount = parseInt(interactionCountInput.value, 10);

    if (isNaN(interactionCount) || interactionCount <= 0) {
      document.getElementById("status").textContent =
        "Please enter a valid number.";
      return;
    }

    const actions = [];

    for (let i = 0; i < interactionCount; i++) {
      actions.push({ type: "like" });
      actions.push({ type: "comment", text: "CFBR" });
    }

    chrome.storage.local.set({ actions, actionIndex: 0 }, function () {
      chrome.tabs.create({ url: "https://www.linkedin.com/feed/" });
    });
  });
});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.type === "profileData") {
    fetch("http://localhost:3000/profiles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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
