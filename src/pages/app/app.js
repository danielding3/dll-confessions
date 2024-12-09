import './app.css'
import { sketch } from './sketch.js'
import { insertData, getData } from '../../utils/database.js'
import anime from 'animejs/lib/anime.es.js';
const messages = [];

const permissionBoxAnimation = () => {
  console.log('playing permission box box animation')
  return anime({
    targets: '#permission-box',
    translateY: ['0px', '-5px'],
    scale: [1, 1.01],
    boxShadow: [
    '0 8px 32px rgba(0,0,0,0.2)',
    '0 16px 48px rgba(0,0,0,0.4)'
  ],
  duration: 2000,
  direction: 'alternate',
  loop: true,
    easing: 'easeInOutQuad'
  });
}

// Debounced resize handler
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}


async function initializeApp() {
  try {
    // 1. Load the data
    const data = await getData();

    // 2. Process Data
    if (data && data.length > 0) {
      //  Update the messages array
      messages.push(...data);
      
      // 3. Update the UI
      updateMessageCount();

      // 4. Start animations
      animateConfessions();

      // 5. Add event listeners
      window.addEventListener('resize', debounce(animateConfessions, 250));
    }
  } catch (error) {
    console.error('Error initializing app: ', error);
    showErrorMessage("Failed to load messages. Please reload the page, or email me at daniel.dding@outlook.com if you're continuing to have issues.")
  }
}

function updateMessageCount() {
  const countElement = document.querySelector('.message-count');
  if (countElement) {
    countElement.textContent = `There are currently ${messages.length} confessions.`;
  }
}

export default function App() {
  document.querySelector('#app').innerHTML = `
    <div id="permission-overlay" class="fixed inset-0 z-50 backdrop-blur-md flex items-center justify-center transition-opacity duration-1000">
      <div id="permission-box" class="bg-white p-8 rounded-lg border-2 border-neutral-900 shadow-[0_8px_32px_rgba(0,0,0,0.2)] max-w-md text-center relative">
        <div class="camera-request inner-shadow absolute inset-0 rounded-lg pointer-events-none"></div>
        <p class="text-lg">This experience requires the use of your camera. Nothing will be recorded.</p>
        <p class="text-lg">Please accept permissions on your device to continue</p>
      </div>
    </div>
    <div id="blackout" class="opacity-0 w-full h-full absolute top-0 left-0 transition-opacity duration-1000 bg-black opacity-0 pointer-events-none"></div>
    <div id="app-container" class="">
      <div id="header" class="relative transition duration-[2000ms]">
        <h1 class="header-text text-4xl text-center">close your eyes...</h1>
        <h1 class="header-text text-4xl text-center">get something off your chest...</h1>
      </div>
      <form action="" id="messageForm" class="flex flex-col items-center w-full">
        <textarea 
          id="textInput" 
          class="block w-full p-4 mb-2 mt-8 text-center bg-white placeholder:text-slate-400 rounded-lg disabled:cursor-not-allowed transition duration-2000 active:outline-none"
          name="textInput" 
          rows="4" 
          placeholder="( you will be able to type when you close your eyes )"
          disabled
          autofocus
        ></textarea>
        <button id="submitBtn" type="submit" class="button hidden text-slate-400 transition hover:text-black mx-4 my-2">submit confession</button>
      </form>
      <div id="sketch-container" class="hidden"></div>
      <div id="p5_loading" class="loading"></div>
    </div>
    <div id="messages-container"></div>
    <button id="infoBtn" class="absolute z-10 top-8 right-8 text-center hover:blur-sm">Info</button>
    <div id="infoModal" class="infoModalContent fixed translate-x-full top-0 right-0 opacity-0 text-left text-neutral-950 h-full w-[31.25%] border-l-1 border-gray-400 bg-white transition-all duration-1000">
      <div class="py-8 pl-8 pr-32">
        <p class="mb-4">We carry guilt and shame in our hearts, and it can be hard to find a safe space to express our feelings. This is a place to let it out.</p>
        <p class="mb-4">Your confession will be anonymous, and there is no information retained except for your confession.</p>
        <p class="mb-4">This project was built as a collaboration between <a href="https://danielding.world" target="_blank" class="underline pointer text-neutral-950">Daniel Ding</a> and &nbsp<a href="https://sfpc.study" target="_blank" class="underline pointer text-neutral-950">The School for Poetic Computation</a> in NYC.</p>
        <a href="/" data-link='/' class="absolute bottom-10 left-0 right-0 text-center">Leave the booth</a>
        <p class="mb-4 message-count">There are currently ${messages.length} confessions.</p>
      </div>
    </div>

  `;
  initializeApp();
  checkCameraPermission();
  permissionBoxAnimation().play();

  const textInput = document.getElementById('textInput');
  textInput.addEventListener('input', (e) => {
    if (textInput.value.length > 0) {
      document.getElementById('submitBtn').classList.remove('hidden');
    } else {
      document.getElementById('submitBtn').classList.add('hidden');
    }
  });
  new p5(sketch, 'sketch-container')

  let messageForm = document.getElementById('messageForm');
  messageForm.addEventListener("submit", (e) => {
    e.preventDefault();
    console.log('attempting message submission...')
    // handle submit
    let message = document.getElementById("textInput").value;
    if (message.length > 0) {
      console.log('message is valid, submitting...')
      insertData( message )
      messageForm.reset(); // resets form inputs
    } else {
      console.log('message is invalid, not submitting...')
    }
  });

  let infoBtn = document.getElementById('infoBtn');
  infoBtn.addEventListener('click', () => {
    document.getElementById('infoModal').classList.toggle('opacity-0');
    document.getElementById('infoModal').classList.toggle('showInfoModal');
    document.getElementById('infoBtn').classList.toggle('text-neutral-400');

  });
}


