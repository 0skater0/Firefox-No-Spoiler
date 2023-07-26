const injectCss = `
/* Hide the elements */
#secondary, #info, #chat, #comments, #bottom-row, .ytp-ce-top-left-quad, .ytp-ce-top-right-quad, .ytp-progress-bar-container, .ytp-time-display, .ytp-cued-thumbnail-overlay-image, ytd-thumbnail-overlay-time-status-renderer {
  display: none !important;
}

/* View the video container */
#player-container-id {
  display: flex !important;
  flex-wrap: wrap !important;
}

/* video and description */
#movie_player, #meta, #meta-contents {
  flex: 1 1 100% !important;
}

/* Full width video */
#player-container-id .html5-video-container, #player-container-id .html5-main-video {
  width: 100% !important;
  height: 100% !important;
}

/* Show controls and bottom bar */
.ytp-chrome-controls, .ytp-chrome-bottom {
  display: block !important;
}

/* View the video recommendations (optional) */
#related {
  display: block !important;
  flex: 1 1 100% !important;
  max-width: 100% !important;
}

/* Show video recommendations to the right of the video (optional) */
#player-container-id .ytp-endscreen-content {
  display: flex !important;
}
`;

async function isActive() {
    return (await browser.storage.local.get("YouTubeNoSpoilersActive")).YouTubeNoSpoilersActive;
}

async function toggleActive(e) {
    let active = await isActive();
    await browser.storage.local.set({ YouTubeNoSpoilersActive: !active });
    applyCSS();
}

async function activate() {
    browser.tabs.insertCSS({ code: injectCss, runAt: "document_start" });
    browser.browserAction.setIcon({
        path: {
            32: "icons/YouTube-No-Spoiler-On.png",
        },
    });
}

async function deactivate() {
    browser.tabs.removeCSS({ code: injectCss, runAt: "document_start" });
    browser.browserAction.setIcon({
        path: {
            32: "icons/YouTube-No-Spoiler-Off.png",
        },
    });
}

async function applyCSS() {
    var active = await isActive();
    if (active) {
        activate();
    } else {
        deactivate();
    }
}

applyCSS();

browser.browserAction.onClicked.addListener(toggleActive);
browser.tabs.onUpdated.addListener(applyCSS);
