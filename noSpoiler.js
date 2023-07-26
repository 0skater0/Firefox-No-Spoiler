const injectCss = `
#secondary, #info, #masthead-container, #chat, #related, #comments, .ytp-progress-bar-container, .ytp-time-display, ytd-thumbnail-overlay-time-status-renderer {
  display: none !important;
}
.ytp-player-content, .ytp-ce-element {
  display: none !important;
}
.html5-video-container, .html5-main-video {
  width: 100% !important;
  height: 100% !important;
}
.ytp-cued-thumbnail-overlay-image {
  z-index: 11;
}
.ytp-chrome-controls, .ytp-chrome-bottom {
  left: 0 !important;
  width: 100% !important;
}
#page-manager.ytd-app {
  margin-top: 0 !important;
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
    active = await isActive();
    if (active) {
        activate();
    } else {
        deactivate();
    }
}

applyCSS();

browser.browserAction.onClicked.addListener(toggleActive);
browser.tabs.onUpdated.addListener(applyCSS);
