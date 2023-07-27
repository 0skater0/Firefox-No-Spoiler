// When the extension is installed or reloaded, we create the context menu
chrome.runtime.onInstalled.addListener(function () {
    chrome.contextMenus.create({
        id: "open_settings",
        title: "Open settings",
        contexts: ["browser_action"],
    });
});

// Listener to be called when the user clicks the option in the context menu
chrome.contextMenus.onClicked.addListener(function (info) {
    if (info.menuItemId === "open_settings") {
        // Open the settings page when the user clicks on the "Open settings page" option
        chrome.runtime.openOptionsPage();
    }
});

// This function retrieves the user-defined hotkey from browser storage and updates the 'toggle-addon' command's shortcut key binding. If no user-defined hotkey is found, a default hotkey of 'Ctrl+Shift+U' is used.
function updateHotkey() {
    // Get 'hotkey' value from the browser's synchronous storage
    browser.storage.sync.get(["hotkey"], function (result) {
        // If hotkey is not set, use 'Ctrl+Shift+U' as default hotkey
        const hotkey = result.hotkey || "Ctrl+Shift+U";

        // Update the 'toggle-addon' command's hotkey in the browser's command API
        browser.commands.update({
            name: "toggle-addon",
            shortcut: hotkey,
        });
    });
}

// Add event listener to update hotkey registration when options change
browser.storage.onChanged.addListener(function (changes, areaName) {
    if (areaName === "sync" && "hotkey" in changes) {
        updateHotkey();
    }
});
