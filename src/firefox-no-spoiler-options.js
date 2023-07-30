// ---------------------------- Dark Mode ----------------------------
// Get the dark mode toggle element from the DOM
const darkModeToggle = document.getElementById("darkModeToggle");
// Define symbols for dark mode and light mode
const darkModeSymbol = "🌙";
const lightModeSymbol = "🔆";

// Function to toggle dark mode
function toggleDarkMode() {
    const isDarkMode = document.body.classList.toggle("dark-mode");
    // Update the dark mode toggle button text based on the current mode
    darkModeToggle.textContent = isDarkMode ? lightModeSymbol : darkModeSymbol;
    // Save the Dark Mode state in localStorage
    localStorage.setItem("darkModeEnabled", isDarkMode ? "true" : "false");
}

// Add a click event listener to the dark mode toggle button
darkModeToggle.addEventListener("click", toggleDarkMode);

// Check if dark mode is already enabled from localStorage
const darkModeEnabled = localStorage.getItem("darkModeEnabled");
if (darkModeEnabled === "true") {
    // If Dark Mode is enabled, add the class to the body and update the button state
    document.body.classList.add("dark-mode");
    darkModeToggle.textContent = lightModeSymbol;
} else {
    // If Dark Mode is not enabled, remove the class from the body and update the button state
    document.body.classList.remove("dark-mode");
    darkModeToggle.textContent = darkModeSymbol;

    // Set Dark Mode ON as the default
    toggleDarkMode();
}

// ---------------------------- Settings ----------------------------
// Get the hotkey input element, save button element, etc from the DOM
const hotkeyInput = document.getElementById("hotkey");
const saveButton = document.getElementById("save");
const resetButton = document.getElementById("reset");
const notification = document.getElementById("notification");
const showVideoTimeCheckbox = document.getElementById("showVideoTime");
const showProgressBarCheckbox = document.getElementById("showProgressBar");
const showCommentsCheckbox = document.getElementById("showComments");
const showDescriptionCheckbox = document.getElementById("showDescription");
const showRecommendationsCheckbox = document.getElementById("showRecommendations");
const showEndcardCheckbox = document.getElementById("showEndcard");
const enableAutoplayCheckbox = document.getElementById("enableAutoplay");

// Run the updateHotkeyInputOnLoad function once the DOM content is loaded
document.addEventListener("DOMContentLoaded", () => {
    updateHotkeyInputOnLoad();
    updateSettingsOnLoad();
});

// Function to update the hotkey input field when the page loads
async function updateHotkeyInputOnLoad() {
    try {
        // Retrieve the saved hotkey from storage and update the input field
        const savedHotkey = await getSavedHotkey();
        updateHotkeyInput(savedHotkey);
    } catch (error) {
        console.error("NoSpoiler: Error retrieving saved hotkey at ", error);
        // Handle the error here if necessary
    }
}

