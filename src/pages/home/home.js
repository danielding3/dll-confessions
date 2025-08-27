import './home.css'
import anime from 'animejs/lib/anime.es.js';
import { Lettering } from '../../lib/lettering.js';
import { setViewportHeight } from '../../utils/viewport.js';
import enterKeySvg from '../../assets/enter-key.svg';
import { router } from '../../utils/router.js';


export default function Home() {
  setViewportHeight();
  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  document.querySelector('#app').innerHTML = `
    <div id="welcome-container" class="text-4xl text-center"> 
      <h1 class="welcome-text absolute top-45 left-0 right-0 text-center">Welcome to your confession booth.</h1>
      <h1 class="welcome-text absolute top-45 left-0 right-0 text-center">What you write here is anonymous.</h1>
      <h1 class="welcome-text absolute top-45 left-0 right-0 text-center">Personal computing is a visual, tactile, and auditory experience. </h1>
      <h1 class="welcome-text absolute top-45 left-0 right-0 text-center">Our senses are always present, and always on guard.</h1>
      <h1 class="welcome-text absolute top-45 left-0 right-0 text-center">Can we make ourselves more vulnerable on the internet by reducing them?</h1>
      <h1 class="welcome-text absolute top-45 left-0 right-0 text-center">Let's begin...</h1>
      <a id="btn" href="/confessions" data-link='/confessions' class="absolute hidden opacity-0 bottom-10 left-0 right-0 text-center">Continue</a>
    </div>
    <div id="prompt" class="opacity-0 pointer-events-none">
      ${isMobile ? '<span class="font-bold">tap</span> to continue' : 'press <span class="font-bold">enter </span>'}
      <img src="${enterKeySvg}" alt="enter" class="w-4 h-4 inline-block">
    </div>
  `;

  const lettering = new Lettering({ className: 'char', wordClass: 'poop'});
  const texts = document.querySelectorAll('.welcome-text');
  let currentTextIndex = 1;

  // Apply to all welcome texts
  document.querySelectorAll('.welcome-text').forEach(element => {
    lettering.letters(element);
  });

  // Handle transition between welcome texts
  const handleTransition = () => {
    if (anime.running.length > 0) return;

    if (currentTextIndex === texts.length) {
      router.navigate('/confessions');
      return;
    }
    const timeline = anime.timeline({});

    const prompt = document.getElementById('prompt');
    prompt.classList.add("scale-105")

    // Fade out enter / touch prompt
    anime({
      targets: "#prompt",
      opacity: [1, 0],
      easing: "easeInQuint",
      duration: 500
    });
    // Fade out current text
    timeline.add({
      targets: `#welcome-container h1:nth-child(${currentTextIndex}) .char`,
      opacity: [1, 0],
      easing: "easeInQuad",
      // duration: 1000,
      delay: (el, i)=>100 + 20 * i
    });
    // Fade in next text
    timeline.add({
      targets: `#welcome-container h1:nth-child(${currentTextIndex + 1}) .char`,
      opacity: [0, 1],
      easing: "easeOutExpo",
      // duration: 1000,
      delay: (el, i)=>0 + 30 * i,
      changeComplete: () => {
        console.log("changeComplete: ", currentTextIndex);
        if (currentTextIndex !== texts.length) {
          anime({
            targets: "#prompt",
            opacity: [0, 1],
            easing: "easeOutQuint",
            duration: 500
          })
        }
      },
      complete: () => {
        console.log("complete: ", currentTextIndex);
      }
    });
    currentTextIndex++;

    // Fade in continue to app button
    if (currentTextIndex === texts.length ) {
      document.getElementById('btn').classList.remove('hidden');
      document.getElementById('prompt').classList.add('opacity-0');
      timeline.add({
        targets: "#btn",
        opacity: [0, 1],
        easing: "easeOutExpo",
        duration: 1000
      })
    }
  }

  //1. Hide all welcome texts.
  document.querySelectorAll('.welcome-text .char').forEach(element => {
    // console.log("element: ", element.innerHTML);
    element.classList.add('opacity-0');
  });
  //2. Fade in the first welcome text.
  anime({
    targets: "#welcome-container h1:nth-child(1) .char",
    opacity: [0, 1],
    easing: "easeInExpo",
    duration: 1000,
    delay: (el, i)=>100 + 30 * i,
    changeComplete: () => {
      document.getElementById('prompt').classList.remove('opacity-0');
    }
  })
  
  //3. Handle keyboard input
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      handleTransition();
    }
  })

  document.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
      document.getElementById('prompt').classList.remove('scale-105');
    }
  })
  //4. Handle touch input
  document.addEventListener("touchstart", (event) => {
    if (isMobile) {
      event.preventDefault(); // prevents scrolling or zooming behaviour
      handleTransition();
    }
  });
  document.addEventListener("touchend", (event) => {
    if (isMobile) {
      event.preventDefault();
      document.getElementById('prompt').classList.remove('scale-105');
    }
  })
}
