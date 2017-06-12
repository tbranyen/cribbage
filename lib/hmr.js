import { outerHTML, release, Internals } from 'diffhtml';
import { Internals as ComponentInternals } from 'diffhtml-components';

const { caches } = ComponentInternals;
let monitorFile = null;
let clearConsole = null;

const handler = ({ file, markup, quiet }) => {
  if (file.slice(-3) !== '.js') {
    return false;
  }

  if (file !== monitorFile) {
    return true;
  }

  if (!quiet) {
    console.log('JS changed, reloading app...');
  }

  // Before doing anything lets reset everything on the page.
  Internals.StateCache.forEach((state, domNode) => {
    domNode.innerHTML = '';
    release(domNode);
  });

  caches.InstanceCache.clear();
  caches.ComponentTreeCache.clear();

  unsubscribe();

  const existingEl = document.querySelector(`script[src^='${file}']`);

  document.body.appendChild(
    Object.assign(document.createElement('script'), { src: file })
  );

  if (existingEl) {
    existingEl.parentNode.removeChild(existingEl);
  }

  if (clearConsole) {
    console.clear();
  }

  return true;
};

const subscribe = opts => () => {
  monitorFile = opts.src || 'dist/app.js';
  clearConsole = opts.clearConsole;
  window.onload = () => staticSyncHandlers.add(handler);
};
const unsubscribe = opts => () => staticSyncHandlers.delete(handler);

export default opts => Object.assign(function hmrTask() {}, {
 subscribe: subscribe(opts),
 unsubscribe: unsubscribe(opts),
});
