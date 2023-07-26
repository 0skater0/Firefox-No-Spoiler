// Funktion zum Deaktivieren des Autoplay auf YouTube
function disableYouTubeAutoplay() {
    const videos = document.querySelectorAll("video");
    videos.forEach((video) => {
        video.autoplay = false;
    });
}

// Funktion zum Aktivieren des Autoplay auf YouTube
function enableYouTubeAutoplay() {
    const videos = document.querySelectorAll("video");
    videos.forEach((video) => {
        video.autoplay = true;
    });
}

// Funktion zum Überprüfen des Werts von YouTubeNoSpoilersActive
function checkYouTubeNoSpoilersActive() {
    browser.storage.local
        .get("YouTubeNoSpoilersActive")
        .then((result) => {
            const isActive = result.YouTubeNoSpoilersActive;
            if (isActive) {
                disableYouTubeAutoplay();
            } else {
                enableYouTubeAutoplay();
            }
        })
        .catch((error) => {
            console.error("Fehler beim Lesen von browser.storage.local: ", error);
        });
}

// Führe die Funktion aus, wenn die Seite geladen ist
window.addEventListener("load", () => {
    checkYouTubeNoSpoilersActive();
});
