// Function to get the saved settings from browser.storage.sync
async function getSettings() {
    try {
        const data = await browser.storage.sync.get([
            "showVideoTime",
            "showProgressBar",
            "showComments",
            "showDescription",
            "showRecommendations",
            "showChat",
            "showEndcard",
            "enableAutoplay",
        ]);

        // Use the retrieved settings
        const settings = {
            showVideoTime: data.showVideoTime || false,
            showProgressBar: data.showProgressBar || false,
            showComments: data.showComments || false,
            showDescription: data.showDescription || false,
            showRecommendations: data.showRecommendations || false,
            showChat: data.showChat || false,
            showEndcard: data.showEndcard || false,
            enableAutoplay: data.enableAutoplay || false,
        };

        return settings;
    } catch (error) {
        console.error("NoSpoiler: Error retrieving settings at ", error);
        return {};
    }
}

// Asynchronous function to construct the CSS injection string
async function buildInjectCss() {
    // Call getSettings() and wait for it to complete
    const settings = await getSettings();

    // Start with an empty string for the CSS injection code
    let cssInjectCode = "";

    // If the user's setting for e.g. "showVideoTime" is false add it to the cssInjectCode
    // as CSS to hide the corresponding page element

    if (!settings.showVideoTime) {
        // Add CSS to hide the video time to cssInjectCode
        cssInjectCode += `
        .ytp-time-display {
            display: none !important;
        }`;
    }

    if (!settings.showProgressBar) {
        cssInjectCode += `
        .ytp-progress-bar-container {
            display: none !important;
        }`;
    }

    if (!settings.showComments) {
        cssInjectCode += `
        #comments {
            display: none !important;
        }`;
    }

    if (!settings.showDescription) {
        cssInjectCode += `
        #description {
            display: none !important;
        }`;
    }

    if (!settings.showRecommendations) {
        cssInjectCode += `
        .ytp-suggestion-set, #related {
            display: none !important;
        }`;
    }

    if (!settings.showChat) {
        cssInjectCode += `
        #chat {
            display: none !important;
        }`;
    }

    if (!settings.showEndcard) {
        cssInjectCode += `
        .ytp-endscreen-content, .ytp-ce-top-left-quad, .ytp-ce-top-right-quad, .ytp-ce-bottom-left-quad, .ytp-ce-bottom-right-quad, .ytp-autonav-endscreen-upnext-container {
            display: none !important;
        }`;
    }

    // Return the constructed cssInjectCode
    return cssInjectCode;
}

// Check if the extension is currently active
async function isActive() {
    let data = await browser.storage.local.get("YouTubeNoSpoilersActive");
    return data.hasOwnProperty("YouTubeNoSpoilersActive") ? data.YouTubeNoSpoilersActive : false;
}

// Toggle the activation status of the extension
async function toggleActive(e) {
    let active = await isActive();
    await browser.storage.local.set({ YouTubeNoSpoilersActive: !active }); // Update the activation status in local storage
    applyCSS(); // Apply the CSS code based on the updated activation status
}

