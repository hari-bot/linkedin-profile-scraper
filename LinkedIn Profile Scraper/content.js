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

    console.log(name, location, about, bio, followerCount, connectionCount);
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
