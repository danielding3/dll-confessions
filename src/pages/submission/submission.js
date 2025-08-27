import anime from 'animejs/lib/anime.es.js';
import { Lettering } from '../../lib/lettering.js';
import './submission.css';

const message = sessionStorage.getItem('confession');
sessionStorage.removeItem('confession');
console.log('confession:', message);

export default function Submission() {
  document.querySelector('#app').innerHTML = `
    <div id="submission-container" class="submission-screen">
      <div id="gratitude-text" class="gratitude-message">
        <h1 class="gratitude-line">Thank you for your vulnerability on the internet.</h1>
        <h1 class="gratitude-line">Have solace knowing you are not alone.</h1>
      </div>
      <div id="confession-display" class="confession-message">
        <p class="confession-text">${message || 'Your confession'}</p>
      </div>
      <div>
        <a id="close-window" class="close-button">Close this chapter</a>
      </div>
    </div>
  `;

  startSubmissionSequence();
  closeWindow();
}

function closeWindow() {
  const closeBtn = document.getElementById('close-window');
  closeBtn.addEventListener('click', () => window.location.href = 'https://www.danielding.world');
}

function startSubmissionSequence() {
  const gratitudeText = document.getElementById('gratitude-text');
  const confessionDisplay = document.getElementById('confession-display');
  const gratitudeLines = document.querySelectorAll('.gratitude-line');
  const confessionText = document.querySelector('.confession-text');
  const closeBtn = document.getElementById('close-window');

  // Phase 1: Fade in gratitude text
  anime.timeline()
    .add({
      targets: gratitudeLines,
      opacity: [0, 1],
      translateY: [0, 0],
      duration: 2000,
      delay: anime.stagger(2000),
      easing: 'easeOutQuart'
    })
    .add({
      // Phase 2: Fade out gratitude, fade in confession
      targets: gratitudeText,
      opacity: [1, 0],
      duration: 2000,
      easing: 'easeOutQuart'
    }, '+=0000')
    .add({
      targets: confessionDisplay,
      opacity: [0, 1],
      duration: 2000,
      easing: 'easeOutQuart'
    }, '+=2000')
    .add({
      // Phase 3: Blur confession into obscurity
      targets: confessionText,
      filter: ['blur(0px)', 'blur(20px)'],
      opacity: [1, 0.0],
      duration: 8000,
      easing: 'easeInOutQuad'
    }, '+=2000')
    .add({
      // Phase 4: Close Tab
      targets: closeBtn,
      opacity: [0, 1],
      duration: 1000,
      easing: 'easeInOutQuad'
    }, '+=0000');
}