chrome.storage.local.get(["actions", "actionIndex"], function (result) {
  const { actions, actionIndex } = result;

  if (!actions || actionIndex >= actions.length) {
    chrome.storage.local.remove(["actions", "actionIndex"]);
    return;
  }

  const action = actions[actionIndex];

  if (action.type === "like") {
    const likeButton = document.querySelector('button[aria-label*="Like"]');

    if (likeButton) {
      likeButton.click();
      setTimeout(() => {
        chrome.storage.local.set({ actionIndex: actionIndex + 1 }, function () {
          chrome.storage.local.get(
            ["actions", "actionIndex"],
            function (nextResult) {
              const nextAction = nextResult.actions[nextResult.actionIndex];
              if (nextAction.type === "comment") {
                setTimeout(() => {
                  const commentButton = document.querySelector(
                    'button[aria-label*="Comment"]'
                  );
                  if (commentButton) {
                    commentButton.click();
                    setTimeout(() => {
                      const commentBox = document.querySelector(
                        'div[role="textbox"]'
                      );
                      if (commentBox) {
                        commentBox.innerHTML = nextAction.text;
                        checkSubmitButton();
                      }
                    }, 2000); // Wait for 2 seconds for the comment box to appear
                  }
                }, 2000); // Wait for 2 seconds before clicking the comment button
              } else {
                location.reload();
              }
            }
          );
        });
      }, 2000); // Wait for 2 seconds before moving to the next action
    }
  } else if (action.type === "comment") {
    const commentButton = document.querySelector(
      'button[aria-label*="Comment"]'
    );
    if (commentButton) {
      commentButton.click();
      setTimeout(() => {
        const commentBox = document.querySelector('div[role="textbox"]');
        if (commentBox) {
          commentBox.innerHTML = action.text;
          checkSubmitButton();
        }
      }, 2000); // Wait for 2 seconds for the comment box to appear
    }
  }
});

function checkSubmitButton() {
  const submitButton = document.querySelector(
    ".comments-comment-box__submit-button"
  );
  if (submitButton) {
    submitButton.click();
    setTimeout(() => {
      chrome.storage.local.get(["actionIndex"], function (result) {
        const { actionIndex } = result;
        chrome.storage.local.set({ actionIndex: actionIndex + 1 }, function () {
          location.reload();
        });
      });
    }, 2000); // Wait for 2 seconds before moving to the next action
  } else {
    setTimeout(checkSubmitButton, 1000); // Check again after 1 second
  }
}

window.addEventListener("load", function () {
  setTimeout(function () {
    const name = document
      .querySelector("h1.text-heading-xlarge")
      .innerText.trim();
    const location = document
      .querySelector("span.text-body-small.inline")
      .innerText.trim();
    const about = document
      .querySelector("div.full-width > div.full-width > span")
      .innerText.trim();
    const bio = document
      .querySelector("div.text-body-medium.break-words")
      .innerText.trim();
    const followerCount = document
      .querySelector("p.pvs-header__optional-link > span")
      .innerText.replace(/,/g, "")
      .match(/\d+/)[0];

    const connectionCount = document
      .querySelector("span.t-black--light > span.t-bold")
      .innerText.replace(/,/g, "")
      .match(/\d+/)[0];
    chrome.runtime.sendMessage({
      type: "profileData",
      data: {
        name,
        url: window.location.href,
        about,
        bio,
        location,
        followerCount: parseInt(followerCount),
        connectionCount: parseInt(connectionCount),
      },
    });
  }, 5000);
});
