import './app.css'
import { sketch } from './sketch.js'
import { getData, insertData } from '../../utils/database.js'
import anime from 'animejs/lib/anime.es.js';
import { setViewportHeight } from '../../utils/viewport.js';
const isMobile = window.innerWidth < 768;
const messages = [];
// Function to set the width of the infoModal based on device type
function setInfoModalWidth() {
  const infoModal = document.getElementById('infoModal');
  if (infoModal) {
    infoModal.style.width = isMobile ? '100%' : '31.25%'; // Adjust width for mobile
  }
}

setInfoModalWidth();

const permissionBoxAnimation = () => {
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

async function getMessageCount() {
  const data = await getData();
  if (data && data.length > 0) {
    messages.push(...data);
    const countElement = document.querySelector('.message-count');
    if (countElement) {
      countElement.textContent = `There are currently ${messages.length} confessions.`;
    }
  }
}

export default function App() {
  setViewportHeight();
  document.querySelector('#app').innerHTML = `
    <div id="permission-overlay" class="fixed inset-0 z-50 backdrop-blur-md flex items-center justify-center transition-opacity duration-1000">
      <div id="permission-box" class="bg-white p-8 rounded-lg border-2 border-neutral-900 shadow-[0_8px_32px_rgba(0,0,0,0.2)] max-w-md text-center relative">
        <div class="camera-request inner-shadow absolute inset-0 rounded-lg pointer-events-none"></div>
        <p class="text-lg">This experience requires the use of your camera. Nothing will be recorded.</p>
        <p class="text-lg">Please accept permissions on your device to continue</p>
      </div>
    </div>
    <div id="sound-loading-progress" class="fixed pointer-events-none inset-0 z-40 backdrop-blur-md flex items-center justify-center transition-opacity duration-1000">
      <div class="w-64 relative">
        <div class="w-full h-8 bg-white border border-black"></div>
        <div id="progress-bar" class="absolute top-0 left-0 h-8 bg-black duration-200 transition-all" style="width: 0%"></div>
        <div id="progress-text" class="absolute inset-0 flex items-center justify-center text-center text-sm font-light">0%</div>

      </div>
    </div>
    <div id="blackout" class="opacity-0 w-full h-full absolute top-0 left-0 transition-opacity duration-1000 bg-black opacity-0 pointer-events-none"></div>
    <div id="app-container" class="">
      <div id="header" class="relative transition duration-[2000ms]">
        <h1 class="header-text md:text-6xl text-4xl text-center">close your eyes...</h1>
        <h1 class="header-text md:text-6xl text-4xl text-center">get something off your chest...</h1>
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
      <div class="py-8 pl-8 md:pr-32 pr-16">
        <p class="mb-4">We carry guilt and shame in our hearts, and it can be hard to find a safe space to express our feelings. This is a place to let it out.</p>
        <p class="mb-4">Your confession will be anonymous, and there is no information retained except for your confession.</p>
        <p class="mb-4">This project was built as a collaboration between <a href="https://danielding.world" target="_blank" class="underline pointer text-neutral-950">Daniel Ding</a> and &nbsp<a href="https://sfpc.study" target="_blank" class="underline pointer text-neutral-950">The School for Poetic Computation</a> in NYC.</p>
        <a href="/" data-link='/' class="absolute md:bottom-10 bottom-5 left-0 right-0 text-center">Leave the booth</a>
        <p class="mb-4 message-count">There are currently ${messages.length} confessions.</p>
      </div>
    </div>

  `;
  checkCameraPermission();
  permissionBoxAnimation().play();
  setInfoModalWidth();
  getMessageCount();

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
    // restart animations (removes existing ones)
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