// Helper functions
async function checkCameraPermission() {
  console.log('checking camera permission...')
  try {
    const result = await navigator.mediaDevices.getUserMedia({ video: true });
    // Permission granted
    result.getTracks().forEach(track => track.stop()); // Cleans up camera when not in us
    console.log('result: ', result)
    // Fade out permission overlay
    console.log('permissions accepted, fading out permission overlay')
    permissionBoxAnimation().pause();  // Pauses pulsation animation
    const overlay = document.getElementById('permission-overlay');
    overlay.classList.add('opacity-0');
    setTimeout(() => overlay.remove(), 1000);
    
  } catch (err) {
    // Permission denied or error
    const overlay = document.getElementById('permission-overlay');
    overlay.style.backgroundColor = 'rgba(0,0,0,0.1)';
    
    // Update message if explicitly denied
    if (err.name === 'NotAllowedError') {
      console.log('permission denied, updating permission box')
      const box = document.getElementById('permission-box');
      box.innerHTML = `
        <div class="camera-request inner-shadow absolute inset-0 rounded-lg pointer-events-none"></div>
        <p class="text-lg">This experience requires the use of your camera.</p>
        <p class="text-lg">Please enable camera permissions and refresh the page to continue.</p>
      `;
    }
  }
}
let currentTimeline = null;

