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

  navigate: async path => {
    console.log('navigate', path)
    history.pushState({}, '', path);
    const routes = {
      '/': () => import('../pages/home/home.js'), //dynamic imports are async, so we need to await them
      '/app': () => import('../pages/app/app.js'),
    };
    const page = routes[path] || routes['/']; // getting current page import
    const module = await page(); // waits for module to be imported
    module.default(); // calls the default export of the module
  },
};
