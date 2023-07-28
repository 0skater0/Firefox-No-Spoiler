// When the extension is installed or reloaded, we create the context menu
browser.runtime.onInstalled.addListener(function () {
    browser.contextMenus.create({
        id: "open_settings",
        title: "Open settings",
        contexts: ["browser_action"],
    });
});

// Listener to be called when the user clicks the option in the context menu
browser.contextMenus.onClicked.addListener(function (info) {
    if (info.menuItemId === "open_settings") {
        // Open the settings page when the user clicks on the "Open settings page" option
        browser.runtime.openOptionsPage();
    }
});
