import { setViewportHeight } from '../../utils/viewport.js';
import { getData } from '../../utils/database';
import  debounce  from '../../utils/debounce.js';
import './confessions.css'
import anime from 'animejs/lib/anime.es.js';

// initialization
setViewportHeight();
const isMobile = window.innerWidth < 768;
const messages = [];
let hasLoopCompleted = false;

async function initializeConfessions() {
  try {
    // 1. Load the data
    const data = await getData();

    // 2. Process Data
    if (data && data.length > 0) {
      //  Update the messages array
      messages.push(...data);
      // 4. Start animations
      animateConfessions();

      // 5. Add event listeners
      window.addEventListener('resize', debounce(animateConfessions, 250));
    }
  } catch (error) {
    console.error('Error initializing confessions: ', error);
    showErrorMessage("Failed to load messages. Please reload the page, or email me at daniel.dding@outlook.com if you're continuing to have issues.")
  }
}

export default function Confessions() {
  setViewportHeight();
  document.querySelector('#app').innerHTML = `
    <div class="w-full h-full flex items-center justify-center">
      <div class="w-full h-full bg-white"></div>
      <div id="next-button-container" class="fixed h-4  w-full flex items-center justify-center"></div>
    </div>
    <div id="messages-container"></div>
  `
  initializeConfessions();
  // showNextButton();
}
function showNextButton() {
  const nextButton = document.createElement('a');
  const nextButtonContainer = document.getElementById('next-button-container');
  nextButton.href = '/app';
  nextButton.textContent = 'i want to confess something';
  nextButton.classList.add(
    'button', 
    'text-black',
    'text-4xl',
    'p-6',
    'md:text-8xl',
    'opacity-0');
  nextButtonContainer.appendChild(nextButton);

  anime({
    targets: nextButton,
    opacity: [0, 1],
    // scale: [1.5, 1],
    filter: ['blur(10px)', 'blur(0px)'],
    duration: 1500,
    easing: 'easeOutCubic',
    complete: () => {
      anime({
        targets: nextButton,
        translateY: [-2, 0],
        duration:1000,
        easing: 'easeInOutSine',
        loop: true,
        direction: 'alternate',
      })
    }
  })
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
  const MAX_ACTIVE_CONFESSIONS = isMobile ? 5 : 10; // Maximum concurrent confessions

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
      if (!hasLoopCompleted) {
        showNextButton();
        hasLoopCompleted = true;
      }
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
    const elementWidth = element.offsetWidth;
    const elementHeight = element.offsetHeight;
    
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
          !doesOverlap(sector.x, sector.y, elementWidth, elementHeight) 
        );
        
        if (validSector) {
          x = validSector.x;
          y = validSector.y;
        } 
        break;
      }
    } while (
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