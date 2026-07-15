chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.task === "check_status") {
        checkIfTracked().then(sendResponse);
        return true; 
    }

    if (message.task === "save_playlist") {
        savePlaylistToDatabase().then(sendResponse);
        // Keep the message channel open for async response
        return true;
    }
});

// Checks if the URL is already in your database
async function checkIfTracked() {
    try {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        const currentTab = tabs[0];

        if (!currentTab.url.includes("youtube.com/playlist")) {
            return { isTracked: false };
        }

        const serverResponse = await fetch(`http://localhost:8000/api/v1/playlists/check?url=${encodeURIComponent(currentTab.url)}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include"
        });

        const backendData = await serverResponse.json();

        if (serverResponse.ok && backendData.data) {
            return { isTracked: true, data: backendData.data };
        }

        return { isTracked: false };
    } catch (error) {
        return { isTracked: false };
    }
}

async function savePlaylistToDatabase() {
    try {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        const currentTab = tabs[0];

        // Ensure user is on a YouTube playlist page
        if (!currentTab.url.includes("youtube.com/playlist")) {
            return { success: false, error: "Please open a YouTube playlist page." };
        }

        const serverResponse = await fetch("http://localhost:8000/api/v1/playlists/import", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ youtubeUrl: currentTab.url }),
            credentials: "include" // Send HttpOnly cookies with request
        });

        const backendData = await serverResponse.json();

        if (!serverResponse.ok) {
            return { success: false, error: backendData.message || "Server rejected it." };
        }

        return { success: true };

    } catch (error) {
        return {
            success: false,
            error: "Is your backend server turned on?"
        };
    }
}