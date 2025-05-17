// Global variables
let miniIconVisible = false
let miniIcon = null
let videoOverlay = null
let isDragging = false
let dragOffsetX = 0
let dragOffsetY = 0
let currentVideoId = null

// Signal that the content script is ready
const CONTENT_SCRIPT_READY = true

// Initialize when the content script loads
init()

function init() {
  console.log("YouTube Mini Browser content script initialized")

  // Inject CSS programmatically
  injectCSS()

  // Listen for messages from the background script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Content script received message:", message)

    if (message.action === "toggleMiniIcon") {
      toggleMiniIcon()
      sendResponse({ success: true })
    } else if (message.action === "openVideoOverlay") {
      openVideoOverlay(message.videoId, message.videoTitle, message.channelTitle)
      sendResponse({ success: true })
    } else if (message.action === "checkContentScriptReady") {
      // This message is used to check if the content script is loaded
      sendResponse({ ready: true })
    }
    return true // Required for async sendResponse
  })

  // Let the background script know we're ready
  try {
    chrome.runtime.sendMessage({ action: "contentScriptReady" })
  } catch (error) {
    console.error("Error sending ready message:", error)
  }
}

// Inject CSS programmatically instead of using a separate CSS file
function injectCSS() {
  const style = document.createElement("style")
  style.textContent = `
    /* Mini Icon */
    #youtube-mini-icon {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 9999;
      cursor: pointer;
      transition: transform 0.2s ease;
    }
    
    #youtube-mini-icon:hover {
      transform: scale(1.1);
    }
    
    #youtube-mini-icon .icon-container {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: #ff0000;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
    }
    
    #youtube-mini-icon img {
      width: 32px;
      height: 32px;
      filter: brightness(0) invert(1);
    }
    
    /* Browse Dialog */
    .youtube-browse-dialog {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 600px;
      max-width: 90vw;
      height: 500px;
      max-height: 90vh;
      background: #0f0f0f;
      color: white;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
      z-index: 10000;
      display: flex;
      flex-direction: column;
      font-family: Arial, sans-serif;
      overflow: hidden;
    }
    
    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background: #1a1a1a;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      cursor: move;
    }
    
    .dialog-header h3 {
      margin: 0;
      font-size: 16px;
      color: #ff0000;
    }
    
    .close-button {
      background: transparent;
      border: none;
      color: rgba(255, 255, 255, 0.7);
      font-size: 20px;
      cursor: pointer;
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
    }
    
    .close-button:hover {
      background-color: rgba(255, 255, 255, 0.1);
      color: white;
    }
    
    .dialog-content {
      flex: 1;
      padding: 16px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .search-container {
      display: flex;
      gap: 8px;
    }
    
    #yt-search-input {
      flex: 1;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 4px;
      padding: 8px 12px;
      color: white;
      font-size: 14px;
    }
    
    #yt-search-button {
      background: #ff0000;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 8px 16px;
      cursor: pointer;
      font-size: 14px;
    }
    
    .categories {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    
    .category-button {
      background: rgba(255, 255, 255, 0.1);
      color: white;
      border: none;
      border-radius: 4px;
      padding: 6px 12px;
      cursor: pointer;
      font-size: 13px;
    }
    
    .category-button:hover {
      background: rgba(255, 255, 255, 0.2);
    }
    
    .results-container {
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .loading {
      text-align: center;
      padding: 20px;
      color: rgba(255, 255, 255, 0.7);
      font-size: 14px;
    }
    
    .info-message {
      background: rgba(0, 100, 255, 0.1);
      border: 1px solid rgba(0, 100, 255, 0.3);
      border-radius: 4px;
      padding: 12px;
      font-size: 13px;
      color: rgba(255, 255, 255, 0.9);
      text-align: center;
    }
    
    .error-message {
      background: rgba(255, 0, 0, 0.1);
      border: 1px solid rgba(255, 0, 0, 0.3);
      border-radius: 4px;
      padding: 12px;
      font-size: 13px;
      color: rgba(255, 255, 255, 0.9);
    }
    
    .error-message ul {
      margin: 8px 0 8px 20px;
      padding: 0;
    }
    
    /* Video Card */
    .video-card {
      display: flex;
      gap: 12px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      padding: 10px;
      cursor: pointer;
      transition: background 0.2s;
    }
    
    .video-card:hover {
      background: rgba(255, 255, 255, 0.1);
    }
    
    .video-thumbnail {
      width: 120px;
      height: 68px;
      border-radius: 4px;
      overflow: hidden;
      flex-shrink: 0;
      position: relative;
    }
    
    .video-thumbnail img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .video-duration {
      position: absolute;
      bottom: 4px;
      right: 4px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      font-size: 10px;
      padding: 1px 4px;
      border-radius: 2px;
    }
    
    .video-details {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    
    .video-title {
      font-size: 14px;
      font-weight: 500;
      line-height: 1.3;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .video-channel {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.7);
    }
    
    .video-stats {
      font-size: 11px;
      color: rgba(255, 255, 255, 0.5);
    }
    
    /* Video Overlay */
    .youtube-video-overlay {
      position: fixed;
      width: 400px;
      height: 300px;
      background: #0f0f0f;
      color: white;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
      z-index: 10000;
      display: flex;
      flex-direction: column;
      font-family: Arial, sans-serif;
      overflow: hidden;
      resize: both;
    }
    
    .youtube-video-overlay.minimized {
      width: 300px;
      height: auto;
      resize: horizontal;
    }
    
    .overlay-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      background: #1a1a1a;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      cursor: move;
    }
    
    .overlay-title {
      font-size: 14px;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 300px;
    }
    
    .overlay-controls {
      display: flex;
      gap: 8px;
    }
    
    .minimize-button {
      background: transparent;
      border: none;
      color: rgba(255, 255, 255, 0.7);
      font-size: 16px;
      cursor: pointer;
      padding: 0;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
    }
    
    .minimize-button:hover {
      background-color: rgba(255, 255, 255, 0.1);
      color: white;
    }
    
    .overlay-body {
      flex: 1;
      background: #000;
    }
    
    .overlay-footer {
      padding: 8px 12px;
      background: #1a1a1a;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .channel-title {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.7);
    }
  `
  document.head.appendChild(style)
}

