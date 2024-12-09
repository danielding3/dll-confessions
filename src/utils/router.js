const routes = {
  '/': () => import(/* @vite-ignore */'../pages/home/home.js'), //dynamic imports are async, so we need to await them
  '/app': () => import(/* @vite-ignore */'../pages/app/app.js'),
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

  navigate: async path => {
    console.log('navigate', path)
    history.pushState({}, '', path);

    try {
      const page = routes[path] || routes['/']; // getting current page import
      const module = await page(); // waits for module to be imported
      module.default(); // calls the default export of the module
    } catch (error) {
      console.error('Navigation error: ', error);
      if (path !== '/') {
        router.navigate('/');
      }
    } 
  },
};
