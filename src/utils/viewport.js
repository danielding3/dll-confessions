export function setViewportHeight() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`); //root el

  window.addEventListener('resize', setViewportHeight);
}

setViewportHeight();