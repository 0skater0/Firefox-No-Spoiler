// Function to disable autoplay on YouTube
function disableYouTubeAutoplay() {
    const videos = document.querySelectorAll("video");
    videos.forEach((video) => {
        video.autoplay = false;
    });
}

// Function to enable autoplay on YouTube
function enableYouTubeAutoplay() {
    const videos = document.querySelectorAll("video");
    videos.forEach((video) => {
        video.autoplay = true;
    });
}

// Function to check the value of YouTubeNoSpoilersActive
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
            console.error("Error reading browser.storage.local: ", error);
        });
}

// Execute the function when the page is loaded
window.addEventListener("load", () => {
    checkYouTubeNoSpoilersActive();
});
