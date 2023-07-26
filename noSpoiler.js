const injectCss = `
/* Ausblenden der Elemente */
#secondary, #info, #chat, #comments, #bottom-row, .ytp-ce-top-left-quad, .ytp-ce-top-right-quad, .ytp-progress-bar-container, .ytp-time-display, .ytp-cued-thumbnail-overlay-image, ytd-thumbnail-overlay-time-status-renderer {
  display: none !important;
}

/* Anzeigen des Videocontainers */
#player-container-id {
  display: flex !important;
  flex-wrap: wrap !important;
}

/* Video und Beschreibung */
#movie_player, #meta, #meta-contents {
  flex: 1 1 100% !important;
}

/* Video auf volle Breite */
#player-container-id .html5-video-container, #player-container-id .html5-main-video {
  width: 100% !important;
  height: 100% !important;
}

/* Steuerelemente und untere Leiste anzeigen */
.ytp-chrome-controls, .ytp-chrome-bottom {
  display: block !important;
}

/* Anzeigen der Videoempfehlungen (optional) */
#related {
  display: block !important;
  flex: 1 1 100% !important;
  max-width: 100% !important;
}

/* Videoempfehlungen rechts vom Video anzeigen (optional) */
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
