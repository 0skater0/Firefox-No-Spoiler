document.addEventListener("DOMContentLoaded", function () {
    const hotkeyInput = document.getElementById("hotkey");
    const saveButton = document.getElementById("save");

    // Werte aus den gespeicherten Einstellungen wiederherstellen
    browser.storage.sync.get(["hotkey"], function (result) {
        hotkeyInput.value = result.hotkey || "";
    });

    // Ereignislistener hinzufügen, um Einstellungen zu speichern
    saveButton.addEventListener("click", function () {
        const hotkey = hotkeyInput.value;
        browser.storage.sync.set({ hotkey: hotkey });
    });
});
