// Content script for Brain Rot Blocker

// Track if we've paid for the current minute
let currentMinutePaid = false;
let watchTime = 0; // Track seconds watched
let minuteTimer = null;
let countdownInterval = null;
let currentOverlay = null;
let videoElement = null;
let videoBlurred = true;
const COIN_COST_PER_MINUTE = 100;

// Function to find the video player
function findVideoPlayer() {
  // Main video element on watch pages
  let video = document.querySelector('video.html5-main-video');
  
  // If not found, try other possible selectors
  if (!video) {
    video = document.querySelector('video.video-stream');
  }
  if (!video) {
    video = document.querySelector('video');
  }
  
  return video;
}

// Function to check if we're on any YouTube page - we want to blur ALL YouTube
function isYouTubePage() {
  return window.location.hostname.includes('youtube.com');
}

// Function to blur the entire page
function blurPage() {
  document.body.classList.add('brb-blurred');
  videoBlurred = true;
}

// Function to unblur the page
function unblurPage() {
  document.body.classList.remove('brb-blurred');
  videoBlurred = false;
}

// Function to create an overlay that covers the entire page
function createOverlay() {
  if (currentOverlay) {
    removeOverlay();
  }
  
  // Create a fixed position overlay that covers the entire viewport
  currentOverlay = document.createElement('div');
  currentOverlay.className = 'brb-overlay';
  currentOverlay.style.position = 'fixed';
  currentOverlay.style.top = '0';
  currentOverlay.style.left = '0';
  currentOverlay.style.width = '100vw';
  currentOverlay.style.height = '100vh';
  currentOverlay.style.zIndex = '9999999';
  
  document.body.appendChild(currentOverlay);
  
  // Get current brain coin count
  chrome.runtime.sendMessage({ type: 'GET_COINS' }, (response) => {
    const brainCoins = response.brainCoins || 0;
    const canAfford = brainCoins >= COIN_COST_PER_MINUTE;
    
    // Create overlay content
    currentOverlay.innerHTML = `
      <div class="brb-brain-icon">🧠</div>
      <div class="brb-coins">Brain Coins: ${brainCoins}</div>
      <div class="brb-warning">${canAfford ? 
        `This will cost you ${COIN_COST_PER_MINUTE} brain coins per minute.` : 
        `You don't have enough brain coins (need ${COIN_COST_PER_MINUTE}).`}</div>
      <button class="brb-button" id="brb-pay-button" ${!canAfford ? 'disabled' : ''}>
        ${canAfford ? `Pay ${COIN_COST_PER_MINUTE} coins to watch` : 'Not enough coins'}
      </button>
    `;
    // No longer need to append the overlay as it's already in the document body
    
    // Add event listener to the pay button
    const payButton = document.getElementById('brb-pay-button');
    if (payButton) {
      payButton.addEventListener('click', handlePayClick);
    }
  });
}

// Function to remove the overlay
function removeOverlay() {
  if (currentOverlay && currentOverlay.parentNode) {
    currentOverlay.parentNode.removeChild(currentOverlay);
    currentOverlay = null;
  }
}

// Function to handle pay button click
function handlePayClick() {
  // Send message to background script to spend coins
  chrome.runtime.sendMessage({ 
    type: 'SPEND_COINS',
    amount: COIN_COST_PER_MINUTE
  }, (response) => {
    if (response.success) {
      // Successfully paid, unblur the page
      unblurPage();
      currentMinutePaid = true;
      
      // Update the overlay to show a timer
      updateOverlayWithTimer();
      
      // Start tracking watch time
      startWatchTimeTracking();
      
      // Pause the video when payment is made (user can manually play it)
      if (videoElement && !videoElement.paused) {
        videoElement.play();
      }
    } else {
      // Failed to pay, update the overlay message
      const brainCoins = response.brainCoins || 0;
      currentOverlay.innerHTML = `
        <div class="brb-brain-icon">🧠</div>
        <div class="brb-coins">Brain Coins: ${brainCoins}</div>
        <div class="brb-warning">Not enough coins! Go study to earn more!</div>
        <a href="http://localhost:3000/test" target="_blank" class="brb-study-button">
          Go to Study App
        </a>
        <button class="brb-button brb-secondary" id="brb-close-button">Close</button>
      `;
      
      // Add event listener to the close button
      const closeButton = document.getElementById('brb-close-button');
      if (closeButton) {
        closeButton.addEventListener('click', () => {
          // Keep the video blurred but remove the overlay
          removeOverlay();
        });
      }
    }
  });
}

// Function to update overlay with countdown timer
function updateOverlayWithTimer() {
  if (!currentOverlay) return;
  
  // Convert the overlay to a timer display
  currentOverlay.innerHTML = `
    <div class="brb-brain-icon">🧠</div>
    <div class="brb-timer">Paid Time Remaining:</div>
    <div class="brb-countdown">
      <div class="brb-progress">
        <div class="brb-progress-bar" id="brb-progress-bar" style="width: 100%;"></div>
      </div>
      <span id="brb-time-remaining">60s</span>
    </div>
  `;
  
  let timeRemaining = 60; // 60 seconds = 1 minute
  const progressBar = document.getElementById('brb-progress-bar');
  const timeDisplay = document.getElementById('brb-time-remaining');
  
  // Clear any existing interval
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }
  
  // Start countdown
  countdownInterval = setInterval(() => {
    timeRemaining--;
    
    if (progressBar) {
      progressBar.style.width = `${(timeRemaining / 60) * 100}%`;
    }
    
    if (timeDisplay) {
      timeDisplay.textContent = `${timeRemaining}s`;
    }
    
    if (timeRemaining <= 0) {
      clearInterval(countdownInterval);
      // Time's up, reblur and show payment overlay
      currentMinutePaid = false;
      handleVideoDetection();
    }
  }, 1000);
}

// Function to start tracking watch time
function startWatchTimeTracking() {
  // Clear any existing timer
  if (minuteTimer) {
    clearTimeout(minuteTimer);
  }
  
  // Reset watch time counter
  watchTime = 0;
  
  // Set up a timer to check every second
  minuteTimer = setInterval(() => {
    // Only increment watch time if the video is playing
    if (videoElement && !videoElement.paused && !videoElement.ended) {
      watchTime++;
      
      // When a full minute has passed, require payment again
      if (watchTime >= 60) {
        watchTime = 0;
        currentMinutePaid = false;
        handleVideoDetection();
      }
    }
  }, 1000);
}

// Main function to handle YouTube page blurring
function handleYouTubeDetection() {
  // If we're not on YouTube, do nothing
  if (!isYouTubePage()) return;
  
  // Find the video element if there is one (for pausing it)
  videoElement = findVideoPlayer();
  
  // If the current minute is already paid for, do nothing
  if (currentMinutePaid) return;
  
  // Blur the entire page
  blurPage();
  
  // Create overlay
  createOverlay();
  
  // Pause the video if it exists
  if (videoElement && !videoElement.paused) {
    videoElement.pause();
  }
}

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CHECK_YOUTUBE') {
    // Short delay to ensure page is fully loaded
    setTimeout(() => {
      handleYouTubeDetection();
    }, 1000);
  }
  sendResponse({});
});

// Observe DOM changes to catch page loading/changes
const observer = new MutationObserver((mutations) => {
  // Check if we should blur this page
  if (isYouTubePage() && !currentMinutePaid) {
    handleYouTubeDetection();
  }
});

// Start observing the document
observer.observe(document.documentElement, {
  childList: true,
  subtree: true
});

// Initial check for YouTube
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(handleYouTubeDetection, 1000);
  });
} else {
  setTimeout(handleYouTubeDetection, 1000);
}

// Detect page navigation (YouTube is a single-page app)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    // Clear any existing timers and overlays
    if (minuteTimer) {
      clearInterval(minuteTimer);
    }
    if (countdownInterval) {
      clearInterval(countdownInterval);
    }
    removeOverlay();
    
    // Reset state
    currentMinutePaid = false;
    
    // Check for YouTube on the new page
    setTimeout(handleYouTubeDetection, 1000);
  }
}).observe(document, { subtree: true, childList: true });

// Handle video player state changes
document.addEventListener('play', function(e) {
  if (e.target.tagName.toLowerCase() === 'video' && videoBlurred) {
    // If video starts playing but is blurred, pause it
    e.target.pause();
  }
}, true);