// 1. create div to hold message
// 2. append div to container
// 3. create timeline
function animateConfessions() {
  // Pause any current animation timelines running (for window resizing)
  if (currentTimeline) {
    currentTimeline.pause();
    currentTimeline.seek(0);
    currentTimeline = null;
  }

  const container = document.getElementById('messages-container');
  container
  const appContainer = document.getElementById('app-container');
  const MAX_ACTIVE_CONFESSIONS = 10; // Maximum concurrent confessions

  // Message pool manager to handle confession rotation
  let messagePool = {
    shown: new Set(), // handles duplicates easily
    current: [], // remaining confessions queue
    initialize() {
      this.shown.clear();
      this.current = shuffleMessages([...messages]); // Create a copy of messages array
    },
    getNextBatch() {
      const batch = [];
      while (batch.length < MAX_ACTIVE_CONFESSIONS && this.current.length > 0) {
        const message = this.current.pop();
        this.shown.add(message);
        batch.push(message);
      }
      
      // Reset and reshuffle when we run out of confessions
      if (this.current.length === 0) {
        this.initialize();
      }
      
      return batch;
    }
  };
  
  messagePool.initialize();

  // Create initial message elements if they don't exist
  if (!container.querySelector('.message-item')) {
    const initialBatch = messagePool.getNextBatch();
    initialBatch.forEach(msg => {
      const div = document.createElement('div');
      div.className = 'message-item text-xs absolute opacity-0 max-w-[min(400px,40vw)] text-wrap break-words';
      div.textContent = msg.confession;
      container.appendChild(div);
    });
  }

  currentTimeline = anime.timeline({
    loop: true,
    loopComplete: function() {
      console.log('=== LOOP COMPLETE ===')
      // Update messages with new random confessions when timeline completes
      const messageElements = document.querySelectorAll('.message-item');
      const newBatch = messagePool.getNextBatch();
      
      messageElements.forEach((el, index) => {
        if (newBatch[index]) {
          el.textContent = newBatch[index].confession;
        }
      });
    }
  });

  // Keep track of occupied spaces
  const occupiedSpaces = [];
  
  // Function to check if a position overlaps with existing messages
  const doesOverlap = (x, y, width, height, padding = 20) => {
    return occupiedSpaces.some(space => {
      return !(x + width + padding < space.x ||
               x > space.x + space.width + padding ||
               y + height + padding < space.y ||
               y > space.y + space.height + padding);
    });
  };

  // Function to get a valid position outside app container and not overlapping
  const getValidPosition = (element) => {
    const appBounds = appContainer.getBoundingClientRect();
    const elementWidth = element.offsetWidth;
    const elementHeight = element.offsetHeight;
    const padding = 20; // Minimum distance from app container
    
    let x, y;
    let attempts = 0;
    const maxAttempts = 100; // Increased max attempts to find non-overlapping position

    do {
      x = Math.random() * (window.innerWidth - elementWidth);
      y = Math.random() * (window.innerHeight - elementHeight);
      attempts++;
      
      // Break loop if we can't find a valid position after many attempts
      if (attempts > maxAttempts) {
        console.log('=== MAX POSITIONING ATTEMPTS REACHED ===')
        // Find the least crowded area as fallback
        const sectors = [
          { x: 0, y: 0 }, // top-left
          { x: window.innerWidth - elementWidth, y: 0 }, // top-right
          { x: 0, y: window.innerHeight - elementHeight }, // bottom-left
          { x: window.innerWidth - elementWidth, y: window.innerHeight - elementHeight } // bottom-right
        ];
        
        const validSector = sectors.find(sector => 
          !doesOverlap(sector.x, sector.y, elementWidth, elementHeight) &&
          !(sector.x < (appBounds.right + padding) && 
            sector.x > (appBounds.left - elementWidth - padding) && 
            sector.y < (appBounds.bottom + elementHeight + padding) && 
            sector.y > (appBounds.top - elementHeight - padding))
        );
        
        if (validSector) {
          x = validSector.x;
          y = validSector.y;
        } else {
          // Last resort: place it in a corner
          x = appBounds.right > window.innerWidth/2 ? 
              padding : 
              window.innerWidth - elementWidth - padding;
          y = padding;
        }
        break;
      }
    } while (
      x < (appBounds.right + padding) && 
      x > (appBounds.left - elementWidth - padding) && 
      y < (appBounds.bottom + elementHeight + padding) && 
      y > (appBounds.top - elementHeight - padding) ||
      doesOverlap(x, y, elementWidth, elementHeight)
    );

    // Update occupied spaces
    // Remove old position if element is being repositioned
    const existingIndex = occupiedSpaces.findIndex(space => space.element === element);
    if (existingIndex !== -1) {
      occupiedSpaces.splice(existingIndex, 1);
    }
    
    // Add new position
    occupiedSpaces.push({
      x,
      y,
      width: elementWidth,
      height: elementHeight,
      element
    });

    return { x, y };
  };

  // Clean up occupiedSpaces when animation completes
  const cleanupOccupiedSpace = (element) => {
    const index = occupiedSpaces.findIndex(space => space.element === element);
    if (index !== -1) {
      occupiedSpaces.splice(index, 1);
    }
  };

  // Animate each message
  document.querySelectorAll('.message-item').forEach((el, i) => {
    const updatePosition = () => {
      const { x, y } = getValidPosition(el);
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
    };

    // Calculate duration based on text length, with min/max bounds
    const baseDuration = Math.min(Math.max(el.textContent.length * 100, 2000), 4000);
    
    currentTimeline.add({
      targets: el,
      keyframes: [
        { opacity: 0, duration: 0 },
        { opacity: 1, duration: 800 },
        { opacity: 1, duration: baseDuration },
        { opacity: 0, duration: 800 }
      ],
      delay: anime.stagger(Math.random() * 1000),
      easing: 'easeInOutSine',
      begin: updatePosition,
      complete: () => {
        cleanupOccupiedSpace(el);
        updatePosition();
      },
    }, i * 1000);
  });
}
// End of animateConfessions

// Helper function to shuffle messages array
function shuffleMessages(messages) {
  return messages
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}