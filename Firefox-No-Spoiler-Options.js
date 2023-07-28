// ---------------------------- Dark Mode ----------------------------
const darkModeToggle = document.getElementById("darkModeToggle");
const darkModeSymbol = "🌙";
const lightModeSymbol = "🔆";

function toggleDarkMode() {
    const isDarkMode = document.body.classList.toggle("dark-mode");
    darkModeToggle.textContent = isDarkMode ? lightModeSymbol : darkModeSymbol;
    // Save the Dark Mode state in localStorage
    localStorage.setItem("darkModeEnabled", isDarkMode ? "true" : "false");
}

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
const hotkeyInput = document.getElementById("hotkey");
const saveButton = document.getElementById("save");
const notification = document.getElementById("notification");

document.addEventListener("DOMContentLoaded", () => {
    updateHotkeyInputOnLoad();
});

// Function to retrieve the saved hotkey when the page loads
async function updateHotkeyInputOnLoad() {
    try {
        const savedHotkey = await getSavedHotkey();
        updateHotkeyInput(savedHotkey);
    } catch (error) {
        console.error("Error retrieving saved hotkey:", error);
        // Handle the error here if necessary
    }
}

// Call the updateHotkeyInputOnLoad function to update the hotkey input field on page load
updateHotkeyInputOnLoad();

hotkeyInput.addEventListener("keydown", (event) => {
    event.preventDefault(); // Prevent the input field from showing the pressed key
    const { key, ctrlKey, shiftKey, altKey, metaKey } = event;
    const hotkeyString = formatHotkey(key, { ctrlKey, shiftKey, altKey, metaKey });
    updateHotkeyInput(hotkeyString); // Update the input field with the current hotkey
});

saveButton.addEventListener("click", async () => {
    const hotkeyValue = hotkeyInput.value.trim();
    if (hotkeyValue) {
        saveHotkey(hotkeyValue);
        showNotification("Settings saved");

        // Send a message to the background script with the updated hotkey
        browser.runtime.sendMessage({ hotkey: hotkeyValue });
    } else {
        showNotification("Please enter a valid hotkey");
    }
});

function formatHotkey(key, modifiers) {
    const { ctrlKey, shiftKey, altKey, metaKey } = modifiers;
    let hotkey = "";
    if (ctrlKey || metaKey) hotkey += "Ctrl+";
    if (shiftKey) hotkey += "Shift+";
    if (altKey) hotkey += "Alt+";
    hotkey += key.toUpperCase();
    return hotkey;
}

async function getSavedHotkey() {
    try {
        const data = await browser.storage.sync.get("noSpoilerHotkey");
        const savedHotkey = data.noSpoilerHotkey || "";

        // If the saved hotkey is empty, fetch the default hotkey from manifest.json
        if (!savedHotkey) {
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

function saveHotkey(noSpoilerHotkey) {
    browser.storage.sync.set({ noSpoilerHotkey });
}

function updateHotkeyInput(hotkey) {
    hotkeyInput.value = hotkey;
}

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
        // Perform the desired action here, e.g., hide spoilers or toggle a feature
        console.log("Action performed for hotkey:", hotkeyInput.value.trim());
    }
});
