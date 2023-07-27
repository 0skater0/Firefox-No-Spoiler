// Set the action for the hotkey
browser.commands.onCommand.addListener(function (command) {
    if (command === "toggle-addon") {
        toggleActive();
    }
});

//#region no spoiler

// The CSS code to inject that hides certain elements and modifies video display
const injectCss = `
/* Hide the elements */
#secondary, #info, #chat, #comments, #bottom-row, .ytp-ce-top-left-quad, .ytp-ce-top-right-quad, .ytp-ce-bottom-left-quad, .ytp-ce-bottom-right-quad, .ytp-autonav-endscreen-upnext-container, .ytp-endscreen-content, .ytp-suggestion-set, .ytp-progress-bar-container, .ytp-time-display, .ytp-cued-thumbnail-overlay-image, ytd-thumbnail-overlay-time-status-renderer {
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

// Check if the extension is currently active
async function isActive() {
    return (await browser.storage.local.get("YouTubeNoSpoilersActive")).YouTubeNoSpoilersActive;
}

// Toggle the activation status of the extension
async function toggleActive(e) {
    let active = await isActive();
    await browser.storage.local.set({ YouTubeNoSpoilersActive: !active });
    applyCSS();
}

// Activate the extension by injecting the CSS code and updating the extension icon
async function activate() {
    browser.tabs.insertCSS({ code: injectCss, runAt: "document_start" });
    browser.browserAction.setIcon({
        path: {
            32: "icons/YouTube-No-Spoiler-On.png",
        },
    });
}

// Deactivate the extension by removing the injected CSS code and updating the extension icon
async function deactivate() {
    browser.tabs.removeCSS({ code: injectCss, runAt: "document_start" });
    browser.browserAction.setIcon({
        path: {
            32: "icons/YouTube-No-Spoiler-Off.png",
        },
    });
}

// Apply the CSS code based on the current activation status
async function applyCSS() {
    var active = await isActive();
    if (active) {
        activate();
    } else {
        deactivate();
    }
}

// Initial application of CSS code on extension load
applyCSS();

// Listen for the browser action button click event to toggle the extension activation status
browser.browserAction.onClicked.addListener(toggleActive);

// Listen for the tab update event to reapply the CSS code whenever a new page loads
browser.tabs.onUpdated.addListener(applyCSS);

// Funktion einmal beim Laden des Hintergrundskripts aufrufen, um die Hotkey-Registrierung zu initialisieren
updateHotkey();

//#endregion