function toggleMiniIcon(forceShow = null) {
  console.log("Toggling mini icon, current state:", miniIconVisible)

  // If forceShow is provided, use that value, otherwise toggle
  const shouldShow = forceShow !== null ? forceShow : !miniIconVisible

  if (shouldShow && !miniIcon) {
    createMiniIcon()
    miniIconVisible = true
  } else if (!shouldShow && miniIcon) {
    removeMiniIcon()
    miniIconVisible = false
  }
}

function createMiniIcon() {
  console.log("Creating mini icon")

  // Remove any existing icon first
  removeMiniIcon()

  // Create the mini icon container
  miniIcon = document.createElement("div")
  miniIcon.id = "youtube-mini-icon"

  miniIcon.innerHTML = `
    <div class="icon-container">
      <img src="${chrome.runtime.getURL("icons/youtube.png")}" alt="YouTube Mini">
    </div>
  `

  // Add click event to open the popup
  miniIcon.addEventListener("click", () => {
    openBrowseDialog()
  })

  // Append to the document
  document.body.appendChild(miniIcon)
}

function removeMiniIcon() {
  if (miniIcon && miniIcon.parentNode) {
    miniIcon.parentNode.removeChild(miniIcon)
    miniIcon = null
  }
}

function openBrowseDialog() {
  // Create a dialog for browsing YouTube
  const dialog = document.createElement("div")
  dialog.className = "youtube-browse-dialog"

  dialog.innerHTML = `
    <div class="dialog-header">
      <h3>YouTube Mini Browser</h3>
      <button class="close-button">×</button>
    </div>
    <div class="dialog-content">
      <div class="search-container">
        <input type="text" id="yt-search-input" placeholder="Search YouTube videos">
        <button id="yt-search-button">Search</button>
      </div>
      <div class="categories">
        <button class="category-button" data-category="music">Music</button>
        <button class="category-button" data-category="gaming">Gaming</button>
        <button class="category-button" data-category="news">News</button>
        <button class="category-button" data-category="sports">Sports</button>
      </div>
      <div class="results-container">
        <div class="loading">Enter a search term above</div>
      </div>
    </div>
  `

  // Add event listeners
  dialog.querySelector(".close-button").addEventListener("click", () => {
    document.body.removeChild(dialog)
  })

  const searchInput = dialog.querySelector("#yt-search-input")
  const searchButton = dialog.querySelector("#yt-search-button")
  const resultsContainer = dialog.querySelector(".results-container")

  // Search button click
  searchButton.addEventListener("click", () => {
    const query = searchInput.value.trim()
    if (query) {
      searchYouTube(query, resultsContainer)
    }
  })

  // Enter key in search input
  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      const query = searchInput.value.trim()
      if (query) {
        searchYouTube(query, resultsContainer)
      }
    }
  })

  // Category buttons
  dialog.querySelectorAll(".category-button").forEach((button) => {
    button.addEventListener("click", () => {
      const category = button.getAttribute("data-category")
      searchYouTube(category, resultsContainer)
    })
  })

  // Append to body
  document.body.appendChild(dialog)

  // Focus the search input
  searchInput.focus()

  // Make the dialog draggable
  makeDraggable(dialog, dialog.querySelector(".dialog-header"))
}

