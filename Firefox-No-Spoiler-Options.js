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

// ---------------------------- Hotkey ----------------------------
// Get the hotkey input element, save button element, and notification element from the DOM
const hotkeyInput = document.getElementById("hotkey");
const saveButton = document.getElementById("save");
const notification = document.getElementById("notification");

// Run the updateHotkeyInputOnLoad function once the DOM content is loaded
document.addEventListener("DOMContentLoaded", () => {
    updateHotkeyInputOnLoad();
});

// Function to update the hotkey input field when the page loads
async function updateHotkeyInputOnLoad() {
    try {
        // Retrieve the saved hotkey from storage and update the input field
        const savedHotkey = await getSavedHotkey();
        updateHotkeyInput(savedHotkey);
    } catch (error) {
        console.error("Error retrieving saved hotkey:", error);
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
    if (hotkeyValue) {
        // Save the hotkey in storage and show a success notification
        saveHotkey(hotkeyValue);
        showNotification("Settings saved");

        // Send a message to the background script with the updated hotkey
        browser.runtime.sendMessage({ hotkey: hotkeyValue });
    } else {
        // If the hotkey is empty, show an error notification
        showNotification("Please enter a valid hotkey");
    }
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
            // Get the default hotkey for the "toggle-addon" command based on the current platform
            const commands = await browser.commands.getAll();
            const toggleAddonCommand = commands.find((command) => command.name === "toggle-addon");

            // Use the default hotkey for the current platform (e.g., Windows, Mac)
            return toggleAddonCommand.suggested_key.default;
        }

        return savedHotkey;
    } catch (error) {
        console.error("Error retrieving hotkey:", error);
        return "";
    }
}

// Function to save the hotkey in storage
function saveHotkey(noSpoilerHotkey) {
    browser.storage.sync.set({ noSpoilerHotkey });
}

// Function to update the hotkey input field with the provided hotkey
function updateHotkeyInput(hotkey) {
    hotkeyInput.value = hotkey;
}

// Function to show a notification with the given message
function showNotification(message) {
    notification.textContent = message;
    notification.style.opacity = "1";

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

// Implement the desired action when the saved hotkey is triggered
document.addEventListener("keydown", (event) => {
    const { key, ctrlKey, shiftKey, altKey, metaKey } = event;
    const pressedHotkey = formatHotkey(key, { ctrlKey, shiftKey, altKey, metaKey });
    if (pressedHotkey === hotkeyInput.value.trim()) {
        // Perform the desired action here, e.g., enable/disable addon
        console.log("Action performed for hotkey:", hotkeyInput.value.trim());
    }
});