// Function to get the saved settings from browser.storage.sync
async function getSettings() {
    try {
        const data = await browser.storage.sync.get([
            "showVideoTime",
            "showProgressBar",
            "showComments",
            "showDescription",
            "showRecommendations",
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
            showEndcard: data.showEndcard || false,
            enableAutoplay: data.enableAutoplay || false,
        };

        return settings;
    } catch (error) {
        console.error("NoSpoiler: Error retrieving settings at ", error);
        return {};
    }
}

// Function to update the checkboxes when the page loads
async function updateSettingsOnLoad() {
    try {
        // Retrieve the saved settings from storage and update the checkboxes
        const savedSettings = await getSettings();
        updateSettings(savedSettings);
    } catch (error) {
        console.error("NoSpoiler: Error retrieving saved settings at ", error);
        // Handle the error here if necessary
    }
}

// Call the updateHotkeyInputOnLoad function to update the hotkey input field on page load
updateHotkeyInputOnLoad();

// Add a keydown event listener to the hotkey input field to update the displayed hotkey
hotkeyInput.addEventListener("keydown", (event) => {
    event.preventDefault(); // Prevent the input field from showing the pressed key
    const { key, ctrlKey, shiftKey, altKey, metaKey } = event;
    const hotkeyString = formatHotkey(key, { ctrlKey, shiftKey, altKey, metaKey });
    updateHotkeyInput(hotkeyString); // Update the input field with the current hotkey
});

// Add a click event listener to the save button to save the hotkey and show a notification
saveButton.addEventListener("click", async () => {
    const hotkeyValue = hotkeyInput.value.trim();
    const settings = {
        showVideoTime: showVideoTimeCheckbox.checked,
        showProgressBar: showProgressBarCheckbox.checked,
        showComments: showCommentsCheckbox.checked,
        showDescription: showDescriptionCheckbox.checked,
        showRecommendations: showRecommendationsCheckbox.checked,
        showEndcard: showEndcardCheckbox.checked,
        enableAutoplay: enableAutoplayCheckbox.checked,
    };

    if (hotkeyValue) {
        // Save the hotkey&settings in storage and show a success notification
        saveHotkey(hotkeyValue);
        saveSettings(settings);
        showNotification("Settings saved. Page reload may be needed.");

        // Send a message to the background script with the updated hotkey
        browser.runtime.sendMessage({ hotkeyValue });

        // Update the command's shortcut
        await browser.commands.update({
            name: "toggle-addon",
            shortcut: hotkeyValue,
        });
    } else {
        // If the hotkey is empty, show an error notification
        showNotification("Please enter a valid hotkey", true); // Add the "true" argument to make the notification red
    }
});

// Add a click event listener to the Reset button
resetButton.addEventListener("click", async () => {
    // Define default settings
    const defaultSettings = {
        showVideoTime: false,
        showProgressBar: false,
        showComments: false,
        showDescription: false,
        showRecommendations: false,
        showEndcard: false,
        enableAutoplay: false,
    };

    // Define default hotkey
    const defaultHotkey = "Ctrl+Alt+U";
    // Save the default settings and hotkey in storage
    await saveSettings(defaultSettings);
    await saveHotkey(defaultHotkey);

    // Update the checkboxes and hotkey input field to reflect the default settings and hotkey
    updateSettings(defaultSettings);
    updateHotkeyInput(defaultHotkey);

    // Show a success notification
    showNotification("Settings reset to default. Page reload may be needed.");

    // Update the command's shortcut
    await browser.commands.update({
        name: "toggle-addon",
        shortcut: defaultHotkey,
    });
});

// Function to format the hotkey based on pressed keys (Ctrl, Shift, Alt, Meta)
function formatHotkey(key, modifiers) {
    const { ctrlKey, shiftKey, altKey, metaKey } = modifiers;
    let hotkey = "";
    if (ctrlKey || metaKey) hotkey += "Ctrl+";
    if (shiftKey) hotkey += "Shift+";
    if (altKey) hotkey += "Alt+";
    hotkey += key.toUpperCase();
    return hotkey;
}

// Function to retrieve the saved hotkey from storage or use the default hotkey from manifest.json
async function getSavedHotkey() {
    try {
        // Get the saved hotkey from storage
        const data = await browser.storage.sync.get("noSpoilerHotkey");
        const savedHotkey = data.noSpoilerHotkey || "";

        // If the saved hotkey is empty, fetch the default hotkey from manifest.json
        if (!savedHotkey) {
            // Get the default hotkey for the "toggle-addon" command
            const commands = await browser.commands.getAll();
            const toggleAddonCommand = commands.find((command) => command.name === "toggle-addon");

            // Use the current hotkey for the command
            return toggleAddonCommand.shortcut;
        }

        return savedHotkey;
    } catch (error) {
        console.error("NoSpoiler: Error retrieving hotkey at ", error);
        return "";
    }
}

// Function to save the hotkey in storage
async function saveHotkey(noSpoilerHotkey) {
    try {
        await browser.storage.sync.set({ noSpoilerHotkey });
    } catch (error) {
        console.error("NoSpoiler: Error saving hotkey at ", error);
    }
}

// Function to save the settings in storage
async function saveSettings(settings) {
    try {
        await browser.storage.sync.set(settings);
    } catch (error) {
        console.error("NoSpoiler: Error saving settings at ", error);
    }
}

// Function to update the hotkey input field with the provided hotkey
function updateHotkeyInput(hotkey) {
    hotkeyInput.value = hotkey;
}

// Function to update the checkboxes based on the saved settings
function updateSettings(settings) {
    showVideoTimeCheckbox.checked = settings.showVideoTime;
    showProgressBarCheckbox.checked = settings.showProgressBar;
    showCommentsCheckbox.checked = settings.showComments;
    showDescriptionCheckbox.checked = settings.showDescription;
    showRecommendationsCheckbox.checked = settings.showRecommendations;
    showEndcardCheckbox.checked = settings.showEndcard;
    enableAutoplayCheckbox.checked = settings.enableAutoplay;
}

// Function to show a notification with the given message
function showNotification(message, isError = false) {
    notification.textContent = message;
    notification.style.opacity = "1";

    // Set the notification background color to red if it's an error notification
    notification.style.backgroundColor = isError ? "red" : "green";

    // Fade out the notification after the active duration
    setTimeout(() => {
        notification.style.transition = "opacity 2s ease-in-out"; /* 2s fade-out */
        notification.style.opacity = "0";

        // Disable clicks on the notification during the fade-out
        notification.style.pointerEvents = "none";

        // Remove the transition property after the fade-out is complete
        setTimeout(() => {
            notification.style.transition = "";
        }, 2000); // 2s delay (same as fade-out duration) before removing transition
    }, 2000); // 2s active duration
}
