// This script injects a floating mini icon into the current page
;(() => {
    // Remove any existing icon first
    const existingIcon = document.getElementById("youtube-mini-icon")
    if (existingIcon) {
      existingIcon.remove()
    }
  
    // Create the mini icon container
    const miniIcon = document.createElement("div")
    miniIcon.id = "youtube-mini-icon"
  
    // Get extension URL for the icon
    const iconUrl = chrome.runtime.getURL("icons/youtube.png")
  
    miniIcon.innerHTML = `
      <div class="icon-container">
        <img src="${iconUrl}" alt="YouTube Mini">
      </div>
    `
  
    // Apply styles
    const style = document.createElement("style")
    style.textContent = `
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
      
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
      }
      
      #youtube-mini-icon img {
        width: 32px;
        height: 32px;
       
      }
    `
  
    // Add click event to open the popup
    miniIcon.addEventListener("click", () => {
      console.log("Mini icon clicked, sending message to open popup")
      chrome.runtime.sendMessage({ action: "openPopup" }, (response) => {
        console.log("Response received:", response)
        if (chrome.runtime.lastError) {
          console.error("Error sending message:", chrome.runtime.lastError)
        }
      })
    })
  
    // Append to the document
    document.head.appendChild(style)
    document.body.appendChild(miniIcon)
  
    console.log("YouTube Mini icon injected successfully")
  })()
  