// Toggles YouTube autoplay based on extension activity and user's original autoplay setting
async function handleAutoplay() {
    try {
        var active = await isActive();

        let settings = await getSettings();
        var enableAutoplaySetting = settings.enableAutoplay;

        // Get the currently active tab
        let [tab] = await browser.tabs.query({ active: true, currentWindow: true });

        // Check if the active tab is a YouTube page
        if (tab.url.includes("youtube.com")) {
            // Check if the original autoplay state has been saved
            let storageData = await browser.storage.sync.get("originalAutoplay");
            let originalAutoplay;

            if (storageData.hasOwnProperty("originalAutoplay")) {
                // The original autoplay state was saved
                originalAutoplay = storageData.originalAutoplay;
            } else {
                // The original autoplay state was not saved, get it now
                let result = await browser.tabs.executeScript(tab.id, {
                    code: `
                    var autoplayButton = document.querySelector('.ytp-autonav-toggle-button');
                    autoplayButton && autoplayButton.getAttribute('aria-checked') === 'true';
                    `,
                    runAt: "document_idle",
                });
                originalAutoplay = result[0];
                // Save the original autoplay state
                await browser.storage.sync.set({ originalAutoplay: originalAutoplay });
            }

            if (active) {
                // The extension is active
                if (!enableAutoplaySetting) {
                    // The user has disabled autoplay in the extension settings
                    // Disable autoplay if it's enabled
                    if (originalAutoplay) {
                        browser.tabs.executeScript(tab.id, {
                            code: `
                            var autoplayButton = document.querySelector('.ytp-autonav-toggle-button');
                            if (autoplayButton && autoplayButton.getAttribute('aria-checked') === 'true') {
                                autoplayButton.click();
                            }
                            `,
                            runAt: "document_idle",
                        });
                    }
                } else {
                    // The user has enabled autoplay in the extension settings
                    // Enable autoplay if it's disabled
                    if (!originalAutoplay) {
                        browser.tabs.executeScript(tab.id, {
                            code: `
                            var autoplayButton = document.querySelector('.ytp-autonav-toggle-button');
                            if (autoplayButton && autoplayButton.getAttribute('aria-checked') === 'false') {
                                autoplayButton.click();
                            }
                            `,
                            runAt: "document_idle",
                        });
                    }
                }
            } else {
                // The extension is not active, restore the original autoplay setting
                browser.tabs.executeScript(tab.id, {
                    code: `
                    var autoplayButton = document.querySelector('.ytp-autonav-toggle-button');
                    if (autoplayButton && autoplayButton.getAttribute('aria-checked') !== '${
                        originalAutoplay ? "true" : "false"
                    }') {
                        autoplayButton.click();
                    }
                    `,
                    runAt: "document_idle",
                });
            }
        }
    } catch (error) {
        console.error("NoSpoiler: Failed to execute autoplay script at ", error);
    }
}

// Global variable to store the CSS code
let activeCssCode = "";

// Activate the extension by injecting the CSS code and updating the extension icon
async function activate() {
    // Call buildInjectCss() and wait for it to complete
    activeCssCode = await buildInjectCss();

    // Inject the generated CSS code to hide elements and modify video display
    browser.tabs.insertCSS({ code: activeCssCode, runAt: "document_start" });

    // Handle autoplay setting
    handleAutoplay();

    // Update the extension icon to indicate it is active
    browser.browserAction.setIcon({
        path: {
            32: "icons/YouTube-No-Spoiler-On.png",
        },
    });
}

// Deactivate the extension by removing the injected CSS code and updating the extension icon
async function deactivate() {
    if (activeCssCode) {
        // Remove the injected CSS code to restore default video display
        browser.tabs.removeCSS({ code: activeCssCode, runAt: "document_start" });

        // Reset activeCssCode
        activeCssCode = "";
    }

    // Handle autoplay setting
    handleAutoplay();

    // Update the extension icon to indicate it is inactive
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
        activate(); // If the extension is active, call the activate function
    } else {
        deactivate(); // If the extension is inactive, call the deactivate function
    }
}

// Initial application of CSS code on extension load
applyCSS(); // Apply CSS code when the extension loads

// Listen for the browser action button click event to toggle the extension activation status
browser.browserAction.onClicked.addListener(toggleActive);

// Listen for the tab update event to reapply the CSS code whenever a new page loads
browser.tabs.onUpdated.addListener(applyCSS);

// Set the action for the hotkey
browser.commands.onCommand.addListener(function (command) {
    if (command === "toggle-addon") {
        toggleActive(); // Call the function to toggle the extension's activation status
    }
});

// Listen for messages from the options script
browser.runtime.onMessage.addListener((message) => {
    if (message.command === "toggle-addon") {
        toggleActive(); // Call the function to toggle the extension's activation status
    }
});
