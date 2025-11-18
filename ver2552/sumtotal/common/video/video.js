let videoUrl = window.location.search;
videoUrl = videoUrl.replace("?videoUrl=", "");

// Set the video source
const videoPlayer = document.getElementById('mgPlayerJSProd_step-video-container');

function decodeBase64ToString(str) {
    if (str && str.length > 0) {
        str = decodeURIComponent(escape(atob(str)));
    }
    return str;
}

if (videoUrl) {
    // Create and append source element
    const source = document.createElement('source');
    source.src = decodeBase64ToString(videoUrl);
    source.type = 'video/mp4'; // Set appropriate type based on your video format
    videoPlayer.appendChild(source);

    // Also set src attribute directly as fallback
    videoPlayer.src = decodeBase64ToString(videoUrl);
    // Add error handling
    videoPlayer.onerror = function(e) {
        console.error("Error loading video:", e);
    };

    videoPlayer.onended = function() {
        window.parent.postMessage({ action: 'mgPlayerJSProd_action:video_ended' }, '*');
    };
}