function searchYouTube(query, resultsContainer) {
  // Show loading
  resultsContainer.innerHTML = '<div class="loading">Searching...</div>'

  // Always use the user's API key
  const apiKey = "AIzaSyAUpE5GLrdZXi-OrfutXi_WzWcEbtqigsQ"

  // Fetch search results from YouTube API
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=10&key=${apiKey}`

  fetch(url)
    .then((response) => {
      if (!response.ok) {
        return response.json().then((errorData) => {
          throw new Error(`API Error: ${errorData.error ? errorData.error.message : response.status}`)
        })
      }
      return response.json()
    })
    .then((data) => {
      // Check if we have results
      if (!data.items || data.items.length === 0) {
        resultsContainer.innerHTML = `
            <div class="info-message">
              No results found for "${query}". Try a different search term.
            </div>
          `
        return
      }

      // Get video details for search results
      const videoIds = data.items
        .map((item) => item.id.videoId)
        .filter((id) => id)
        .join(",")

      if (!videoIds) {
        resultsContainer.innerHTML = `
            <div class="info-message">
              No valid video results found for "${query}". Try a different search term.
            </div>
          `
        return
      }

      return fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoIds}&key=${apiKey}`,
      )
    })
    .then((response) => {
      if (!response.ok) {
        return response.json().then((errorData) => {
          throw new Error(`API Error: ${errorData.error ? errorData.error.message : response.status}`)
        })
      }
      return response.json()
    })
    .then((data) => {
      // Clear results
      resultsContainer.innerHTML = ""

      // Process and display videos
      if (data.items && data.items.length > 0) {
        data.items.forEach((video) => {
          const videoCard = createVideoCard(video)
          resultsContainer.appendChild(videoCard)
        })
      } else {
        resultsContainer.innerHTML = `
            <div class="info-message">
              No detailed video information found. Try a different search term.
            </div>
          `
      }
    })
    .catch((error) => {
      console.error("Error searching YouTube:", error)
      resultsContainer.innerHTML = `
          <div class="error-message">
            <p>Error searching videos: ${error.message}</p>
            <p>This could be due to:</p>
            <ul>
              <li>API key quota exceeded</li>
              <li>API key restrictions</li>
              <li>Network connectivity issues</li>
            </ul>
          </div>
        `
    })
}

function createVideoCard(video) {
  const videoCard = document.createElement("div")
  videoCard.className = "video-card"

  // Format duration if available
  let duration = ""
  if (video.contentDetails && video.contentDetails.duration) {
    duration = formatDuration(video.contentDetails.duration)
  }

  // Format view count if available
  let viewCount = ""
  if (video.statistics && video.statistics.viewCount) {
    viewCount = formatViewCount(video.statistics.viewCount)
  }

  videoCard.innerHTML = `
    <div class="video-thumbnail">
      <img src="${video.snippet.thumbnails.medium ? video.snippet.thumbnails.medium.url : chrome.runtime.getURL("icons/placeholder.png")}" alt="${video.snippet.title}">
      ${duration ? `<div class="video-duration">${duration}</div>` : ""}
    </div>
    <div class="video-details">
      <div class="video-title">${video.snippet.title}</div>
      <div class="video-channel">${video.snippet.channelTitle}</div>
      ${viewCount ? `<div class="video-stats">${viewCount}</div>` : ""}
    </div>
  `

  videoCard.addEventListener("click", () => {
    // Close the dialog
    const dialog = document.querySelector(".youtube-browse-dialog")
    if (dialog) {
      document.body.removeChild(dialog)
    }

    // Open the video overlay
    openVideoOverlay(video.id, video.snippet.title, video.snippet.channelTitle)
  })

  return videoCard
}

