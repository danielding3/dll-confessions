const routes = {
  '/': () => import('/src/pages/home/home.js'), 
  '/app': () => import('/src/pages/app/app.js'),
  '/confessions': () => import('/src/pages/confessions/confessions.js'),
  '/submission': () => import('/src/pages/submission/submission.js'),

};


export const router = {
  init: () => {
    window.addEventListener('popstate', () => router.navigate(window.location.pathname));

    document.addEventListener('DOMContentLoaded', () => {
      document.body.addEventListener('click', e => {
        if (e.target.matches('[data-link]')) {
          e.preventDefault();
          // console.log('dataset', e.target.dataset.link);
          router.navigate(e.target.dataset.link);
        }
      });
    });
    router.navigate(window.location.pathname);
  },

    /**
   * Navigate to a given path with optional state.
   * @param {string} path - The route path.
   * @param {object} state - The state object to pass. [ OPTIONAL, default: null ]
   */

  navigate: async (path, state = null) => {
    console.log('navigate', path)
    history.pushState(state, '', path); // state object to be passed to the page en-route

    try {
      const page = routes[path] || routes['/']; // getting current page import
      const module = await page(); // waits for module to be imported
      module.default(); // calls the default export of the module
    } catch (error) {
      console.error('Navigation error: ', error);
      console.error('Navigating back to home page');
      if (path !== '/') {
        router.navigate('/');
      }
    } 
  },
};
