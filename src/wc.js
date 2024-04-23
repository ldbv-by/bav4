import { WcEvents } from './domain/wcEvents';
console.log(document.currentScript.src);

/**
 * At first we have to load the configuration script
 */
const scriptEl = document.createElement('script');
scriptEl.setAttribute('src', document.currentScript.src.replace('wc.js', 'config.js'));
document.body.appendChild(scriptEl);

/**
 * After that we're able to import the web-component chunk, cause configuration (backend url, etc) is present now
 */
scriptEl.addEventListener('load', () => {
	// see https://webpack.js.org/guides/code-splitting/#dynamic-imports
	// eslint-disable-next-line promise/prefer-await-to-then, import/no-unresolved
	import('@chunk/public-web-component').then(() => {
		window.dispatchEvent(new CustomEvent(WcEvents.LOAD));
	});
});