function openVideoOverlay(videoId, videoTitle, channelTitle) {
  // Remove existing overlay if any
  if (videoOverlay) {
    document.body.removeChild(videoOverlay)
  }

  // Save current video ID
  currentVideoId = videoId

  // Create overlay container
  videoOverlay = document.createElement("div")
  videoOverlay.className = "youtube-video-overlay"

  videoOverlay.innerHTML = `
    <div class="overlay-header">
      <div class="overlay-title">${videoTitle || "YouTube Video"}</div>
      <div class="overlay-controls">
        <button class="minimize-button">_</button>
        <button class="close-button">×</button>
      </div>
    </div>
    <div class="overlay-body">
      <iframe 
        width="100%" 
        height="100%" 
        src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0" 
        title="YouTube video player" 
        frameborder="0" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
        allowfullscreen>
      </iframe>
    </div>
    <div class="overlay-footer">
      <div class="channel-title">${channelTitle || ""}</div>
    </div>
  `

  // Add event listeners
  videoOverlay.querySelector(".close-button").addEventListener("click", () => {
    document.body.removeChild(videoOverlay)
    videoOverlay = null
    currentVideoId = null
  })

  const minimizeButton = videoOverlay.querySelector(".minimize-button")
  minimizeButton.addEventListener("click", () => {
    const overlayBody = videoOverlay.querySelector(".overlay-body")
    const overlayFooter = videoOverlay.querySelector(".overlay-footer")

    if (overlayBody.style.display === "none") {
      // Expand
      overlayBody.style.display = "block"
      overlayFooter.style.display = "block"
      minimizeButton.textContent = "_"
      videoOverlay.classList.remove("minimized")
    } else {
      // Minimize
      overlayBody.style.display = "none"
      overlayFooter.style.display = "none"
      minimizeButton.textContent = "□"
      videoOverlay.classList.add("minimized")
    }
  })

  // Make the overlay draggable
  makeDraggable(videoOverlay, videoOverlay.querySelector(".overlay-header"))

  // Append to body
  document.body.appendChild(videoOverlay)

  // Position in the bottom right corner initially
  const rect = videoOverlay.getBoundingClientRect()
  videoOverlay.style.top = `${window.innerHeight - rect.height - 20}px`
  videoOverlay.style.left = `${window.innerWidth - rect.width - 20}px`
}

function makeDraggable(element, handle) {
  if (!handle) handle = element

  handle.addEventListener("mousedown", startDrag)

  function startDrag(e) {
    // Prevent default behavior to avoid text selection during drag
    e.preventDefault()

    // Get the initial mouse position
    const initialX = e.clientX
    const initialY = e.clientY

    // Get the initial element position
    const rect = element.getBoundingClientRect()

    // Calculate the offset of the mouse pointer from the element's top-left corner
    dragOffsetX = initialX - rect.left
    dragOffsetY = initialY - rect.top

    // Set dragging state
    isDragging = true

    // Add event listeners for drag and end drag events
    document.addEventListener("mousemove", drag)
    document.addEventListener("mouseup", endDrag)
  }

  function drag(e) {
    if (!isDragging) return

    // Calculate new position
    const newLeft = e.clientX - dragOffsetX
    const newTop = e.clientY - dragOffsetY

    // Apply new position
    element.style.left = `${newLeft}px`
    element.style.top = `${newTop}px`
  }

  function endDrag() {
    // Reset dragging state
    isDragging = false

    // Remove event listeners
    document.removeEventListener("mousemove", drag)
    document.removeEventListener("mouseup", endDrag)
  }
}

function formatDuration(isoDuration) {
  const match = isoDuration.match(/PT(\d+H)?(\d+M)?(\d+S)?/)
  if (!match) return ""

  const hours = (match[1] && match[1].replace("H", "")) || 0
  const minutes = (match[2] && match[2].replace("M", "")) || 0
  const seconds = (match[3] && match[3].replace("S", "")) || 0

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  } else {
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }
}

function formatViewCount(viewCount) {
  const count = Number.parseInt(viewCount)
  if (isNaN(count)) return "0 views"

  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M views`
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K views`
  } else {
    return `${count} views`
  }
}
