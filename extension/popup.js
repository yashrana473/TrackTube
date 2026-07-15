// Wait for popup to load
document.addEventListener("DOMContentLoaded", () => {

    const trackButton = document.getElementById("import-btn");
    const feedbackText = document.getElementById("status-message");
    
    const statsContainer = document.getElementById("stats-container");
    const playlistTitle = document.getElementById("playlist-title");
    const videoCount = document.getElementById("video-count");

    // Check if the current playlist is being tracked
    chrome.runtime.sendMessage({ task: "check_status" }, (response) => {

        if (response && response.isTracked) {

            statsContainer.classList.remove("hidden");

            playlistTitle.textContent =
                response.data.name || "Tracked Playlist";
            videoCount.textContent =
                `${response.data.totalVideos} Videos`;

            trackButton.textContent = "Tracked ✓";
            trackButton.disabled = true;
            feedbackText.textContent = "You are already tracking this course.";
        }
    });

    trackButton.addEventListener("click", () => {
        // Prevent multiple clicks while the request is in progress
        trackButton.disabled = true;
        trackButton.textContent = "Working on it...";
        feedbackText.textContent = "Checking background script...";

        chrome.runtime.sendMessage({ task: "save_playlist" }, (response) => {

            if (chrome.runtime.lastError || !response) {
                feedbackText.textContent = "Connection lost.";
                trackButton.disabled = false;
                trackButton.textContent = "Try Again";
                return;
            }

            if (response.success) {
                feedbackText.textContent = "Playlist saved to your dashboard!";
                feedbackText.style.color = "green";
                trackButton.textContent = "Tracked ";
            } else {
                feedbackText.textContent = response.error;
                feedbackText.style.color = "red";
                trackButton.disabled = false;
                trackButton.textContent = "Try Again";
            }
        });
    });
});