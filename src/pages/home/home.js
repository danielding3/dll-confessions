import './home.css'
import anime from 'animejs/lib/anime.es.js';
import { Lettering } from '../../lib/lettering.js';
import { setViewportHeight } from '../../utils/viewport.js';

export default function Home() {
  setViewportHeight();
  document.querySelector('#app').innerHTML = `
    <div id="welcome-container" class="text-4xl text-center"> 
      <h1 class="welcome-text absolute top-45 left-0 right-0 text-center">Welcome to your confession booth.</h1>
      <h1 class="welcome-text absolute top-45 left-0 right-0 text-center">What you write here is anonymous.</h1>
      <h1 class="welcome-text absolute top-45 left-0 right-0 text-center">Personal computing is a visual, tactile, and auditory experience. </h1>
      <h1 class="welcome-text absolute top-45 left-0 right-0 text-center">Our senses are always present, and always on guard.</h1>
      <h1 class="welcome-text absolute top-45 left-0 right-0 text-center">Can we make ourselves more vulnerable on the internet by reducing them?</h1>
      <h1 class="welcome-text absolute top-45 left-0 right-0 text-center">Let's begin...</h1>
      <a id="btn-app" href="/app" data-link='/app' class="absolute bottom-10 left-0 right-0 text-center">Confess</a>
    </div>
  `;

  const lettering = new Lettering({ className: 'char', wordClass: 'poop'});

  // Apply to all welcome texts
  document.querySelectorAll('.welcome-text').forEach(element => {
    lettering.letters(element);
  });

  anime.timeline({}).add({
    targets: "#welcome-container h1:nth-child(1) .char",
    // translateX: [30, 0],
    translateZ: 0,
    opacity: [0,1],
    easing: "easeOutExpo",
    duration: 1500,
    delay: (el, i)=>500 + 30 * i
  }).add({
    targets: "#welcome-container h1:nth-child(1) .char",
    opacity: [1, 0],
    easing: "easeInExpo",
    duration: 1000,
    delay: (el, i)=>100 + 20 * i
  }) .add({
    targets: "#welcome-container h1:nth-child(2) .char",
    opacity: [0, 1],
    easing: "easeOutExpo",
    duration: 1000,
    delay: (el, i)=>500 + 30 * i
  }).add({
    targets: "#welcome-container h1:nth-child(2) .char",
    opacity: [1, 0],
    easing: "easeInExpo",
    duration: 1000,
    delay: (el, i)=>100 + 20 * i
  }).add({
    targets: "#welcome-container h1:nth-child(3) .char",
    opacity: [0, 1],
    easing: "easeOutExpo",
    duration: 1000,
    delay: (el, i)=>500 + 30 * i
  }).add({
    targets: "#welcome-container h1:nth-child(3) .char",
    opacity: [1, 0],
    easing: "easeInExpo",
    duration: 1000,
    delay: (el, i)=>100 + 20 * i
  }).add({
    targets: "#welcome-container h1:nth-child(4) .char",
    opacity: [0, 1],
    easing: "easeOutExpo",
    duration: 1000,
    delay: (el, i)=>100 + 30 * i
  }).add({
    targets: "#welcome-container h1:nth-child(4) .char",
    opacity: [1, 0],
    easing: "easeInExpo",
    duration: 1000,
    delay: (el, i)=>100 + 20 * i
  }).add({
    targets: "#welcome-container h1:nth-child(5) .char",
    opacity: [0, 1],
    easing: "easeOutExpo",
    duration: 1000,
    delay: (el, i)=>100 + 30 * i
  }).add({
    targets: "#welcome-container h1:nth-child(5) .char",
    opacity: [1, 0],
    easing: "easeInExpo",
    duration: 1000,
    delay: (el, i)=>100 + 20 * i
  }).add({
    targets: "#welcome-container h1:nth-child(6), #btn-app",
    opacity: [0, 1],
    easing: "easeOutExpo",
    duration: 1000,
    delay: (el, i)=>100 + 30 * i
  })
}
